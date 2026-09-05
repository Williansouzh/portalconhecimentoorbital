import { query } from "./db";
import { categoriaPadrao, categoryMeta } from "./data";
import type { Category } from "./types";

function slugify(label: string): string {
  return label
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Categorias existem porque há conteúdo nelas — a lista sai do acervo. */
export async function getCategories(): Promise<Category[]> {
  const rows = await query<{ cat: string; total: number }>(
    `SELECT cat, count(*)::int AS total
       FROM articles WHERE status = 'publicado'
      GROUP BY cat ORDER BY count(*) DESC, cat`
  );
  return rows.map((r) => {
    const meta = categoryMeta[r.cat];
    return {
      slug: meta?.slug ?? slugify(r.cat),
      label: meta?.label ?? r.cat,
      description: meta?.description ?? categoriaPadrao.description,
      icon: meta?.icon ?? categoriaPadrao.icon,
      count: r.total,
    };
  });
}
