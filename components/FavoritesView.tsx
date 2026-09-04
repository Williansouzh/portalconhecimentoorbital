"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUI } from "./UIProvider";

type Article = { id: string; title: string; cat: string; read: string; updated: string; dept: string };

type TabId = "favoritos" | "recentes" | "pesquisas" | "recomendados";

const TAB_LABEL: Record<TabId, string> = {
  favoritos: "Favoritos",
  recentes: "Visualizados recentemente",
  pesquisas: "Pesquisas recentes",
  recomendados: "Recomendados para você",
};
const CLEAR_LABEL: Record<TabId, string> = {
  favoritos: "Remover todos os favoritos",
  recentes: "Limpar histórico",
  pesquisas: "Limpar pesquisas recentes",
  recomendados: "Atualizar recomendações",
};
const RECOMMENDED_IDS = ["2fa", "chamados", "novo"];

export default function FavoritesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, confirm } = useUI();
  const tab = (searchParams.get("tab") as TabId) || "favoritos";

  const [favorites, setFavorites] = useState<Article[] | null>(null);
  const [history, setHistory] = useState<Article[] | null>(null);
  const [searches, setSearches] = useState<string[] | null>(null);
  const [recommended, setRecommended] = useState<Article[] | null>(null);

  const loadAll = useCallback(() => {
    fetch("/api/favorites").then((r) => r.json()).then((d) => setFavorites(d.items));
    fetch("/api/history").then((r) => r.json()).then((d) => setHistory(d.items));
    fetch("/api/searches").then((r) => r.json()).then((d) => setSearches(d.searches));
    Promise.all(RECOMMENDED_IDS.map((id) => fetch(`/api/articles/${id}`).then((r) => r.json())))
      .then((results) => setRecommended(results.map((r) => r.article)))
      .catch(() => setRecommended([]));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function setTab(next: TabId) {
    router.push(`/favoritos?tab=${next}`);
  }

  async function removeFavorite(id: string) {
    await fetch("/api/favorites", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    setFavorites((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
  }
  async function removeHistoryItem(id: string) {
    await fetch(`/api/history?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setHistory((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
  }
  async function removeSearch(q: string) {
    await fetch(`/api/searches?q=${encodeURIComponent(q)}`, { method: "DELETE" });
    setSearches((prev) => (prev ? prev.filter((s) => s !== q) : prev));
  }
  async function addFavoriteFromRecommended(id: string) {
    await fetch("/api/favorites", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    showToast("Adicionado aos favoritos");
  }

  async function handleClear() {
    if (tab === "recomendados") {
      showToast("Recomendações atualizadas — protótipo");
      return;
    }
    const copy: Record<Exclude<TabId, "recomendados">, { title: string; body: string; confirmLabel: string }> = {
      favoritos: {
        title: "Remover todos os favoritos?",
        body: "Os itens salvos como favoritos serão removidos.",
        confirmLabel: "Remover todos",
      },
      recentes: {
        title: "Limpar histórico?",
        body: "Os itens visualizados recentemente serão removidos deste dispositivo.",
        confirmLabel: "Limpar histórico",
      },
      pesquisas: {
        title: "Limpar pesquisas recentes?",
        body: "As pesquisas recentes serão removidas deste dispositivo.",
        confirmLabel: "Limpar pesquisas",
      },
    };
    const c = copy[tab as Exclude<TabId, "recomendados">];
    const ok = await confirm(c);
    if (!ok) return;
    if (tab === "favoritos") {
      await fetch("/api/favorites", { method: "DELETE" });
      setFavorites([]);
    } else if (tab === "recentes") {
      await fetch("/api/history", { method: "DELETE" });
      setHistory([]);
    } else if (tab === "pesquisas") {
      await fetch("/api/searches", { method: "DELETE" });
      setSearches([]);
    }
    showToast("Pronto, lista limpa");
  }

  const counts = {
    favoritos: favorites?.length ?? 0,
    recentes: history?.length ?? 0,
    pesquisas: searches?.length ?? 0,
    recomendados: RECOMMENDED_IDS.length,
  };

  return (
    <main className="main-loose">
      <div className="page-wrap-article">
        <h1 style={{ margin: "0 0 8px", font: "600 34px/1.15 var(--font-head)", letterSpacing: "-.015em" }}>Seu espaço</h1>
        <p style={{ margin: "0 0 24px", font: "400 16.5px/1.6 var(--font-body)", color: "var(--text2)" }}>
          Favoritos, histórico e recomendações — tudo visível apenas para você.
        </p>

        <div role="tablist" aria-label="Abas do espaço pessoal" className="tabs" style={{ marginBottom: 22 }}>
          {(Object.keys(TAB_LABEL) as TabId[]).map((id) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`tab-btn${tab === id ? " on" : ""}`}>
              {TAB_LABEL[id]}
              <span className="count">{counts[id]}</span>
            </button>
          ))}
        </div>

        {tab === "favoritos" && (
          <Rows
            loading={!favorites}
            items={(favorites ?? []).map((a) => ({
              id: a.id,
              badge: "★",
              title: a.title,
              meta: `${a.cat} · ${a.read} de leitura · atualizado ${a.updated}`,
              action: "Remover",
              onAction: () => removeFavorite(a.id),
            }))}
            onClear={handleClear}
            clearLabel={CLEAR_LABEL.favoritos}
          />
        )}
        {tab === "recentes" && (
          <Rows
            loading={!history}
            items={(history ?? []).map((a) => ({
              id: a.id,
              badge: "◷",
              title: a.title,
              meta: `Visto recentemente · ${a.cat}`,
              action: "Remover",
              onAction: () => removeHistoryItem(a.id),
            }))}
            onClear={handleClear}
            clearLabel={CLEAR_LABEL.recentes}
          />
        )}
        {tab === "pesquisas" && (
          <Rows
            loading={!searches}
            items={(searches ?? []).map((s) => ({
              id: s,
              badge: "⌕",
              title: `“${s}”`,
              meta: "Pesquisa recente",
              action: "Remover",
              onAction: () => removeSearch(s),
              href: `/resultados?q=${encodeURIComponent(s)}`,
            }))}
            onClear={handleClear}
            clearLabel={CLEAR_LABEL.pesquisas}
          />
        )}
        {tab === "recomendados" && (
          <Rows
            loading={!recommended}
            items={(recommended ?? []).map((a) => ({
              id: a.id,
              badge: "✧",
              title: a.title,
              meta: "Recomendado porque você leu sobre acessos",
              action: "Favoritar",
              onAction: () => addFavoriteFromRecommended(a.id),
            }))}
            onClear={handleClear}
            clearLabel={CLEAR_LABEL.recomendados}
          />
        )}
      </div>
    </main>
  );
}

function Rows({
  loading,
  items,
  onClear,
  clearLabel,
}: {
  loading: boolean;
  items: { id: string; badge: string; title: string; meta: string; action: string; onAction: () => void; href?: string }[];
  onClear: () => void;
  clearLabel: string;
}) {
  if (loading) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="card" style={{ padding: "17px 20px" }}>
            <span className="skeleton-shimmer" style={{ display: "block", height: 13, width: "48%" }} />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: "56px 40px",
          textAlign: "center",
          background: "var(--surface)",
          border: "1px dashed var(--border-strong)",
          borderRadius: 16,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 52,
            height: 52,
            margin: "0 auto 16px",
            borderRadius: 14,
            background: "var(--surface2)",
            color: "var(--text3)",
            display: "grid",
            placeItems: "center",
            font: "600 20px/1 var(--font-head)",
          }}
        >
          ☆
        </div>
        <h2 style={{ margin: "0 0 8px", font: "600 20px/1.3 var(--font-head)" }}>Nada por aqui ainda</h2>
        <p style={{ margin: "0 auto 20px", maxWidth: 380, font: "400 15px/1.55 var(--font-body)", color: "var(--text2)" }}>
          Ao encontrar um conteúdo útil, toque no marcador para guardá-lo nesta lista.
        </p>
        <Link href="/" className="btn btn-primary">
          Pesquisar conteúdos
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((i) => (
          <div key={i.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "17px 20px" }}>
            <span
              aria-hidden="true"
              style={{
                width: 38,
                height: 38,
                flex: "none",
                borderRadius: 10,
                background: "var(--surface2)",
                color: "var(--text3)",
                display: "grid",
                placeItems: "center",
                font: "600 13px/1 var(--font-head)",
              }}
            >
              {i.badge}
            </span>
            <Link href={i.href ?? `/artigo/${i.id}`} style={{ flex: 1, minWidth: 0, textAlign: "left", color: "inherit" }}>
              <span style={{ display: "block", font: "600 16px/1.35 var(--font-body)" }}>{i.title}</span>
              <span style={{ display: "block", marginTop: 3, font: "400 13px/1 var(--font-body)", color: "var(--text3)" }}>{i.meta}</span>
            </Link>
            <button onClick={i.onAction} className="btn btn-secondary btn-sm" style={{ flex: "none" }}>
              {i.action}
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onClear}>
          {clearLabel}
        </button>
      </div>
    </>
  );
}
