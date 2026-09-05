import { termosSugeridos } from "./data";
import type { SuggestionGroup } from "./types";
import { normalize } from "./search";
import { searchArticles } from "./results";
import { query } from "./db";

export async function buildSuggestionGroups(q: string): Promise<SuggestionGroup[]> {
  if (!q.trim()) return [];
  const groups: SuggestionGroup[] = [];
  const termo = normalize(q);

  const found = (await searchArticles(q, "relevancia", [])).slice(0, 4);
  if (found.length) {
    groups.push({
      label: "Conteúdos",
      kind: "Conteúdo",
      glyph: "▤",
      items: found.map(({ article: a }) => ({
        id: `article:${a.id}`,
        text: a.title,
        meta: `${a.cat} · ${a.read} · ${a.verified ? "verificado" : "em revisão"}`,
        href: `/artigo/${a.id}`,
        kind: "Conteúdo",
        glyph: "▤",
      })),
    });
  }

  // Termos: os mais buscados de verdade; sem histórico, os do acervo. Exige
  // repetição para um erro de digitação isolado não virar sugestão.
  const buscados = await query<{ termo: string }>(
    `SELECT mode() WITHIN GROUP (ORDER BY term) AS termo
       FROM search_events
      WHERE results_count > 0 AND normalized LIKE $1 || '%'
      GROUP BY normalized HAVING count(*) >= 3
      ORDER BY count(*) DESC LIMIT 3`,
    [termo]
  );
  const termos = buscados.length
    ? buscados.map((b) => b.termo)
    : termosSugeridos.filter((k) => normalize(k).includes(termo)).slice(0, 3);
  if (termos.length) {
    groups.push({
      label: "Palavras-chave",
      kind: "Termo",
      glyph: "⌕",
      items: termos.map((k) => ({
        id: `kw:${k}`,
        text: k,
        meta: "Termo de busca",
        href: `/resultados?q=${encodeURIComponent(k)}`,
        kind: "Termo",
        glyph: "⌕",
      })),
    });
  }

  const catsFound = [...new Set(found.map((f) => f.article.cat))].slice(0, 2);
  if (catsFound.length) {
    const counts = await query<{ cat: string; n: number }>(
      "SELECT cat, count(*)::int AS n FROM articles WHERE status = 'publicado' AND cat = ANY($1::text[]) GROUP BY cat",
      [catsFound]
    );
    const byCat = new Map(counts.map((c) => [c.cat, c.n]));
    groups.push({
      label: "Categorias",
      kind: "Categoria",
      glyph: "◧",
      items: catsFound.map((c) => ({
        id: `cat:${c}`,
        text: c,
        meta: `${byCat.get(c) ?? 0} conteúdos nesta categoria`,
        href: `/resultados?filter=${encodeURIComponent(`cat|${c}`)}`,
        kind: "Categoria",
        glyph: "◧",
      })),
    });
  }

  return groups;
}
