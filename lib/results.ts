import { articles } from "./data";
import type { Article, SearchResult } from "./types";
import { highlight, parseViews, relevancePct, score, withinWindow } from "./search";

export type SortKey = "relevancia" | "acessados" | "recentes";

const FILTER_GROUPS = [
  { key: "cat", label: "Categoria", options: ["Tecnologia", "Recursos Humanos", "Sistemas", "Financeiro", "Segurança"] },
  { key: "dept", label: "Departamento", options: ["TI", "RH", "Financeiro", "Operações", "Segurança"] },
  { key: "type", label: "Tipo de conteúdo", options: ["Tutorial", "Procedimento", "Política", "Solução de problema"] },
  {
    key: "date",
    label: "Última atualização",
    options: [["30 dias", "30d"], ["3 meses", "3m"], ["Este ano", "ano"]] as [string, string][],
  },
];

function matchesGroup(a: Article, group: string, value: string): boolean {
  if (group === "cat") return a.cat === value;
  if (group === "type") return a.type === value;
  if (group === "dept") return a.dept.startsWith(value);
  return true;
}

export function countFor(group: string, value: string): number {
  return articles.filter((a) => a.status === "publicado" && matchesGroup(a, group, value)).length;
}

export function filterGroupsMeta() {
  return FILTER_GROUPS;
}

export function rankedArticles(
  q: string,
  sort: SortKey,
  activeFilters: string[],
  today: Date = new Date()
): Article[] {
  let list = articles.filter((a) => a.status === "publicado").map((a) => ({ a, s: score(a, q) }));
  if (q.trim()) list = list.filter((x) => x.s > 1);

  const byGroup: Record<string, string[]> = {};
  activeFilters.forEach((key) => {
    const [g, v] = key.split("|");
    if (!g || v === undefined) return;
    (byGroup[g] = byGroup[g] || []).push(v);
  });
  Object.entries(byGroup).forEach(([g, values]) => {
    if (g === "date") {
      list = list.filter((x) => values.some((v) => withinWindow(x.a.updatedISO, v as "30d" | "3m" | "ano", today)));
    } else {
      list = list.filter((x) => values.some((v) => matchesGroup(x.a, g, v)));
    }
  });

  list.sort((x, y) => {
    if (sort === "acessados") return parseViews(y.a.views) - parseViews(x.a.views);
    if (sort === "recentes") return new Date(y.a.updatedISO).getTime() - new Date(x.a.updatedISO).getTime();
    return y.s - x.s;
  });

  return list.map((x) => x.a);
}

export function toSearchResult(a: Article, q: string, favs: Record<string, boolean>): SearchResult {
  const h = highlight(a.title, q);
  const s = highlight(a.snippet.replace(/<[^>]+>/g, ""), q);
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
    fav: !!favs[a.id],
    relPct: relevancePct(a, q),
  };
}
