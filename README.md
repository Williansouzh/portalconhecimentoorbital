# Portal do Conhecimento — RioCard

Base de conhecimento interna da RioCard: busca, leitura de procedimentos, espaço
pessoal (favoritos/histórico) e gestão editorial. Implementação em Next.js do
design entregue pelo Claude Design (handoff `Portal do Conhecimento.dc.html`).

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Backend no próprio Next.js**: route handlers em `app/api/*`
- **PostgreSQL 17** com `pg` — sem ORM, SQL direto
- CSS puro com design tokens (claro/escuro) em `app/globals.css`
- Fontes Archivo (títulos) e Figtree (texto) via `next/font`

## Rodando

```bash
npm install
cp .env.example .env             # gere um AUTH_SECRET (instruções no arquivo)
docker compose up -d postgres    # banco em localhost:5433
npm run dev                      # http://localhost:3000
```

O schema e os dados iniciais são criados sozinhos no primeiro acesso — o boot
roda o DDL (idempotente) e semeia usuários e artigos se o banco estiver vazio.

### Docker

```bash
docker compose up -d      # app em http://localhost:3200, Postgres em 5433
docker compose logs -f
docker compose down       # para os containers e mantém o volume do banco
```

São dois serviços: o app (imagem multi-stage rodando o build `standalone` do
Next como usuário não-root) e o Postgres, cujos dados ficam no volume
`portal-pgdata`. O app só sobe depois que o healthcheck do banco passa.

## Fluxo editorial

O artigo percorre **rascunho → revisão → aprovação → publicação**, e o botão do
editor mostra sempre só o próximo passo permitido para quem está editando:
autor leva até a revisão; aprovar e publicar são do curador (a API responde 403
para quem não pode). Só o que está publicado entra na busca — rascunho e
revisão ficam invisíveis para quem lê o portal.

Publicar carimba a data de atualização exibida no conteúdo. O corpo escrito no
editor usa um markdown enxuto (`## seção` e `1. passo`) e é renderizado na
página do artigo no mesmo visual dos passos estruturados.

No painel, cada card do fluxo abre o artigo no editor, e o botão "Criar artigo"
de uma lacuna já leva o termo buscado para o título e as palavras-chave.

Categorias e filtros são derivados do acervo: aparecem as que existem, com a
contagem real, e um filtro só é exibido quando tem mais de uma opção — com um
único tipo de conteúdo cadastrado, filtrar por tipo não separa nada.

## Métricas

O painel de gestão lê agregações do banco, não números fixos. Cada busca grava
um `search_event` (termo, forma normalizada e quantos resultados vieram); abrir
um resultado grava um `result_click` ligado àquela busca. Dessa ligação saem
duas coisas: a taxa de cliques por termo e o **tempo médio até a resposta**
(intervalo entre a busca e o clique). As avaliações do rodapé do artigo viram
linhas em `article_feedback`, e o fluxo editorial é `count(*)` por `status`.

Quando não há dado no período, o painel diz isso em vez de mostrar zero
disfarçado de métrica.

Uma instalação nova começa sem eventos: o painel abre dizendo que ainda não há
dado e vai se preenchendo conforme o portal é usado. Nenhum número ali é
inventado.

## Autenticação

Sessão por **JWT (HS256) em cookie httpOnly**, assinado com `AUTH_SECRET` —
obrigatório em produção, com fallback só de desenvolvimento. O `middleware.ts`
barra tudo que não seja `/login` e `/api/auth/login`: página sem sessão
redireciona para o login (preservando o destino em `?next=`), rota de API sem
sessão responde 401.

Três papéis: **leitor**, **autor** e **curador**. Autor e curador enxergam o
item "Gestão" no menu e acessam `/admin` e `/admin/editor`; para os demais o
middleware redireciona, e `POST /api/articles` responde 403.

Favoritos, histórico e pesquisas recentes são **por usuário** — cada sessão lê e
escreve apenas o seu subconjunto do store.

### Usuários de demonstração

Criados no primeiro boot, com senha `portal2026` (ou `SEED_PASSWORD`):

| E-mail | Papel | Área |
| --- | --- | --- |
| ana.coutinho@riocard.com.br | leitor | Operações |
| bruno.lima@riocard.com.br | autor | RH · Pessoas |
| carla.menezes@riocard.com.br | curador | TI · Suporte |

São apenas para a demo. Um deploy real troca esse seed por SSO corporativo — o
ponto de troca é `findUserByEmail`/`verifyPassword` em `lib/store.ts` e a rota
`app/api/auth/login`.

## Telas

