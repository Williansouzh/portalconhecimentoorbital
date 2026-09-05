import { Pool, type QueryResultRow } from "pg";
import { SCHEMA_SQL } from "./schema";
import { seedArticles } from "./data";
import { hashPassword } from "./passwords";
import type { Role } from "./auth";

// Pool e inicialização vivem no globalThis: server components e route handlers
// são empacotados em chunks separados e cada um teria o seu próprio pool,
// multiplicando conexões e rodando o seed em paralelo.
declare global {
  var __portalPool: Pool | undefined;
  var __portalReady: Promise<void> | undefined;
}

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL é obrigatório");
  return url;
}

export function pool(): Pool {
  if (!globalThis.__portalPool) {
    globalThis.__portalPool = new Pool({ connectionString: connectionString(), max: 10 });
  }
  return globalThis.__portalPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  await ready();
  const res = await pool().query<T>(text, params);
  return res.rows;
}

/** Igual a query(), mas sem esperar a inicialização (uso interno do boot). */
async function raw<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query<T>(text, params);
  return res.rows;
}

const SEED_PASSWORD = process.env.SEED_PASSWORD || "portal2026";

const SEED_USERS: { id: string; name: string; shortName: string; email: string; dept: string; role: Role }[] = [
  { id: "ana", name: "Ana Coutinho", shortName: "Ana C.", email: "ana.coutinho@riocard.com.br", dept: "Atendimento", role: "leitor" },
  { id: "bruno", name: "Bruno Lima", shortName: "Bruno L.", email: "bruno.lima@riocard.com.br", dept: "Atendimento", role: "autor" },
  { id: "carla", name: "Carla Menezes", shortName: "Carla M.", email: "carla.menezes@riocard.com.br", dept: "Qualidade · Atendimento", role: "curador" },
];

async function seed() {
  const [{ count }] = await raw<{ count: string }>("SELECT count(*)::text AS count FROM users");
  if (Number(count) > 0) return;

  for (const u of SEED_USERS) {
    await raw(
      `INSERT INTO users (id, name, short_name, email, dept, role, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [u.id, u.name, u.shortName, u.email, u.dept, u.role, hashPassword(SEED_PASSWORD)]
    );
  }

  // Conteúdo real: os roteiros de atendimento transcritos do documento.
  for (const a of seedArticles) {
    await raw(
      `INSERT INTO articles
         (id, title, cat, dept, type, read_time, views, updated_at, published_at, verified, rel,
          keywords, snippet, content, classification, path, status)
       VALUES ($1,$2,$3,$4,$5,$6,0, current_date, now(), false, 0, $7,$8,$9,$10,$11,'publicado')
       ON CONFLICT (id) DO NOTHING`,
      [
        a.id,
        a.title,
        a.cat,
        a.dept,
        a.type,
        tempoDeLeitura(a.content),
        a.keywords,
        a.summary,
        a.content,
        a.classification,
        `Início · ${a.cat}`,
      ]
    );
  }

  await encerraSeed();
}

async function encerraSeed() {
  // O acervo já existente não é novidade para ninguém: o contador do sino
  // começa zerado e só conta o que for publicado daqui para frente.
  await raw("UPDATE users SET news_seen_at = now()");
}

/** ~200 palavras por minuto, arredondado para cima. */
function tempoDeLeitura(texto: string): string {
  const palavras = texto.trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(palavras / 200))} min`;
}

/** Cria o schema e semeia os dados iniciais uma única vez por processo. */
export function ready(): Promise<void> {
  if (!globalThis.__portalReady) {
    globalThis.__portalReady = (async () => {
      await pool().query(SCHEMA_SQL);
      await seed();
    })().catch((err) => {
      // Uma falha não pode ficar cacheada: o próximo request tenta de novo
      // (o banco pode ainda estar subindo).
      globalThis.__portalReady = undefined;
      throw err;
    });
  }
  return globalThis.__portalReady;
}
