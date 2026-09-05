import { Client } from "pg";

const BASE = process.env.TEST_BASE_DATABASE_URL ?? "postgres://portal:portal@127.0.0.1:5433/portal";
const NOME = "portal_test";

/**
 * Recria o banco de teste antes da suíte. Sem Postgres alcançável, marca a
 * ausência para os testes de integração se pularem em vez de falharem.
 */
export async function setup() {
  const cliente = new Client({ connectionString: BASE, connectionTimeoutMillis: 3000 });
  try {
    await cliente.connect();
  } catch {
    process.env.DB_DISPONIVEL = "";
    console.warn(`\n[testes] Postgres indisponível em ${BASE} — integração será pulada.\n`);
    return;
  }
  await cliente.query(`DROP DATABASE IF EXISTS ${NOME} WITH (FORCE)`);
  await cliente.query(`CREATE DATABASE ${NOME}`);
  await cliente.end();
  process.env.DB_DISPONIVEL = "1";
}
