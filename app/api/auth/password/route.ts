import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { findUserById, trocarSenha } from "@/lib/store";
import { problemasNaSenha, verifyPassword } from "@/lib/passwords";
import { revogarSessoesDoUsuario } from "@/lib/sessions";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const sessao = await getSession();
  if (!sessao) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const atual = typeof body.atual === "string" ? body.atual : "";
  const nova = typeof body.nova === "string" ? body.nova : "";

  const usuario = await findUserById(sessao.id);
  if (!usuario || !verifyPassword(atual, usuario.passwordHash)) {
    return NextResponse.json({ error: "senha_atual_incorreta" }, { status: 400 });
  }

  const problemas = problemasNaSenha(nova, usuario.email);
  if (problemas.length > 0) {
    return NextResponse.json({ error: "senha_fraca", problemas }, { status: 400 });
  }
  if (verifyPassword(nova, usuario.passwordHash)) {
    return NextResponse.json({ error: "senha_repetida", problemas: ["A nova senha é igual à atual."] }, { status: 400 });
  }

  await trocarSenha(sessao.id, nova);
  // Trocar a senha encerra as sessões abertas, inclusive esta.
  await revogarSessoesDoUsuario(sessao.id);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
