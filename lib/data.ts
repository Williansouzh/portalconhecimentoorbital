import assuntos from "./content/assuntos.json";
import type { Category } from "./types";

/**
 * Conteúdo do portal: os assuntos de "ASSUNTOS PROMPT ATENDIMENTO", extraídos
 * do documento da central. Cada item é um roteiro de atendimento — a situação
 * relatada, os dados a coletar, a orientação e a classificação do chamado.
 *
 * O JSON é gerado a partir do documento; para atualizar, reprocesse o
 * documento e substitua lib/content/assuntos.json.
 */
export type SeedArticle = {
  id: string;
  codigo: string;
  title: string;
  cat: string;
  dept: string;
  type: string;
  summary: string;
  content: string;
  classification: string;
  keywords: string[];
};

// O documento não indica área responsável por assunto; tudo é da central.
const AREA = "Atendimento";
const TIPO = "Roteiro de atendimento";

export const seedArticles: SeedArticle[] = assuntos.map((a) => ({
  id: a.id,
  codigo: a.codigo,
  title: a.codigo ? `${a.codigo} · ${a.titulo}` : a.titulo,
  cat: a.secao,
  dept: AREA,
  type: TIPO,
  summary: a.resumo,
  content: a.conteudo,
  classification: a.classificacao,
  keywords: a.palavrasChave,
}));

/** Ícone e descrição de cada categoria; a contagem vem do banco. */
export const categoryMeta: Record<string, Omit<Category, "count">> = {
  Gratuidade: {
    slug: "gratuidade",
    label: "Gratuidade",
    description: "Estudante, vale social, sênior e demais benefícios com isenção.",
    icon: "people",
  },
  "BUI e tarifa social": {
    slug: "bui-tarifa-social",
    label: "BUI e tarifa social",
    description: "Ativação, suspensão e regras do Bilhete Único Intermunicipal.",
    icon: "shield",
  },
  "Empresa em contato": {
    slug: "empresa-em-contato",
    label: "Empresa em contato",
    description: "Atendimento às empresas compradoras.",
    icon: "people",
  },
  "Saldo e informação de uso": {
    slug: "saldo-e-uso",
    label: "Saldo e informação de uso",
    description: "Consulta de saldo, extrato e histórico de utilização.",
    icon: "bars",
  },
  Pedidos: {
    slug: "pedidos",
    label: "Pedidos",
    description: "Acompanhamento, entrega e problemas com pedidos de cartão.",
    icon: "grid",
  },
  "Bolsa de crédito": {
    slug: "bolsa-de-credito",
    label: "Bolsa de crédito",
    description: "Geração e uso da bolsa de crédito do comprador.",
    icon: "bars",
  },
  "Solicitando cartão": {
    slug: "solicitando-cartao",
    label: "Solicitando cartão",
    description: "Primeira via, segunda via e solicitação feita pela empresa.",
    icon: "doc",
  },
  Cancelamento: {
    slug: "cancelamento",
    label: "Cancelamento",
    description: "Cancelar cartão, benefício e recargas agendadas.",
    icon: "triangle",
  },
  "Resgate de crédito": {
    slug: "resgate-de-credito",
    label: "Resgate de crédito",
    description: "Resgate de saldo em cartões cancelados ou substituídos.",
    icon: "bars",
  },
  Recargas: {
    slug: "recargas",
    label: "Recargas",
    description: "Agendamento, pendências, cartão errado e recarga por app, ATM e Recarga Mais.",
    icon: "gear",
  },
  Ressarcimento: {
    slug: "ressarcimento",
    label: "Ressarcimento",
    description: "Devolução de valores e taxas cobradas indevidamente.",
    icon: "doc",
  },
  Boletos: {
    slug: "boletos",
    label: "Boletos",
    description: "Emissão, vencimento e pagamento de boletos.",
    icon: "doc",
  },
  Desassociação: {
    slug: "desassociacao",
    label: "Desassociação",
    description: "Desassociar e associar cartão a empresa ou pessoa física.",
    icon: "grid",
  },
  Integração: {
    slug: "integracao",
    label: "Integração",
    description: "Regras de integração entre linhas municipais e intermunicipais.",
    icon: "gear",
  },
  "Site e app": {
    slug: "site-e-app",
    label: "Site e app",
    description: "Uso do site do comprador e do aplicativo RioCard.",
    icon: "laptop",
  },
  ATM: {
    slug: "atm",
    label: "ATM",
    description: "Ocorrências nas máquinas de autoatendimento.",
    icon: "laptop",
  },
};

// Seções sem código de assunto: roteiros de e-mail e material de apoio.
Object.assign(categoryMeta, {
  Valorado: { slug: "valorado", label: "Valorado", description: "Procedimentos do produto valorado.", icon: "bars" },
  "Valorado Expresso": {
    slug: "valorado-expresso",
    label: "Valorado Expresso",
    description: "Procedimentos do valorado no Expresso.",
    icon: "bars",
  },
  "PAP Vale Transporte": {
    slug: "pap-vale-transporte",
    label: "PAP Vale Transporte",
    description: "Passo a passo enviado por e-mail ao comprador de vale-transporte.",
    icon: "doc",
  },
  "PAP Expresso": {
    slug: "pap-expresso",
    label: "PAP Expresso",
    description: "Passo a passo enviado por e-mail aos usuários do Expresso.",
    icon: "doc",
  },
  "PAP SEEDUC": {
    slug: "pap-seeduc",
    label: "PAP SEEDUC",
    description: "Passo a passo do cartão Conexão Educação, da SEEDUC.",
    icon: "doc",
  },
  "Pontos importantes": {
    slug: "pontos-importantes",
    label: "Pontos importantes",
    description: "Regras que valem para todo atendimento: integração, gratuidades e bases.",
    icon: "shield",
  },
  "Bases RioCard": {
    slug: "bases-riocard",
    label: "Bases RioCard",
    description: "Quais municípios pertencem a cada base operadora.",
    icon: "grid",
  },
});

export const categoriaPadrao: Omit<Category, "count" | "label" | "slug"> = {
  description: "Conteúdos desta área.",
  icon: "doc",
};

/** Termos sugeridos enquanto não há histórico real de busca. */
export const termosSugeridos = [
  "recarga pendente",
  "vale social",
  "cartão estudante",
  "declarar renda",
  "segunda via",
  "bolsa de crédito",
];

/** Equivalências do vocabulário de atendimento, expandidas na busca. */
export const synonyms: Record<string, string[]> = {
  recarga: ["carga", "credito", "recarregar"],
  cancelamento: ["cancelar", "cancelada", "cancelado"],
  app: ["aplicativo", "celular"],
  atm: ["terminal", "maquina", "totem"],
  bilhete: ["passagem", "unitario", "bui"],
  ressarcimento: ["reembolso", "devolucao", "estorno"],
  pendente: ["pendencia", "nao efetuada", "nao realizada"],
  comprador: ["empresa", "rh"],
  cartao: ["cartoes"],
  estudante: ["aluno", "escolar", "escola"],
  senior: ["idoso", "gratuidade"],
  beneficio: ["gratuidade", "isencao"],
  segunda: ["2a", "outra"],
};
