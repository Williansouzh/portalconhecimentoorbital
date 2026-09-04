export type Article = {
  id: string;
  title: string;
  cat: string;
  dept: string;
  type: string;
  read: string;
  views: string;
  updated: string;
  updatedISO: string;
  verified: boolean;
  outdated?: boolean;
  rel: number;
  kw: string[];
  snippet: string;
  path: string;
  status: "publicado" | "revisao" | "rascunho";
};

export type Highlighted = { pre: string; mid: string; post: string };

export type SuggestionItem = {
  id: string;
  text: string;
  meta: string;
  href: string;
  kind: string;
  glyph: string;
};

export type SuggestionGroup = {
  label: string;
  kind: string;
  glyph: string;
  items: SuggestionItem[];
};

export type SearchResult = Highlighted & {
  id: string;
  sPre: string;
  sMid: string;
  sPost: string;
  path: string;
  type: string;
  cat: string;
  updated: string;
  read: string;
  views: string;
  kw: string;
  verified: boolean;
  outdated: boolean;
  fav: boolean;
  relPct: number;
};

export type ArticleStep = { title: string; text: string };
export type ArticleRequirement = { ok: boolean; text: string };
export type ArticleFaq = { q: string; a: string };
export type ArticleBody = {
  intro: string;
  calloutText?: string;
  calloutHref?: string;
  steps: ArticleStep[];
  requirements: ArticleRequirement[];
  troubleshoot: string;
  faq: ArticleFaq[];
};

export type Category = {
  slug: string;
  label: string;
  count: number;
  description: string;
  icon: string;
};
