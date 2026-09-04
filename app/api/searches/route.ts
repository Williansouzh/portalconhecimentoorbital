import { NextRequest, NextResponse } from "next/server";
import { addSearch, clearSearches, getSearches, removeSearch } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ searches: getSearches() });
}

export async function POST(req: NextRequest) {
  const { q } = await req.json().catch(() => ({ q: undefined }));
  if (typeof q !== "string") return NextResponse.json({ error: "q_required" }, { status: 400 });
  addSearch(q);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (q) {
    removeSearch(q);
  } else {
    clearSearches();
  }
  return NextResponse.json({ ok: true });
}
