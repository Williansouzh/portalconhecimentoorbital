/**
 * DDL do banco. Vive como string (e não como .sql lido em runtime) para ser
 * empacotada junto com o build standalone, sem depender de copiar arquivos
 * soltos para a imagem.
 *
 * Tudo é idempotente: roda a cada boot e não quebra se o schema já existe.
 */
export const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Dois detalhes que travam colunas geradas aqui:
--  1. unaccent() é STABLE; a forma de dois argumentos fixa o dicionário e
--     permite marcar este wrapper como IMMUTABLE.
--  2. to_tsvector('portuguese', x) com a config em texto também é STABLE —
--     é preciso passar 'portuguese'::regconfig (ver colunas geradas abaixo).
--  3. array_to_string é STABLE — daí o wrapper logo abaixo.
CREATE OR REPLACE FUNCTION imutavel_unaccent(text)
  RETURNS text
  LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
  AS $$ SELECT public.unaccent('public.unaccent', $1) $$;

-- array_to_string(anyarray, text) também é STABLE (depende da função de saída
-- do tipo do elemento). Fixando em text[], o resultado é imutável.
CREATE OR REPLACE FUNCTION imutavel_array_to_string(text[], text)
  RETURNS text
  LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
  AS $$ SELECT array_to_string($1, $2) $$;

CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  short_name    text NOT NULL,
  email         text NOT NULL UNIQUE,
  dept          text NOT NULL,
  role          text NOT NULL CHECK (role IN ('leitor','autor','curador')),
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS articles (
  id         text PRIMARY KEY,
  title      text NOT NULL,
  cat        text NOT NULL,
  dept       text NOT NULL,
  type       text NOT NULL,
  read_time  text NOT NULL,
  views      integer NOT NULL DEFAULT 0,
  updated_at date NOT NULL,
  verified   boolean NOT NULL DEFAULT false,
  outdated   boolean NOT NULL DEFAULT false,
  rel        integer NOT NULL DEFAULT 0,
  keywords   text[] NOT NULL DEFAULT '{}',
  snippet    text NOT NULL,
  path       text NOT NULL,
  status     text NOT NULL DEFAULT 'publicado' CHECK (status IN ('publicado','revisao','rascunho')),
  body       jsonb,
  author_id  text REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Corpo escrito no editor (markdown enxuto) e prazo de revisão. A coluna
-- body em jsonb continua servindo aos artigos com passo a passo estruturado.
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS next_review date;

-- Índice de busca com peso por campo: título pesa mais que palavra-chave,
-- que pesa mais que categoria/área, que pesa mais que o resumo.
ALTER TABLE articles ADD COLUMN IF NOT EXISTS search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese'::regconfig, imutavel_unaccent(title)), 'A') ||
    setweight(to_tsvector('portuguese'::regconfig, imutavel_unaccent(imutavel_array_to_string(keywords, ' '))), 'B') ||
    setweight(to_tsvector('portuguese'::regconfig, imutavel_unaccent(cat || ' ' || dept)), 'C') ||
    setweight(to_tsvector('portuguese'::regconfig, imutavel_unaccent(snippet)), 'D')
  ) STORED;

-- Texto achatado e sem acento, para a tolerância a erro de digitação.
ALTER TABLE articles ADD COLUMN IF NOT EXISTS searchable text
  GENERATED ALWAYS AS (
    imutavel_unaccent(lower(title || ' ' || imutavel_array_to_string(keywords, ' ') || ' ' || snippet))
  ) STORED;

-- Índices parciais: toda busca é sobre publicados, e como o status casa com
-- quase toda a tabela, o índice completo era descartado pelo planner. Com o
-- recorte, os dois ramos da busca usam GIN (medido em 20 mil linhas: 221 ms
-- de varredura sequencial contra 3,4 ms).
DROP INDEX IF EXISTS articles_search_idx;
DROP INDEX IF EXISTS articles_searchable_trgm_idx;
CREATE INDEX IF NOT EXISTS articles_search_pub_idx
  ON articles USING GIN (search) WHERE status = 'publicado';
CREATE INDEX IF NOT EXISTS articles_searchable_pub_idx
  ON articles USING GIN (searchable gin_trgm_ops) WHERE status = 'publicado';
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles (status);
CREATE INDEX IF NOT EXISTS articles_cat_idx ON articles (cat);

CREATE TABLE IF NOT EXISTS favorites (
  user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);

CREATE TABLE IF NOT EXISTS history (
  user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  viewed_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);
CREATE INDEX IF NOT EXISTS history_user_time_idx ON history (user_id, viewed_at DESC);

CREATE TABLE IF NOT EXISTS recent_searches (
  user_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term        text NOT NULL,
  searched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, term)
);
CREATE INDEX IF NOT EXISTS recent_searches_user_time_idx ON recent_searches (user_id, searched_at DESC);

-- O fluxo editorial tem quatro estágios; a coluna nasceu com três.
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE articles ADD CONSTRAINT articles_status_check
  CHECK (status IN ('publicado','aprovacao','revisao','rascunho'));

-- Eventos que alimentam o painel de gestão. Uma busca gera um search_event;
-- abrir um resultado gera um result_click ligado a ele, e é essa ligação que
-- dá tanto a taxa de cliques quanto o tempo até a resposta.
CREATE TABLE IF NOT EXISTS search_events (
  id            bigserial PRIMARY KEY,
  user_id       text REFERENCES users(id) ON DELETE SET NULL,
  term          text NOT NULL,
  normalized    text NOT NULL,
  results_count integer NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS search_events_time_idx ON search_events (created_at DESC);
CREATE INDEX IF NOT EXISTS search_events_term_idx ON search_events (normalized);
CREATE INDEX IF NOT EXISTS search_events_empty_idx ON search_events (created_at DESC) WHERE results_count = 0;

CREATE TABLE IF NOT EXISTS result_clicks (
  id              bigserial PRIMARY KEY,
  search_event_id bigint REFERENCES search_events(id) ON DELETE CASCADE,
  user_id         text REFERENCES users(id) ON DELETE SET NULL,
  article_id      text REFERENCES articles(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS result_clicks_event_idx ON result_clicks (search_event_id);

CREATE TABLE IF NOT EXISTS article_feedback (
  id              bigserial PRIMARY KEY,
  article_id      text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id         text REFERENCES users(id) ON DELETE SET NULL,
  helpful         boolean,
  outdated_report boolean NOT NULL DEFAULT false,
  comment         text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS article_feedback_time_idx ON article_feedback (created_at DESC);
`;
