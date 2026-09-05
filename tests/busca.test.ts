import { describe, expect, it } from "vitest";
import { buildTsQuery, highlight, normalize, synonymsFor } from "@/lib/search";

describe("normalize", () => {
  it("remove acento e caixa", () => {
    expect(normalize("Gratuidade SÊNIOR")).toBe("gratuidade senior");
    expect(normalize("cartão")).toBe(normalize("CARTAO"));
  });

  it("aceita entrada vazia", () => {
    expect(normalize("")).toBe("");
  });
});

describe("synonymsFor", () => {
  it("liga o termo do cliente ao do sistema", () => {
    expect(synonymsFor("estorno")).toContain("ressarcimento");
    expect(synonymsFor("aplicativo")).toContain("app");
  });

  it("funciona nos dois sentidos", () => {
    expect(synonymsFor("ressarcimento")).toContain("estorno");
  });

  it("não devolve o próprio termo", () => {
    expect(synonymsFor("recarga")).not.toContain("recarga");
  });
});

describe("buildTsQuery", () => {
  it("usa prefixo para responder durante a digitação", () => {
    expect(buildTsQuery("recarg")).toContain("recarg:*");
  });

  it("combina os termos com AND e os sinônimos com OR", () => {
    const q = buildTsQuery("estorno taxa");
    expect(q).toContain(" & ");
    expect(q).toMatch(/estorno:\*[^&]*\|/);
  });

  it("descarta preposições, que viram lexema vazio e derrubariam o AND", () => {
    // Regressão: "bolsa de crédito" não achava nada por causa do "de".
    const q = buildTsQuery("bolsa de crédito");
    expect(q).not.toContain("de:*");
    expect(q).toContain("bolsa:*");
    expect(q).toContain("credito:*");
  });

  it("mantém a busca quando o termo é só uma preposição", () => {
    expect(buildTsQuery("de")).toContain("de:*");
  });

  it("ignora pontuação e termos vazios", () => {
    expect(buildTsQuery("...")).toBe("");
    expect(buildTsQuery("  ")).toBe("");
  });
});

describe("highlight", () => {
  it("divide o texto em torno do termo encontrado", () => {
    expect(highlight("Recarga pendente", "pendente")).toEqual({
      pre: "Recarga ",
      mid: "pendente",
      post: "",
    });
  });

  it("casa ignorando acento e caixa, preservando o texto original", () => {
    const r = highlight("Cartão vale social", "CARTAO");
    expect(r.mid).toBe("Cartão");
    expect(r.pre + r.mid + r.post).toBe("Cartão vale social");
  });

  it("devolve o texto intacto quando não há casamento", () => {
    expect(highlight("Recarga", "xyz")).toEqual({ pre: "Recarga", mid: "", post: "" });
  });

  it("destaca o termo mais longo quando há vários", () => {
    expect(highlight("Bilhete unitário", "bilhete unitario").mid).toBe("unitário");
  });
});
