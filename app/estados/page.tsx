export const metadata = { title: "Estados do sistema — Portal do Conhecimento" };

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card" style={{ overflow: "hidden" }}>
      <h2 style={{ margin: 0, padding: "14px 18px", borderBottom: "1px solid var(--border)", font: "600 13.5px/1 var(--font-head)", letterSpacing: ".03em" }}>
        {title}
      </h2>
      <div style={{ padding: 18 }}>{children}</div>
    </section>
  );
}

export default function StatesPage() {
  return (
    <main className="main-loose">
      <div className="page-wrap">
        <h1 style={{ margin: "0 0 8px", font: "600 32px/1.15 var(--font-head)", letterSpacing: "-.015em" }}>Estados do sistema</h1>
        <p style={{ margin: "0 0 28px", maxWidth: 620, font: "400 16.5px/1.6 var(--font-body)", color: "var(--text2)" }}>
          Todo estado explica o que aconteceu, o que a pessoa pode fazer agora e nunca depende só de cor para comunicar.
        </p>
        <div className="stack" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 18 }}>
          <Panel title="01 · Carregando (skeleton)">
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <span className="skeleton-shimmer" style={{ height: 13, width: "62%" }} />
                <span className="skeleton-line" style={{ width: "92%" }} />
                <span className="skeleton-line" style={{ width: "78%" }} />
              </div>
              <p style={{ margin: 0, font: "400 12.5px/1.5 var(--font-body)", color: "var(--text3)" }}>
                O esqueleto tem a mesma altura do resultado real, então nada salta quando o conteúdo chega.
              </p>
            </div>
          </Panel>

          <Panel title="02 · Busca sem resultados">
            <div style={{ textAlign: "center" }}>
              <div aria-hidden="true" style={{ width: 44, height: 44, margin: "0 auto 12px", borderRadius: 12, background: "var(--warn-soft)", color: "var(--warn)", display: "grid", placeItems: "center", font: "700 19px/1 var(--font-head)" }}>
                ?
              </div>
              <p style={{ margin: "0 0 6px", font: "600 15.5px/1.35 var(--font-body)" }}>Nada para &ldquo;redifinir senha&rdquo;</p>
              <p style={{ margin: "0 0 14px", font: "400 13.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
                Você quis dizer <b style={{ color: "var(--brand)" }}>redefinir senha</b>?
              </p>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                <span className="pill">senha expirada</span>
                <span className="pill">Tecnologia</span>
              </div>
              <button className="btn btn-primary btn-sm">Solicitar ajuda</button>
            </div>
          </Panel>

          <Panel title="03 · Erro de conexão">
            <div role="alert" className="alert alert-danger" style={{ marginBottom: 14 }}>
              <span className="alert-icon" aria-hidden="true">
                ✕
              </span>
              <span style={{ font: "400 13.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
                <b style={{ display: "block", font: "600 14px/1.4 var(--font-body)" }}>Sem conexão com o portal</b>Seus favoritos continuam
                disponíveis offline.
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary btn-sm">Tentar de novo</button>
              <button className="btn btn-secondary btn-sm">Ver favoritos</button>
            </div>
          </Panel>

          <Panel title="04 · Conteúdo indisponível">
            <div style={{ textAlign: "center" }}>
              <div aria-hidden="true" style={{ width: 44, height: 44, margin: "0 auto 12px", borderRadius: 12, background: "var(--surface2)", color: "var(--text3)", display: "grid", placeItems: "center", font: "700 17px/1 var(--font-head)" }}>
                404
              </div>
              <p style={{ margin: "0 0 6px", font: "600 15.5px/1.35 var(--font-body)" }}>Este conteúdo saiu do ar</p>
              <p style={{ margin: "0 0 14px", font: "400 13.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
                Foi arquivado em jun 2026. Sugerimos a versão atual do procedimento.
              </p>
              <button className="btn btn-sm" style={{ border: "1px solid var(--brand)", background: "var(--brand-soft)", color: "var(--brand-strong)" }}>
                Ver conteúdo substituto
              </button>
            </div>
          </Panel>

          <Panel title="05 · Sem permissão">
            <div style={{ textAlign: "center" }}>
              <div aria-hidden="true" style={{ width: 44, height: 44, margin: "0 auto 12px", borderRadius: 12, background: "var(--surface2)", color: "var(--text2)", display: "grid", placeItems: "center" }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden="true">
                  <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
                  <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
                </svg>
              </div>
              <p style={{ margin: "0 0 6px", font: "600 15.5px/1.35 var(--font-body)" }}>Conteúdo restrito</p>
              <p style={{ margin: "0 0 14px", font: "400 13.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
                Disponível para o grupo <b style={{ color: "var(--text)" }}>Financeiro · Gestores</b>. Você pode pedir acesso à área
                responsável.
              </p>
              <button className="btn btn-primary btn-sm">Solicitar acesso</button>
            </div>
          </Panel>

          <Panel title="06 · Artigo desatualizado">
            <div role="alert" className="alert alert-warn">
              <span className="alert-icon" aria-hidden="true">
                !
              </span>
              <span style={{ font: "400 13.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
                <b style={{ display: "block", font: "600 14px/1.4 var(--font-body)" }}>Fora do prazo de revisão</b>Última revisão em fev
                2026 · responsável avisado automaticamente.
              </span>
            </div>
            <p style={{ margin: "12px 0 0", font: "400 12.5px/1.5 var(--font-body)", color: "var(--text3)" }}>
              O aviso usa ícone + texto + cor: nunca só a cor.
            </p>
          </Panel>

          <Panel title="07 · Filtros sem resultado">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              <span className="chip">Financeiro</span>
              <span className="chip">Política</span>
            </div>
            <p style={{ margin: "0 0 12px", font: "400 13.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
              Nenhum conteúdo combina os dois filtros. Removendo <b style={{ color: "var(--text)" }}>Política</b> aparecem 12 resultados.
            </p>
            <button className="btn btn-dashed btn-sm">Remover &ldquo;Política&rdquo;</button>
          </Panel>

          <Panel title="08 · Campo de busca vazio">
            <div style={{ display: "flex", alignItems: "center", gap: 10, height: 46, padding: "0 14px", border: "1.5px solid var(--brand)", borderRadius: 12, boxShadow: "0 0 0 4px var(--ring)", marginBottom: 12 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M16.5 16.5 21 21" />
              </svg>
              <span style={{ flex: 1, font: "400 14px/1 var(--font-body)", color: "var(--text3)" }}>Pesquise por uma dúvida…</span>
            </div>
            <div style={{ padding: "12px 14px", background: "var(--surface2)", borderRadius: 11 }}>
              <span style={{ display: "block", marginBottom: 8, font: "600 11px/1 var(--font-head)", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text3)" }}>
                Suas pesquisas recentes
              </span>
              <span style={{ display: "block", padding: "5px 0", font: "500 13.5px/1.4 var(--font-body)" }}>redefinir senha</span>
              <span style={{ display: "block", padding: "5px 0", font: "500 13.5px/1.4 var(--font-body)" }}>férias 2026</span>
            </div>
          </Panel>

          <Panel title="09 · Publicação concluída">
            <div role="status" className="alert alert-ok" style={{ marginBottom: 14 }}>
              <span className="alert-icon" aria-hidden="true">
                ✓
              </span>
              <span style={{ font: "400 13.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
                <b style={{ display: "block", font: "600 14px/1.4 var(--font-body)" }}>Artigo publicado</b>Já aparece na busca de 2.184
                pessoas.
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary btn-sm">Ver publicado</button>
              <button className="btn btn-secondary btn-sm">Copiar link</button>
            </div>
          </Panel>

          <Panel title="10 · Confirmação de exclusão">
            <div style={{ padding: 16, background: "var(--surface2)", borderRadius: 13 }}>
              <p style={{ margin: "0 0 6px", font: "600 15.5px/1.3 var(--font-head)" }}>Excluir &ldquo;Política de viagens 2024&rdquo;?</p>
              <p style={{ margin: "0 0 14px", font: "400 13.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
                O artigo sai da busca imediatamente. A ação pode ser desfeita em 30 dias na lixeira.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="btn btn-secondary btn-sm">Cancelar</button>
                <button className="btn btn-danger btn-sm">Excluir artigo</button>
              </div>
            </div>
          </Panel>

          <Panel title="11 · Primeiro acesso">
            <div style={{ position: "relative", padding: 16, background: "var(--brand)", color: "var(--brand-ink)", borderRadius: 13 }}>
              <span style={{ display: "block", marginBottom: 5, font: "600 11px/1 var(--font-head)", letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.8 }}>
                Passo 1 de 3
              </span>
              <p style={{ margin: "0 0 6px", font: "600 16px/1.3 var(--font-head)" }}>Comece pela busca</p>
              <p style={{ margin: "0 0 14px", font: "400 13.5px/1.5 var(--font-body)", opacity: 0.92 }}>
                Digite sua dúvida como você falaria com um colega. O atalho Ctrl + K abre a busca de qualquer tela.
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ display: "flex", gap: 5 }}>
                  <span style={{ width: 18, height: 5, borderRadius: 3, background: "#fff" }} />
                  <span style={{ width: 7, height: 5, borderRadius: 3, background: "rgba(255,255,255,.45)" }} />
                  <span style={{ width: 7, height: 5, borderRadius: 3, background: "rgba(255,255,255,.45)" }} />
                </span>
                <span style={{ display: "flex", gap: 7 }}>
                  <button style={{ height: 34, padding: "0 12px", border: 0, borderRadius: 9, background: "rgba(255,255,255,.18)", color: "#fff", font: "600 12.5px/1 var(--font-body)" }}>
                    Pular
                  </button>
                  <button style={{ height: 34, padding: "0 13px", border: 0, borderRadius: 9, background: "#fff", color: "var(--brand-strong)", font: "600 12.5px/1 var(--font-body)" }}>
                    Próximo
                  </button>
                </span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
