import { NextRequest, NextResponse } from "next/server";
import { buildSuggestionGroups } from "@/lib/suggestions";
import { highlight } from "@/lib/search";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const groups = buildSuggestionGroups(q).map((g) => ({
    label: g.label,
    kind: g.kind,
    glyph: g.glyph,
    items: g.items.map((it) => ({ ...it, ...highlight(it.text, q) })),
  }));
  const count = groups.reduce((n, g) => n + g.items.length, 0);
  return NextResponse.json({ q, groups, count });
}
