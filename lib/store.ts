import { query } from "./db";
import { verifyPassword } from "./passwords";
import type { Role } from "./auth";
import type { Article, ArticleStatus } from "./types";
import { rowToArticle, type ArticleRow } from "./rows";

export { hashPassword, verifyPassword } from "./passwords";
import { hashPassword } from "./passwords";

export type UserRecord = {
  id: string;
  name: string;
  shortName: string;
  email: string;
  dept: string;
  role: Role;
  passwordHash: string;
};

type UserRow = {
  id: string;
  name: string;
  short_name: string;
  email: string;
  dept: string;
  role: Role;
  password_hash: string;
};

function toUser(r: UserRow): UserRecord {
  return {
    id: r.id,
    name: r.name,
    shortName: r.short_name,
    email: r.email,
    dept: r.dept,
    role: r.role,
    passwordHash: r.password_hash,
  };
}

// ---------- usuários ----------

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const rows = await query<UserRow>("SELECT * FROM users WHERE lower(email) = lower($1)", [email.trim()]);
  return rows[0] ? toUser(rows[0]) : undefined;
}

export async function findUserById(id: string): Promise<UserRecord | undefined> {
  const rows = await query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] ? toUser(rows[0]) : undefined;
}

export async function authenticate(email: string, password: string): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export async function trocarSenha(userId: string, novaSenha: string): Promise<void> {
  await query("UPDATE users SET password_hash = $2 WHERE id = $1", [userId, hashPassword(novaSenha)]);
}

// ---------- favoritos ----------

export async function getFavoriteIds(userId: string): Promise<Set<string>> {
  const rows = await query<{ article_id: string }>("SELECT article_id FROM favorites WHERE user_id = $1", [userId]);
  return new Set(rows.map((r) => r.article_id));
}

export async function getFavoriteArticles(userId: string): Promise<Article[]> {
  const rows = await query<ArticleRow>(
    `SELECT a.* FROM favorites f JOIN articles a ON a.id = f.article_id
     WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows.map(rowToArticle);
}

export async function toggleFavorite(userId: string, articleId: string): Promise<boolean> {
  const removed = await query(
    "DELETE FROM favorites WHERE user_id = $1 AND article_id = $2 RETURNING article_id",
    [userId, articleId]
  );
  if (removed.length > 0) return false;
  await query("INSERT INTO favorites (user_id, article_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userId, articleId]);
  return true;
}

export async function clearFavorites(userId: string): Promise<void> {
  await query("DELETE FROM favorites WHERE user_id = $1", [userId]);
}

// ---------- histórico ----------

export async function getHistoryArticles(userId: string): Promise<Article[]> {
  const rows = await query<ArticleRow>(
    `SELECT a.* FROM history h JOIN articles a ON a.id = h.article_id
     WHERE h.user_id = $1 ORDER BY h.viewed_at DESC LIMIT 30`,
    [userId]
  );
  return rows.map(rowToArticle);
}

/** Uma abertura de artigo conta como visualização do acervo. */
export async function incrementViews(articleId: string): Promise<void> {
  await query("UPDATE articles SET views = views + 1 WHERE id = $1", [articleId]);
}

export async function pushHistory(userId: string, articleId: string): Promise<void> {
  await query(
    `INSERT INTO history (user_id, article_id) VALUES ($1, $2)
     ON CONFLICT (user_id, article_id) DO UPDATE SET viewed_at = now()`,
    [userId, articleId]
  );
}

export async function removeFromHistory(userId: string, articleId: string): Promise<void> {
  await query("DELETE FROM history WHERE user_id = $1 AND article_id = $2", [userId, articleId]);
}

export async function clearHistory(userId: string): Promise<void> {
  await query("DELETE FROM history WHERE user_id = $1", [userId]);
}

// ---------- pesquisas recentes ----------

export async function getSearches(userId: string): Promise<string[]> {
  const rows = await query<{ term: string }>(
    "SELECT term FROM recent_searches WHERE user_id = $1 ORDER BY searched_at DESC LIMIT 20",
    [userId]
  );
  return rows.map((r) => r.term);
}

export async function addSearch(userId: string, term: string): Promise<void> {
  const trimmed = term.trim();
  if (!trimmed) return;
  await query(
    `INSERT INTO recent_searches (user_id, term) VALUES ($1, $2)
     ON CONFLICT (user_id, term) DO UPDATE SET searched_at = now()`,
    [userId, trimmed]
  );
}

export async function removeSearch(userId: string, term: string): Promise<void> {
  await query("DELETE FROM recent_searches WHERE user_id = $1 AND term = $2", [userId, term]);
}

export async function clearSearches(userId: string): Promise<void> {
  await query("DELETE FROM recent_searches WHERE user_id = $1", [userId]);
}

// ---------- artigos ----------

export async function findArticle(id: string): Promise<Article | undefined> {
  const rows = await query<ArticleRow>("SELECT * FROM articles WHERE id = $1", [id]);
  return rows[0] ? rowToArticle(rows[0]) : undefined;
}

export async function getRelated(articleId: string, limit = 3): Promise<Article[]> {
  const rows = await query<ArticleRow>(
    `SELECT * FROM articles WHERE id <> $1 AND status = 'publicado' ORDER BY views DESC LIMIT $2`,
    [articleId, limit]
  );
  return rows.map(rowToArticle);
}

export async function createArticle(
  input: Partial<ArticleInput> & { title: string; authorId: string; status?: ArticleStatus }
): Promise<Article> {
  const id = `art-${Date.now().toString(36)}`;
  const cat = input.cat ?? "Tecnologia";
  const rows = await query<ArticleRow>(
    `INSERT INTO articles
       (id, title, cat, dept, type, read_time, updated_at, snippet, content, path, status, keywords, next_review, author_id)
     VALUES ($1,$2,$3,$4,'Procedimento','2 min', current_date, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      id,
      input.title,
      cat,
      input.dept ?? "TI · Suporte",
      input.summary ?? "",
      input.content ?? "",
      `Início · ${cat}`,
      input.status ?? "rascunho",
      input.keywords ?? [],
      input.nextReview ?? null,
      input.authorId,
    ]
  );
  return rowToArticle(rows[0]);
}

