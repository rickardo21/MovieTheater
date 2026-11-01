const BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "https://movietheater-yart.onrender.com";

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} su ${path}`);
  return (await res.json()) as T;
}

export function img(path: string | null | undefined, size: "w342" | "w780" | "w1280" | "original" = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

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

export interface MovieDetail extends TitleItem {
  runtime: number | null;
  genres: { id: number; name: string }[];
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
  genres: { id: number; name: string }[];
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
