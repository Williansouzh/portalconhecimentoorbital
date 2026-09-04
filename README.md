# Portal do Conhecimento — RioCard

Base de conhecimento interna da RioCard: busca, leitura de procedimentos, espaço
pessoal (favoritos/histórico) e gestão editorial. Implementação em Next.js do
design entregue pelo Claude Design (handoff `Portal do Conhecimento.dc.html`).

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Backend no próprio Next.js**: route handlers em `app/api/*`
- CSS puro com design tokens (claro/escuro) em `app/globals.css`
- Fontes Archivo (títulos) e Figtree (texto) via `next/font`

## Rodando

```bash
npm install
cp .env.example .env    # gere um AUTH_SECRET (instruções no arquivo)
npm run dev             # http://localhost:3000
```

### Docker

```bash
docker compose up -d      # http://localhost:3200
docker compose logs -f
docker compose down       # para os containers e mantém o volume
```

A imagem é multi-stage e roda o build `standalone` do Next como usuário
não-root. O volume `portal-data` guarda `/app/data`, onde fica o estado do
store (favoritos, histórico, pesquisas), então ele sobrevive a restarts.

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
| `/admin/editor` | Editor de artigo |
| `/estados` | Catálogo dos 11 estados de carregamento, vazio e erro |
| `/design-system` | Cores, tipografia, espaçamento, botões, alertas |
| `/mapa` | Mapa de telas, fluxo principal e decisões de UX |

## API

| Rota | O que faz |
| --- | --- |
| `GET /api/search` | Busca com ranking, filtros (categoria/departamento/tipo/data) e ordenação |
| `GET /api/suggestions` | Sugestões agrupadas (conteúdos, termos, categorias, sistemas, FAQ) |
| `GET /api/articles/[id]` | Artigo, corpo e relacionados · `POST /api/articles` cria rascunho |
| `GET/POST/DELETE /api/favorites` | Favoritos |
| `GET/POST/DELETE /api/history` | Histórico de leitura |
| `GET/POST/DELETE /api/searches` | Pesquisas recentes |
| `POST /api/feedback` | Avaliação do artigo e aviso de conteúdo desatualizado |
| `GET /api/home`, `GET /api/categories` | Dados agregados da home e categorias |
| `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | Sessão |

### Busca

`lib/search.ts` implementa o comportamento definido no design: ignora acento e
caixa, aceita prefixos, tolera um caractere errado (Levenshtein limitado) e
expande sinônimos — "ticket" encontra "chamado", "password" encontra "senha".

### Persistência

`lib/store.ts` mantém usuários, favoritos, histórico, pesquisas e rascunhos em memória com
escrita em `data/state.json` (ignorado pelo git), sobrevivendo a reinícios do
servidor. É o ponto de troca para um banco real: a mesma interface passa a
consultar o banco sem mudar as rotas.

## Conteúdo

Os 10 artigos de exemplo ficam em `lib/data.ts`. Só o artigo `senha` tem corpo
completo escrito (passo a passo, requisitos, FAQ) — os demais mostram apenas o
resumo até que as equipes responsáveis escrevam o conteúdo.
