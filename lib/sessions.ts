import { query } from "./db";

/**
 * O middleware só confere a assinatura do JWT (roda no runtime edge, sem
 * banco). A checagem de revogação acontece aqui, no runtime Node, em toda
 * leitura de sessão.
 */
export async function tokenRevogado(
  jti: string | undefined,
  userId?: string,
  emitidoEm?: number
): Promise<boolean> {
  if (!jti) return false;
  const linhas = await query<{ jti: string }>(
    `SELECT jti FROM revoked_tokens
      WHERE jti = $1
         -- Revogação global (troca de senha) atinge só o que foi emitido
         -- antes dela; senão o login seguinte já nasceria inválido.
         OR ($2::text IS NOT NULL AND user_id = $2 AND jti LIKE 'todos:%'
             AND revoked_at > to_timestamp($3))
      LIMIT 1`,
    [jti, userId ?? null, emitidoEm ?? 0]
  );
  return linhas.length > 0;
}

export async function revogarToken(jti: string | undefined, userId: string, exp: number | undefined) {
  if (!jti) return;
  const expiraEm = exp ? new Date(exp * 1000) : new Date(Date.now() + 8 * 60 * 60 * 1000);
  await query(
    `INSERT INTO revoked_tokens (jti, user_id, expires_at) VALUES ($1, $2, $3)
     ON CONFLICT (jti) DO NOTHING`,
    [jti, userId, expiraEm]
  );
  // Guardar token expirado não serve para nada: a assinatura já não vale.
  await query("DELETE FROM revoked_tokens WHERE expires_at < now()");
}

/** Encerra todas as sessões do usuário (usado ao trocar a senha). */
export async function revogarSessoesDoUsuario(userId: string) {
  await query(
    `INSERT INTO revoked_tokens (jti, user_id, expires_at)
     SELECT 'todos:' || $1 || ':' || extract(epoch FROM now())::bigint, $1, now() + interval '8 hours'
     ON CONFLICT (jti) DO NOTHING`,
    [userId]
  );
}
