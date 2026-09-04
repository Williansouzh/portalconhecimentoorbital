import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { authenticate } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "credenciais_incompletas" }, { status: 400 });
  }

  // Mesma resposta para e-mail inexistente e senha errada, para não revelar
  // quais e-mails existem.
  const user = await authenticate(email, password);
  if (!user) {
    return NextResponse.json({ error: "credenciais_invalidas" }, { status: 401 });
  }

  const token = await createSessionToken({
    id: user.id,
    name: user.name,
    shortName: user.shortName,
    dept: user.dept,
    role: user.role,
  });

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, shortName: user.shortName, dept: user.dept, role: user.role },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
