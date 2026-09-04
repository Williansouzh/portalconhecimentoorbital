import { NextRequest, NextResponse } from "next/server";

// Article helpfulness feedback ("Sim, resolveu" / "Não resolveu" + optional
// comment) and "report outdated" pings. No durable store yet — this is a
// stub the real analytics/ticketing backend can replace behind the same
// contract.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body || typeof body.articleId !== "string") {
    return NextResponse.json({ error: "articleId_required" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
