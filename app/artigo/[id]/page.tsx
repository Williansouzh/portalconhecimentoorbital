import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findArticle, getFavoriteIds, getRelated, incrementViews, pushHistory } from "@/lib/store";
import { requireSession } from "@/lib/session";
import ArticleView from "@/components/ArticleView";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await findArticle(id);
  return { title: article ? `${article.title} — Portal do Conhecimento` : "Artigo não encontrado" };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const article = await findArticle(id);
  if (!article) notFound();

  await Promise.all([pushHistory(session.id, article.id), incrementViews(article.id)]);
  const [favs, related] = await Promise.all([getFavoriteIds(session.id), getRelated(article.id)]);

  return (
    <ArticleView
      article={article}
      body={null}
      initialFav={favs.has(article.id)}
      related={related.map((a) => ({ id: a.id, title: a.title, cat: a.cat, read: a.read }))}
    />
  );
}
