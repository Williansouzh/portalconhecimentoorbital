import { articles, categories, homeCategorySlugs } from "./data";
import { getFavorites } from "./store";

const CONTINUE_READING: { id: string; pct: number; section: string }[] = [
  { id: "remoto", pct: 60, section: "Dias remotos por semana" },
  { id: "reembolso", pct: 25, section: "Documentos aceitos" },
];

const RECENT_IDS = ["2fa", "chamados", "senha", "novo"];

export function getHomeData(userId: string) {
  const favs = getFavorites(userId);
  const published = articles.filter((a) => a.status === "publicado");

  const topSearched = [...published]
    .sort((a, b) => parseFloat(b.views.replace(/\./g, "")) - parseFloat(a.views.replace(/\./g, "")))
    .slice(0, 5)
    .map((a, i) => ({
      rank: String(i + 1).padStart(2, "0"),
      id: a.id,
      title: a.title,
      cat: a.cat,
      read: a.read,
      views: `${a.views} acessos`,
    }));

  const recent = RECENT_IDS.map((id) => published.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .map((a) => ({ id: a.id, title: a.title, dept: a.dept, updated: a.updated }));

  const continueReading = CONTINUE_READING.map((c) => {
    const a = published.find((x) => x.id === c.id)!;
    return { id: a.id, title: a.title, section: c.section, pct: c.pct };
  });

  const favList = published.filter((a) => favs[a.id]).map((a) => ({ id: a.id, title: a.title }));

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
