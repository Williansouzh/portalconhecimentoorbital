import { NextRequest, NextResponse } from "next/server";
import { buildSuggestionGroups } from "@/lib/suggestions";
import { highlight } from "@/lib/search";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const groups = (await buildSuggestionGroups(q)).map((g) => ({
    label: g.label,
    kind: g.kind,
    glyph: g.glyph,
    items: g.items.map((it) => ({ ...it, ...highlight(it.text, q) })),
  }));
  const count = groups.reduce((n, g) => n + g.items.length, 0);
  return NextResponse.json({ q, groups, count });
}
