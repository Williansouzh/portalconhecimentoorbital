import type { Article, Highlighted } from "./types";
import { synonyms } from "./data";

const DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");

export function normalize(input: string): string {
  return String(input || "")
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase();
}

// Bounded Levenshtein distance — mirrors the prototype's short-circuit for
// strings whose length differs by more than 2 (never a near-match anyway).
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const k = b.length;
  if (Math.abs(m - k) > 2) return 9;
  let prev = Array.from({ length: k + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur: number[] = [i];
    for (let j = 1; j <= k; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[k];
}

export function expandSynonyms(q: string): string[] {
  const t = normalize(q);
  const out = [t];
  Object.keys(synonyms).forEach((k) => {
    if (t.includes(k)) out.push(...synonyms[k].map((s) => normalize(s)));
    synonyms[k].forEach((s) => {
      if (t.includes(normalize(s))) out.push(k);
    });
  });
  return out;
}

export type Scoreable = Pick<Article, "title" | "kw" | "cat" | "dept" | "snippet" | "rel">;

function haystack(a: Scoreable): string {
  return normalize(
    `${a.title} ${a.kw.join(" ")} ${a.cat} ${a.dept} ${a.snippet.replace(/<[^>]+>/g, "")}`
  );
}

export function score(a: Scoreable, q: string): number {
  if (!q.trim()) return 0;
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  const hay = haystack(a);
  const hayWords = hay.split(/\W+/);
  const alts = expandSynonyms(q);
  let s = 0;
  terms.forEach((t) => {
    if (hay.includes(t)) s += normalize(a.title).includes(t) ? 6 : 3;
    else if (hayWords.some((w) => w.startsWith(t))) s += 2.4;
    else if (t.length > 3 && hayWords.some((w) => levenshtein(w, t) <= 1)) s += 1.8;
    else if (alts.some((alt) => alt && hay.includes(alt))) s += 1.2;
  });
  return s + a.rel / 200;
}

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

export function relevancePct(a: Article, q: string): number {
  return Math.min(100, Math.round(score(a, q) * 11 + 18));
}

export function parseViews(v: string): number {
  return parseFloat(v.replace(/\./g, "").replace(",", "."));
}

const DAY = 24 * 60 * 60 * 1000;
export function withinWindow(updatedISO: string, window: "30d" | "3m" | "ano", today: Date): boolean {
  const updated = new Date(updatedISO + "T00:00:00");
  const diffDays = (today.getTime() - updated.getTime()) / DAY;
  if (window === "30d") return diffDays <= 30;
  if (window === "3m") return diffDays <= 92;
  return updated.getFullYear() === today.getFullYear();
}
