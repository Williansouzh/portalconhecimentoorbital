import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { recordFeedback } from "@/lib/events";

// Avaliação do artigo ("Sim, resolveu" / "Não resolveu" + comentário) e aviso
// de conteúdo desatualizado. Alimenta o painel de gestão.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body || typeof body.articleId !== "string") {
    return NextResponse.json({ error: "articleId_required" }, { status: 400 });
  }
  await recordFeedback({
    userId: session.id,
    articleId: body.articleId,
    helpful: typeof body.helpful === "boolean" ? body.helpful : undefined,
    outdatedReport: body.reportOutdated === true,
    comment: typeof body.comment === "string" ? body.comment : undefined,
  });

  return NextResponse.json({ ok: true });
}
