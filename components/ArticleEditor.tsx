"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/components/UIProvider";
import type { Article, ArticleStatus } from "@/lib/types";
import type { Role } from "@/lib/auth";

const CATEGORY_OPTIONS = ["Tecnologia", "Recursos Humanos", "Financeiro", "Sistemas", "Segurança", "Operações", "Comercial", "Políticas internas"];
const DEPT_OPTIONS = ["TI · Suporte", "TI · Infraestrutura", "RH · Pessoas", "Financeiro · Contas a pagar", "Operações · Benefícios", "Segurança da informação"];
const TOOLBAR = ["B", "I", "H2", "1.", "•", "↗", "▣"];

const STATUS_LABEL: Record<ArticleStatus, string> = {
  rascunho: "Rascunho",
  revisao: "Em revisão",
  aprovacao: "Aguardando aprovação",
  publicado: "Publicado",
};
const ESTAGIOS: ArticleStatus[] = ["rascunho", "revisao", "aprovacao", "publicado"];

/** Próximo passo do fluxo, respeitando o papel de quem está editando. */
function proximaAcao(status: ArticleStatus, role: Role): { label: string; alvo: ArticleStatus } | null {
  if (status === "rascunho") return { label: "Enviar para revisão", alvo: "revisao" };
  if (status === "revisao") return role === "curador" ? { label: "Aprovar", alvo: "aprovacao" } : null;
  if (status === "aprovacao") return role === "curador" ? { label: "Publicar", alvo: "publicado" } : null;
  return null;
}

