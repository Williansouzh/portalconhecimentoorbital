import { NextRequest, NextResponse } from "next/server";
import { clearFavorites, getFavoriteArticles, getFavoriteIds, toggleFavorite } from "@/lib/store";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [ids, items] = await Promise.all([getFavoriteIds(session.id), getFavoriteArticles(session.id)]);
  return NextResponse.json({ favs: Object.fromEntries([...ids].map((id) => [id, true])), items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({ id: undefined }));
  if (typeof id !== "string") return NextResponse.json({ error: "id_required" }, { status: 400 });
  const on = await toggleFavorite(session.id, id);
  return NextResponse.json({ id, on });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await clearFavorites(session.id);
  return NextResponse.json({ ok: true });
}
