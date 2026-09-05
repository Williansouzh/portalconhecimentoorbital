import type { Article, ArticleBody } from "./types";

export type ArticleRow = {
  id: string;
  title: string;
  cat: string;
  dept: string;
  type: string;
  read_time: string;
  views: number;
  updated_at: Date | string;
  verified: boolean;
  outdated: boolean;
  rel: number;
  keywords: string[];
  snippet: string;
  path: string;
  status: Article["status"];
  body: ArticleBody | null;
  content: string | null;
  classification: string | null;
  next_review: Date | string | null;
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-08-12" -> "12 ago 2026" */
export function formatDate(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return `${String(d.getDate()).padStart(2, "0")} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** 12480 -> "12.480" */
export function formatViews(n: number): string {
  return n.toLocaleString("pt-BR");
}

export function toISODate(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function rowToArticle(r: ArticleRow): Article {
  return {
    id: r.id,
    title: r.title,
    cat: r.cat,
    dept: r.dept,
    type: r.type,
    read: r.read_time,
    views: formatViews(r.views),
    updated: formatDate(r.updated_at),
    updatedISO: toISODate(r.updated_at),
    verified: r.verified,
    outdated: r.outdated,
    rel: r.rel,
    kw: r.keywords,
    snippet: r.snippet,
    path: r.path,
    status: r.status,
    content: r.content ?? undefined,
    classification: r.classification ?? undefined,
    nextReview: r.next_review ? toISODate(r.next_review) : undefined,
  };
}
