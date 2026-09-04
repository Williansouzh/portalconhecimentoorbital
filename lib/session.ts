import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken, type SessionUser } from "./auth";

/** Sessão do request atual (server components e route handlers). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Sessão obrigatória. O middleware já barra requests sem sessão, então
 * chegar aqui sem uma significa configuração incorreta, não fluxo normal.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("sessão ausente");
  return session;
}
