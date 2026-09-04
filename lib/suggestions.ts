import { articles, faqs, keywords, systems } from "./data";
import type { SuggestionGroup } from "./types";
import { normalize, score } from "./search";

export function buildSuggestionGroups(q: string): SuggestionGroup[] {
  if (!q.trim()) return [];
  const groups: SuggestionGroup[] = [];

  const scored = articles
    .map((a) => ({ a, s: score(a, q) }))
    .filter((x) => x.s > 1)
    .sort((x, y) => y.s - x.s)
    .slice(0, 4);
  if (scored.length) {
    groups.push({
      label: "Conteúdos",
      kind: "Conteúdo",
      glyph: "▤",
      items: scored.map(({ a }) => ({
        id: `article:${a.id}`,
        text: a.title,
        meta: `${a.cat} · ${a.read} · ${a.verified ? "verificado" : "em revisão"}`,
        href: `/artigo/${a.id}`,
        kind: "Conteúdo",
        glyph: "▤",
      })),
    });
  }

  const firstTerm = normalize(q).split(/\s+/)[0] ?? "";
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

  const cats = Array.from(new Set(articles.map((a) => a.cat)))
    .filter((c) => articles.some((a) => a.cat === c && score(a, q) > 1))
    .slice(0, 2);
  if (cats.length) {
    groups.push({
      label: "Categorias",
      kind: "Categoria",
      glyph: "◧",
      items: cats.map((c) => ({
        id: `cat:${c}`,
        text: c,
        meta: `${articles.filter((a) => a.cat === c).length} conteúdos nesta categoria`,
        href: `/resultados?q=${encodeURIComponent(c)}`,
        kind: "Categoria",
        glyph: "◧",
      })),
    });
  }

  const sys = systems
    .filter(
      (s) =>
        articles.some((a) => normalize(a.title + a.kw.join(" ")).includes(normalize(s.n))) ||
        normalize(s.n).includes(normalize(q))
    )
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

  const fq = faqs
    .filter((f) => score({ title: f, kw: [], cat: "", dept: "", snippet: f, rel: 0 }, q) > 1)
    .slice(0, 2);
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
