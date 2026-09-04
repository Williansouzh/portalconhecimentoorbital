import fs from "node:fs";
import path from "node:path";
import type { Article } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

type Draft = Partial<Article> & {
  id: string;
  title: string;
  createdAt: string;
  summary?: string;
  content?: string;
  keywords?: string[];
};

type StoreShape = {
  favs: Record<string, boolean>;
  hist: string[];
  searches: string[];
  drafts: Draft[];
};

const DEFAULT_STATE: StoreShape = {
  favs: { senha: true, remoto: true, reembolso: true },
  hist: ["senha", "remoto", "chamados", "vt", "email"],
  searches: ["redefinir senha", "férias 2026", "reembolso combustível", "sap bloqueado"],
  drafts: [],
};

// Module-level cache: survives for the lifetime of the Node process (dev/start),
// backed by a JSON file on disk so state also survives a server restart.
let cache: StoreShape | null = null;

function load(): StoreShape {
  if (cache) return cache;
  let loaded: StoreShape;
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    loaded = { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    loaded = {
      ...DEFAULT_STATE,
      favs: { ...DEFAULT_STATE.favs },
      hist: [...DEFAULT_STATE.hist],
      searches: [...DEFAULT_STATE.searches],
      drafts: [],
    };
  }
  cache = loaded;
  return cache;
}

function persist() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(cache, null, 2));
  } catch {
    // Best-effort: the in-memory cache stays authoritative for this process
    // even if the write fails.
  }
}

export function getFavorites(): Record<string, boolean> {
  return load().favs;
}

export function toggleFavorite(id: string): boolean {
  const s = load();
  s.favs[id] = !s.favs[id];
  persist();
  return s.favs[id];
}

export function clearFavorites() {
  const s = load();
  s.favs = {};
  persist();
}

export function getHistory(): string[] {
  return load().hist;
}

export function pushHistory(id: string) {
  const s = load();
  s.hist = [id, ...s.hist.filter((h) => h !== id)].slice(0, 30);
  persist();
}

export function removeFromHistory(id: string) {
  const s = load();
  s.hist = s.hist.filter((h) => h !== id);
  persist();
}

export function clearHistory() {
  const s = load();
  s.hist = [];
  persist();
}

export function getSearches(): string[] {
  return load().searches;
}

export function addSearch(q: string) {
  const trimmed = q.trim();
  if (!trimmed) return;
  const s = load();
  s.searches = [trimmed, ...s.searches.filter((x) => x.toLowerCase() !== trimmed.toLowerCase())].slice(0, 20);
  persist();
}

export function removeSearch(q: string) {
  const s = load();
  s.searches = s.searches.filter((x) => x !== q);
  persist();
}

export function clearSearches() {
  const s = load();
  s.searches = [];
  persist();
}

export function getDrafts(): Draft[] {
  return load().drafts;
}

export function addDraft(draft: Draft) {
  const s = load();
  s.drafts = [draft, ...s.drafts];
  persist();
  return draft;
}
