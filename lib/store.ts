import fs from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Article } from "./types";
import type { Role } from "./auth";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

export type UserRecord = {
  id: string;
  name: string;
  shortName: string;
  email: string;
  dept: string;
  role: Role;
  passwordHash: string;
};

export type UserState = {
  favs: Record<string, boolean>;
  hist: string[];
  searches: string[];
};

type Draft = Partial<Article> & {
  id: string;
  title: string;
  createdAt: string;
  authorId?: string;
  summary?: string;
  content?: string;
  keywords?: string[];
};

type StoreShape = {
  users: UserRecord[];
  state: Record<string, UserState>;
  drafts: Draft[];
};

// ---------- senhas ----------

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const derived = scryptSync(plain, salt, 64);
  const expectedBuf = Buffer.from(expected, "hex");
  if (derived.length !== expectedBuf.length) return false;
  return timingSafeEqual(derived, expectedBuf);
}

// ---------- seed ----------

// Senha de demonstração dos usuários semente. Um deploy real troca isto por
// SSO corporativo — daí o aviso no README.
const SEED_PASSWORD = process.env.SEED_PASSWORD || "portal2026";

const EMPTY_STATE: UserState = { favs: {}, hist: [], searches: [] };

function seedUsers(): UserRecord[] {
  return [
    {
      id: "ana",
      name: "Ana Coutinho",
      shortName: "Ana C.",
      email: "ana.coutinho@riocard.com.br",
      dept: "Operações",
      role: "leitor",
      passwordHash: hashPassword(SEED_PASSWORD),
    },
    {
      id: "bruno",
      name: "Bruno Lima",
      shortName: "Bruno L.",
      email: "bruno.lima@riocard.com.br",
      dept: "RH · Pessoas",
      role: "autor",
      passwordHash: hashPassword(SEED_PASSWORD),
    },
    {
      id: "carla",
      name: "Carla Menezes",
      shortName: "Carla M.",
      email: "carla.menezes@riocard.com.br",
      dept: "TI · Suporte",
      role: "curador",
      passwordHash: hashPassword(SEED_PASSWORD),
    },
  ];
}

// Estado inicial só da Ana, para a demo abrir com conteúdo na tela.
function seedState(): Record<string, UserState> {
  return {
    ana: {
      favs: { senha: true, remoto: true, reembolso: true },
      hist: ["senha", "remoto", "chamados", "vt", "email"],
      searches: ["redefinir senha", "férias 2026", "reembolso combustível", "sap bloqueado"],
    },
  };
}

function seedStore(): StoreShape {
  return { users: seedUsers(), state: seedState(), drafts: [] };
}

// O cache vive no globalThis, não no escopo do módulo: server components e
// route handlers são empacotados em chunks diferentes, e cada chunk teria a
// sua própria cópia do módulo — dois caches divergentes gravando por cima um
// do outro no mesmo arquivo. No global existe um só por processo.
declare global {
  var __portalStore: StoreShape | undefined;
}

function load(): StoreShape {
  if (globalThis.__portalStore) return globalThis.__portalStore;
  let loaded: StoreShape;
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    loaded = {
      users: parsed.users?.length ? parsed.users : seedUsers(),
      state: parsed.state ?? seedState(),
      drafts: parsed.drafts ?? [],
    };
  } catch {
    loaded = seedStore();
  }
  globalThis.__portalStore = loaded;
  persist();
  return loaded;
}

function persist() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(globalThis.__portalStore, null, 2));
  } catch {
    // Best-effort: o cache em memória segue autoritativo neste processo
    // mesmo que a escrita falhe.
  }
}

function userState(userId: string): UserState {
  const s = load();
  if (!s.state[userId]) s.state[userId] = { ...EMPTY_STATE, favs: {}, hist: [], searches: [] };
  return s.state[userId];
}

// ---------- usuários ----------

export function findUserByEmail(email: string): UserRecord | undefined {
  const wanted = email.trim().toLowerCase();
  return load().users.find((u) => u.email.toLowerCase() === wanted);
}

export function findUserById(id: string): UserRecord | undefined {
  return load().users.find((u) => u.id === id);
}

// ---------- favoritos ----------

export function getFavorites(userId: string): Record<string, boolean> {
  return userState(userId).favs;
}

export function toggleFavorite(userId: string, id: string): boolean {
  const st = userState(userId);
  st.favs[id] = !st.favs[id];
  persist();
  return st.favs[id];
}

export function clearFavorites(userId: string) {
  userState(userId).favs = {};
  persist();
}

// ---------- histórico ----------

export function getHistory(userId: string): string[] {
  return userState(userId).hist;
}

export function pushHistory(userId: string, id: string) {
  const st = userState(userId);
  st.hist = [id, ...st.hist.filter((h) => h !== id)].slice(0, 30);
  persist();
}

export function removeFromHistory(userId: string, id: string) {
  const st = userState(userId);
  st.hist = st.hist.filter((h) => h !== id);
  persist();
}

export function clearHistory(userId: string) {
  userState(userId).hist = [];
  persist();
}

// ---------- pesquisas recentes ----------

export function getSearches(userId: string): string[] {
  return userState(userId).searches;
}

export function addSearch(userId: string, q: string) {
  const trimmed = q.trim();
  if (!trimmed) return;
  const st = userState(userId);
  st.searches = [trimmed, ...st.searches.filter((x) => x.toLowerCase() !== trimmed.toLowerCase())].slice(0, 20);
  persist();
}

export function removeSearch(userId: string, q: string) {
  const st = userState(userId);
  st.searches = st.searches.filter((x) => x !== q);
  persist();
}

export function clearSearches(userId: string) {
  userState(userId).searches = [];
  persist();
}

// ---------- rascunhos ----------

export function getDrafts(): Draft[] {
  return load().drafts;
}

export function addDraft(draft: Draft) {
  const s = load();
  s.drafts = [draft, ...s.drafts];
  persist();
  return draft;
}
