import { useEffect, useRef, useState } from "react";
import { Page, Navbar, Subnavbar, Searchbar, List, ListItem, Block, Preloader } from "framework7-react";
import Rail, { type RailEntry } from "../components/Rail";
import { apiGet, img, yearOf, titleOf, type MediaType, type Paged, type TitleItem } from "../lib/api";

interface Result {
  key: string;
  item: TitleItem;
  mediaType: MediaType;
}

const DEBOUNCE_MS = 350;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [trending, setTrending] = useState<RailEntry[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const requestId = useRef(0);

  // Suggerimenti prima di scrivere: i titoli di tendenza
  useEffect(() => {
    Promise.all([
      apiGet<Paged<TitleItem>>("/api/tmdb/movies/trending"),
      apiGet<Paged<TitleItem>>("/api/tmdb/tv/trending"),
    ])
      .then(([movies, shows]) =>
        setTrending([
          ...movies.results.slice(0, 8).map((item) => ({ item, mediaType: "movie" as const })),
          ...shows.results.slice(0, 8).map((item) => ({ item, mediaType: "tv" as const })),
        ])
      )
      .catch(() => setTrending([]));
  }, []);

  const runSearch = async (text: string) => {
    const q = text.trim();
    const id = ++requestId.current;
    setQuery(q);
    if (!q) {
      setResults([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      const params = `?q=${encodeURIComponent(q)}`;
      const [movies, shows] = await Promise.all([
        apiGet<Paged<TitleItem>>(`/api/tmdb/movies/search${params}`),
        apiGet<Paged<TitleItem>>(`/api/tmdb/tv/search${params}`),
      ]);
      if (id !== requestId.current) return; // è partita una ricerca più recente
      setResults(
        [
          ...movies.results.map((item) => ({ key: `m-${item.id}`, item, mediaType: "movie" as const })),
          ...shows.results.map((item) => ({ key: `t-${item.id}`, item, mediaType: "tv" as const })),
        ].filter((r) => r.item.poster_path)
      );
      setStatus("idle");
    } catch {
      if (id === requestId.current) setStatus("error");
    }
  };

  const schedule = (text: string) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => runSearch(text), DEBOUNCE_MS);
  };

  const showResults = query !== "";

  return (
    <Page name="search">
      <Navbar large title="Cerca">
        <Subnavbar inner={false}>
          <Searchbar
            customSearch
            placeholder="Film e serie"
            disableButtonText="Annulla"
            clearButton
            onSearchbarSearch={(_searchbar: unknown, text: string) => schedule(text)}
            onSearchbarClear={() => schedule("")}
          />
        </Subnavbar>
      </Navbar>

      {!showResults && <Rail title="Di tendenza" entries={trending} />}

      {showResults && status === "loading" && (
        <Block className="empty-state">
          <Preloader />
        </Block>
      )}

      {status === "error" && (
        <Block className="empty-state">
          <h3>Ricerca non riuscita</h3>
          <p>Controlla la connessione e riprova.</p>
        </Block>
      )}

      {showResults && status === "idle" && results.length === 0 && (
        <Block className="empty-state">
          <h3>Nessun risultato</h3>
          <p>Non c’è nulla per “{query}”. Prova con un altro titolo.</p>
        </Block>
      )}

      {results.length > 0 && status !== "error" && (
        <List mediaList strong inset dividersIos>
          {results.map((r) => {
            const poster = img(r.item.poster_path, "w185");
            return (
              <ListItem
                key={r.key}
                link={`/detail/${r.mediaType}/${r.item.id}/`}
                title={titleOf(r.item)}
                subtitle={`${r.mediaType === "movie" ? "Film" : "Serie"}${yearOf(r.item) ? ` · ${yearOf(r.item)}` : ""}`}
                text={r.item.overview}
              >
                {poster && <img slot="media" src={poster} alt="" width="54" height="81" className="thumb" loading="lazy" />}
              </ListItem>
            );
          })}
        </List>
      )}
    </Page>
  );
}
