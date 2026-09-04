"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/components/UIProvider";

const CATEGORY_OPTIONS = ["Tecnologia", "Recursos Humanos", "Financeiro", "Sistemas", "Segurança"];
const DEPT_OPTIONS = ["TI · Suporte", "TI · Infraestrutura", "RH · Pessoas", "Financeiro · Contas a pagar"];
const TOOLBAR = ["B", "I", "H2", "1.", "•", "↗", "▣"];

export default function EditorPage() {
  const router = useRouter();
  const { showToast } = useUI();

  const [title, setTitle] = useState("Como redefinir a senha corporativa");
  const [summary, setSummary] = useState(
    "Acesse o portal de acessos, informe sua matrícula e receba um link de redefinição no e-mail corporativo."
  );
  const [content, setContent] = useState(
    "## Antes de começar\nVocê precisa da matrícula (6 dígitos) e de acesso ao e-mail corporativo.\n\n## Passo a passo\n1. Abra portal.riocard.com.br/senha\n2. Clique em “Esqueci minha senha”\n3. Use o código de 6 dígitos\n4. Defina a nova senha"
  );
  const [cat, setCat] = useState(CATEGORY_OPTIONS[0]);
  const [dept, setDept] = useState(DEPT_OPTIONS[0]);
  const [reviewDate, setReviewDate] = useState("2026-12-15");
  const [keywords, setKeywords] = useState(["senha", "acesso", "login"]);
  const [kwInput, setKwInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function addKeyword() {
    const v = kwInput.trim();
    if (v && !keywords.includes(v)) setKeywords((k) => [...k, v]);
    setKwInput("");
  }
  function removeKeyword(k: string) {
    setKeywords((prev) => prev.filter((x) => x !== k));
  }

  async function submit() {
    setSubmitting(true);
    try {
      await fetch("/api/articles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, summary, content, cat, dept, reviewDate, keywords }),
      });
      showToast("Artigo enviado para revisão");
      router.push("/admin");
    } catch {
      showToast("Não foi possível enviar agora — tente novamente");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <div className="page-wrap-narrow">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/admin" aria-label="Voltar para a gestão" className="icon-btn" style={{ width: 42, height: 42 }}>
              ‹
            </Link>
            <div>
              <h1 style={{ margin: "0 0 4px", font: "600 24px/1.2 var(--font-head)" }}>Editor de artigo</h1>
              <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, font: "400 13px/1 var(--font-body)", color: "var(--text3)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ok)" }} />
                Rascunho salvo automaticamente · versão 5
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button className="btn btn-secondary">Visualizar</button>
            <button className="btn btn-secondary">Salvar rascunho</button>
            <button className="btn btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? "Enviando…" : "Enviar para revisão"}
            </button>
          </div>
        </div>

        <div className="stack" style={{ gridTemplateColumns: "minmax(0,1fr) 320px", gap: 24, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 18 }}>
            <div className="card" style={{ padding: 22, display: "grid", gap: 18 }}>
              <div>
                <label htmlFor="e-t" className="field-label">
                  Título<span style={{ color: "var(--danger)" }}> *</span>
                </label>
                <input id="e-t" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
                <p className="field-hint">Comece com o verbo da ação. {title.length} de 80 caracteres.</p>
              </div>
              <div>
                <label htmlFor="e-r" className="field-label">
                  Resumo<span style={{ color: "var(--danger)" }}> *</span>
                </label>
                <textarea id="e-r" rows={2} className="textarea" value={summary} onChange={(e) => setSummary(e.target.value)} />
                <p className="field-hint">Aparece nos resultados de busca — responda a dúvida em uma frase.</p>
              </div>
              <div>
                <label htmlFor="e-c" className="field-label">
                  Conteúdo
                </label>
                <div style={{ border: "1px solid var(--border)", borderRadius: 11, overflow: "hidden" }}>
                  <div
                    role="toolbar"
                    aria-label="Formatação"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      padding: 7,
                      background: "var(--surface2)",
                      borderBottom: "1px solid var(--border)",
                      flexWrap: "wrap",
                    }}
                  >
                    {TOOLBAR.map((t) => (
                      <button key={t} aria-label={t} style={{ minWidth: 34, height: 34, padding: "0 9px", border: 0, borderRadius: 8, background: "none", font: "600 13px/1 var(--font-body)" }}>
                        {t}
                      </button>
                    ))}
                    <span aria-hidden="true" style={{ width: 1, height: 22, margin: "0 5px", background: "var(--border)" }} />
                    <button style={{ height: 34, padding: "0 11px", border: 0, borderRadius: 8, background: "var(--brand-soft)", color: "var(--brand-strong)", font: "600 12.5px/1 var(--font-body)" }}>
                      + Passo
                    </button>
                  </div>
                  <textarea
                    id="e-c"
                    rows={9}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ width: "100%", padding: 15, border: 0, background: "var(--surface)", font: "400 15px/1.7 var(--font-body)", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>

            <div className="stack" style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div className="card" style={{ padding: "20px 22px", display: "grid", gap: 16 }}>
                <div>
                  <label htmlFor="e-cat" className="field-label">
                    Categoria<span style={{ color: "var(--danger)" }}> *</span>
                  </label>
                  <select id="e-cat" className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="e-dep" className="field-label">
                    Departamento responsável
                  </label>
                  <select id="e-dep" className="select" value={dept} onChange={(e) => setDept(e.target.value)}>
                    {DEPT_OPTIONS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="e-rev" className="field-label">
                    Data da próxima revisão
                  </label>
                  <input id="e-rev" type="date" className="select" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
                </div>
              </div>
              <div className="card" style={{ padding: "20px 22px", display: "grid", gap: 16 }}>
                <div>
                  <label htmlFor="e-kw" className="field-label">
                    Palavras-chave
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: 9, border: "1px solid var(--border)", borderRadius: 11, background: "var(--surface2)" }}>
                    {keywords.map((k) => (
                      <span key={k} className="chip">
                        {k}
                        <button aria-label={`Remover palavra-chave ${k}`} className="chip-x" onClick={() => removeKeyword(k)}>
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      id="e-kw"
                      placeholder="Adicionar…"
                      value={kwInput}
                      onChange={(e) => setKwInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                      style={{ flex: 1, minWidth: 110, height: 30, border: 0, background: "transparent", font: "400 13.5px/1 var(--font-body)", outline: "none" }}
                    />
                  </div>
                  <p className="field-hint">Inclua os termos que as pessoas realmente digitam, com erros comuns.</p>
                </div>
                <div>
                  <span className="field-label">Anexos</span>
                  <div style={{ display: "grid", gap: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", background: "var(--surface2)", borderRadius: 10, font: "500 13.5px/1 var(--font-body)" }}>
                      <span aria-hidden="true" style={{ color: "var(--text3)" }}>
                        ▤
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        manual-senha.pdf
                        <span style={{ display: "block", marginTop: 3, font: "400 12px/1 var(--font-body)", color: "var(--text3)" }}>480 KB</span>
                      </span>
                      <button aria-label="Remover anexo" style={{ width: 26, height: 26, border: 0, borderRadius: 8, background: "none", color: "var(--text3)", font: "600 13px/1 var(--font-body)" }}>
                        ×
                      </button>
                    </div>
                    <button className="btn btn-dashed" style={{ height: 44, borderRadius: 10 }}>
                      + Adicionar arquivo ou imagem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside style={{ position: "sticky", top: 88, display: "grid", gap: 16 }}>
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ marginBottom: 13, font: "600 12px/1 var(--font-head)", letterSpacing: ".09em", textTransform: "uppercase", color: "var(--text3)" }}>
                Situação
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 30, padding: "0 12px", borderRadius: 15, background: "var(--surface2)", font: "600 13px/1 var(--font-body)", color: "var(--text2)" }}>
                Rascunho
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
                <span style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--brand)" }} />
                <span style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--surface3)" }} />
                <span style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--surface3)" }} />
                <span style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--surface3)" }} />
              </div>
              <p style={{ margin: "9px 0 0", font: "400 12.5px/1.5 var(--font-body)", color: "var(--text3)" }}>
                Rascunho → revisão → aprovação → publicação
              </p>
            </div>
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ marginBottom: 13, font: "600 12px/1 var(--font-head)", letterSpacing: ".09em", textTransform: "uppercase", color: "var(--text3)" }}>
                Antes de enviar
              </div>
              <div style={{ display: "grid", gap: 10, font: "400 13.5px/1.45 var(--font-body)", color: "var(--text2)" }}>
                <span style={{ display: "flex", gap: 9 }}>
                  <b style={{ color: title.trim() && summary.trim() ? "var(--ok)" : "var(--text3)" }}>✓</b>Resumo responde a dúvida
                </span>
                <span style={{ display: "flex", gap: 9 }}>
                  <b style={{ color: "var(--ok)" }}>✓</b>Passos numerados
                </span>
                <span style={{ display: "flex", gap: 9 }}>
                  <b style={{ color: keywords.length > 0 ? "var(--ok)" : "var(--text3)" }}>✓</b>Palavras-chave preenchidas
                </span>
                <span style={{ display: "flex", gap: 9, color: "var(--warn)" }}>
                  <b>!</b>Captura de tela pendente
                </span>
              </div>
            </div>
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ marginBottom: 13, font: "600 12px/1 var(--font-head)", letterSpacing: ".09em", textTransform: "uppercase", color: "var(--text3)" }}>
                Conteúdos relacionados
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", background: "var(--surface2)", borderRadius: 10, font: "500 13.5px/1.35 var(--font-body)" }}>
                  Autenticação em dois fatores
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", background: "var(--surface2)", borderRadius: 10, font: "500 13.5px/1.35 var(--font-body)" }}>
                  Desbloqueio de senha do SAP
                </span>
                <button className="btn btn-dashed" style={{ height: 40, borderRadius: 10 }}>
                  + Vincular conteúdo
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
