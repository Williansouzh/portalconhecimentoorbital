import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articleBodies, articles, findArticle } from "@/lib/data";
import { getFavorites, pushHistory } from "@/lib/store";
import ArticleView from "@/components/ArticleView";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = findArticle(id);
  return { title: article ? `${article.title} — Portal do Conhecimento` : "Artigo não encontrado" };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = findArticle(id);
  if (!article) notFound();

  pushHistory(article.id);
  const favs = getFavorites();
  const related = articles
    .filter((a) => a.id !== article.id)
    .slice(0, 3)
    .map((a) => ({ id: a.id, title: a.title, cat: a.cat, read: a.read }));

  return <ArticleView article={article} body={articleBodies[article.id] ?? null} initialFav={!!favs[article.id]} related={related} />;
}
