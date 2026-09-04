import { NextRequest, NextResponse } from "next/server";
import { articles } from "@/lib/data";
import { clearFavorites, getFavorites, toggleFavorite } from "@/lib/store";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const favs = getFavorites(session.id);
  const items = articles.filter((a) => favs[a.id]);
  return NextResponse.json({ favs, items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({ id: undefined }));
  if (typeof id !== "string") return NextResponse.json({ error: "id_required" }, { status: 400 });
  const on = toggleFavorite(session.id, id);
  return NextResponse.json({ id, on });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  clearFavorites(session.id);
  return NextResponse.json({ ok: true });
}
