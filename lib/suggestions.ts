import { faqs, keywords, systems } from "./data";
import type { SuggestionGroup } from "./types";
import { normalize } from "./search";
import { searchArticles } from "./results";
import { query } from "./db";

export async function buildSuggestionGroups(q: string): Promise<SuggestionGroup[]> {
  if (!q.trim()) return [];
  const groups: SuggestionGroup[] = [];
  const term = normalize(q);
  const firstTerm = term.split(/\s+/)[0] ?? "";

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

  const kw = keywords.filter((k) => normalize(k).includes(firstTerm)).slice(0, 3);
  if (kw.length) {
    groups.push({
      label: "Palavras-chave",
      kind: "Termo",
      glyph: "⌕",
      items: kw.map((k) => ({
        id: `kw:${k}`,
        text: k,
        meta: "Termo de busca",
        href: `/resultados?q=${encodeURIComponent(k)}`,
        kind: "Termo",
        glyph: "⌕",
      })),
    });
  }

  // Categorias que têm algum conteúdo entre os resultados da busca.
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
        href: `/resultados?q=${encodeURIComponent(c)}`,
        kind: "Categoria",
        glyph: "◧",
      })),
    });
  }

  const sys = systems
    .filter((s) => normalize(s.n).includes(term) || found.some((f) => normalize(f.article.title).includes(normalize(s.n))))
    .slice(0, 2);
  if (sys.length) {
    groups.push({
      label: "Sistemas",
      kind: "Sistema",
      glyph: "◈",
      items: sys.map((s) => ({
        id: `sys:${s.n}`,
        text: s.n,
        meta: s.d,
        href: `/resultados?q=${encodeURIComponent(s.n)}`,
        kind: "Sistema",
        glyph: "◈",
      })),
    });
  }

  const fq = faqs.filter((f) => normalize(f).includes(firstTerm)).slice(0, 2);
  if (fq.length) {
    groups.push({
      label: "Perguntas frequentes",
      kind: "FAQ",
      glyph: "?",
      items: fq.map((f) => ({
        id: `faq:${f}`,
        text: f,
        meta: "Resposta rápida",
        href: `/resultados?q=${encodeURIComponent(f)}`,
        kind: "FAQ",
        glyph: "?",
      })),
    });
  }

  return groups;
}
