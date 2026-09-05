import { query } from "./db";

const JANELA = "30 days";

export type Metricas = {
  tempoMedioSegundos: number | null;
  avaliacoes: { total: number; positivas: number; negativas: number; percentual: number | null };
  semResultado: { atual: number; anterior: number };
  artigos: { publicados: number; rascunhos: number; revisao: number; aprovacao: number; desatualizados: number; revisaoAntiga: number };
  termos: { termo: string; buscas: number; cliquePercentual: number | null }[];
  lacunas: { termo: string; buscas: number }[];
  fluxo: { status: string; total: number; cards: { title: string; meta: string; warn: boolean }[] }[];
};

const FLUXO_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  revisao: "Em revisão",
  aprovacao: "Aprovação",
  publicado: "Publicado",
};

export async function getMetricas(): Promise<Metricas> {
  const [tempo, avaliacoes, semResultado, artigos, termos, lacunas, fluxoTotais, fluxoCards] = await Promise.all([
    // Tempo até a resposta: intervalo entre a busca e o clique que ela gerou.
    query<{ segundos: string | null }>(
      `SELECT avg(extract(epoch FROM c.created_at - s.created_at))::numeric(10,1)::text AS segundos
         FROM result_clicks c
         JOIN search_events s ON s.id = c.search_event_id
        WHERE c.created_at >= now() - interval '${JANELA}'`
    ),
    query<{ total: string; positivas: string; negativas: string }>(
      `SELECT count(*) FILTER (WHERE helpful IS NOT NULL)::text AS total,
              count(*) FILTER (WHERE helpful)::text            AS positivas,
              count(*) FILTER (WHERE helpful = false)::text    AS negativas
         FROM article_feedback
        WHERE created_at >= now() - interval '${JANELA}'`
    ),
    query<{ atual: string; anterior: string }>(
      `SELECT count(*) FILTER (WHERE created_at >= now() - interval '${JANELA}')::text AS atual,
              count(*) FILTER (WHERE created_at >= now() - interval '60 days'
                                AND created_at <  now() - interval '${JANELA}')::text AS anterior
         FROM search_events
        WHERE results_count = 0`
    ),
    query<{
      publicados: string; rascunhos: string; revisao: string; aprovacao: string; desatualizados: string; revisao_antiga: string;
    }>(
      `SELECT count(*) FILTER (WHERE status = 'publicado')::text  AS publicados,
              count(*) FILTER (WHERE status = 'rascunho')::text   AS rascunhos,
              count(*) FILTER (WHERE status = 'revisao')::text    AS revisao,
              count(*) FILTER (WHERE status = 'aprovacao')::text  AS aprovacao,
              count(*) FILTER (WHERE outdated)::text              AS desatualizados,
              count(*) FILTER (WHERE status = 'revisao'
                                AND created_at < now() - interval '15 days')::text AS revisao_antiga
         FROM articles`
    ),
    query<{ termo: string; buscas: string; cliques: string }>(
      // Agrupa pelo termo normalizado (para "férias" e "ferias" contarem
      // junto) mas exibe a grafia mais usada.
      `SELECT mode() WITHIN GROUP (ORDER BY s.term) AS termo,
              count(DISTINCT s.id)::text AS buscas,
              count(DISTINCT c.search_event_id)::text AS cliques
         FROM search_events s
         LEFT JOIN result_clicks c ON c.search_event_id = s.id
        WHERE s.created_at >= now() - interval '${JANELA}'
        GROUP BY s.normalized
        ORDER BY count(DISTINCT s.id) DESC
        LIMIT 5`
    ),
    query<{ termo: string; buscas: string }>(
      `SELECT mode() WITHIN GROUP (ORDER BY term) AS termo, count(*)::text AS buscas
         FROM search_events
        WHERE results_count = 0 AND created_at >= now() - interval '${JANELA}'
        GROUP BY normalized
        ORDER BY count(*) DESC
        LIMIT 3`
    ),
    query<{ status: string; total: string }>("SELECT status, count(*)::text AS total FROM articles GROUP BY status"),
    // Dois cards por estágio, os mais recentes.
    query<{ status: string; title: string; dept: string; dias: string }>(
      `SELECT status, title, dept, extract(day FROM now() - created_at)::int::text AS dias
         FROM (
           SELECT *, row_number() OVER (PARTITION BY status ORDER BY created_at DESC) AS n
             FROM articles
         ) t
        WHERE n <= 2`
    ),
  ]);

  const av = avaliacoes[0];
  const totalAv = Number(av?.total ?? 0);
  const positivas = Number(av?.positivas ?? 0);

  const totais = new Map(fluxoTotais.map((r) => [r.status, Number(r.total)]));
  const fluxo = ["rascunho", "revisao", "aprovacao", "publicado"].map((status) => ({
    status: FLUXO_LABEL[status],
    total: totais.get(status) ?? 0,
    cards: fluxoCards
      .filter((c) => c.status === status)
      .map((c) => {
        const dias = Number(c.dias);
        const atrasado = status === "revisao" && dias > 15;
        return {
          title: c.title,
          meta: atrasado ? `há ${dias} dias na fila` : c.dept,
          warn: atrasado,
        };
      }),
  }));

  return {
    tempoMedioSegundos: tempo[0]?.segundos ? Number(tempo[0].segundos) : null,
    avaliacoes: {
      total: totalAv,
      positivas,
      negativas: Number(av?.negativas ?? 0),
      percentual: totalAv > 0 ? Math.round((positivas / totalAv) * 100) : null,
    },
    semResultado: {
      atual: Number(semResultado[0]?.atual ?? 0),
      anterior: Number(semResultado[0]?.anterior ?? 0),
    },
    artigos: {
      publicados: Number(artigos[0]?.publicados ?? 0),
      rascunhos: Number(artigos[0]?.rascunhos ?? 0),
      revisao: Number(artigos[0]?.revisao ?? 0),
      aprovacao: Number(artigos[0]?.aprovacao ?? 0),
      desatualizados: Number(artigos[0]?.desatualizados ?? 0),
      revisaoAntiga: Number(artigos[0]?.revisao_antiga ?? 0),
    },
    termos: termos.map((t) => ({
      termo: t.termo,
      buscas: Number(t.buscas),
      cliquePercentual: Number(t.buscas) > 0 ? Math.round((Number(t.cliques) / Number(t.buscas)) * 100) : null,
    })),
    lacunas: lacunas.map((l) => ({ termo: l.termo, buscas: Number(l.buscas) })),
    fluxo,
  };
}
