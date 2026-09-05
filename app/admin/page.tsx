import Link from "next/link";
import { getMetricas } from "@/lib/metrics";

export const metadata = { title: "Gestão do conhecimento — Portal do Conhecimento" };

function delta(atual: number, anterior: number): { texto: string; cor: string } | null {
  if (anterior === 0 && atual === 0) return null;
  const diff = atual - anterior;
  if (diff === 0) return { texto: "estável vs. período anterior", cor: "var(--text2)" };
  const seta = diff > 0 ? "↑" : "↓";
  return { texto: `${seta} ${Math.abs(diff)} vs. período anterior`, cor: diff > 0 ? "var(--warn)" : "var(--ok)" };
}

export default async function AdminPage() {
  const m = await getMetricas();
  const semResultadoDelta = delta(m.semResultado.atual, m.semResultado.anterior);
  const totalArtigos = m.artigos.publicados + m.artigos.rascunhos + m.artigos.revisao + m.artigos.aprovacao;

  return (
    <main className="main-loose">
      <div className="page-wrap">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 26 }}>
          <div>
            <h1 style={{ margin: "0 0 8px", font: "600 32px/1.15 var(--font-head)", letterSpacing: "-.015em" }}>
              Gestão do conhecimento
            </h1>
            <p style={{ margin: 0, font: "400 15.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
              Últimos 30 dias · {totalArtigos} conteúdos no acervo · {m.artigos.publicados} publicados
            </p>
          </div>
          <Link href="/admin/editor" className="btn btn-primary">
            Novo artigo
          </Link>
        </div>

        <div className="stack" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16, marginBottom: 26 }}>
          <Metric
            label="Tempo médio até a resposta"
            value={m.tempoMedioSegundos !== null ? `${m.tempoMedioSegundos.toFixed(0)} s` : "—"}
            note={m.tempoMedioSegundos !== null ? "da busca até abrir o conteúdo" : "ainda sem cliques medidos"}
          />
          <Metric
            label="Avaliações positivas"
            value={m.avaliacoes.percentual !== null ? `${m.avaliacoes.percentual}%` : "—"}
            note={
              m.avaliacoes.total > 0
                ? `${m.avaliacoes.total} avaliações · ${m.avaliacoes.negativas} negativas`
                : "ainda sem avaliações"
            }
          />
          <Metric
            label="Pesquisas sem resultado"
            value={String(m.semResultado.atual)}
            note={semResultadoDelta?.texto ?? "nenhuma no período"}
            noteColor={semResultadoDelta?.cor}
          />
          <Metric label="Artigos publicados" value={String(m.artigos.publicados)} note={`${m.artigos.rascunhos} em rascunho`} />
          <Metric
            label="Aguardando revisão"
            value={String(m.artigos.revisao)}
            note={m.artigos.revisaoAntiga > 0 ? `${m.artigos.revisaoAntiga} há mais de 15 dias` : "nenhum atrasado"}
            tone="warn"
          />
          <Metric
            label="Conteúdos desatualizados"
            value={String(m.artigos.desatualizados)}
            note="fora do prazo de revisão"
            tone="danger"
          />
          <Metric
            label="Sem prazo de revisão"
            value={String(m.artigos.semPrazo)}
            note={
              m.artigos.semPrazo > 0
                ? "definir o prazo faz o alerta de desatualizado funcionar"
                : "todo o acervo tem prazo definido"
            }
            tone={m.artigos.semPrazo > 0 ? "warn" : undefined}
          />
          <Metric
            label="Conteúdo verificado"
            value={`${m.artigos.publicados > 0 ? Math.round((m.artigos.verificados / m.artigos.publicados) * 100) : 0}%`}
            note={`${m.artigos.verificados} de ${m.artigos.publicados} publicados`}
          />
        </div>

        <div className="stack" style={{ gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 26 }}>
          <div className="card" style={{ padding: "20px 22px" }}>
            <h2 style={{ margin: "0 0 14px", font: "600 18px/1.2 var(--font-head)" }}>Assuntos mais pesquisados</h2>
            {m.termos.length === 0 ? (
              <Vazio texto="Nenhuma busca registrada nos últimos 30 dias." />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Termo</th>
                    <th scope="col" style={{ textAlign: "right" }}>
                      Buscas
                    </th>
                    <th scope="col" style={{ textAlign: "right" }}>
                      Cliques
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {m.termos.map((t) => (
                    <tr key={t.termo}>
                      <td style={{ fontWeight: 500 }}>{t.termo}</td>
                      <td style={{ textAlign: "right" }}>{t.buscas.toLocaleString("pt-BR")}</td>
                      <td
                        style={{
                          textAlign: "right",
                          color: (t.cliquePercentual ?? 0) >= 70 ? "var(--ok)" : "var(--warn)",
                          fontWeight: 600,
                        }}
                      >
                        {t.cliquePercentual !== null ? `${t.cliquePercentual}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card" style={{ padding: "20px 22px" }}>
            <h2 style={{ margin: "0 0 4px", font: "600 18px/1.2 var(--font-head)" }}>Pesquisas sem resultado</h2>
            <p style={{ margin: "0 0 14px", font: "400 13.5px/1.4 var(--font-body)", color: "var(--text3)" }}>
              Cada linha é uma lacuna de conteúdo — a ação sugerida já vem pronta.
            </p>
            {m.lacunas.length === 0 ? (
              <Vazio texto="Toda busca do período encontrou conteúdo." />
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {m.lacunas.map((g) => (
                  <div key={g.termo} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--surface2)", borderRadius: 11 }}>
                    <span style={{ flex: 1, minWidth: 0, font: "600 14.5px/1.3 var(--font-body)" }}>
                      &ldquo;{g.termo}&rdquo;
                      <span style={{ display: "block", marginTop: 2, font: "400 12.5px/1 var(--font-body)", color: "var(--text3)" }}>
                        {g.buscas} {g.buscas === 1 ? "busca" : "buscas"}
                      </span>
                    </span>
                    <Link
                      href={`/admin/editor?termo=${encodeURIComponent(g.termo)}`}
                      className="btn btn-sm"
                      style={{ flex: "none", border: "1px solid var(--brand)", background: "var(--surface)", color: "var(--brand-strong)" }}
                    >
                      Criar artigo
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h2 style={{ margin: "0 0 4px", font: "600 18px/1.2 var(--font-head)" }}>Fluxo editorial</h2>
          <p style={{ margin: "0 0 18px", font: "400 13.5px/1.4 var(--font-body)", color: "var(--text3)" }}>
            Rascunho → revisão → aprovação → publicação
          </p>
          <div className="stack" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
            {m.fluxo.map((col) => {
              const publicado = col.status === "Publicado";
              return (
                <div key={col.status} style={{ padding: 14, background: publicado ? "var(--ok-soft)" : "var(--surface2)", borderRadius: 13 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                      font: "600 13px/1 var(--font-head)",
                      letterSpacing: ".05em",
                      textTransform: "uppercase",
                      color: publicado ? "var(--ok)" : "var(--text3)",
                    }}
                  >
                    {col.status}
                    <span style={{ color: publicado ? "inherit" : "var(--text2)" }}>{col.total}</span>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {col.cards.length === 0 && (
                      <span style={{ font: "400 12.5px/1.4 var(--font-body)", color: "var(--text3)" }}>Nada neste estágio.</span>
                    )}
                    {col.cards.map((card) => (
                      <Link
                        key={card.id}
                        href={`/admin/editor/${card.id}`}
                        style={{
                          display: "block",
                          color: "inherit",
                          padding: 12,
                          background: "var(--surface)",
                          border: `1px solid ${card.warn ? "var(--warn-line)" : publicado ? "var(--ok-line)" : "var(--border)"}`,
                          borderRadius: 10,
                          font: "500 13.5px/1.4 var(--font-body)",
                        }}
                      >
                        {card.title}
                        <span
                          style={{
                            display: "block",
                            marginTop: 4,
                            font: "400 12px/1 var(--font-body)",
                            color: card.warn ? "var(--warn)" : publicado ? "var(--ok)" : "var(--text3)",
                          }}
                        >
                          {card.meta}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <p style={{ margin: "8px 0", font: "400 13.5px/1.5 var(--font-body)", color: "var(--text3)" }}>{texto}</p>
  );
}

function Metric({
  label,
  value,
  note,
  noteColor,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  noteColor?: string;
  tone?: "warn" | "danger";
}) {
  const bg = tone === "warn" ? "var(--warn-soft)" : tone === "danger" ? "var(--danger-soft)" : "var(--surface)";
  const border = tone === "warn" ? "var(--warn-line)" : tone === "danger" ? "var(--danger-line)" : "var(--border)";
  const labelColor = tone === "warn" ? "var(--warn)" : tone === "danger" ? "var(--danger)" : "var(--text3)";
  return (
    <div style={{ padding: "20px 22px", background: bg, border: `1px solid ${border}`, borderRadius: 14, boxShadow: tone ? undefined : "var(--sh1)" }}>
      <span style={{ display: "block", font: "500 13px/1 var(--font-body)", color: labelColor }}>{label}</span>
      <span style={{ display: "block", margin: "10px 0 6px", font: "600 34px/1 var(--font-head)", color: "var(--text)" }}>{value}</span>
      <span style={{ display: "block", font: "500 13px/1 var(--font-body)", color: noteColor ?? "var(--text2)" }}>{note}</span>
    </div>
  );
}
