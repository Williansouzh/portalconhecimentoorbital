"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Article, ArticleBody } from "@/lib/types";
import { useUI } from "./UIProvider";
import { CheckIcon, LinkIcon, PrintIcon } from "./Icons";

type Related = { id: string; title: string; cat: string; read: string };

const TOC: [string, string][] = [
  ["antes", "Antes de começar"],
  ["passos", "Passo a passo"],
  ["requisitos", "Requisitos"],
  ["falhou", "Se não funcionar"],
  ["faq", "Perguntas frequentes"],
];

export default function ArticleView({
  article,
  body,
  initialFav,
  related,
}: {
  article: Article;
  body: ArticleBody | null;
  initialFav: boolean;
  related: Related[];
}) {
  const { showToast } = useUI();
  const [fav, setFav] = useState(initialFav);
  const [sec, setSec] = useState(TOC[0][0]);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!body) return;
    const ids = TOC.map(([id]) => id);
    const onScroll = () => {
      let cur = ids[0];
      ids.forEach((id) => {
        const el = document.getElementById(`sec-${id}`);
        if (el && el.getBoundingClientRect().top < 140) cur = id;
      });
      setSec((prev) => (prev !== cur ? cur : prev));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [body]);

  async function toggleFav() {
    setFav((f) => !f);
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: article.id }),
      });
    } catch {}
  }

  function scrollTo(id: string) {
    const el = document.getElementById(`sec-${id}`);
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 96, behavior: "smooth" });
    setSec(id);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
    setCopied(true);
    showToast("Link copiado para a área de transferência");
    setTimeout(() => setCopied(false), 1800);
  }

  function sendFeedback() {
    fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ articleId: article.id, helpful: feedback === "yes", comment }),
    }).catch(() => {});
    showToast("Obrigado! Sua avaliação foi registrada");
  }

  function reportOutdated() {
    fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ articleId: article.id, reportOutdated: true }),
    }).catch(() => {});
    showToast("Aviso enviado à equipe responsável");
  }

  return (
    <main>
      <div className="page-wrap">
        <nav aria-label="Trilha" className="trail">
          <Link href="/">Início</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/resultados?q=${encodeURIComponent(article.cat)}`}>{article.cat}</Link>
          <span aria-hidden="true">›</span>
          <span>{article.title}</span>
        </nav>

        {article.outdated && (
          <div role="alert" className="alert alert-warn" style={{ marginBottom: 20 }}>
            <span className="alert-icon" aria-hidden="true">
              !
            </span>
            <div>
              <strong style={{ display: "block", font: "600 15px/1.3 var(--font-body)" }}>
                Este conteúdo está fora do prazo de revisão
              </strong>
              <span style={{ display: "block", marginTop: 3, font: "400 14px/1.5 var(--font-body)", color: "var(--text2)" }}>
                A última revisão foi em {article.updated}. Confirme a informação com a equipe responsável antes de seguir o
                procedimento.
              </span>
            </div>
          </div>
        )}

        <div
          className="stack"
          style={{
            gridTemplateColumns: body ? "238px minmax(0,1fr) 286px" : "minmax(0,1fr) 286px",
            gap: 32,
            alignItems: "start",
          }}
        >
          {body && (
            <nav aria-label="Índice do conteúdo" style={{ position: "sticky", top: 88 }}>
              <div
                style={{
                  marginBottom: 12,
                  font: "600 12px/1 var(--font-head)",
                  letterSpacing: ".09em",
                  textTransform: "uppercase",
                  color: "var(--text3)",
                }}
              >
                Nesta página
              </div>
              {TOC.filter(([id]) => id !== "requisitos" || body.requirements.length > 0).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 12px",
                    marginBottom: 2,
                    border: 0,
                    borderLeft: `2px solid ${sec === id ? "var(--brand)" : "var(--border)"}`,
                    borderRadius: "0 8px 8px 0",
                    background: sec === id ? "var(--brand-soft)" : "transparent",
                    font: `${sec === id ? 600 : 400} 14px/1.4 var(--font-body)`,
                    color: sec === id ? "var(--brand-strong)" : "var(--text2)",
                  }}
                >
                  {label}
                </button>
              ))}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                <div style={{ font: "400 12.5px/1.5 var(--font-body)", color: "var(--text3)" }}>
                  Leitura de {article.read} · {article.views} visualizações
                </div>
              </div>
            </nav>
          )}

          <article>
            <header style={{ marginBottom: 26 }}>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {article.verified && (
                  <span className="badge badge-lg badge-ok">
                    <CheckIcon />
                    Conteúdo verificado
                  </span>
                )}
                <span className="badge badge-lg">{article.type}</span>
                <span className="badge badge-lg">{article.cat}</span>
              </div>
              <h1 style={{ margin: "0 0 14px", font: "600 38px/1.15 var(--font-head)", letterSpacing: "-.015em" }}>{article.title}</h1>
              <p style={{ margin: "0 0 18px", font: "400 18px/1.6 var(--font-body)", color: "var(--text2)" }}>
                {article.snippet.replace(/<[^>]+>/g, "")}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                  padding: "14px 0",
                  borderTop: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  font: "400 13.5px/1 var(--font-body)",
                  color: "var(--text3)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "var(--brand-soft)",
                      color: "var(--brand-strong)",
                      font: "700 11px/28px var(--font-body)",
                      textAlign: "center",
                    }}
                  >
                    {article.dept.slice(0, 2).toUpperCase()}
                  </span>
                  <span style={{ color: "var(--text2)", fontWeight: 500 }}>{article.dept}</span>
                </span>
                <span>Atualizado em {article.updated}</span>
              </div>
            </header>

            {body ? (
              <>
                <section id="sec-antes" style={{ marginBottom: 34, scrollMarginTop: 96 }}>
                  <h2 style={{ margin: "0 0 12px", font: "600 24px/1.25 var(--font-head)" }}>Antes de começar</h2>
                  <p style={{ margin: "0 0 14px", font: "400 16.5px/1.7 var(--font-body)", color: "var(--text2)" }}>{body.intro}</p>
                  {body.calloutText && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 13,
                        padding: "15px 17px",
                        background: "var(--brand-soft)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 24,
                          height: 24,
                          flex: "none",
                          borderRadius: 7,
                          background: "var(--brand)",
                          color: "var(--brand-ink)",
                          display: "grid",
                          placeItems: "center",
                          font: "700 14px/1 var(--font-head)",
                        }}
                      >
                        i
                      </span>
                      <p style={{ margin: 0, font: "400 14.5px/1.55 var(--font-body)", color: "var(--text2)" }}>
                        {body.calloutHref ? <Link href={body.calloutHref}>{body.calloutText}</Link> : body.calloutText}
                      </p>
                    </div>
                  )}
                </section>

                <section id="sec-passos" style={{ marginBottom: 34, scrollMarginTop: 96 }}>
                  <h2 style={{ margin: "0 0 16px", font: "600 24px/1.25 var(--font-head)" }}>Passo a passo</h2>
                  <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 14 }}>
                    {body.steps.map((s, i) => (
                      <li
                        key={s.title}
                        style={{
                          display: "flex",
                          gap: 15,
                          padding: "17px 19px",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: 13,
                          boxShadow: "var(--sh1)",
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: 30,
                            height: 30,
                            flex: "none",
                            borderRadius: 9,
                            background: "var(--brand)",
                            color: "var(--brand-ink)",
                            display: "grid",
                            placeItems: "center",
                            font: "700 14px/1 var(--font-head)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <strong style={{ display: "block", marginBottom: 4, font: "600 16px/1.35 var(--font-body)" }}>{s.title}</strong>
                          <span style={{ display: "block", font: "400 15.5px/1.6 var(--font-body)", color: "var(--text2)" }}>{s.text}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                {body.requirements.length > 0 && (
                  <section id="sec-requisitos" style={{ marginBottom: 34, scrollMarginTop: 96 }}>
                    <h2 style={{ margin: "0 0 12px", font: "600 24px/1.25 var(--font-head)" }}>Requisitos</h2>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 9 }}>
                      {body.requirements.map((r) => (
                        <li key={r.text} style={{ display: "flex", gap: 11, font: "400 16px/1.6 var(--font-body)", color: "var(--text2)" }}>
                          <span aria-hidden="true" style={{ color: r.ok ? "var(--ok)" : "var(--danger)", fontWeight: 700 }}>
                            {r.ok ? "✓" : "✕"}
                          </span>
                          {r.text}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section id="sec-falhou" style={{ marginBottom: 34, scrollMarginTop: 96 }}>
                  <h2 style={{ margin: "0 0 12px", font: "600 24px/1.25 var(--font-head)" }}>Se não funcionar</h2>
                  <p style={{ margin: 0, font: "400 16.5px/1.7 var(--font-body)", color: "var(--text2)" }}>{body.troubleshoot}</p>
                </section>

                <section id="sec-faq" style={{ marginBottom: 34, scrollMarginTop: 96 }}>
                  <h2 style={{ margin: "0 0 12px", font: "600 24px/1.25 var(--font-head)" }}>Perguntas frequentes</h2>
                  <div style={{ display: "grid", gap: 10 }}>
                    {body.faq.map((f) => (
                      <details key={f.q} className="card" style={{ padding: "15px 18px" }}>
                        <summary style={{ font: "600 15.5px/1.4 var(--font-body)", cursor: "pointer" }}>{f.q}</summary>
                        <p style={{ margin: "10px 0 0", font: "400 15px/1.6 var(--font-body)", color: "var(--text2)" }}>{f.a}</p>
                      </details>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <section style={{ marginBottom: 34 }}>
                <p style={{ margin: 0, font: "400 16.5px/1.7 var(--font-body)", color: "var(--text2)" }}>
                  O conteúdo completo deste artigo ainda está em elaboração pela equipe responsável ({article.dept}). O resumo
                  acima reflete o procedimento atual — solicite ajuda se precisar do passo a passo detalhado.
                </p>
              </section>
            )}

            <section aria-labelledby="fb-h" className="card" style={{ padding: "24px 26px" }}>
              <h2 id="fb-h" style={{ margin: "0 0 4px", font: "600 19px/1.3 var(--font-head)" }}>
                Esta informação resolveu sua dúvida?
              </h2>
              <p style={{ margin: "0 0 16px", font: "400 14.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
                Sua resposta ajuda a equipe responsável a melhorar o conteúdo.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <button
                  onClick={() => setFeedback("yes")}
                  aria-pressed={feedback === "yes"}
                  className="btn"
                  style={{
                    border: `1px solid ${feedback === "yes" ? "var(--ok-line)" : "var(--border)"}`,
                    background: feedback === "yes" ? "var(--ok-soft)" : "var(--surface)",
                    color: feedback === "yes" ? "var(--ok)" : "var(--text)",
                  }}
                >
                  Sim, resolveu
                </button>
                <button
                  onClick={() => setFeedback("no")}
                  aria-pressed={feedback === "no"}
                  className="btn"
                  style={{
                    border: `1px solid ${feedback === "no" ? "var(--danger-line)" : "var(--border)"}`,
                    background: feedback === "no" ? "var(--danger-soft)" : "var(--surface)",
                    color: feedback === "no" ? "var(--danger)" : "var(--text)",
                  }}
                >
                  Não resolveu
                </button>
              </div>
              {feedback && (
                <div style={{ animation: "fup .16s ease-out" }}>
                  <label htmlFor="fb-c" style={{ display: "block", marginBottom: 7, font: "500 13.5px/1 var(--font-body)", color: "var(--text2)" }}>
                    Comentário (opcional)
                  </label>
                  <textarea
                    id="fb-c"
                    rows={3}
                    className="textarea"
                    placeholder="O que faltou ou o que poderia ficar mais claro?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                    <button className="btn btn-primary" onClick={sendFeedback}>
                      Enviar avaliação
                    </button>
                    <button className="btn btn-secondary" onClick={() => showToast("Pedido de ajuda aberto — protótipo")}>
                      Solicitar ajuda
                    </button>
                    <button
                      className="btn"
                      style={{ border: "1px solid var(--warn-line)", background: "var(--warn-soft)", color: "var(--warn)" }}
                      onClick={reportOutdated}
                    >
                      Informar conteúdo desatualizado
                    </button>
                  </div>
                </div>
              )}
            </section>
          </article>

          <aside style={{ position: "sticky", top: 88, display: "grid", gap: 16 }}>
            <div className="card" style={{ padding: 16, display: "grid", gap: 8 }}>
              <button
                onClick={toggleFav}
                className="btn"
                style={{
                  border: `1px solid ${fav ? "var(--brand)" : "var(--border)"}`,
                  background: fav ? "var(--brand)" : "var(--surface)",
                  color: fav ? "var(--brand-ink)" : "var(--text)",
                }}
              >
                {fav ? "Salvo nos favoritos" : "Favoritar conteúdo"}
              </button>
              <button className="btn btn-secondary" onClick={copyLink}>
                <LinkIcon />
                {copied ? "Link copiado" : "Copiar link"}
              </button>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <PrintIcon />
                Imprimir ou salvar PDF
              </button>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div
                style={{
                  marginBottom: 11,
                  font: "600 12px/1 var(--font-head)",
                  letterSpacing: ".09em",
                  textTransform: "uppercase",
                  color: "var(--text3)",
                }}
              >
                Palavras-chave
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {article.kw.slice(0, 5).map((k) => (
                  <Link key={k} href={`/resultados?q=${encodeURIComponent(k)}`} className="pill" style={{ borderRadius: 15, height: 30 }}>
                    {k}
                  </Link>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div
                style={{
                  marginBottom: 11,
                  font: "600 12px/1 var(--font-head)",
                  letterSpacing: ".09em",
                  textTransform: "uppercase",
                  color: "var(--text3)",
                }}
              >
                Artigos relacionados
              </div>
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/artigo/${r.id}`}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)",
                    font: "500 14px/1.4 var(--font-body)",
                    color: "var(--text)",
                  }}
                >
                  {r.title}
                  <span style={{ display: "block", marginTop: 3, font: "400 12px/1 var(--font-body)", color: "var(--text3)" }}>
                    {r.cat} · {r.read}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
