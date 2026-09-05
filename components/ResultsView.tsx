"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUI } from "./UIProvider";
import { BookmarkIcon, CheckIcon } from "./Icons";

type SearchResult = {
  id: string;
  pre: string;
  mid: string;
  post: string;
  sPre: string;
  sMid: string;
  sPost: string;
  path: string;
  type: string;
  cat: string;
  updated: string;
  read: string;
  views: string;
  kw: string;
  verified: boolean;
  outdated: boolean;
  fav: boolean;
  relPct: number;
};
type FilterOption = { label: string; value: string; count: number | null; on: boolean };
type FilterGroup = { key: string; label: string; options: FilterOption[] };
type SearchResponse = {
  q: string;
  searchEventId: number | null;
  results: SearchResult[];
  resultCount: number;
  searchTimeMs: number;
  filterGroups: FilterGroup[];
  activeFilters: string[];
};

const SORT_LABEL: Record<string, string> = {
  relevancia: "relevância",
  acessados: "mais acessados",
  recentes: "mais recentes",
};
const POPULAR = ["redefinir senha", "férias", "reembolso", "trabalho remoto", "chamados"];

export default function ResultsView() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  // Keying on q remounts the panel (fresh sort/filters/view state) instead
  // of reconciling it via a setState-in-effect reset.
  return <ResultsPanel key={q} q={q} />;
}

