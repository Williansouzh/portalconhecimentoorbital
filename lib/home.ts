import { query } from "./db";
import { termosSugeridos } from "./data";
import { getCategories } from "./categories";
import { rowToArticle, type ArticleRow } from "./rows";
import { getFavoriteArticles, getHistoryArticles } from "./store";

function aberturasLabel(n: number): string {
  if (n === 0) return "ainda sem aberturas";
  return `${n.toLocaleString("pt-BR")} ${n === 1 ? "abertura" : "aberturas"}`;
}

export async function getHomeData(userId: string) {
  const [maisAbertos, recentes, historico, favoritos, categorias, termos] = await Promise.all([
    // Popularidade real: quantas vezes o conteúdo foi aberto.
    query<ArticleRow & { aberturas: number }>(
      `SELECT a.*, a.views AS aberturas
         FROM articles a WHERE a.status = 'publicado'
        ORDER BY a.views DESC, a.updated_at DESC LIMIT 5`
    ),
    query<ArticleRow>("SELECT * FROM articles WHERE status = 'publicado' ORDER BY updated_at DESC, id LIMIT 4"),
    getHistoryArticles(userId),
    getFavoriteArticles(userId),
    getCategories(),
    // Buscas mais feitas nos últimos 30 dias; sem histórico, termos do acervo.
    query<{ termo: string }>(
      `SELECT mode() WITHIN GROUP (ORDER BY term) AS termo
         FROM search_events
        WHERE created_at >= now() - interval '30 days' AND results_count > 0
        GROUP BY normalized HAVING count(*) >= 3
        ORDER BY count(*) DESC LIMIT 5`
    ),
  ]);

  const topSearched = maisAbertos.map(rowToArticle).map((a, i) => ({
    rank: String(i + 1).padStart(2, "0"),
    id: a.id,
    title: a.title,
    cat: a.cat,
    read: a.read,
    views: aberturasLabel(Number(a.views.replace(/\./g, ""))),
  }));

  const recent = recentes.map(rowToArticle).map((a) => ({
    id: a.id,
    title: a.title,
    dept: a.dept,
    updated: a.updated,
  }));

  // "Continue de onde parou" = o que a pessoa abriu por último.
  const continueReading = historico.slice(0, 2).map((a) => ({
    id: a.id,
    title: a.title,
    meta: `${a.cat} · ${a.read} de leitura`,
  }));

  return {
    topSearched,
    recent,
    continueReading,
    favList: favoritos.map((a) => ({ id: a.id, title: a.title })),
    homeCategories: categorias.slice(0, 4),
    popular: termos.length > 0 ? termos.map((t) => t.termo) : termosSugeridos,
  };
}
