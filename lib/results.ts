import { query } from "./db";
import { rowToArticle, type ArticleRow } from "./rows";
import type { Article, SearchResult } from "./types";
import { buildTsQuery, highlight, normalize } from "./search";

export type SortKey = "relevancia" | "acessados" | "recentes";



const JANELAS_DATA: [string, string][] = [["30 dias", "30d"], ["3 meses", "3m"], ["Este ano", "ano"]];

export type FilterGroupMeta = { key: string; label: string; options: [string, string][] };

/**
 * As opções de filtro saem do acervo: só aparece o que existe, com a
 * contagem real ao lado.
 */
export async function filterGroups(): Promise<{ meta: FilterGroupMeta[]; counts: Record<string, Record<string, number>> }> {
  const rows = await query<{ g: string; v: string; n: number }>(
    `SELECT 'cat' AS g, cat AS v, count(*)::int AS n FROM articles WHERE status = 'publicado' GROUP BY cat
     UNION ALL
     SELECT 'type', type, count(*)::int FROM articles WHERE status = 'publicado' GROUP BY type
     UNION ALL
     SELECT 'dept', split_part(dept, ' · ', 1), count(*)::int FROM articles WHERE status = 'publicado'
      GROUP BY split_part(dept, ' · ', 1)
     ORDER BY 1, 3 DESC, 2`
  );

  const counts: Record<string, Record<string, number>> = { cat: {}, type: {}, dept: {} };
  rows.forEach((r) => {
    counts[r.g] = counts[r.g] || {};
    counts[r.g][r.v] = r.n;
  });

  const opcoes = (g: string): [string, string][] =>
    Object.keys(counts[g] ?? {}).map((v) => [v, v] as [string, string]);

  const meta: FilterGroupMeta[] = [
    { key: "cat", label: "Categoria", options: opcoes("cat") },
    { key: "dept", label: "Área responsável", options: opcoes("dept") },
    { key: "type", label: "Tipo de conteúdo", options: opcoes("type") },
    { key: "date", label: "Última atualização", options: JANELAS_DATA },
  ].filter((g) => g.options.length > 1 || g.key === "date");

  return { meta, counts };
}

const DATE_WINDOWS: Record<string, string> = {
  "30d": "a.updated_at >= current_date - interval '30 days'",
  "3m": "a.updated_at >= current_date - interval '3 months'",
  ano: "date_trunc('year', a.updated_at) = date_trunc('year', current_date)",
};

type ScoredRow = ArticleRow & { rank: number; sim: number };

/**
 * Busca com ranking por peso de campo (ts_rank_cd sobre a coluna `search`) e
 * tolerância a erro de digitação por trigrama (word_similarity). Filtros e
 * ordenação entram na mesma consulta.
 */
export async function searchArticles(
  q: string,
  sort: SortKey,
  activeFilters: string[]
): Promise<{ article: Article; score: number }[]> {
  const tsq = buildTsQuery(q);
  const raw = normalize(q);

  // Os parâmetros entram só quando são usados: o Postgres recusa a query se
  // sobrar placeholder sem referência (busca vazia não tem tsquery).
  const params: unknown[] = [];
  let tsqRef = "";
  let rawRef = "";
  if (tsq) {
    params.push(tsq);
    tsqRef = `$${params.length}`;
    params.push(raw);
    rawRef = `$${params.length}`;
  }

  const where: string[] = ["a.status = 'publicado'"];

  const byGroup: Record<string, string[]> = {};
  activeFilters.forEach((key) => {
    const [g, v] = key.split("|");
    if (!g || v === undefined) return;
    (byGroup[g] = byGroup[g] || []).push(v);
  });

  for (const [group, values] of Object.entries(byGroup)) {
    if (group === "cat" || group === "type") {
      params.push(values);
      where.push(`a.${group} = ANY($${params.length}::text[])`);
    } else if (group === "dept") {
      params.push(values);
      where.push(`EXISTS (SELECT 1 FROM unnest($${params.length}::text[]) d WHERE a.dept LIKE d || '%')`);
    } else if (group === "date") {
      const clauses = values.map((v) => DATE_WINDOWS[v]).filter(Boolean);
      if (clauses.length) where.push(`(${clauses.join(" OR ")})`);
    }
  }

  const order =
    sort === "acessados"
      ? "a.views DESC"
      : sort === "recentes"
        ? "a.updated_at DESC"
        : tsq
          ? "score DESC, a.views DESC"
          : "a.views DESC";

  // Full-text e trigrama entram como CTEs separadas de propósito: com as duas
  // condições num único OR o planner abandona os índices GIN e varre a tabela
  // inteira (medido: 221 ms contra ~3 ms em 20 mil linhas). O trigrama só é
  // consultado quando a busca exata não encontra nada.
  const sql = tsq
    ? `WITH ft AS (
         SELECT id, ts_rank_cd(search, to_tsquery('portuguese', ${tsqRef})) * 3 AS score
           FROM articles
          WHERE status = 'publicado' AND search @@ to_tsquery('portuguese', ${tsqRef})
       ), tg AS (
         SELECT id, word_similarity(${rawRef}, searchable) AS score
           FROM articles
          WHERE status = 'publicado' AND ${rawRef} <% searchable
       ), hits AS (
         -- O trigrama entra só como plano B: quando a busca exata acha algo,
         -- incluí-lo traria casamentos atravessando fronteira de palavra
         -- ("senha" casando com um texto que não fala de senha).
         SELECT id, max(score) AS score
           FROM (
             SELECT * FROM ft
             UNION ALL
             SELECT * FROM tg WHERE NOT EXISTS (SELECT 1 FROM ft)
           ) u
          GROUP BY id
       )
       SELECT a.*, h.score
         FROM articles a
         JOIN hits h ON h.id = a.id
        WHERE ${where.join(" AND ")}
        ORDER BY ${order}`
    : `SELECT a.*, 0 AS score
         FROM articles a
        WHERE ${where.join(" AND ")}
        ORDER BY ${order}`;

  const rows = await query<ScoredRow & { score: number }>(sql, params);
  return rows.map((r) => ({ article: rowToArticle(r), score: Number(r.score) || 0 }));
}

export function toSearchResult(
  a: Article,
  q: string,
  favs: Set<string>,
  score: number,
  topScore: number
): SearchResult {
  const h = highlight(a.title, q);
  const s = highlight(a.snippet.replace(/<[^>]+>/g, ""), q);
  const relPct = topScore > 0 ? Math.max(12, Math.round((score / topScore) * 100)) : 100;
  return {
    id: a.id,
    ...h,
    sPre: s.pre,
    sMid: s.mid,
    sPost: s.post,
    path: a.path,
    type: a.type,
    cat: a.cat,
    updated: a.updated,
    read: a.read,
    views: a.views,
    kw: a.kw.slice(0, 3).join(", "),
    verified: a.verified,
    outdated: !!a.outdated,
    fav: favs.has(a.id),
    relPct,
  };
}
