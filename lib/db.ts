import { Pool, type QueryResultRow } from "pg";
import { SCHEMA_SQL } from "./schema";
import { articleBodies, articles as seedArticles } from "./data";
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
  { id: "ana", name: "Ana Coutinho", shortName: "Ana C.", email: "ana.coutinho@riocard.com.br", dept: "Operações", role: "leitor" },
  { id: "bruno", name: "Bruno Lima", shortName: "Bruno L.", email: "bruno.lima@riocard.com.br", dept: "RH · Pessoas", role: "autor" },
  { id: "carla", name: "Carla Menezes", shortName: "Carla M.", email: "carla.menezes@riocard.com.br", dept: "TI · Suporte", role: "curador" },
];

// Estado inicial só da Ana, para a demo abrir com conteúdo na tela.
const SEED_ANA = {
  favs: ["senha", "remoto", "reembolso"],
  hist: ["senha", "remoto", "chamados", "vt", "email"],
  searches: ["redefinir senha", "férias 2026", "reembolso combustível", "sap bloqueado"],
};

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

  for (const a of seedArticles) {
    await raw(
      `INSERT INTO articles
         (id, title, cat, dept, type, read_time, views, updated_at, verified, outdated, rel, keywords, snippet, path, status, body)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (id) DO NOTHING`,
      [
        a.id,
        a.title,
        a.cat,
        a.dept,
        a.type,
        a.read,
        Number(a.views.replace(/\./g, "")),
        a.updatedISO,
        a.verified,
        !!a.outdated,
        a.rel,
        a.kw,
        a.snippet,
        a.path,
        a.status,
        articleBodies[a.id] ? JSON.stringify(articleBodies[a.id]) : null,
      ]
    );
  }

  for (const id of SEED_ANA.favs) {
    await raw("INSERT INTO favorites (user_id, article_id) VALUES ('ana', $1) ON CONFLICT DO NOTHING", [id]);
  }
  // viewed_at decrescente para o histórico sair na ordem semeada
  for (const [i, id] of SEED_ANA.hist.entries()) {
    await raw(
      "INSERT INTO history (user_id, article_id, viewed_at) VALUES ('ana', $1, now() - ($2 || ' minutes')::interval) ON CONFLICT DO NOTHING",
      [id, String(i)]
    );
  }
  for (const [i, term] of SEED_ANA.searches.entries()) {
    await raw(
      "INSERT INTO recent_searches (user_id, term, searched_at) VALUES ('ana', $1, now() - ($2 || ' minutes')::interval) ON CONFLICT DO NOTHING",
      [term, String(i)]
    );
  }
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
