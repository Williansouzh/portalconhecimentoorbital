import { Fragment } from "react";
import Link from "next/link";

export const metadata = { title: "Mapa, fluxo e decisões — Portal do Conhecimento" };

const SCREEN_MAP: { label: string; items: { href: string; title: string; desc: string }[] }[] = [
  {
    label: "Descoberta",
    items: [
      { href: "/", title: "1. Página inicial", desc: "Busca em foco · atalhos · mais pesquisados" },
      { href: "/", title: "2. Busca em digitação", desc: "Sugestões agrupadas · teclado · destaque do termo" },
      { href: "/categorias", title: "5. Categorias", desc: "Rota alternativa para quem prefere navegar" },
    ],
  },
  {
    label: "Localização e leitura",
    items: [
      { href: "/resultados?q=redefinir%20senha", title: "3. Resultados", desc: "Filtros · ordenação · chips · lista ou cartões" },
      { href: "/artigo/senha", title: "4. Artigo", desc: "Índice fixo · passos · avaliação · relacionados" },
      { href: "/favoritos?tab=favoritos", title: "6. Favoritos e histórico", desc: "4 abas · remoção · limpeza com confirmação" },
    ],
  },
  {
    label: "Curadoria",
    items: [
      { href: "/admin", title: "7. Painel de gestão", desc: "Métricas · lacunas de conteúdo · fluxo editorial" },
      { href: "/admin/editor", title: "8. Editor de artigo", desc: "Autosave · checklist · anexos" },
      { href: "/estados", title: "Estados transversais", desc: "11 estados de carregamento, vazio e erro" },
    ],
  },
];

const FLOW = [
  { t: "0 s", title: "Abre o portal", text: "O cursor já está na busca." },
  { t: "5 s", title: "Digita “senha”", text: "Sugestões agrupadas aparecem na 3ª letra." },
  { t: "9 s · atalho", title: "Escolhe a sugestão", text: "Pula a página de resultados e vai direto ao artigo.", accent: true },
  { t: "15 s", title: "Lê o passo a passo", text: "Resumo primeiro, índice fixo à esquerda." },
  { t: "40 s", title: "Resolve e avalia", text: "“Sim/Não” alimenta o painel de gestão." },
];

const DECISIONS = [
  {
    title: "A busca é a página, não um componente",
    text: "Campo de 74 px de altura, centralizado, com Ctrl + K. Nada compete com ele acima da dobra — o resto da home é atalho, não conteúdo.",
  },
  {
    title: "Sugestões agrupadas encurtam o caminho",
    text: "Separar conteúdos, termos, categorias, sistemas e FAQ deixa a pessoa pular a página de resultados. O trecho digitado vem destacado para confirmar o acerto.",
  },
  {
    title: "Tolerância a erro em vez de exigir precisão",
    text: "A busca ignora acentos e caixa, aceita palavras parciais, tolera um caractere errado e reconhece sinônimos (“ticket” encontra “chamado”).",
  },
  {
    title: "Cada resultado responde antes do clique",
    text: "O trecho mostra a resposta, e o selo de verificado mais a data de atualização dizem se dá para confiar. Relevância aparece discreta, sem número.",
  },
  {
    title: "Estado vazio é uma rota, não um beco",
    text: "Sem resultado, o portal corrige a grafia, sugere termos e categorias e oferece o pedido de ajuda — que vira pauta de conteúdo no painel de gestão.",
  },
  {
    title: "Acessibilidade embutida, não adicionada",
    text: "Anel de foco de 3 px sempre visível, alvos de 44 px, avisos com ícone + texto além da cor, navegação completa por teclado e respeito à redução de movimento.",
  },
];

export default function MapPage() {
  return (
    <main className="main-loose">
      <div className="page-wrap-narrow">
        <h1 style={{ margin: "0 0 8px", font: "600 32px/1.15 var(--font-head)", letterSpacing: "-.015em" }}>Mapa, fluxo e decisões</h1>
        <p style={{ margin: "0 0 30px", maxWidth: 640, font: "400 16.5px/1.6 var(--font-body)", color: "var(--text2)" }}>
          A estrutura do portal em uma página: quais telas existem, como a pessoa chega à resposta e por que o desenho é assim.
        </p>

        <section style={{ marginBottom: 34 }}>
          <h2 style={{ margin: "0 0 16px", font: "600 20px/1.2 var(--font-head)" }}>Mapa de telas</h2>
          <div className="stack" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 18 }}>
            {SCREEN_MAP.map((group) => (
              <div key={group.label} className="card" style={{ padding: 20 }}>
                <span style={{ display: "block", marginBottom: 12, font: "600 11px/1 var(--font-head)", letterSpacing: ".11em", textTransform: "uppercase", color: "var(--brand-strong)" }}>
                  {group.label}
                </span>
                <div style={{ display: "grid", gap: 8 }}>
                  {group.items.map((it) => (
                    <Link
                      key={it.title}
                      href={it.href}
                      style={{
                        display: "block",
                        textAlign: "left",
                        padding: "13px 15px",
                        border: "1px solid var(--border)",
                        borderRadius: 11,
                        background: "var(--surface2)",
                        font: "600 14px/1.3 var(--font-body)",
                        color: "inherit",
                      }}
                    >
                      {it.title}
                      <span style={{ display: "block", marginTop: 3, font: "400 12.5px/1.4 var(--font-body)", color: "var(--text3)" }}>{it.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 34 }}>
          <h2 style={{ margin: "0 0 4px", font: "600 20px/1.2 var(--font-head)" }}>Fluxo principal</h2>
          <p style={{ margin: "0 0 16px", font: "400 14px/1.5 var(--font-body)", color: "var(--text3)" }}>
            Meta: da entrada à resposta em menos de 45 segundos, com no máximo dois cliques.
          </p>
          <div style={{ display: "flex", alignItems: "stretch", gap: 10, flexWrap: "wrap" }}>
            {FLOW.map((step, i) => (
              <Fragment key={step.title}>
                <div
                  style={{
                    flex: 1,
                    minWidth: 170,
                    padding: 16,
                    background: step.accent ? "var(--brand-soft)" : "var(--surface)",
                    border: `1px solid ${step.accent ? "var(--brand)" : "var(--border)"}`,
                    borderRadius: 13,
                    boxShadow: step.accent ? undefined : "var(--sh1)",
                  }}
                >
                  <span style={{ display: "block", font: "600 11px/1 var(--font-head)", letterSpacing: ".1em", color: step.accent ? "var(--brand-strong)" : "var(--text3)" }}>
                    {step.t}
                  </span>
                  <b style={{ display: "block", margin: "8px 0 5px", font: "600 15px/1.3 var(--font-body)" }}>{step.title}</b>
                  <span style={{ font: "400 13px/1.45 var(--font-body)", color: "var(--text2)" }}>{step.text}</span>
                </div>
                {i < FLOW.length - 1 && (
                  <span aria-hidden="true" style={{ alignSelf: "center", font: "400 18px/1 var(--font-body)", color: "var(--text3)" }}>
                    →
                  </span>
                )}
              </Fragment>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ margin: "0 0 16px", font: "600 20px/1.2 var(--font-head)" }}>Decisões de UX</h2>
          <div className="stack" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {DECISIONS.map((d) => (
              <div key={d.title} className="card" style={{ padding: "18px 20px" }}>
                <b style={{ display: "block", marginBottom: 6, font: "600 15.5px/1.3 var(--font-head)" }}>{d.title}</b>
                <span style={{ font: "400 14px/1.6 var(--font-body)", color: "var(--text2)" }}>{d.text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
