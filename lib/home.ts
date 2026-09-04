import { categories, homeCategorySlugs } from "./data";
import { query } from "./db";
import { rowToArticle, type ArticleRow } from "./rows";
import { getFavoriteArticles } from "./store";

const CONTINUE_READING: { id: string; pct: number; section: string }[] = [
  { id: "remoto", pct: 60, section: "Dias remotos por semana" },
  { id: "reembolso", pct: 25, section: "Documentos aceitos" },
];

export async function getHomeData(userId: string) {
  const [maisVistos, recentes, continuar, favoritos] = await Promise.all([
    query<ArticleRow>("SELECT * FROM articles WHERE status = 'publicado' ORDER BY views DESC LIMIT 5"),
    query<ArticleRow>("SELECT * FROM articles WHERE status = 'publicado' ORDER BY updated_at DESC LIMIT 4"),
    query<ArticleRow>("SELECT * FROM articles WHERE id = ANY($1::text[])", [CONTINUE_READING.map((c) => c.id)]),
    getFavoriteArticles(userId),
  ]);

  const topSearched = maisVistos.map(rowToArticle).map((a, i) => ({
    rank: String(i + 1).padStart(2, "0"),
    id: a.id,
    title: a.title,
    cat: a.cat,
    read: a.read,
    views: `${a.views} acessos`,
  }));

  const recent = recentes.map(rowToArticle).map((a) => ({
    id: a.id,
    title: a.title,
    dept: a.dept,
    updated: a.updated,
  }));

  const byId = new Map(continuar.map((r) => [r.id, rowToArticle(r)]));
  const continueReading = CONTINUE_READING.flatMap((c) => {
    const a = byId.get(c.id);
    return a ? [{ id: a.id, title: a.title, section: c.section, pct: c.pct }] : [];
  });

  const favList = favoritos.map((a) => ({ id: a.id, title: a.title }));

  const homeCategories = homeCategorySlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return {
    topSearched,
    recent,
    continueReading,
    favList,
    homeCategories,
    popular: ["redefinir senha", "férias", "reembolso", "trabalho remoto", "chamados"],
  };
}
