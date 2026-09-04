export const metadata = { title: "Design system — Portal do Conhecimento" };

const COLORS = [
  { label: "Primária", varName: "--brand", hex: "#0079C1", note: "ações, foco, destaque de busca" },
  { label: "Apoio petróleo", varName: "--teal", hex: "#0F5C6B", note: "categorias e gráficos" },
  { label: "Aviso importante", varName: "--warn", hex: "#9A5B0B", note: "conteúdo desatualizado" },
  { label: "Verificado", varName: "--ok", hex: "#136E56", note: "selo de conteúdo oficial" },
];

const TOKENS = [
  { label: "Fundo", varName: "--bg", bg: "var(--bg)" },
  { label: "Superfície", varName: "--surface", bg: "var(--surface)" },
  { label: "Superfície 2", varName: "--surface2", bg: "var(--surface2)" },
  { label: "Texto 2", varName: "--text2", bg: "var(--surface)", color: "var(--text2)" },
  { label: "Primária suave", varName: "--brand-soft", bg: "var(--brand-soft)", color: "var(--brand-strong)" },
];

const TYPE_SCALE = [
  { label: "Archivo 600 · 52/56", sample: "Título da home", font: "600 52px/1.08 var(--font-head)", letterSpacing: "-.02em" },
  { label: "Archivo 600 · 38/44", sample: "Título de artigo", font: "600 38px/1.15 var(--font-head)" },
  { label: "Archivo 600 · 24/30", sample: "Seção do conteúdo", font: "600 24px/1.25 var(--font-head)" },
  {
    label: "Figtree 400 · 16,5/28",
    sample: "Corpo de texto — medida máxima de 72 caracteres por linha.",
    font: "400 16.5px/1.7 var(--font-body)",
    color: "var(--text2)",
  },
  {
    label: "Figtree 400 · 12,5/18",
    sample: "Metadado — menor tamanho permitido em texto de apoio.",
    font: "400 12.5px/1.4 var(--font-body)",
    color: "var(--text3)",
  },
];

