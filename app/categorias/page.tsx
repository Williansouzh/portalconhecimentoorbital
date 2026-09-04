import Link from "next/link";
import { categories } from "@/lib/data";
import { CategoryGlyphIcon } from "@/components/Icons";

export const metadata = { title: "Categorias — Portal do Conhecimento" };

export default function CategoriesPage() {
  const total = categories.reduce((n, c) => n + c.count, 0);

  return (
    <main className="main-loose">
      <div className="page-wrap">
        <h1 style={{ margin: "0 0 8px", font: "600 34px/1.15 var(--font-head)", letterSpacing: "-.015em" }}>Categorias</h1>
        <p style={{ margin: "0 0 28px", maxWidth: 560, font: "400 16.5px/1.6 var(--font-body)", color: "var(--text2)" }}>
          Se você prefere navegar em vez de pesquisar, comece por aqui. São {categories.length} áreas com {total} conteúdos
          publicados.
        </p>
        <div className="stack" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 16 }}>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/resultados?q=${encodeURIComponent(c.label)}`}
              className="card card-lift"
              style={{ display: "block", textAlign: "left", padding: 22, color: "inherit" }}
            >
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 48,
                  height: 48,
                  marginBottom: 16,
                  borderRadius: 12,
                  background: "var(--brand-soft)",
                  color: "var(--brand-strong)",
                }}
              >
                <CategoryGlyphIcon icon={c.icon} size={24} />
              </span>
              <span style={{ display: "block", font: "600 17px/1.25 var(--font-head)" }}>{c.label}</span>
              <span style={{ display: "block", margin: "7px 0 14px", font: "400 14px/1.5 var(--font-body)", color: "var(--text2)" }}>
                {c.description}
              </span>
              <span style={{ display: "block", font: "600 13px/1 var(--font-body)", color: "var(--brand-strong)" }}>
                {c.count} conteúdos
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