// ---------- edição de conteúdo ----------

export type ArticleInput = {
  title: string;
  summary: string;
  content: string;
  cat: string;
  dept: string;
  keywords: string[];
  nextReview: string | null;
};

export type Revisao = {
  id: number;
  title: string;
  autor: string | null;
  status: string | null;
  criadaEm: string;
};

/** Guarda o estado atual antes de sobrescrever. */
async function guardarRevisao(id: string, autorId: string | null) {
  await query(
    `INSERT INTO article_revisions (article_id, author_id, title, snippet, content, cat, dept, keywords, status)
     SELECT id, $2, title, snippet, content, cat, dept, keywords, status FROM articles WHERE id = $1`,
    [id, autorId]
  );
}

export async function listarRevisoes(articleId: string): Promise<Revisao[]> {
  const linhas = await query<{ id: string; title: string; autor: string | null; status: string | null; created_at: Date }>(
    `SELECT r.id::text, r.title, u.short_name AS autor, r.status, r.created_at
       FROM article_revisions r
       LEFT JOIN users u ON u.id = r.author_id
      WHERE r.article_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10`,
    [articleId]
  );
  return linhas.map((l) => ({
    id: Number(l.id),
    title: l.title,
    autor: l.autor,
    status: l.status,
    criadaEm: new Date(l.created_at).toISOString(),
  }));
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
  autorId: string | null = null
): Promise<Article | undefined> {
  await guardarRevisao(id, autorId);
  const rows = await query<ArticleRow>(
    `UPDATE articles
        SET title = $2, snippet = $3, content = $4, cat = $5, dept = $6,
            keywords = $7, next_review = $8, path = 'Início · ' || $5
      WHERE id = $1
      RETURNING *`,
    [id, input.title, input.summary, input.content, input.cat, input.dept, input.keywords, input.nextReview]
  );
  return rows[0] ? rowToArticle(rows[0]) : undefined;
}

/** Publicar também carimba a data de atualização exibida no conteúdo. */
export async function setArticleStatus(id: string, status: ArticleStatus): Promise<Article | undefined> {
  const rows = await query<ArticleRow>(
    `UPDATE articles
        SET status = $2,
            updated_at   = CASE WHEN $2 = 'publicado' THEN current_date ELSE updated_at END,
            published_at = CASE WHEN $2 = 'publicado' THEN now() ELSE published_at END
      WHERE id = $1
      RETURNING *`,
    [id, status]
  );
  return rows[0] ? rowToArticle(rows[0]) : undefined;
}

export async function marcarVerificado(id: string, verificado: boolean): Promise<Article | undefined> {
  const linhas = await query<ArticleRow>(
    "UPDATE articles SET verified = $2 WHERE id = $1 RETURNING *",
    [id, verificado]
  );
  return linhas[0] ? rowToArticle(linhas[0]) : undefined;
}

export async function listManagedArticles(): Promise<Article[]> {
  const rows = await query<ArticleRow>("SELECT * FROM articles ORDER BY created_at DESC");
  return rows.map(rowToArticle);
}
