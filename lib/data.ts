import type { Category } from "./types";

/**
 * Conteúdo real do portal, transcrito de "ASSUNTOS PROMPT ATENDIMENTO".
 * Cada item é um roteiro de atendimento: a situação relatada pelo cliente, os
 * dados a coletar, a orientação dada e a classificação do chamado.
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

export const seedArticles: SeedArticle[] = [
  {
    id: "rg-01",
    codigo: "RG-01",
    title: "Cancelamento de recargas agendadas (app)",
    cat: "Recargas",
    dept: "Atendimento",
    type: "Roteiro de atendimento",
    summary:
      "Cliente quer cancelar um agendamento de recarga feito pelo app. Se não conseguir cancelar sozinho, pode pedir auxílio com o app em loja.",
    content: `## Situação
Cliente entra em contato informando que fez agendamento de recarga mas gostaria de cancelar, como foram recargas via app caso o mesmo não consiga cancelar por conta própria pode pedir auxílio com o app em loja.`,
    classification: "INF - COMPRADOR - VT/EXPRESSO - RECARGA MAIS",
    keywords: ["rg-01", "cancelamento", "recarga agendada", "agendamento", "app", "recarga mais"],
  },
  {
    id: "rg-02",
    codigo: "RG-02",
    title: "Pedido de entrega (recarga) — sem taxa de entrega e sem cartão",
    cat: "Recargas",
    dept: "Atendimento",
    type: "Roteiro de atendimento",
    summary:
      "Cliente pede informações de um pedido, mas o pedido consta como recarga. Todo o valor vai para a bolsa de crédito do comprador.",
    content: `## Situação
Cliente entra em contato solicitando informações de pedido, porém o pedido consta como recarga.

## Dados a coletar
- N° do pedido
- Valor de taxa de entrega
- Quantidade de cartões gerados
- Valor de carga

## Orientação
Orientado de que todo o valor de recarga vai para a bolsa de crédito do comprador.`,
    classification: "INF - COMPRADOR - VT/EXPRESSO - RECARGA MAIS",
    keywords: ["rg-02", "pedido de entrega", "taxa de entrega", "bolsa de crédito", "recarga", "comprador"],
  },
  {
    id: "rg-03",
    codigo: "RG-03",
    title: "Bilhete unitário retido em ATM",
    cat: "Recargas",
    dept: "Atendimento",
    type: "Roteiro de atendimento",
    summary:
      "Cliente comprou bilhete unitário no ATM e não recebeu. Abre-se chamado com os dados da compra e os dados bancários para ressarcimento.",
    content: `## Situação
Cliente entra em contato informando que fez a compra de um bilhete unitário e não o recebeu, orientado de que será realizado a abertura de um chamado.

## Dados a coletar
- Descrição da ocorrência: COMPRA DE BILHETE UNITÁRIO
- Nome completo
- CPF
- Data da compra
- Número do terminal
- Valor: 7,90
- Forma de pagamento
- N° do cartão

## Dados bancários
- Banco
- Agência
- Conta
- Operação

## Orientação
Caso tenha sido via PIX: anexar o comprovante da transação. Caso tenha sido por débito ou crédito: informar os 6 primeiros e os 4 últimos dígitos do cartão utilizado.
E-mail para anexar comprovantes: riocardresponde@riocardmais.com.br`,
    classification:
      "RECLAMAÇÃO - COMPRADOR - EXPRESSO - RECARGA - ATM - CARTÃO RETIDO PELO ATM - COM/SEM NÚMERO DE TERMINAL",
    keywords: ["rg-03", "bilhete unitário", "atm", "cartão retido", "terminal", "ressarcimento", "comprovante"],
  },
  {
    id: "rg-04",
    codigo: "RG-04",
    title: "Recarga não realizada — sem n° de pedido (app)",
    cat: "Recargas",
    dept: "Atendimento",
    type: "Roteiro de atendimento",
    summary:
      "Valor debitado e recarga não realizada, mas o cliente não tem o n° do pedido. Sem esse número não é possível dar continuidade ao atendimento.",
    content: `## Situação
Cliente entra em contato informando que realizou uma recarga, o valor foi debitado e a recarga não foi realizada, orientada de que sem o n° do pedido não conseguimos dar continuidade no atendimento.

## Orientação
Orientada a retornar com o n° do pedido e caso não consiga acessar o app, se dirigir a uma loja para auxílio.`,
    classification: "INF - USUÁRIO - VT/EXPRESSO - RECARGA - CONSULTA A RECARGA",
    keywords: ["rg-04", "recarga não realizada", "sem número de pedido", "valor debitado", "app", "consulta a recarga"],
  },
  {
    id: "rg-05",
    codigo: "RG-05",
    title: "Recarga pendente com abertura de ressarcimento anterior (Carga Excedente - VOLTA)",
    cat: "Recargas",
    dept: "Atendimento",
    type: "Roteiro de atendimento",
    summary:
      "Recarga não efetuada e já existe ressarcimento aberto. Como a recarga está pendente, é provável que o protocolo anterior seja encerrado.",
    content: `## Situação
Cliente entra em contato informando que realizou uma recarga de cartão mas a recarga não foi efetuada. O cliente informa que foi aberto um ressarcimento anteriormente para esta recarga.

## Dados a coletar
- Pedido
- Em sistema consta recarga
- Protocolo

## Orientação
Orientado de que pode desconsiderar esse chamado, pois como a recarga está pendente, é provável que o protocolo em questão será encerrado.
Mesmo com n° de recargas diferentes consta "Carga Excedente - VOLTA".`,
    classification: "INF - USUÁRIO - VT/EXPRESSO - RECARGA - CONSULTA A RECARGA",
    keywords: ["rg-05", "recarga pendente", "ressarcimento", "protocolo", "carga excedente", "volta"],
  },
  {
    id: "rg-06",
    codigo: "RG-06",
    title: "Recarga pendente",
    cat: "Recargas",
    dept: "Atendimento",
    type: "Roteiro de atendimento",
    summary:
      "Pagamento feito e recarga não efetuada. A recarga pendente só cai quando o saldo da recarga anterior acaba; se não validar, a loja RioCard resolve.",
    content: `## Situação
Cliente entra em contato informando que realizou um pagamento de recarga porém a recarga não foi efetuada.

## Dados a coletar
- Valor
- Data de pagamento
- Consta recarga pendente

## Orientação
Orientado de que a recarga consta "pendente" e caso o mesmo não consiga validar recarga em linhas, posto de validação nem pelo app, o mesmo pode se dirigir a uma loja da RioCard para validação.
Lembrando que a recarga pendente só cai quando o saldo da recarga anterior acaba.`,
    classification: "INF - USUÁRIO - VT/EXPRESSO - RECARGA - CONSULTA A RECARGA",
    keywords: ["rg-06", "recarga pendente", "validação", "posto de validação", "saldo anterior", "loja riocard"],
  },
  {
    id: "rg-07",
    codigo: "RG-07",
    title: "Recarga não pode ser realizada — trabalha em duas empresas",
    cat: "Recargas",
    dept: "Atendimento",
    type: "Roteiro de atendimento",
    summary:
      "O site do comprador só recarrega cartões vinculados a ele. A empresa não vinculada deve usar o Recarga Mais.",
    content: `## Situação
Cliente entra em contato ignorando que trabalha em duas empresas, o cartão está vinculado a uma empresa mas a que não está vinculada não consegue realizar recarga.

## Orientação
Orientado de que as recargas através do site do comprador são realizadas apenas para cartões vinculados ao comprador, logo foi recomendado de que a empresa que não está vinculada, realize as recargas através do Recarga Mais.`,
    classification: "INF - USUÁRIO - VT - RECARGA MAIS",
    keywords: ["rg-07", "duas empresas", "cartão vinculado", "site do comprador", "recarga mais", "vale-transporte"],
  },
  {
    id: "rg-08",
    codigo: "RG-08",
    title: "Recarga feita para cartão errado",
    cat: "Recargas",
    dept: "Atendimento",
    type: "Roteiro de atendimento",
    summary:
      "Recarga caiu em cartão diferente do informado. O cliente pode verificar as informações em loja RioCard com RG e CPF.",
    content: `## Situação
Cliente entra em contato informando que realizou recarga, em sistema mostra que foi para o cartão errado.

## Dados a coletar
- Cartão
- Recarga

## Orientação
Orientada de que pode verificar informações na loja da RioCard com RG e CPF.`,
    classification: "INF - USUÁRIO - VT/EXPRESSO - RECARGA - CONSULTA A RECARGA",
    keywords: ["rg-08", "cartão errado", "recarga", "loja riocard", "rg e cpf"],
  },
];

/** Metadados de apresentação das categorias; a contagem vem do banco. */
export const categoryMeta: Record<string, Omit<Category, "count">> = {
  Recargas: {
    slug: "recargas",
    label: "Recargas",
    description: "Agendamento, pendências, cartão errado e recarga por app, ATM e Recarga Mais.",
    icon: "bars",
  },
};

export const categoriaPadrao: Omit<Category, "count" | "label" | "slug"> = {
  description: "Conteúdos desta área.",
  icon: "doc",
};

/** Termos sugeridos enquanto não há histórico real de busca. */
export const termosSugeridos = [
  "recarga pendente",
  "cancelar recarga agendada",
  "bilhete unitário",
  "recarga não realizada",
  "cartão errado",
  "recarga mais",
];

/** Equivalências do vocabulário de atendimento, expandidas na busca. */
export const synonyms: Record<string, string[]> = {
  recarga: ["carga", "credito", "recarregar"],
  cancelamento: ["cancelar", "cancelada"],
  app: ["aplicativo", "celular"],
  atm: ["terminal", "maquina", "totem"],
  bilhete: ["passagem", "unitario"],
  ressarcimento: ["reembolso", "devolucao", "estorno"],
  pendente: ["pendencia", "nao efetuada", "nao realizada"],
  comprador: ["empresa", "rh"],
  cartao: ["cartoes"],
};
