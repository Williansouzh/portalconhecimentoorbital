import { NextRequest, NextResponse } from "next/server";
import { articleBodies } from "@/lib/data";
import { findArticle, getFavoriteIds, getRelated } from "@/lib/store";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const article = await findArticle(id);
  if (!article) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [favs, related] = await Promise.all([getFavoriteIds(session.id), getRelated(article.id)]);

  return NextResponse.json({
    article: { ...article, snippetText: article.snippet.replace(/<[^>]+>/g, "") },
    body: articleBodies[article.id] ?? null,
    fav: favs.has(article.id),
    related: related.map((a) => ({ id: a.id, title: a.title, cat: a.cat, read: a.read })),
  });
}
