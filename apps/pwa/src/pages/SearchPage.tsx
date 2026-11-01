import { useState, type FormEvent } from "react";
import { Page, Navbar, NavTitleLarge, Searchbar, Block } from "framework7-react";
import Poster from "../components/Poster";
import { apiGet, type Paged, type TitleItem } from "../lib/api";

interface Result {
  key: string;
  item: TitleItem;
  mediaType: "movie" | "tv";
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [searched, setSearched] = useState("");

  const runSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setStatus("loading");
    try {
      const params = `?q=${encodeURIComponent(q)}`;
      const [movies, shows] = await Promise.all([
        apiGet<Paged<TitleItem>>(`/api/tmdb/movies/search${params}`),
        apiGet<Paged<TitleItem>>(`/api/tmdb/tv/search${params}`),
      ]);
      setResults([
        ...movies.results.map((item) => ({ key: `m-${item.id}`, item, mediaType: "movie" as const })),
        ...shows.results.map((item) => ({ key: `t-${item.id}`, item, mediaType: "tv" as const })),
      ].filter((r) => r.item.poster_path));
      setSearched(q);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Page>
      <Navbar transparent>
        <NavTitleLarge>Cerca</NavTitleLarge>
      </Navbar>

      <form onSubmit={runSearch} className="search-form">
        <Searchbar
          placeholder="Film e serie"
          value={query}
          onInput={(e: any) => setQuery(e.target.value)}
          onSubmit={() => runSearch()}
          disableButton
          customSearch
        />
      </form>

      {status === "loading" && <Block className="status-text">Ricerca in corso…</Block>}
      {status === "error" && <Block className="status-text">Ricerca non riuscita. Riprova.</Block>}
      {status === "idle" && searched && results.length === 0 && (
        <Block className="status-text">Nessun risultato per “{searched}”.</Block>
      )}

      <div className="grid">
        {results.map((r) => (
          <Poster key={r.key} item={r.item} mediaType={r.mediaType} />
        ))}
      </div>
    </Page>
  );
}
