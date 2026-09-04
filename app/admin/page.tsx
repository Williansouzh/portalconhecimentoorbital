import Link from "next/link";

export const metadata = { title: "Gestão do conhecimento — Portal do Conhecimento" };

const TOP_SEARCHES = [
  { term: "redefinir senha", searches: "2.184", clicks: "94%", ok: true },
  { term: "férias", searches: "1.702", clicks: "88%", ok: true },
  { term: "reembolso", searches: "1.240", clicks: "81%", ok: true },
  { term: "vale-transporte", searches: "905", clicks: "62%", ok: false },
  { term: "chamado", searches: "874", clicks: "79%", ok: true },
];

const GAPS = [
  { term: "ponto eletrônico app", meta: "31 buscas · RH" },
  { term: "troca de crachá", meta: "18 buscas · Operações" },
  { term: "plano odontológico dependente", meta: "14 buscas · RH" },
];

const KANBAN: {
  title: string;
  count: number;
  tone?: "ok";
  cards: { title: string; meta: string; warn?: boolean }[];
}[] = [
  {
    title: "Rascunho",
    count: 3,
    cards: [
      { title: "Ponto eletrônico no app", meta: "RH · Bruno L." },
      { title: "Troca de crachá", meta: "Operações · Ana C." },
    ],
  },
  {
    title: "Em revisão",
    count: 14,
    cards: [
      { title: "Desbloqueio de senha do SAP", meta: "há 18 dias na fila", warn: true },
      { title: "Reembolso de quilometragem", meta: "Financeiro · Carla M." },
    ],
  },
  { title: "Aprovação", count: 6, cards: [{ title: "Política de viagens 2026", meta: "Aguarda diretoria" }] },
  {
    title: "Publicado",
    count: 342,
    tone: "ok",
    cards: [{ title: "Autenticação em dois fatores", meta: "publicado em 21 ago" }],
  },
];

export default function AdminPage() {
  return (
    <main className="main-loose">
      <div className="page-wrap">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 26 }}>
          <div>
            <h1 style={{ margin: "0 0 8px", font: "600 32px/1.15 var(--font-head)", letterSpacing: "-.015em" }}>
              Gestão do conhecimento
            </h1>
            <p style={{ margin: 0, font: "400 15.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
              Visão de agosto de 2026 · 397 conteúdos publicados · 12 equipes responsáveis
            </p>
          </div>
          <Link href="/admin/editor" className="btn btn-primary">
            Novo artigo
          </Link>
        </div>

        <div className="stack" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16, marginBottom: 26 }}>
          <Metric label="Tempo médio até a resposta" value="41 s" note="↓ 12 s vs. julho" noteColor="var(--ok)" />
          <Metric label="Avaliações positivas" value="87%" note="3.204 avaliações · 412 negativas" />
          <Metric label="Pesquisas sem resultado" value="63" note="↑ 9 vs. julho" noteColor="var(--warn)" />
          <Metric label="Artigos publicados" value="342" note="55 em rascunho" />
          <Metric label="Aguardando revisão" value="14" note="5 há mais de 15 dias" tone="warn" />
          <Metric label="Conteúdos desatualizados" value="9" note="fora do prazo de revisão" tone="danger" />
        </div>

        <div className="stack" style={{ gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 26 }}>
          <div className="card" style={{ padding: "20px 22px" }}>
            <h2 style={{ margin: "0 0 14px", font: "600 18px/1.2 var(--font-head)" }}>Assuntos mais pesquisados</h2>
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
                {TOP_SEARCHES.map((s) => (
                  <tr key={s.term}>
                    <td style={{ fontWeight: 500 }}>{s.term}</td>
                    <td style={{ textAlign: "right" }}>{s.searches}</td>
                    <td style={{ textAlign: "right", color: s.ok ? "var(--ok)" : "var(--warn)", fontWeight: 600 }}>{s.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card" style={{ padding: "20px 22px" }}>
            <h2 style={{ margin: "0 0 4px", font: "600 18px/1.2 var(--font-head)" }}>Pesquisas sem resultado</h2>
            <p style={{ margin: "0 0 14px", font: "400 13.5px/1.4 var(--font-body)", color: "var(--text3)" }}>
              Cada linha é uma lacuna de conteúdo — a ação sugerida já vem pronta.
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              {GAPS.map((g) => (
                <div key={g.term} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--surface2)", borderRadius: 11 }}>
                  <span style={{ flex: 1, minWidth: 0, font: "600 14.5px/1.3 var(--font-body)" }}>
                    &ldquo;{g.term}&rdquo;
                    <span style={{ display: "block", marginTop: 2, font: "400 12.5px/1 var(--font-body)", color: "var(--text3)" }}>{g.meta}</span>
                  </span>
                  <Link
                    href="/admin/editor"
                    className="btn btn-sm"
                    style={{ flex: "none", border: "1px solid var(--brand)", background: "var(--surface)", color: "var(--brand-strong)" }}
                  >
                    Criar artigo
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h2 style={{ margin: "0 0 4px", font: "600 18px/1.2 var(--font-head)" }}>Fluxo editorial</h2>
          <p style={{ margin: "0 0 18px", font: "400 13.5px/1.4 var(--font-body)", color: "var(--text3)" }}>
            Rascunho → revisão → aprovação → publicação
          </p>
          <div className="stack" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
            {KANBAN.map((col) => (
              <div key={col.title} style={{ padding: 14, background: col.tone === "ok" ? "var(--ok-soft)" : "var(--surface2)", borderRadius: 13 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    font: "600 13px/1 var(--font-head)",
                    letterSpacing: ".05em",
                    textTransform: "uppercase",
                    color: col.tone === "ok" ? "var(--ok)" : "var(--text3)",
                  }}
                >
                  {col.title}
                  <span style={{ color: col.tone === "ok" ? "inherit" : "var(--text2)" }}>{col.count}</span>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {col.cards.map((card) => (
                    <div
                      key={card.title}
                      style={{
                        padding: 12,
                        background: "var(--surface)",
                        border: `1px solid ${card.warn ? "var(--warn-line)" : col.tone === "ok" ? "var(--ok-line)" : "var(--border)"}`,
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
                          color: card.warn ? "var(--warn)" : col.tone === "ok" ? "var(--ok)" : "var(--text3)",
                        }}
                      >
                        {card.meta}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
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
