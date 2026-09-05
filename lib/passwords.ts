import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const derived = scryptSync(plain, salt, 64);
  const expectedBuf = Buffer.from(expected, "hex");
  if (derived.length !== expectedBuf.length) return false;
  return timingSafeEqual(derived, expectedBuf);
}

/**
 * Regras de senha do próprio portal, as mesmas que o conteúdo orienta aos
 * usuários. Devolve a lista de problemas — vazia quando a senha serve.
 */
export function problemasNaSenha(senha: string, email: string): string[] {
  const problemas: string[] = [];
  if (senha.length < 10) problemas.push("Use pelo menos 10 caracteres.");
  if (!/[a-zà-ú]/.test(senha) || !/[A-ZÀ-Ú]/.test(senha)) {
    problemas.push("Combine letras maiúsculas e minúsculas.");
  }
  if (!/\d/.test(senha)) problemas.push("Inclua ao menos um número.");
  const usuario = email.split("@")[0]?.toLowerCase() ?? "";
  if (usuario && senha.toLowerCase().includes(usuario)) {
    problemas.push("A senha não pode conter seu e-mail.");
  }
  return problemas;
}
