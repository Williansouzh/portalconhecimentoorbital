import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { marcarNovidadesVistas } from "@/lib/home";

/**
 * Abrir as novidades zera o contador e leva para o acervo em ordem de
 * publicação — é o que a pessoa quer ver depois de clicar no sino.
 */
export default async function NovidadesPage() {
  const session = await requireSession();
  await marcarNovidadesVistas(session.id);
  redirect("/resultados?sort=recentes");
}