| Rota | Tela |
| --- | --- |
| `/` | Home com busca em destaque, categorias, mais pesquisados, continuar lendo |
| `/resultados?q=` | Resultados com filtros, ordenação, lista/cartões |
| `/artigo/[id]` | Artigo com índice fixo, passos, avaliação e relacionados |
| `/categorias` | As 8 áreas de conteúdo |
| `/favoritos?tab=` | Favoritos, histórico, pesquisas recentes e recomendados |
| `/admin` | Painel de gestão: métricas, lacunas de conteúdo, fluxo editorial |
| `/admin/editor` | Novo artigo (aceita `?termo=` vindo de uma lacuna) |
| `/admin/editor/[id]` | Editar artigo existente |
| `/estados` | Catálogo dos 11 estados de carregamento, vazio e erro |
| `/design-system` | Cores, tipografia, espaçamento, botões, alertas |
| `/mapa` | Mapa de telas, fluxo principal e decisões de UX |

## API

| Rota | O que faz |
| --- | --- |
| `GET /api/search` | Busca com ranking, filtros (categoria/departamento/tipo/data) e ordenação |
| `GET /api/suggestions` | Sugestões agrupadas (conteúdos, termos, categorias, sistemas, FAQ) |
| `GET /api/articles/[id]` | Artigo, corpo e relacionados |
| `POST /api/articles` · `PATCH /api/articles/[id]` | Cria e edita conteúdo |
| `POST /api/articles/[id]/status` | Move o artigo no fluxo editorial |
| `GET/POST/DELETE /api/favorites` | Favoritos |
| `GET/POST/DELETE /api/history` | Histórico de leitura |
| `GET/POST/DELETE /api/searches` | Pesquisas recentes |
| `POST /api/feedback` | Avaliação do artigo e aviso de conteúdo desatualizado |
| `POST /api/search/click` | Clique num resultado, atribuído à busca que o originou |
| `GET /api/home`, `GET /api/categories` | Dados agregados da home e categorias |
| `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | Sessão |

### Busca

Feita no banco, com o comportamento que o design pede: ignora acento
(`unaccent`), aceita prefixo (`senh` já encontra), tolera erro de digitação
(`pg_trgm`, `word_similarity`) e expande sinônimos — "ticket" encontra
"chamado", "password" encontra "senha". O ranking usa `ts_rank_cd` sobre uma
coluna `tsvector` gerada com peso por campo: título (A) pesa mais que
palavra-chave (B), que pesa mais que categoria/área (C) e resumo (D).
`lib/search.ts` cuida só do que é apresentação: normalizar, montar o `tsquery`
e destacar o trecho.

Os dois índices têm papéis distintos: o full-text cobre tudo, inclusive o corpo
do artigo; o trigrama cobre só título, palavras-chave e resumo, e serve de plano
B para erro de digitação. Comparar trigrama contra o texto inteiro produzia
casamento atravessando fronteira de palavra ("senha" achava um roteiro que não
fala de senha, 0.67 de similaridade contra 0.33 no campo enxuto).

Outros dois detalhes valem registro, porque não são óbvios:

- As duas condições (full-text e trigrama) entram como CTEs separadas. Num
  único `OR`, o planner abandona os índices GIN e varre a tabela: medido em 20
  mil linhas, 221 ms contra 3,4 ms.
- Os índices GIN são **parciais** (`WHERE status = 'publicado'`). Como o
  status casa com quase toda a tabela, o índice completo era descartado.

### Persistência

Oito tabelas: `users`, `articles`, `favorites`, `history`, `recent_searches` e
as três de eventos (`search_events`, `result_clicks`, `article_feedback`).
Favoritos e histórico são tabelas de ligação com chave estrangeira e
`ON DELETE CASCADE`; o corpo do artigo (passos, requisitos, FAQ) fica em
`jsonb`. O DDL vive em `lib/schema.ts` e roda a cada boot, sempre idempotente.

## Conteúdo

O acervo vem de **ASSUNTOS PROMPT ATENDIMENTO**, o catálogo de roteiros da
central. Cada assunto do documento virou um artigo, com este mapeamento:

| No documento | No portal |
| --- | --- |
| Seção (`RECARGAS`) | categoria |
| Código (`RG-01`) | id do artigo e primeira palavra-chave |
| Título | título |
| "Cliente entra em contato…" | resumo + seção **Situação** |
| Campos a preencher (`CPF:`, `Valor:`) | seção **Dados a coletar** |
| "Orientado de que…" | seção **Orientação** |
| `INF - COMPRADOR - VT/EXPRESSO - …` | campo próprio, em destaque no topo do artigo |

A classificação ganhou campo próprio porque é o que o atendente copia para o
chamado — fica visível sem precisar rolar, e entra no índice de busca.

Para acrescentar outra seção do catálogo, basta estender `seedArticles` em
`lib/data.ts` (ou criar pelo editor, que grava direto no banco).

