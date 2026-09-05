import { Pool, type QueryResultRow } from "pg";
import { SCHEMA_SQL } from "./schema";
import { articleBodies, articles as seedArticles } from "./data";
import { hashPassword } from "./passwords";
import { normalize } from "./search";
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

// Conteúdo nos demais estágios do fluxo editorial, para o painel de gestão
// refletir um acervo em movimento e não só publicados.
const SEED_EM_FLUXO: { id: string; title: string; cat: string; dept: string; status: string; autor: string; diasAtras: number }[] = [
  { id: "ponto-app", title: "Ponto eletrônico no app", cat: "Recursos Humanos", dept: "RH · Pessoas", status: "rascunho", autor: "bruno", diasAtras: 4 },
  { id: "cracha", title: "Troca de crachá", cat: "Operações", dept: "Operações · Benefícios", status: "rascunho", autor: "bruno", diasAtras: 2 },
  { id: "km", title: "Reembolso de quilometragem", cat: "Financeiro", dept: "Financeiro · Contas a pagar", status: "revisao", autor: "carla", diasAtras: 18 },
  { id: "odonto", title: "Plano odontológico para dependentes", cat: "Recursos Humanos", dept: "RH · Pessoas", status: "revisao", autor: "bruno", diasAtras: 3 },
  { id: "viagens", title: "Política de viagens 2026", cat: "Políticas internas", dept: "RH · Pessoas", status: "aprovacao", autor: "carla", diasAtras: 9 },
];

// Uso sintético dos últimos 60 dias: sem isso o painel de gestão abre zerado
// numa instalação nova. São dados de demonstração, como os artigos semente.
const SEED_BUSCAS: { termo: string; artigo: string | null; resultados: number; buscas: number; taxaClique: number }[] = [
  { termo: "redefinir senha", artigo: "senha", resultados: 6, buscas: 46, taxaClique: 0.94 },
  { termo: "férias", artigo: "ferias", resultados: 1, buscas: 33, taxaClique: 0.88 },
  { termo: "reembolso", artigo: "reembolso", resultados: 1, buscas: 25, taxaClique: 0.81 },
  { termo: "vale-transporte", artigo: "vt", resultados: 1, buscas: 19, taxaClique: 0.62 },
  { termo: "chamado", artigo: "chamados", resultados: 1, buscas: 17, taxaClique: 0.79 },
  { termo: "ponto eletrônico app", artigo: null, resultados: 0, buscas: 9, taxaClique: 0 },
  { termo: "troca de crachá", artigo: null, resultados: 0, buscas: 6, taxaClique: 0 },
  { termo: "plano odontológico dependente", artigo: null, resultados: 0, buscas: 4, taxaClique: 0 },
];

async function seedFluxoEditorial() {
  for (const a of SEED_EM_FLUXO) {
    await raw(
      `INSERT INTO articles
         (id, title, cat, dept, type, read_time, updated_at, snippet, path, status, keywords, author_id, created_at)
       VALUES ($1,$2,$3,$4,'Procedimento','—', current_date, '', $5, $6, '{}', $7, now() - ($8 || ' days')::interval)
       ON CONFLICT (id) DO NOTHING`,
      [a.id, a.title, a.cat, a.dept, `Início · ${a.cat}`, a.status, a.autor, String(a.diasAtras)]
    );
  }
}

async function seedEventos() {
  for (const b of SEED_BUSCAS) {
    await raw(
      `INSERT INTO search_events (user_id, term, normalized, results_count, created_at)
       SELECT (ARRAY['ana','bruno','carla'])[1 + floor(random() * 3)],
              $1, $2, $3, now() - (random() * interval '60 days')
         FROM generate_series(1, $4)`,
      [b.termo, normalize(b.termo), b.resultados, b.buscas]
    );

    if (b.artigo) {
      // O clique é atribuído à busca que o gerou, alguns segundos depois —
      // é essa diferença que vira "tempo médio até a resposta".
      await raw(
        `INSERT INTO result_clicks (search_event_id, user_id, article_id, created_at)
         SELECT s.id, s.user_id, $1, s.created_at + ((18 + random() * 55) || ' seconds')::interval
           FROM search_events s
          WHERE s.normalized = $2 AND s.results_count > 0 AND random() < $3`,
        [b.artigo, normalize(b.termo), b.taxaClique]
      );
    }
  }

  await raw(
    `INSERT INTO article_feedback (article_id, user_id, helpful, created_at)
     SELECT (ARRAY['senha','ferias','reembolso','chamados','2fa'])[1 + floor(random() * 5)],
            (ARRAY['ana','bruno','carla'])[1 + floor(random() * 3)],
            random() < 0.87,
            now() - (random() * interval '30 days')
       FROM generate_series(1, 64)`
  );
}

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

  await seedFluxoEditorial();
  await seedEventos();
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
