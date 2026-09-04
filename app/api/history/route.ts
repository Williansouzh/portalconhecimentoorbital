import { NextRequest, NextResponse } from "next/server";
import { findArticle } from "@/lib/data";
import { clearHistory, getHistory, pushHistory, removeFromHistory } from "@/lib/store";

export async function GET() {
  const hist = getHistory();
  const items = hist.map((id) => findArticle(id)).filter((a): a is NonNullable<typeof a> => !!a);
  return NextResponse.json({ hist, items });
}

export async function POST(req: NextRequest) {
  const { id } = await req.json().catch(() => ({ id: undefined }));
  if (typeof id !== "string") return NextResponse.json({ error: "id_required" }, { status: 400 });
  pushHistory(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    removeFromHistory(id);
  } else {
    clearHistory();
  }
  return NextResponse.json({ ok: true });
}
