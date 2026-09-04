import { query } from "./db";
import { verifyPassword } from "./passwords";
import type { Role } from "./auth";
import type { Article } from "./types";
import { rowToArticle, type ArticleRow } from "./rows";

export { hashPassword, verifyPassword } from "./passwords";

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

export async function createDraft(input: {
  title: string;
  summary?: string;
  cat?: string;
  dept?: string;
  keywords?: string[];
  authorId: string;
}): Promise<{ id: string; title: string }> {
  const id = `draft-${Date.now().toString(36)}`;
  await query(
    `INSERT INTO articles (id, title, cat, dept, type, read_time, updated_at, snippet, path, status, keywords, author_id)
     VALUES ($1,$2,$3,$4,'Procedimento','—', current_date, $5, $6, 'revisao', $7, $8)`,
    [
      id,
      input.title,
      input.cat ?? "Tecnologia",
      input.dept ?? "TI · Suporte",
      input.summary ?? "",
      `Início · ${input.cat ?? "Tecnologia"}`,
      input.keywords ?? [],
      input.authorId,
    ]
  );
  return { id, title: input.title };
}
