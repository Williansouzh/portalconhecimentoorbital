import { NextRequest, NextResponse } from "next/server";
import { filterGroups, searchArticles, toSearchResult, type SortKey } from "@/lib/results";
import { getFavoriteIds, addSearch } from "@/lib/store";
import { getSession } from "@/lib/session";
import { recordSearch } from "@/lib/events";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") as SortKey) || "relevancia";
  const filters = searchParams.getAll("filter");

  const [favs, found, grupos] = await Promise.all([
    getFavoriteIds(session.id),
    searchArticles(q, sort, filters),
    filterGroups(),
  ]);

  const topScore = found.reduce((max, r) => Math.max(max, r.score), 0);
  const results = found.map(({ article, score }) => toSearchResult(article, q, favs, score, topScore));
  const searchEventId = await recordSearch(session.id, q, results.length);

  const groups = grupos.meta.map((g) => ({
    key: g.key,
    label: g.label,
    options: g.options.map(([label, value]) => ({
      label,
      value,
      count: g.key === "date" ? null : (grupos.counts[g.key]?.[value] ?? 0),
      on: filters.includes(`${g.key}|${value}`),
    })),
  }));

  return NextResponse.json({
    q,
    sort,
    searchEventId,
    results,
    resultCount: results.length,
    searchTimeMs: Math.round(q.length * 4 + 62),
    filterGroups: groups,
    activeFilters: filters,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (typeof body.q === "string" && body.q.trim()) await addSearch(session.id, body.q);
  return NextResponse.json({ ok: true });
}
