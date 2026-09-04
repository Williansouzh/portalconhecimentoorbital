import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Avaliação do artigo ("Sim, resolveu" / "Não resolveu" + comentário) e aviso
// de conteúdo desatualizado. Ainda sem persistência — é o ponto de entrada
// para o backend real de analytics/chamados, atrás do mesmo contrato.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body || typeof body.articleId !== "string") {
    return NextResponse.json({ error: "articleId_required" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
