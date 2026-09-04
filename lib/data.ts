import type { Article, ArticleBody, Category } from "./types";

export const articles: Article[] = [
  {
    id: "senha",
    title: "Como redefinir a senha corporativa",
    cat: "Tecnologia",
    dept: "TI · Suporte",
    type: "Tutorial",
    read: "2 min",
    views: "12.480",
    updated: "12 ago 2026",
    updatedISO: "2026-08-12",
    verified: true,
    rel: 98,
    kw: ["senha", "redefinir", "acesso", "login", "portal riocard", "password"],
    snippet:
      "Acesse portal.riocard.com.br/senha, informe sua matrícula e clique em Esqueci minha senha. Você recebe um link de redefinição no e-mail corporativo em até 2 minutos.",
    path: "Início · Tecnologia · Acessos e senhas",
    status: "publicado",
  },
  {
    id: "ferias",
    title: "Como solicitar férias",
    cat: "Recursos Humanos",
    dept: "RH · Pessoas",
    type: "Procedimento",
    read: "3 min",
    views: "9.310",
    updated: "28 jul 2026",
    updatedISO: "2026-07-28",
    verified: true,
    rel: 41,
    kw: ["férias", "descanso", "solicitação", "afastamento"],
    snippet:
      "A solicitação é feita pelo autoatendimento no RioCard Gente, com antecedência mínima de 30 dias e aprovação da liderança direta.",
    path: "Início · Recursos Humanos · Jornada e férias",
    status: "publicado",
  },
  {
    id: "reembolso",
    title: "Procedimento para reembolso de despesas",
    cat: "Financeiro",
    dept: "Financeiro · Contas a pagar",
    type: "Procedimento",
    read: "4 min",
    views: "7.120",
    updated: "05 ago 2026",
    updatedISO: "2026-08-05",
    verified: true,
    rel: 33,
    kw: ["reembolso", "despesa", "nota fiscal", "ressarcimento"],
    snippet:
      "Envie a nota fiscal em PDF pelo formulário de despesas até o dia 25. Reembolsos aprovados entram na folha do mês seguinte.",
    path: "Início · Financeiro · Despesas",
    status: "publicado",
  },
  {
    id: "chamados",
    title: "Como acessar o sistema de chamados",
    cat: "Sistemas",
    dept: "TI · Suporte",
    type: "Tutorial",
    read: "2 min",
    views: "6.480",
    updated: "19 ago 2026",
    updatedISO: "2026-08-19",
    verified: true,
    rel: 52,
    kw: ["chamado", "ticket", "suporte", "helpdesk", "senha"],
    snippet:
      "O sistema de chamados usa o mesmo login e senha do portal. Acesse chamados.riocard.com.br e escolha a fila do seu assunto.",
    path: "Início · Sistemas · Chamados",
    status: "publicado",
  },
  {
    id: "remoto",
    title: "Política de trabalho remoto",
    cat: "Políticas internas",
    dept: "RH · Pessoas",
    type: "Política",
    read: "5 min",
    views: "5.940",
    updated: "14 jun 2026",
    updatedISO: "2026-06-14",
    verified: true,
    rel: 22,
    kw: ["remoto", "home office", "teletrabalho", "híbrido"],
    snippet:
      "O modelo híbrido prevê até dois dias remotos por semana, combinados com a liderança e registrados no RioCard Gente.",
    path: "Início · Políticas internas · Jornada",
    status: "publicado",
  },
  {
    id: "email",
    title: "Configuração inicial do e-mail corporativo",
    cat: "Tecnologia",
    dept: "TI · Infraestrutura",
    type: "Tutorial",
    read: "3 min",
    views: "4.870",
    updated: "02 ago 2026",
    updatedISO: "2026-08-02",
    verified: true,
    rel: 64,
    kw: ["e-mail", "outlook", "configuração", "senha", "acesso"],
    snippet:
      "No primeiro acesso use a senha provisória enviada pelo RH e defina uma senha definitiva. Depois ative o aplicativo autenticador.",
    path: "Início · Tecnologia · E-mail e comunicação",
    status: "publicado",
  },
  {
    id: "sap",
    title: "Desbloqueio de senha do SAP",
    cat: "Sistemas",
    dept: "TI · Sistemas corporativos",
    type: "Solução de problema",
    read: "2 min",
    views: "4.210",
    updated: "11 fev 2026",
    updatedISO: "2026-02-11",
    verified: false,
    outdated: true,
    rel: 87,
    kw: ["sap", "senha", "bloqueio", "desbloqueio", "acesso"],
    snippet:
      "Três tentativas incorretas bloqueiam o usuário no SAP. O desbloqueio é feito pela transação SU01 pela equipe de sistemas.",
    path: "Início · Sistemas · SAP",
    status: "publicado",
  },
  {
    id: "2fa",
    title: "Autenticação em dois fatores no portal RioCard",
    cat: "Segurança",
    dept: "Segurança da informação",
    type: "Tutorial",
    read: "3 min",
    views: "3.760",
    updated: "21 ago 2026",
    updatedISO: "2026-08-21",
    verified: true,
    rel: 76,
    kw: ["dois fatores", "2fa", "senha", "autenticador", "segurança"],
    snippet:
      "Depois de redefinir a senha, cadastre o segundo fator no aplicativo autenticador. Ele é exigido a cada 30 dias.",
    path: "Início · Segurança · Autenticação",
    status: "publicado",
  },
  {
    id: "vt",
    title: "Segunda via do cartão de vale-transporte",
    cat: "Operações",
    dept: "Operações · Benefícios",
    type: "Procedimento",
    read: "3 min",
    views: "3.104",
    updated: "30 jul 2026",
    updatedISO: "2026-07-30",
    verified: true,
    rel: 12,
    kw: ["vale-transporte", "cartão", "segunda via", "benefício"],
    snippet:
      "Registre a perda no formulário de benefícios. A segunda via fica pronta em até 5 dias úteis na sua unidade.",
    path: "Início · Operações · Benefícios",
    status: "publicado",
  },
  {
    id: "novo",
    title: "Abertura de acesso para novo colaborador",
    cat: "Tecnologia",
    dept: "TI · Suporte",
    type: "Procedimento",
    read: "4 min",
    views: "2.880",
    updated: "08 ago 2026",
    updatedISO: "2026-08-08",
    verified: true,
    rel: 48,
    kw: ["acesso", "novo colaborador", "onboarding", "login", "senha"],
    snippet:
      "A liderança abre o pedido com 3 dias de antecedência. O acesso chega com senha provisória que deve ser trocada no primeiro login.",
    path: "Início · Tecnologia · Acessos e senhas",
    status: "publicado",
  },
];

