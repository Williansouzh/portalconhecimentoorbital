import { NextRequest, NextResponse } from "next/server";
import { createDraft } from "@/lib/store";
import { getSession } from "@/lib/session";
import { canCurate } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!canCurate(session.role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "title_required" }, { status: 400 });

  const draft = await createDraft({
    title,
    summary: typeof body.summary === "string" ? body.summary : undefined,
    cat: typeof body.cat === "string" ? body.cat : undefined,
    dept: typeof body.dept === "string" ? body.dept : undefined,
    keywords: Array.isArray(body.keywords) ? body.keywords : undefined,
    authorId: session.id,
  });

  return NextResponse.json({ ok: true, draft });
}
