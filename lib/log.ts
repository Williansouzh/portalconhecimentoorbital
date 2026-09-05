type Nivel = "info" | "erro";

/**
 * Log em JSON numa linha: é o formato que qualquer coletor (Loki, CloudWatch,
 * Datadog) consome sem parser próprio.
 */
function escrever(nivel: Nivel, evento: string, dados: Record<string, unknown> = {}) {
  const linha = JSON.stringify({ ts: new Date().toISOString(), nivel, evento, ...dados });
  if (nivel === "erro") console.error(linha);
  else console.log(linha);
}

export const log = {
  info: (evento: string, dados?: Record<string, unknown>) => escrever("info", evento, dados),
  erro: (evento: string, erro: unknown, dados?: Record<string, unknown>) =>
    escrever("erro", evento, {
      ...dados,
      erro: erro instanceof Error ? erro.message : String(erro),
      pilha: erro instanceof Error ? erro.stack?.split("\n").slice(0, 4).join(" | ") : undefined,
    }),
};
