import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { findArticle, listarRevisoes } from "@/lib/store";
import ArticleEditor from "@/components/ArticleEditor";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await findArticle(id);
  return { title: article ? `Editar: ${article.title}` : "Artigo não encontrado" };
}

export default async function EditarArtigoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const article = await findArticle(id);
  if (!article) notFound();

  const revisoes = await listarRevisoes(article.id);
  return <ArticleEditor article={article} role={session.role} revisoesIniciais={revisoes} />;
}
