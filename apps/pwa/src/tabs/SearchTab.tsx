import { useState, type FormEvent } from "react";
import Poster from "../components/Poster";
import { apiGet, type Paged, type TitleItem } from "../lib/api";

interface Result {
  key: string;
  item: TitleItem;
  mediaType: "movie" | "tv";
}

export default function SearchTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [searched, setSearched] = useState("");

  const runSearch = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setStatus("loading");
    try {
      const params = `?q=${encodeURIComponent(q)}`;
      const [movies, shows] = await Promise.all([
        apiGet<Paged<TitleItem>>(`/api/tmdb/movies/search${params}`),
        apiGet<Paged<TitleItem>>(`/api/tmdb/tv/search${params}`),
      ]);
      setResults(
        [
          ...movies.results.map((item) => ({ key: `m-${item.id}`, item, mediaType: "movie" as const })),
          ...shows.results.map((item) => ({ key: `t-${item.id}`, item, mediaType: "tv" as const })),
        ].filter((r) => r.item.poster_path)
      );
      setSearched(q);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <h1 className="screen-title">Cerca</h1>
      <form onSubmit={runSearch} className="search-form">
        <input
          type="search"
          value={query}
          placeholder="Film e serie"
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="chip chip-active">Cerca</button>
      </form>

      {status === "loading" && <p className="status-text">Ricerca in corso…</p>}
      {status === "error" && <p className="status-text">Ricerca non riuscita. Riprova.</p>}
      {status === "idle" && searched && results.length === 0 && (
        <p className="status-text">Nessun risultato per “{searched}”.</p>
      )}

      <div className="grid">
        {results.map((r) => (
          <Poster key={r.key} item={r.item} mediaType={r.mediaType} />
        ))}
      </div>
    </>
  );
}
