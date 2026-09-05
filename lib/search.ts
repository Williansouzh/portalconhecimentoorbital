import type { Highlighted } from "./types";
import { synonyms } from "./data";

const DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");

export function normalize(input: string): string {
  return String(input || "")
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase();
}

/** Termos equivalentes: "ticket" encontra "chamado", "password" encontra "senha". */
export function synonymsFor(term: string): string[] {
  const out = new Set<string>();
  Object.entries(synonyms).forEach(([key, values]) => {
    const normalized = values.map((v) => normalize(v));
    if (term === key || term.startsWith(key)) normalized.forEach((v) => out.add(v));
    if (normalized.some((v) => v === term || v.startsWith(term))) out.add(key);
  });
  out.delete(term);
  return [...out];
}

// Preposições e artigos viram lexema vazio no dicionário português: mantê-los
// no AND fazia a consulta inteira falhar ("bolsa de crédito" não achava nada).
const VAZIAS = new Set([
  "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
  "em", "no", "na", "nos", "nas", "ao", "aos", "e", "ou", "que", "por", "pelo", "pela",
  "com", "para", "se", "ser", "foi",
]);

/**
 * Monta o tsquery: cada termo digitado vira um grupo OR com seus sinônimos,
 * todos com prefixo (`:*`) para a busca responder já na terceira letra, e os
 * grupos são combinados com AND. Retorna "" quando não sobra nada pesquisável.
 */
export function buildTsQuery(q: string): string {
  const terms = normalize(q)
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);
  const uteis = terms.filter((t) => !VAZIAS.has(t));
  const efetivos = uteis.length ? uteis : terms;
  if (!efetivos.length) return "";

  return efetivos
    .map((term) => {
      const alternatives = [term, ...synonymsFor(term).map((s) => s.replace(/[^a-z0-9 ]/g, "").split(" ")[0])]
        .filter(Boolean)
        .map((t) => `${t}:*`);
      return `(${[...new Set(alternatives)].join(" | ")})`;
    })
    .join(" & ");
}

/** Trecho destacado: divide o texto em antes / termo / depois. */
export function highlight(text: string, q: string): Highlighted {
  const t = normalize(text);
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  let best: { i: number; len: number } | null = null;
  terms.forEach((term) => {
    const i = t.indexOf(term);
    if (i >= 0 && (!best || term.length > best.len)) best = { i, len: term.length };
  });
  if (!best) return { pre: text, mid: "", post: "" };
  const b: { i: number; len: number } = best;
  return { pre: text.slice(0, b.i), mid: text.slice(b.i, b.i + b.len), post: text.slice(b.i + b.len) };
}
