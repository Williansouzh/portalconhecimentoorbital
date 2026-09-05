import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "portal_session";
const ISSUER = "portal-do-conhecimento";
const MAX_AGE_SECONDS = 8 * 60 * 60;

export type Role = "leitor" | "autor" | "curador";

export type SessionUser = {
  id: string;
  name: string;
  shortName: string;
  dept: string;
  role: Role;
  /** Identificador desta sessão, usado para revogá-la no logout. */
  jti?: string;
  /** Expiração do token, para saber até quando guardar a revogação. */
  exp?: number;
  /** Emissão do token: distingue sessões anteriores de posteriores a uma
   *  revogação global (troca de senha). */
  iat?: number;
};

/** Papéis que enxergam a área de curadoria (/admin e /admin/editor). */
export function canCurate(role: Role): boolean {
  return role === "autor" || role === "curador";
}

const DEV_SECRET = "dev-secret-portal-do-conhecimento-nao-use-em-producao";

function secret(): Uint8Array {
  const fromEnv = process.env.AUTH_SECRET;
  if (!fromEnv && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET é obrigatório em produção");
  }
  return new TextEncoder().encode(fromEnv || DEV_SECRET);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ name: user.name, shortName: user.shortName, dept: user.dept, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(crypto.randomUUID())
    .setSubject(user.id)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

/** Verifica o JWT. Funciona no runtime edge (middleware) e no Node. */
export async function readSessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: ISSUER });
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      name: String(payload.name ?? ""),
      shortName: String(payload.shortName ?? ""),
      dept: String(payload.dept ?? ""),
      role: (payload.role as Role) ?? "leitor",
      jti: typeof payload.jti === "string" ? payload.jti : undefined,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
      iat: typeof payload.iat === "number" ? payload.iat : undefined,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
