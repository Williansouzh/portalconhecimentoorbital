import { NextRequest, NextResponse } from "next/server";
import { articles } from "@/lib/data";
import { clearFavorites, getFavorites, toggleFavorite } from "@/lib/store";

export async function GET() {
  const favs = getFavorites();
  const items = articles.filter((a) => favs[a.id]);
  return NextResponse.json({ favs, items });
}

export async function POST(req: NextRequest) {
  const { id } = await req.json().catch(() => ({ id: undefined }));
  if (typeof id !== "string") return NextResponse.json({ error: "id_required" }, { status: 400 });
  const on = toggleFavorite(id);
  return NextResponse.json({ id, on });
}

export async function DELETE() {
  clearFavorites();
  return NextResponse.json({ ok: true });
}
