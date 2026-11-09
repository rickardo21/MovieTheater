import { useSyncExternalStore } from "react";
import type { MediaType } from "./api";

// Dati personali salvati sul telefono: la mia lista e "continua a guardare".
export interface SavedTitle {
  type: MediaType;
  id: number;
  title: string;
  poster: string | null;
  backdrop: string | null;
}

export interface Progress extends SavedTitle {
  season?: number;
  episode?: number;
  position: number;
  duration: number;
  updatedAt: number;
}

interface State {
  list: SavedTitle[];
  progress: Progress[];
}

const KEY = "mt.library.v1";
const MAX_PROGRESS = 20;

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      return { list: parsed.list ?? [], progress: parsed.progress ?? [] };
    }
  } catch {
    // storage non disponibile o dati rovinati: si riparte da vuoto
  }
  return { list: [], progress: [] };
}

let state: State = load();
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // il salvataggio può fallire in navigazione privata: lo stato resta in memoria
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useLibrary = () => useSyncExternalStore(subscribe, () => state);

export const isInList = (s: State, type: MediaType, id: number) => s.list.some((t) => t.type === type && t.id === id);

export function toggleInList(item: SavedTitle) {
  const exists = isInList(state, item.type, item.id);
  commit({
    ...state,
    list: exists ? state.list.filter((t) => !(t.type === item.type && t.id === item.id)) : [item, ...state.list],
  });
}

// Un solo elemento per titolo: si tiene l'ultimo episodio visto
export function saveProgress(entry: Progress) {
  const others = state.progress.filter((p) => !(p.type === entry.type && p.id === entry.id));
  commit({ ...state, progress: [entry, ...others].slice(0, MAX_PROGRESS) });
}

export function removeProgress(type: MediaType, id: number) {
  commit({ ...state, progress: state.progress.filter((p) => !(p.type === type && p.id === id)) });
}

export function findProgress(type: MediaType, id: number, season?: number, episode?: number) {
  const p = state.progress.find((x) => x.type === type && x.id === id);
  if (!p) return undefined;
  if (type === "tv" && (p.season !== season || p.episode !== episode)) return undefined;
  return p;
}