export const keywords = [
  "redefinir senha",
  "senha expirada",
  "senha do SAP",
  "senha da rede wifi",
  "política de senhas",
];

export const systems = [
  { n: "Portal RioCard", d: "Acesso único · 12 conteúdos" },
  { n: "SAP", d: "Sistemas corporativos · 24 conteúdos" },
  { n: "RioCard Gente", d: "RH · 31 conteúdos" },
];

export const faqs = [
  "Minha senha expirou, o que devo fazer?",
  "Quantos caracteres a senha precisa ter?",
  "Posso reaproveitar uma senha antiga?",
];

export const synonyms: Record<string, string[]> = {
  senha: ["password", "credencial", "login", "acesso"],
  ferias: ["descanso", "afastamento"],
  reembolso: ["despesa", "ressarcimento", "nota"],
  chamado: ["ticket", "suporte", "helpdesk"],
  remoto: ["home office", "teletrabalho", "hibrido"],
  email: ["outlook", "correio"],
};

export const categories: Category[] = [
  {
    slug: "recursos-humanos",
    label: "Recursos Humanos",
    count: 64,
    description: "Férias, folha, benefícios, jornada e desenvolvimento.",
    icon: "people",
  },
  {
    slug: "tecnologia",
    label: "Tecnologia",
    count: 86,
    description: "Acessos, senhas, e-mail, equipamentos e suporte.",
    icon: "laptop",
  },
  {
    slug: "financeiro",
    label: "Financeiro",
    count: 41,
    description: "Reembolsos, adiantamentos, notas fiscais e compras.",
    icon: "bars",
  },
  {
    slug: "comercial",
    label: "Comercial",
    count: 37,
    description: "Atendimento, contratos, tabelas e argumentos de venda.",
    icon: "triangle",
  },
  {
    slug: "operacoes",
    label: "Operações",
    count: 72,
    description: "Rotinas de campo, bilhetagem, cartões e unidades.",
    icon: "gear",
  },
  {
    slug: "seguranca",
    label: "Segurança",
    count: 29,
    description: "Autenticação, dados pessoais, incidentes e boas práticas.",
    icon: "shield",
  },
  {
    slug: "sistemas",
    label: "Sistemas",
    count: 45,
    description: "SAP, chamados, RioCard Gente e integrações.",
    icon: "grid",
  },
  {
    slug: "politicas-internas",
    label: "Políticas internas",
    count: 23,
    description: "Código de conduta, trabalho remoto, viagens e compliance.",
    icon: "doc",
  },
];