export default function ArticleEditor({
  article,
  role,
  termoSugerido,
}: {
  article: Article | null;
  role: Role;
  termoSugerido?: string;
}) {
  const router = useRouter();
  const { showToast } = useUI();

  const [id, setId] = useState(article?.id ?? null);
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? "rascunho");
  const [title, setTitle] = useState(article?.title ?? (termoSugerido ? termoSugerido[0].toUpperCase() + termoSugerido.slice(1) : ""));
  const [summary, setSummary] = useState(article?.snippet ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [cat, setCat] = useState(article?.cat ?? CATEGORY_OPTIONS[0]);
  const [dept, setDept] = useState(article?.dept ?? DEPT_OPTIONS[0]);
  const [nextReview, setNextReview] = useState(article?.nextReview ?? "");
  const [keywords, setKeywords] = useState<string[]>(article?.kw ?? (termoSugerido ? [termoSugerido] : []));
  const [kwInput, setKwInput] = useState("");
  const [salvando, setSalvando] = useState(false);

  const acao = proximaAcao(status, role);
  const payload = { title, summary, content, cat, dept, keywords, nextReview: nextReview || null };

  function addKeyword() {
    const v = kwInput.trim();
    if (v && !keywords.includes(v)) setKeywords((k) => [...k, v]);
    setKwInput("");
  }

  /** Cria na primeira gravação, atualiza nas seguintes. Devolve o id. */
  async function salvar(silencioso = false): Promise<string | null> {
    if (!title.trim()) {
      showToast("O título é obrigatório");
      return null;
    }
    setSalvando(true);
    try {
      const res = id
        ? await fetch(`/api/articles/${id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/articles", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        showToast("Não foi possível salvar agora");
        return null;
      }
      const data = await res.json();
      const novoId: string = data.article.id;
      setId(novoId);
      if (!silencioso) showToast("Rascunho salvo");
      return novoId;
    } finally {
      setSalvando(false);
    }
  }

  async function avancar() {
    if (!acao) return;
    const alvoId = await salvar(true);
    if (!alvoId) return;
    const res = await fetch(`/api/articles/${alvoId}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: acao.alvo }),
    });
    if (!res.ok) {
      showToast(res.status === 403 ? "Seu papel não permite esta etapa" : "Não foi possível mudar o estágio");
      return;
    }
    setStatus(acao.alvo);
    showToast(acao.alvo === "publicado" ? "Artigo publicado — já aparece na busca" : `Enviado: ${STATUS_LABEL[acao.alvo]}`);
    router.refresh();
  }

  const indiceEstagio = ESTAGIOS.indexOf(status);

  return (
    <main>
      <div className="page-wrap-narrow">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/admin" aria-label="Voltar para a gestão" className="icon-btn" style={{ width: 42, height: 42 }}>
              ‹
            </Link>
            <div>
              <h1 style={{ margin: "0 0 4px", font: "600 24px/1.2 var(--font-head)" }}>
                {id ? "Editar artigo" : "Novo artigo"}
              </h1>
              <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, font: "400 13px/1 var(--font-body)", color: "var(--text3)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: status === "publicado" ? "var(--ok)" : "var(--warn)" }} />
                {STATUS_LABEL[status]}
                {id && ` · ${id}`}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {status === "publicado" && id && (
              <Link href={`/artigo/${id}`} className="btn btn-secondary">
                Ver publicado
              </Link>
            )}
            <button className="btn btn-secondary" onClick={() => salvar()} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar rascunho"}
            </button>
            {acao && (
              <button className="btn btn-primary" onClick={avancar} disabled={salvando}>
                {acao.label}
              </button>
            )}
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
                    style={{ display: "flex", alignItems: "center", gap: 3, padding: 7, background: "var(--surface2)", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}
                  >
                    {TOOLBAR.map((t) => (
                      <button key={t} aria-label={t} style={{ minWidth: 34, height: 34, padding: "0 9px", border: 0, borderRadius: 8, background: "none", font: "600 13px/1 var(--font-body)" }}>
                        {t}
                      </button>
                    ))}
                    <span aria-hidden="true" style={{ width: 1, height: 22, margin: "0 5px", background: "var(--border)" }} />
                    <button
                      onClick={() => setContent((c) => `${c}${c.endsWith("\n") || !c ? "" : "\n"}## Novo passo\n`)}
                      style={{ height: 34, padding: "0 11px", border: 0, borderRadius: 8, background: "var(--brand-soft)", color: "var(--brand-strong)", font: "600 12.5px/1 var(--font-body)" }}
                    >
                      + Passo
                    </button>
                  </div>
                  <textarea
                    id="e-c"
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={"## Antes de começar\nO que a pessoa precisa ter em mãos.\n\n## Passo a passo\n1. Primeiro passo\n2. Segundo passo"}
                    style={{ width: "100%", padding: 15, border: 0, background: "var(--surface)", font: "400 15px/1.7 var(--font-body)", resize: "vertical" }}
                  />
                </div>
                <p className="field-hint">Use ## para títulos de seção e 1. 2. 3. para os passos.</p>
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
                  <input id="e-rev" type="date" className="select" value={nextReview} onChange={(e) => setNextReview(e.target.value)} />
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
                        <button aria-label={`Remover palavra-chave ${k}`} className="chip-x" onClick={() => setKeywords((prev) => prev.filter((x) => x !== k))}>
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
              </div>
            </div>
          </div>

          <aside style={{ position: "sticky", top: 88, display: "grid", gap: 16 }}>
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ marginBottom: 13, font: "600 12px/1 var(--font-head)", letterSpacing: ".09em", textTransform: "uppercase", color: "var(--text3)" }}>
                Situação
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 30, padding: "0 12px", borderRadius: 15, background: status === "publicado" ? "var(--ok-soft)" : "var(--surface2)", font: "600 13px/1 var(--font-body)", color: status === "publicado" ? "var(--ok)" : "var(--text2)" }}>
                {STATUS_LABEL[status]}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
                {ESTAGIOS.map((e, i) => (
                  <span key={e} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= indiceEstagio ? "var(--brand)" : "var(--surface3)" }} />
                ))}
              </div>
              <p style={{ margin: "9px 0 0", font: "400 12.5px/1.5 var(--font-body)", color: "var(--text3)" }}>
                Rascunho → revisão → aprovação → publicação
              </p>
              {!acao && status !== "publicado" && (
                <p style={{ margin: "10px 0 0", font: "400 12.5px/1.5 var(--font-body)", color: "var(--warn)" }}>
                  A próxima etapa é de um curador.
                </p>
              )}
            </div>

            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ marginBottom: 13, font: "600 12px/1 var(--font-head)", letterSpacing: ".09em", textTransform: "uppercase", color: "var(--text3)" }}>
                Antes de enviar
              </div>
              <div style={{ display: "grid", gap: 10, font: "400 13.5px/1.45 var(--font-body)", color: "var(--text2)" }}>
                <Check ok={!!title.trim()} texto="Título preenchido" />
                <Check ok={!!summary.trim()} texto="Resumo responde a dúvida" />
                <Check ok={content.includes("##")} texto="Conteúdo com seções" />
                <Check ok={keywords.length > 0} texto="Palavras-chave preenchidas" />
                <Check ok={!!nextReview} texto="Prazo de revisão definido" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Check({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <span style={{ display: "flex", gap: 9, color: ok ? "var(--text2)" : "var(--text3)" }}>
      <b style={{ color: ok ? "var(--ok)" : "var(--warn)" }}>{ok ? "✓" : "!"}</b>
      {texto}
    </span>
  );
}
