import { NextRequest, NextResponse } from "next/server";
import { findArticle, getFavoriteIds, getRelated, updateArticle } from "@/lib/store";
import { getSession } from "@/lib/session";
import { canCurate } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const article = await findArticle(id);
  if (!article) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [favs, related] = await Promise.all([getFavoriteIds(session.id), getRelated(article.id)]);

  return NextResponse.json({
    article: { ...article, snippetText: article.snippet.replace(/<[^>]+>/g, "") },
    fav: favs.has(article.id),
    related: related.map((a) => ({ id: a.id, title: a.title, cat: a.cat, read: a.read })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!canCurate(session.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await findArticle(id);
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "title_required" }, { status: 400 });

  const article = await updateArticle(id, {
    title,
    summary: typeof body.summary === "string" ? body.summary : existing.snippet,
    content: typeof body.content === "string" ? body.content : (existing.content ?? ""),
    cat: typeof body.cat === "string" ? body.cat : existing.cat,
    dept: typeof body.dept === "string" ? body.dept : existing.dept,
    keywords: Array.isArray(body.keywords) ? body.keywords : existing.kw,
    // Campo ausente mantém o valor atual; só um null/"" explícito limpa a data.
    nextReview:
      body.nextReview === undefined
        ? (existing.nextReview ?? null)
        : typeof body.nextReview === "string" && body.nextReview
          ? body.nextReview
          : null,
  });

  return NextResponse.json({ ok: true, article });
}
