import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, readSessionToken, type SessionUser } from "./auth";
import { tokenRevogado } from "./sessions";

/** Sessão do request atual (server components e route handlers). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const sessao = await readSessionToken(store.get(SESSION_COOKIE)?.value);
  if (!sessao) return null;
  return (await tokenRevogado(sessao.jti, sessao.id, sessao.iat)) ? null : sessao;
}

/**
 * Sessão obrigatória nas páginas. O middleware valida só a assinatura — ele
 * roda no edge, sem banco —, então um token revogado chega até aqui com
 * assinatura boa e sessão nula. Nesse caso o certo é mandar ao login, não
 * estourar um 500.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
