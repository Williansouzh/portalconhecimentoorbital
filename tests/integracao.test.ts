import { beforeAll, describe, expect, it } from "vitest";
import { ready, query } from "@/lib/db";
import { createSessionToken, readSessionToken } from "@/lib/auth";
import { revogarSessoesDoUsuario, revogarToken, tokenRevogado } from "@/lib/sessions";
import { searchArticles, sugestaoDeCorrecao } from "@/lib/results";
import {
  authenticate,
  createArticle,
  getFavoriteIds,
  listarRevisoes,
  setArticleStatus,
  toggleFavorite,
  updateArticle,
} from "@/lib/store";

const temBanco = !!process.env.DB_DISPONIVEL;

async function ids(q: string, filtros: string[] = []) {
  const { itens } = await searchArticles(q, "relevancia", filtros, 1, 50);
  return itens.map((i) => i.article.id);
}

describe.skipIf(!temBanco)("busca sobre o acervo real", () => {
  beforeAll(async () => {
    await ready();
  });

  it("carrega o acervo do documento", async () => {
    const [{ total }] = await query<{ total: string }>("SELECT count(*)::text AS total FROM articles");
    expect(Number(total)).toBeGreaterThan(200);
  });

  it("ignora acento e caixa", async () => {
    const comAcento = await ids("gratuidade sênior");
    const semAcento = await ids("GRATUIDADE SENIOR");
    expect(semAcento).toEqual(comAcento);
    expect(comAcento.length).toBeGreaterThan(0);
  });

  it("encontra pelo código do assunto", async () => {
    expect(await ids("GT-05")).toContain("gt-05");
  });

  it("entende sinônimo do vocabulário de atendimento", async () => {
    // "estorno" é como o cliente fala; o documento diz "ressarcimento".
    const achados = await ids("estorno");
    expect(achados.length).toBeGreaterThan(0);
  });

  it("tolera erro de digitação", async () => {
    expect((await ids("cancelmento")).length).toBeGreaterThan(0);
    expect((await ids("bilete unitario")).length).toBeGreaterThan(0);
  });

  it("não inventa resultado para termo inexistente", async () => {
    expect(await ids("xyzabcdef")).toEqual([]);
  });

  it("acha frase com preposição no meio", async () => {
    // Regressão: preposições viram lexema vazio e derrubavam o AND inteiro.
    const achados = await ids("bolsa de crédito");
    expect(achados.length).toBeGreaterThan(0);
    expect(achados).toContain("bc-01");
  });

  it("indexa os dois lados de um termo com barra", async () => {
    // Regressão: "VT/EXPRESSO" era um token único e "expresso" não casava.
    expect((await ids("expresso")).length).toBeGreaterThan(20);
  });

  it("procura também no corpo do artigo", async () => {
    expect((await ids("riocardresponde")).length).toBeGreaterThan(0);
  });

  it("filtra por categoria", async () => {
    const achados = await searchArticles("", "relevancia", ["cat|Recargas"], 1, 50);
    expect(achados.total).toBe(8);
    expect(achados.itens.every((i) => i.article.cat === "Recargas")).toBe(true);
  });

  it("pagina sem repetir nem perder resultado", async () => {
    const p1 = await searchArticles("", "relevancia", [], 1, 20);
    const p2 = await searchArticles("", "relevancia", [], 2, 20);
    expect(p1.itens).toHaveLength(20);
    expect(p1.total).toBe(p2.total);
    const idsP1 = p1.itens.map((i) => i.article.id);
    const idsP2 = p2.itens.map((i) => i.article.id);
    expect(idsP1.some((id) => idsP2.includes(id))).toBe(false);
  });

  it("sugere correção só quando há algo parecido", async () => {
    expect(await sugestaoDeCorrecao("xyzabcdef")).toBeNull();
  });
});

