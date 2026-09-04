import { NextRequest, NextResponse } from "next/server";
import { countFor, filterGroupsMeta, rankedArticles, toSearchResult, type SortKey } from "@/lib/results";
import { getFavorites, addSearch } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") as SortKey) || "relevancia";
  const filters = searchParams.getAll("filter");

  const favs = getFavorites();
  const ranked = rankedArticles(q, sort, filters);
  const results = ranked.map((a) => toSearchResult(a, q, favs));

  const groups = filterGroupsMeta().map((g) => ({
    key: g.key,
    label: g.label,
    options: g.options.map((opt) => {
      const [label, value] = Array.isArray(opt) ? opt : [opt, opt];
      return {
        label,
        value,
        count: g.key === "date" ? null : countFor(g.key, value),
        on: filters.includes(`${g.key}|${value}`),
      };
    }),
  }));

  return NextResponse.json({
    q,
    sort,
    results,
    resultCount: results.length,
    searchTimeMs: Math.round(q.length * 4 + 62),
    filterGroups: groups,
    activeFilters: filters,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (typeof body.q === "string" && body.q.trim()) addSearch(body.q);
  return NextResponse.json({ ok: true });
}
