import { NextRequest, NextResponse } from "next/server";
import { articleBodies, articles, findArticle } from "@/lib/data";
import { getFavorites } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = findArticle(id);
  if (!article) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const favs = getFavorites();
  const related = articles
    .filter((a) => a.id !== article.id)
    .slice(0, 3)
    .map((a) => ({ id: a.id, title: a.title, cat: a.cat, read: a.read }));

  return NextResponse.json({
    article: { ...article, snippetText: article.snippet.replace(/<[^>]+>/g, "") },
    body: articleBodies[article.id] ?? null,
    fav: !!favs[article.id],
    related,
  });
}