describe.skipIf(!temBanco)("fluxo editorial e permissões", () => {
  beforeAll(async () => {
    await ready();
  });

  it("autentica com a senha correta e recusa a errada", async () => {
    expect(await authenticate("ana.coutinho@riocard.com.br", "Portal2026")).not.toBeNull();
    expect(await authenticate("ana.coutinho@riocard.com.br", "errada")).toBeNull();
    expect(await authenticate("ninguem@riocard.com.br", "Portal2026")).toBeNull();
  });

  it("rascunho fica fora da busca até ser publicado", async () => {
    const artigo = await createArticle({
      title: "Assunto de teste automatizado",
      summary: "resumo de teste",
      content: "## Situação\nconteúdo de teste",
      cat: "Recargas",
      authorId: "bruno",
    });

    expect(artigo.status).toBe("rascunho");
    expect(await ids("automatizado")).not.toContain(artigo.id);

    await setArticleStatus(artigo.id, "publicado");
    expect(await ids("automatizado")).toContain(artigo.id);

    await query("DELETE FROM articles WHERE id = $1", [artigo.id]);
  });

  it("publicar carimba a data de publicação", async () => {
    const artigo = await createArticle({ title: "Carimbo de publicação", authorId: "carla" });
    const publicado = await setArticleStatus(artigo.id, "publicado");
    expect(publicado?.status).toBe("publicado");
    const [linha] = await query<{ published_at: Date | null }>(
      "SELECT published_at FROM articles WHERE id = $1",
      [artigo.id]
    );
    expect(linha.published_at).not.toBeNull();
    await query("DELETE FROM articles WHERE id = $1", [artigo.id]);
  });
});

describe.skipIf(!temBanco)("estado por usuário", () => {
  beforeAll(async () => {
    await ready();
  });

  it("favorito de um não aparece para o outro", async () => {
    await toggleFavorite("ana", "rg-01");
    expect([...(await getFavoriteIds("ana"))]).toContain("rg-01");
    expect([...(await getFavoriteIds("bruno"))]).not.toContain("rg-01");
    await toggleFavorite("ana", "rg-01");
    expect([...(await getFavoriteIds("ana"))]).not.toContain("rg-01");
  });
});

describe.skipIf(!temBanco)("revogação de sessão", () => {
  beforeAll(async () => {
    await ready();
  });

  it("logout invalida aquele token e só ele", async () => {
    const usuario = { id: "ana", name: "Ana", shortName: "Ana C.", dept: "Atendimento", role: "leitor" as const };
    const tokenA = await readSessionToken(await createSessionToken(usuario));
    const tokenB = await readSessionToken(await createSessionToken(usuario));

    await revogarToken(tokenA!.jti, "ana", tokenA!.exp);

    expect(await tokenRevogado(tokenA!.jti, "ana", tokenA!.iat)).toBe(true);
    expect(await tokenRevogado(tokenB!.jti, "ana", tokenB!.iat)).toBe(false);
  });

  it("troca de senha derruba sessões anteriores mas não o login seguinte", async () => {
    const usuario = { id: "bruno", name: "Bruno", shortName: "Bruno L.", dept: "Atendimento", role: "autor" as const };
    const anterior = await readSessionToken(await createSessionToken(usuario));

    await new Promise((r) => setTimeout(r, 1100)); // iat tem resolução de segundo
    await revogarSessoesDoUsuario("bruno");
    await new Promise((r) => setTimeout(r, 1100));

    const posterior = await readSessionToken(await createSessionToken(usuario));

    expect(await tokenRevogado(anterior!.jti, "bruno", anterior!.iat)).toBe(true);
    expect(await tokenRevogado(posterior!.jti, "bruno", posterior!.iat)).toBe(false);
  });
});

describe.skipIf(!temBanco)("histórico de versões", () => {
  beforeAll(async () => {
    await ready();
  });

  it("guarda a versão anterior a cada edição", async () => {
    const artigo = await createArticle({ title: "Assunto versionado", summary: "v1", authorId: "carla" });

    expect(await listarRevisoes(artigo.id)).toHaveLength(0);

    await updateArticle(
      artigo.id,
      { title: "Assunto versionado", summary: "v2", content: "", cat: "Recargas", dept: "Atendimento", keywords: [], nextReview: null },
      "carla"
    );
    const apos1 = await listarRevisoes(artigo.id);
    expect(apos1).toHaveLength(1);
    expect(apos1[0].autor).toBe("Carla M.");

    await updateArticle(
      artigo.id,
      { title: "Assunto versionado", summary: "v3", content: "", cat: "Recargas", dept: "Atendimento", keywords: [], nextReview: null },
      "carla"
    );
    expect(await listarRevisoes(artigo.id)).toHaveLength(2);

    await query("DELETE FROM articles WHERE id = $1", [artigo.id]);
  });
});