// Only "senha" has a fully authored long-form body in this delivery — the
// other seed articles render their summary only until content owners write
// the rest (see the admin backlog of content gaps).
export const articleBodies: Record<string, ArticleBody> = {
  senha: {
    intro:
      "Você precisa da sua matrícula (6 dígitos, disponível no contracheque) e de acesso ao e-mail corporativo ou ao número de celular cadastrado no RioCard Gente. O procedimento leva cerca de dois minutos e pode ser feito de qualquer dispositivo.",
    calloutText: "Se você nunca acessou o portal, use o procedimento de primeiro acesso em vez deste.",
    calloutHref: "/resultados?q=primeiro%20acesso",
    steps: [
      {
        title: "Abra o portal de acessos",
        text: "Acesse portal.riocard.com.br/senha pelo navegador. Não é necessário estar na rede interna.",
      },
      {
        title: "Clique em “Esqueci minha senha”",
        text: "Informe a matrícula e escolha receber o código por e-mail corporativo ou SMS.",
      },
      {
        title: "Use o código de 6 dígitos",
        text: "O código chega em até 2 minutos e expira em 15 minutos. Se não chegar, confira a caixa de spam.",
      },
      {
        title: "Defina a nova senha",
        text: "A troca vale para o portal, o e-mail, o SAP e o sistema de chamados. Pode levar até 10 minutos para propagar.",
      },
    ],
    requirements: [
      { ok: true, text: "Pelo menos 10 caracteres" },
      { ok: true, text: "Uma letra maiúscula, uma minúscula e um número" },
      { ok: true, text: "Diferente das 5 últimas senhas usadas" },
      { ok: false, text: "Sem matrícula, nome próprio ou datas de nascimento" },
    ],
    troubleshoot:
      "Três tentativas incorretas bloqueiam o usuário por 15 minutos. Depois desse intervalo, tente novamente. Se o bloqueio persistir, abra um chamado na fila Acessos e senhas — o atendimento é feito em até 4 horas úteis.",
    faq: [
      { q: "Minha senha expirou. É o mesmo procedimento?", a: "Sim. A senha expira a cada 90 dias e o fluxo de redefinição é idêntico." },
      { q: "A troca vale também para o SAP?", a: "Sim, o SAP usa o mesmo diretório de acesso. A propagação pode levar até 10 minutos." },
      { q: "Não recebo o código por e-mail nem SMS.", a: "Verifique com o RH se o celular cadastrado está atualizado no RioCard Gente e tente de novo." },
    ],
  },
};

export const homeCategorySlugs = ["tecnologia", "recursos-humanos", "financeiro", "seguranca"];

export function findArticle(id: string): Article | undefined {
  return articles.find((a) => a.id === id);
}
