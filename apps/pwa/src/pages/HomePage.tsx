import { useEffect, useState } from "react";
import { Page, Navbar, NavTitleLarge, Link, Block } from "framework7-react";
import Poster from "../components/Poster";
import { apiGet, img, titleOf, type Paged, type TitleItem } from "../lib/api";

interface Section {
  key: string;
  title: string;
  mediaType: "movie" | "tv";
  ranked: boolean;
  items: TitleItem[];
}

const SECTIONS = [
  { key: "movie-top", title: "Top 10 film", path: "/api/tmdb/movies/popular", mediaType: "movie" as const, ranked: true },
  { key: "tv-top", title: "Top 10 serie", path: "/api/tmdb/tv/popular", mediaType: "tv" as const, ranked: true },
  { key: "movie-now", title: "Al cinema", path: "/api/tmdb/movies/now-playing", mediaType: "movie" as const, ranked: false },
  { key: "tv-air", title: "In onda oggi", path: "/api/tmdb/tv/airing-today", mediaType: "tv" as const, ranked: false },
];

export default function HomePage() {
  const [hero, setHero] = useState<TitleItem | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      SECTIONS.map(async (s) => {
        const data = await apiGet<Paged<TitleItem>>(s.path);
        return { key: s.key, title: s.title, mediaType: s.mediaType, ranked: s.ranked, items: data.results };
      })
    )
      .then((loaded) => {
        if (cancelled) return;
        setSections(loaded);
        setHero(loaded[0]?.items[0] ?? null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Errore");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const backdrop = img(hero?.backdrop_path, "w1280");

  return (
    <Page>
      <Navbar transparent>
        <NavTitleLarge>Inizio</NavTitleLarge>
      </Navbar>

      {hero && (
        <Link href={`/detail/movie/${hero.id}/`} className="hero">
          {backdrop && <img src={backdrop} alt="" className="hero-art" />}
          <div className="hero-body">
            <p className="hero-kicker">In primo piano</p>
            <p className="hero-title">{titleOf(hero)}</p>
            <span className="hero-play">Riproduci</span>
          </div>
        </Link>
      )}

      {error && <Block className="status-text">Impossibile caricare i contenuti: {error}</Block>}
      {!error && sections.length === 0 && <Block className="status-text">Caricamento…</Block>}

      {sections.map((s) => (
        <div key={s.key} className="section">
          <h2 className="section-title">{s.title}</h2>
          <div className="row">
            {s.items.slice(0, 10).map((item, i) => (
              <Poster
                key={`${s.key}-${item.id}`}
                item={item}
                mediaType={s.mediaType}
                rank={s.ranked ? i + 1 : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </Page>
  );
}
