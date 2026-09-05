import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { recordClick } from "@/lib/events";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const searchEventId = Number(body.searchEventId);
  const articleId = typeof body.articleId === "string" ? body.articleId : "";
  if (!Number.isFinite(searchEventId) || !articleId) {
    return NextResponse.json({ error: "parametros_invalidos" }, { status: 400 });
  }

  await recordClick(session.id, searchEventId, articleId);
  return NextResponse.json({ ok: true });
}
