import { requireSession } from "@/lib/session";
import ArticleEditor from "@/components/ArticleEditor";

export const metadata = { title: "Novo artigo — Portal do Conhecimento" };

export default async function NovoArtigoPage({
  searchParams,
}: {
  searchParams: Promise<{ termo?: string }>;
}) {
  const session = await requireSession();
  const { termo } = await searchParams;
  return <ArticleEditor article={null} role={session.role} termoSugerido={termo} />;
}