function ResultsPanel({ q }: { q: string }) {
  const router = useRouter();
  const { showToast } = useUI();

  const [sort, setSort] = useState("relevancia");
  const [filters, setFilters] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "cards">("list");
  const [data, setData] = useState<SearchResponse | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("q", q);
    params.set("sort", sort);
    filters.forEach((f) => params.append("filter", f));
    fetch(`/api/search?${params.toString()}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [q, sort, filters]);

  function toggleFilter(key: string) {
    setFilters((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
  }

  async function toggleFav(id: string) {
    setData((prev) => (prev ? { ...prev, results: prev.results.map((r) => (r.id === id ? { ...r, fav: !r.fav } : r)) } : prev));
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  }

  // Clique num resultado é atribuído à busca que o originou — é daí que saem
  // a taxa de cliques e o tempo até a resposta no painel de gestão.
  function registerClick(articleId: string) {
    if (!data?.searchEventId) return;
    const payload = JSON.stringify({ searchEventId: data.searchEventId, articleId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/search/click", new Blob([payload], { type: "application/json" }));
      return;
    }
    fetch("/api/search/click", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }

  const chips = useMemo(() => filters.map((k) => ({ key: k, label: k.split("|")[1] })), [filters]);

  if (!data) {
    return (
      <main>
        <div className="page-wrap">
          <div className="card card-pad" style={{ display: "grid", gap: 14 }}>
            <span className="skeleton-shimmer" style={{ height: 13, width: "40%" }} />
            <span className="skeleton-line" style={{ width: "80%" }} />
            <span className="skeleton-line" style={{ width: "65%" }} />
          </div>
        </div>
      </main>
    );
  }

  const gridStyle =
    view === "cards"
      ? { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }
      : { display: "grid", gap: 14 };

  return (
    <main>
      <div className="page-wrap">
        <nav aria-label="Trilha" className="trail">
          <Link href="/">Início</Link>
          <span aria-hidden="true">›</span>
          <span>Resultados da pesquisa</span>
        </nav>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: "0 0 6px", font: "600 27px/1.2 var(--font-head)" }}>Resultados para &ldquo;{q}&rdquo;</h1>
            <p style={{ margin: 0, font: "400 14px/1 var(--font-body)", color: "var(--text2)" }}>
              {data.resultCount} conteúdos encontrados em {(data.searchTimeMs / 1000).toFixed(2).replace(".", ",")} s · ordenados
              por {SORT_LABEL[sort]}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label htmlFor="sort" style={{ font: "500 13px/1 var(--font-body)", color: "var(--text2)" }}>
              Ordenar por
            </label>
            <select id="sort" className="select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: "auto" }}>
              <option value="relevancia">Relevância</option>
              <option value="acessados">Mais acessados</option>
              <option value="recentes">Mais recentes</option>
            </select>
            <div
              role="group"
              aria-label="Modo de visualização"
              style={{ display: "flex", gap: 2, padding: 3, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)" }}
            >
              <button onClick={() => setView("list")} aria-pressed={view === "list"} className={`seg-btn${view === "list" ? " on" : ""}`}>
                Lista
              </button>
              <button onClick={() => setView("cards")} aria-pressed={view === "cards"} className={`seg-btn${view === "cards" ? " on" : ""}`}>
                Cartões
              </button>
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            <span style={{ font: "500 13px/1 var(--font-body)", color: "var(--text3)" }}>Filtros ativos:</span>
            {chips.map((c) => (
              <span key={c.key} className="chip">
                {c.label}
                <button className="chip-x" aria-label="Remover filtro" onClick={() => toggleFilter(c.key)}>
                  ×
                </button>
              </span>
            ))}
            <button
              className="btn-dashed"
              style={{ height: 32, padding: "0 12px", borderRadius: 16, font: "500 13px/1 var(--font-body)" }}
              onClick={() => setFilters([])}
            >
              Limpar todos
            </button>
          </div>
        )}

        <div className="stack" style={{ gridTemplateColumns: "264px 1fr", gap: 26, alignItems: "start" }}>
          <aside aria-label="Filtros" className="card" style={{ position: "sticky", top: 88, padding: "6px 18px 14px" }}>
            {data.filterGroups.map((g) => (
              <div key={g.key} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                <div
                  style={{
                    marginBottom: 9,
                    font: "600 12px/1 var(--font-head)",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "var(--text3)",
                  }}
                >
                  {g.label}
                </div>
                {g.options.map((o) => {
                  const key = `${g.key}|${o.value}`;
                  return (
                    <label key={key} className="filter-check">
                      <input type="checkbox" checked={filters.includes(key)} onChange={() => toggleFilter(key)} />
                      <span className="lbl">{o.label}</span>
                      {o.count !== null && <span className="cnt">{o.count}</span>}
                    </label>
                  );
                })}
              </div>
            ))}
            <button className="btn btn-secondary" style={{ width: "100%", marginTop: 14 }} onClick={() => setFilters([])}>
              Limpar filtros
            </button>
          </aside>

          <div>
            {data.resultCount > 0 ? (
              <>
                <div style={gridStyle}>
                  {data.results.map((r) => (
                    <article
                      key={r.id}
                      className="card card-hover"
                      style={{ padding: view === "cards" ? "18px 20px" : "20px 22px", transition: "box-shadow .14s,border-color .14s" }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 7,
                              font: "400 12px/1 var(--font-body)",
                              color: "var(--text3)",
                            }}
                          >
                            {r.path}
                          </div>
                          <Link
                            href={`/artigo/${r.id}`}
                            onClick={() => registerClick(r.id)}
                            style={{ display: "block", margin: "0 0 8px", font: "600 19px/1.3 var(--font-head)", color: "var(--text)" }}
                          >
                            {r.pre}
                            <b className="hl">{r.mid}</b>
                            {r.post}
                          </Link>
                          <p style={{ margin: "0 0 12px", font: "400 14.5px/1.55 var(--font-body)", color: "var(--text2)" }}>
                            {r.sPre}
                            <b className="hl" style={{ color: "var(--text)" }}>
                              {r.sMid}
                            </b>
                            {r.sPost}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                            <span className="badge">{r.type}</span>
                            <span className="badge">{r.cat}</span>
                            {r.verified && (
                              <span className="badge badge-ok">
                                <CheckIcon />
                                Conteúdo verificado
                              </span>
                            )}
                            {r.outdated && <span className="badge badge-warn">! Pode estar desatualizado</span>}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 14,
                              font: "400 12.5px/1 var(--font-body)",
                              color: "var(--text3)",
                            }}
                          >
                            <span>Atualizado em {r.updated}</span>
                            <span>{r.read} de leitura</span>
                            <span>{r.views} visualizações</span>
                            <span>Palavras-chave: {r.kw}</span>
                          </div>
                        </div>
                        <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                          <button
                            onClick={() => toggleFav(r.id)}
                            aria-label="Favoritar conteúdo"
                            aria-pressed={r.fav}
                            style={{
                              width: 40,
                              height: 40,
                              border: `1px solid ${r.fav ? "var(--brand)" : "var(--border)"}`,
                              borderRadius: 11,
                              background: r.fav ? "var(--brand-soft)" : "var(--surface)",
                              color: r.fav ? "var(--brand-strong)" : "var(--text3)",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <BookmarkIcon filled={r.fav} />
                          </button>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ display: "block", font: "500 11px/1 var(--font-body)", color: "var(--text3)", marginBottom: 5 }}>
                              relevância
                            </span>
                            <span style={{ display: "block", width: 64, height: 5, borderRadius: 3, background: "var(--surface3)", overflow: "hidden" }}>
                              <span style={{ display: "block", height: "100%", width: `${r.relPct}%`, background: "var(--brand)", borderRadius: 3 }} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginTop: 26 }}>
                  <span style={{ font: "400 13.5px/1 var(--font-body)", color: "var(--text3)" }}>
                    Mostrando {data.resultCount} de {data.resultCount} resultados
                  </span>
                </div>
              </>
            ) : (
              <div className="card" style={{ padding: "44px 40px", textAlign: "center" }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 56,
                    height: 56,
                    margin: "0 auto 18px",
                    borderRadius: 14,
                    background: "var(--warn-soft)",
                    color: "var(--warn)",
                    display: "grid",
                    placeItems: "center",
                    font: "700 24px/1 var(--font-head)",
                  }}
                >
                  ?
                </div>
                <h2 style={{ margin: "0 0 8px", font: "600 22px/1.25 var(--font-head)" }}>Nada encontrado para &ldquo;{q}&rdquo;</h2>
                <p style={{ margin: "0 auto 22px", maxWidth: 460, font: "400 15px/1.55 var(--font-body)", color: "var(--text2)" }}>
                  Talvez você quis dizer{" "}
                  <button className="btn-ghost" style={{ fontSize: 15 }} onClick={() => router.push("/resultados?q=redefinir%20senha")}>
                    redefinir senha
                  </button>
                  ? Você também pode tentar os termos abaixo.
                </p>
                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
                  {POPULAR.map((p) => (
                    <Link key={p} href={`/resultados?q=${encodeURIComponent(p)}`} className="pill">
                      {p}
                    </Link>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                  <Link href="/categorias" className="btn btn-secondary">
                    Navegar por categorias
                  </Link>
                  <button className="btn btn-primary" onClick={() => showToast("Pedido de ajuda aberto — protótipo")}>
                    Solicitar ajuda
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
