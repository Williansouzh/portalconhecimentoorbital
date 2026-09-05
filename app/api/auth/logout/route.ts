import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { revogarToken } from "@/lib/sessions";

export async function POST() {
  const sessao = await getSession();
  if (sessao) await revogarToken(sessao.jti, sessao.id, sessao.exp);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
