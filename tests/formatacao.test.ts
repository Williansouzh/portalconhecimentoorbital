import { describe, expect, it } from "vitest";
import { formatDate, formatViews, rowToArticle, toISODate, type ArticleRow } from "@/lib/rows";

describe("formatação de artigo", () => {
  it("formata data no padrão do portal", () => {
    expect(formatDate("2026-08-12")).toBe("12 ago 2026");
    expect(formatDate("2026-01-05")).toBe("05 jan 2026");
  });

  it("mantém o ISO estável na ida e volta", () => {
    expect(toISODate("2026-12-31")).toBe("2026-12-31");
  });

  it("usa separador de milhar brasileiro", () => {
    expect(formatViews(12480)).toBe("12.480");
    expect(formatViews(0)).toBe("0");
  });

  it("converte a linha do banco no artigo da interface", () => {
    const linha: ArticleRow = {
      id: "rg-01",
      title: "RG-01 · Cancelamento",
      cat: "Recargas",
      dept: "Atendimento",
      type: "Roteiro de atendimento",
      read_time: "1 min",
      views: 1234,
      updated_at: "2026-09-05",
      verified: false,
      outdated: false,
      rel: 0,
      keywords: ["rg-01"],
      snippet: "resumo",
      path: "Início · Recargas",
      status: "publicado",
      body: null,
      content: "## Situação\ntexto",
      classification: "INF - COMPRADOR - VT/EXPRESSO",
      next_review: null,
    };
    const artigo = rowToArticle(linha);
    expect(artigo.views).toBe("1.234");
    expect(artigo.updated).toBe("05 set 2026");
    expect(artigo.classification).toBe("INF - COMPRADOR - VT/EXPRESSO");
    expect(artigo.nextReview).toBeUndefined();
  });
});
