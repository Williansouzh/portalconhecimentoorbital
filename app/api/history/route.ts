import { NextRequest, NextResponse } from "next/server";
import { findArticle } from "@/lib/data";
import { clearHistory, getHistory, pushHistory, removeFromHistory } from "@/lib/store";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const hist = getHistory(session.id);
  const items = hist.map((id) => findArticle(id)).filter((a): a is NonNullable<typeof a> => !!a);
  return NextResponse.json({ hist, items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({ id: undefined }));
  if (typeof id !== "string") return NextResponse.json({ error: "id_required" }, { status: 400 });
  pushHistory(session.id, id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    removeFromHistory(session.id, id);
  } else {
    clearHistory(session.id);
  }
  return NextResponse.json({ ok: true });
}
