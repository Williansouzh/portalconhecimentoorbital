import { NextRequest, NextResponse } from "next/server";
import { findArticle, setArticleStatus } from "@/lib/store";
import { getSession } from "@/lib/session";
import { canCurate } from "@/lib/auth";
import type { ArticleStatus } from "@/lib/types";

const ESTAGIOS: ArticleStatus[] = ["rascunho", "revisao", "aprovacao", "publicado"];

// Aprovar e publicar são do curador; autor leva o conteúdo até a revisão.
const SO_CURADOR: ArticleStatus[] = ["aprovacao", "publicado"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!canCurate(session.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body.status as ArticleStatus;
  if (!ESTAGIOS.includes(status)) return NextResponse.json({ error: "status_invalido" }, { status: 400 });
  if (SO_CURADOR.includes(status) && session.role !== "curador") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const existing = await findArticle(id);
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const article = await setArticleStatus(id, status);
  return NextResponse.json({ ok: true, article });
}
