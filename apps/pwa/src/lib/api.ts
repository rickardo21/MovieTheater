const DEFAULT_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "https://movietheater-yart.onrender.com";

const BASE_KEY = "mt.apiBase";

// L'indirizzo del server si può cambiare dalla scheda Libreria (utile per un server sul proprio computer)
export function getApiBase(): string {
  try {
    const saved = localStorage.getItem(BASE_KEY);
    if (saved) return saved;
  } catch {
    // storage non disponibile: si usa l'indirizzo predefinito
  }
  return DEFAULT_BASE;
}

export function setApiBase(url: string) {
  const clean = url.trim().replace(/\/+$/, "");
  try {
    if (clean) localStorage.setItem(BASE_KEY, clean);
    else localStorage.removeItem(BASE_KEY);
  } catch {
    // ignorato: l'impostazione vale solo per questa sessione
  }
}

export const defaultApiBase = DEFAULT_BASE;

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`);
  if (!res.ok) {
    // Mostra il messaggio d'errore del server, non solo il codice
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error ? `: ${body.error}` : "";
    } catch {
      detail = "";
    }
    throw new Error(`HTTP ${res.status} su ${path}${detail}`);
  }
  return (await res.json()) as T;
}

export function img(path: string | null | undefined, size: "w185" | "w342" | "w780" | "w1280" | "original" = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export type MediaType = "movie" | "tv";

export interface Paged<T> {
  page: number;
  results: T[];
  total_pages: number;
}

export interface TitleItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetail extends TitleItem {
  runtime: number | null;
  genres: Genre[];
}

export interface TvSeasonSummary {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
}

export interface TvDetail extends TitleItem {
  number_of_seasons: number;
  genres: Genre[];
  seasons: TvSeasonSummary[];
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime: number | null;
}

export interface SeasonDetail {
  season_number: number;
  name: string;
  episodes: Episode[];
}

export interface StreamInfo {
  masterUrl: string;
  embedUrl: string;
}

export const titleOf = (item: TitleItem) => item.title ?? item.name ?? "";
export const yearOf = (item: TitleItem) => (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
