import { NextRequest, NextResponse } from "next/server";
import { addSearch, clearSearches, getSearches, removeSearch } from "@/lib/store";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ searches: getSearches(session.id) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { q } = await req.json().catch(() => ({ q: undefined }));
  if (typeof q !== "string") return NextResponse.json({ error: "q_required" }, { status: 400 });
  addSearch(session.id, q);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (q) {
    removeSearch(session.id, q);
  } else {
    clearSearches(session.id);
  }
  return NextResponse.json({ ok: true });
}
