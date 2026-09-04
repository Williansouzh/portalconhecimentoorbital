import Link from "next/link";
import { getHomeData } from "@/lib/home";
import SearchBox from "@/components/SearchBox";
import HelpButton from "@/components/HelpButton";
import { CategoryGlyphIcon } from "@/components/Icons";

export default function HomePage() {
  const { topSearched, recent, continueReading, favList, homeCategories, popular } = getHomeData();

  return (
    <main className="main-loose">
      <section className="page-wrap" style={{ padding: "76px 0 40px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <span
            style={{
              font: "600 12px/1 var(--font-head)",
              letterSpacing: ".13em",
              textTransform: "uppercase",
              color: "var(--brand-strong)",
            }}
          >
            Base de conhecimento interna
          </span>
        </div>
        <h1 style={{ margin: "0 0 14px", font: "600 52px/1.08 var(--font-head)", letterSpacing: "-.02em" }}>
          Como podemos ajudar você hoje?
        </h1>
        <p style={{ margin: "0 auto 34px", maxWidth: 560, font: "400 18px/1.5 var(--font-body)", color: "var(--text2)" }}>
          Procedimentos, tutoriais e respostas do dia a dia da RioCard — tudo em um só lugar.
        </p>

        <SearchBox variant="hero" />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop: 22 }}>
          <span style={{ font: "400 13.5px/1 var(--font-body)", color: "var(--text3)" }}>Buscas frequentes:</span>
          {popular.map((p) => (
            <Link key={p} href={`/resultados?q=${encodeURIComponent(p)}`} className="pill">
              {p}
            </Link>
          ))}
        </div>
      </section>

      <section className="page-wrap" style={{ marginBottom: 44 }} aria-labelledby="h-cats">
        <h2
          id="h-cats"
          style={{ margin: "0 0 14px", font: "600 15px/1 var(--font-head)", letterSpacing: ".02em", color: "var(--text2)" }}
        >
          Categorias mais acessadas
        </h2>
        <div className="stack" style={{ gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {homeCategories.map((c) => (
            <Link
              key={c.slug}
              href="/categorias"
              className="card card-lift"
              style={{ display: "flex", alignItems: "center", gap: 14, padding: 18, textAlign: "left", color: "inherit" }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  flex: "none",
                  borderRadius: 11,
                  background: "var(--brand-soft)",
                  color: "var(--brand-strong)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CategoryGlyphIcon icon={c.icon} />
              </span>
              <span>
                <span style={{ display: "block", font: "600 15.5px/1.2 var(--font-body)" }}>{c.label}</span>
                <span style={{ display: "block", marginTop: 3, font: "400 13px/1.2 var(--font-body)", color: "var(--text3)" }}>
                  {c.count} conteúdos
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="stack page-wrap" style={{ marginBottom: 44, gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div className="card card-pad">
          <h2 style={{ margin: "0 0 4px", font: "600 18px/1.2 var(--font-head)" }}>Mais pesquisados</h2>
          <p style={{ margin: "0 0 14px", font: "400 13.5px/1.4 var(--font-body)", color: "var(--text3)" }}>
            Nos últimos 30 dias, por toda a empresa
          </p>
          {topSearched.map((a) => (
            <Link
              key={a.id}
              href={`/artigo/${a.id}`}
              className="row-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                padding: "11px 10px",
                borderBottom: "1px solid var(--border)",
                borderRadius: 9,
              }}
            >
              <span style={{ width: 24, flex: "none", font: "600 13px/1 var(--font-head)", color: "var(--text3)" }}>{a.rank}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", font: "500 15px/1.3 var(--font-body)" }}>{a.title}</span>
                <span style={{ display: "block", marginTop: 3, font: "400 12.5px/1 var(--font-body)", color: "var(--text3)" }}>
                  {a.cat} · {a.read} de leitura
                </span>
              </span>
              <span style={{ flex: "none", font: "500 12.5px/1 var(--font-body)", color: "var(--text3)" }}>{a.views}</span>
            </Link>
          ))}
        </div>
        <div className="card card-pad">
          <h2 style={{ margin: "0 0 4px", font: "600 18px/1.2 var(--font-head)" }}>Atualizados recentemente</h2>
          <p style={{ margin: "0 0 14px", font: "400 13.5px/1.4 var(--font-body)", color: "var(--text3)" }}>
            Revisados pela equipe responsável
          </p>
          {recent.map((a) => (
            <Link
              key={a.id}
              href={`/artigo/${a.id}`}
              className="row-link"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                width: "100%",
                padding: "11px 10px",
                borderBottom: "1px solid var(--border)",
                borderRadius: 9,
              }}
            >
              <span style={{ width: 9, height: 9, flex: "none", marginTop: 6, borderRadius: "50%", background: "var(--brand)" }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", font: "500 15px/1.3 var(--font-body)" }}>{a.title}</span>
                <span style={{ display: "block", marginTop: 3, font: "400 12.5px/1 var(--font-body)", color: "var(--text3)" }}>
                  {a.dept} · atualizado {a.updated}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="stack page-wrap" style={{ marginBottom: 44, gridTemplateColumns: "1.4fr 1fr", gap: 22 }}>
        <div>
          <h2 style={{ margin: "0 0 14px", font: "600 15px/1 var(--font-head)", color: "var(--text2)" }}>Continue de onde parou</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {continueReading.map((c) => (
              <Link key={c.id} href={`/artigo/${c.id}`} className="card card-hover" style={{ padding: 18, display: "block", color: "inherit" }}>
                <span style={{ display: "block", font: "600 15.5px/1.3 var(--font-body)" }}>{c.title}</span>
                <span style={{ display: "block", margin: "6px 0 12px", font: "400 13px/1.4 var(--font-body)", color: "var(--text3)" }}>
                  Parou em &ldquo;{c.section}&rdquo;
                </span>
                <span style={{ display: "block", height: 6, borderRadius: 3, background: "var(--surface3)", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${c.pct}%`, background: "var(--brand)", borderRadius: 3 }} />
                </span>
                <span style={{ display: "block", marginTop: 8, font: "500 12px/1 var(--font-body)", color: "var(--brand-strong)" }}>
                  {c.pct}% lido
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ margin: 0, font: "600 15px/1 var(--font-head)", color: "var(--text2)" }}>Seus favoritos</h2>
            <Link href="/favoritos?tab=favoritos" className="btn-ghost">
              Ver todos
            </Link>
          </div>
          <div className="card" style={{ padding: "8px 12px" }}>
            {favList.length === 0 && (
              <p style={{ margin: "10px 6px", font: "400 13.5px/1.5 var(--font-body)", color: "var(--text3)" }}>
                Você ainda não favoritou nenhum conteúdo.
              </p>
            )}
            {favList.map((f) => (
              <Link
                key={f.id}
                href={`/artigo/${f.id}`}
                className="row-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "12px 6px",
                  borderBottom: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--brand)" aria-hidden="true">
                  <path d="M6 3h12a1 1 0 0 1 1 1v16.2a.8.8 0 0 1-1.25.67L12 17.4l-5.75 3.47A.8.8 0 0 1 5 20.2V4a1 1 0 0 1 1-1z" />
                </svg>
                <span style={{ flex: 1, minWidth: 0, font: "500 14.5px/1.3 var(--font-body)" }}>{f.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="page-wrap"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
          padding: "26px 30px",
          background: "var(--brand-soft)",
          border: "1px solid var(--border)",
          borderRadius: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <h2 style={{ margin: "0 0 6px", font: "600 20px/1.2 var(--font-head)", color: "var(--text)" }}>
            Não encontrou o que precisava?
          </h2>
          <p style={{ margin: 0, font: "400 15px/1.5 var(--font-body)", color: "var(--text2)" }}>
            Abra um pedido de ajuda. A equipe responsável responde e, se fizer sentido, publica um novo conteúdo para todo
            mundo.
          </p>
        </div>
        <HelpButton className="btn btn-primary">Solicitar ajuda</HelpButton>
      </section>
    </main>
  );
}