export default function DesignSystemPage() {
  return (
    <main className="main-loose">
      <div className="page-wrap-narrow">
        <h1 style={{ margin: "0 0 8px", font: "600 32px/1.15 var(--font-head)", letterSpacing: "-.015em" }}>Design system</h1>
        <p style={{ margin: "0 0 30px", maxWidth: 640, font: "400 16.5px/1.6 var(--font-body)", color: "var(--text2)" }}>
          Baseado no azul RioCard. Todos os pares de cor abaixo passam de 4,5:1 nos tamanhos de texto em que são usados (WCAG
          AA), nos modos claro e escuro.
        </p>

        <section style={{ marginBottom: 34 }}>
          <h2 style={{ margin: "0 0 16px", font: "600 20px/1.2 var(--font-head)" }}>Cores</h2>
          <div className="stack" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
            {COLORS.map((c) => (
              <div key={c.label} className="card" style={{ overflow: "hidden" }}>
                <div style={{ height: 76, background: `var(${c.varName})` }} />
                <div style={{ padding: "12px 14px" }}>
                  <b style={{ display: "block", font: "600 14px/1.3 var(--font-body)" }}>{c.label}</b>
                  <span style={{ display: "block", marginTop: 3, font: "400 12.5px/1.4 var(--font-body)", color: "var(--text3)" }}>
                    {c.hex} · {c.note}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="stack" style={{ gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10, marginTop: 12 }}>
            {TOKENS.map((t) => (
              <div
                key={t.label}
                style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 11, background: t.bg, color: t.color, font: "500 12px/1.4 var(--font-body)" }}
              >
                {t.label}
                <span style={{ display: "block", color: "var(--text3)" }}>{t.varName}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 34 }}>
          <h2 style={{ margin: "0 0 16px", font: "600 20px/1.2 var(--font-head)" }}>Tipografia</h2>
          <div className="card card-pad" style={{ display: "grid", gap: 16 }}>
            {TYPE_SCALE.map((t) => (
              <div key={t.label} style={{ display: "flex", alignItems: "baseline", gap: 20, flexWrap: "wrap" }}>
                <span style={{ width: 150, flex: "none", font: "500 12px/1 var(--font-body)", color: "var(--text3)" }}>{t.label}</span>
                <span style={{ font: t.font, letterSpacing: t.letterSpacing, color: t.color }}>{t.sample}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="stack" style={{ gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 34 }}>
          <div className="card card-pad">
            <h2 style={{ margin: "0 0 16px", font: "600 18px/1.2 var(--font-head)" }}>Espaçamento e raios</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 18 }}>
              {[4, 8, 12, 16, 24, 32, 44].map((n) => (
                <span key={n} style={{ width: n, height: 24, background: "var(--brand)" }} />
              ))}
            </div>
            <p style={{ margin: "0 0 18px", font: "400 13.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
              Escala de 4 px: 4 · 8 · 12 · 16 · 24 · 32 · 44. Cartões usam 20–24 px internos.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[8, 11, 14, 18].map((r) => (
                <span
                  key={r}
                  style={{ width: 64, height: 44, border: "1px solid var(--border-strong)", borderRadius: r, background: "var(--surface2)", font: "500 11px/44px var(--font-body)", textAlign: "center", color: "var(--text3)" }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="card card-pad">
            <h2 style={{ margin: "0 0 16px", font: "600 18px/1.2 var(--font-head)" }}>Sombras</h2>
            <div style={{ display: "grid", gap: 14 }}>
              <div className="card" style={{ padding: 14, boxShadow: "var(--sh1)", font: "500 13.5px/1 var(--font-body)" }}>
                Nível 1 — cartões em repouso
              </div>
              <div className="card" style={{ padding: 14, boxShadow: "var(--sh2)", font: "500 13.5px/1 var(--font-body)" }}>
                Nível 2 — hover e campo de busca
              </div>
              <div className="card" style={{ padding: 14, boxShadow: "var(--sh3)", font: "500 13.5px/1 var(--font-body)" }}>
                Nível 3 — sugestões, modais
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 34 }}>
          <h2 style={{ margin: "0 0 16px", font: "600 20px/1.2 var(--font-head)" }}>Botões e estados de interação</h2>
          <div className="card card-pad" style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ width: 96, flex: "none", font: "600 12px/1 var(--font-head)", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text3)" }}>
                Primário
              </span>
              <button className="btn btn-primary">Padrão</button>
              <span className="btn" style={{ background: "var(--brand-strong)", color: "var(--brand-ink)" }}>
                Hover
              </span>
              <span className="btn" style={{ background: "var(--brand)", color: "var(--brand-ink)", boxShadow: "0 0 0 3px var(--ring)" }}>
                Foco
              </span>
              <span className="btn" style={{ background: "var(--brand-strong)", color: "var(--brand-ink)", transform: "translateY(1px)", filter: "brightness(.94)" }}>
                Pressionado
              </span>
              <span className="btn" style={{ background: "var(--surface3)", color: "var(--text3)" }}>
                Desabilitado
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ width: 96, flex: "none", font: "600 12px/1 var(--font-head)", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text3)" }}>
                Secundário
              </span>
              <button className="btn btn-secondary">Padrão</button>
              <span className="btn" style={{ border: "1px solid var(--border-strong)", background: "var(--surface2)" }}>
                Hover
              </span>
              <span className="btn" style={{ border: "1px solid var(--brand)", background: "var(--surface)", boxShadow: "0 0 0 3px var(--ring)" }}>
                Foco
              </span>
              <span className="btn" style={{ border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text3)" }}>
                Desabilitado
              </span>
            </div>
            <p style={{ margin: 0, font: "400 13px/1.5 var(--font-body)", color: "var(--text3)" }}>
              Altura mínima de 44 px em qualquer botão — o mesmo valor da área de toque no celular. O anel de foco tem 3 px e
              nunca é removido.
            </p>
          </div>
        </section>

        <section className="stack" style={{ gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 34 }}>
          <div className="card card-pad">
            <h2 style={{ margin: "0 0 16px", font: "600 18px/1.2 var(--font-head)" }}>Chips, abas e trilha</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              <span className="pill">Sugestão</span>
              <span className="chip">Selecionado</span>
              <span className="chip">
                Removível <span aria-hidden="true">×</span>
              </span>
              <span className="btn btn-dashed" style={{ height: 32, padding: "0 12px", borderRadius: 16, font: "500 13px/1 var(--font-body)" }}>
                Limpar todos
              </span>
            </div>
            <div className="tabs" style={{ marginBottom: 18 }}>
              <span className="tab-btn on">Ativa</span>
              <span className="tab-btn">Inativa</span>
              <span className="tab-btn" style={{ opacity: 0.6 }}>
                Desabilitada
              </span>
            </div>
            <div className="trail" style={{ marginBottom: 0 }}>
              <b style={{ color: "var(--brand)", fontWeight: 500 }}>Início</b>›
              <b style={{ color: "var(--brand)", fontWeight: 500 }}>Tecnologia</b>›<span>Acessos e senhas</span>
            </div>
          </div>
          <div className="card card-pad">
            <h2 style={{ margin: "0 0 16px", font: "600 18px/1.2 var(--font-head)" }}>Alertas e notificações</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <div className="alert alert-info" style={{ font: "400 13.5px/1.45 var(--font-body)", color: "var(--text2)" }}>
                <b aria-hidden="true" style={{ color: "var(--brand-strong)" }}>
                  i
                </b>
                <span>
                  <b style={{ color: "var(--text)" }}>Informativo</b> — contexto adicional.
                </span>
              </div>
              <div className="alert alert-ok" style={{ font: "400 13.5px/1.45 var(--font-body)", color: "var(--text2)" }}>
                <b aria-hidden="true" style={{ color: "var(--ok)" }}>
                  ✓
                </b>
                <span>
                  <b style={{ color: "var(--text)" }}>Sucesso</b> — ação concluída.
                </span>
              </div>
              <div className="alert alert-warn" style={{ font: "400 13.5px/1.45 var(--font-body)", color: "var(--text2)" }}>
                <b aria-hidden="true" style={{ color: "var(--warn)" }}>
                  !
                </b>
                <span>
                  <b style={{ color: "var(--text)" }}>Aviso importante</b> — exige atenção.
                </span>
              </div>
              <div className="alert alert-danger" style={{ font: "400 13.5px/1.45 var(--font-body)", color: "var(--text2)" }}>
                <b aria-hidden="true" style={{ color: "var(--danger)" }}>
                  ✕
                </b>
                <span>
                  <b style={{ color: "var(--text)" }}>Erro</b> — algo falhou, com ação de recuperação.
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
