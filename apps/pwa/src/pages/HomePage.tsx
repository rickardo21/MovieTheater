import { useCallback, useEffect, useState } from "react";
import { Page, Navbar, Block, Button } from "framework7-react";
import Rail, { RailSkeleton, type RailEntry } from "../components/Rail";
import { apiGet, img, titleOf, type MediaType, type Paged, type TitleItem } from "../lib/api";
import { isInList, toggleInList, useLibrary } from "../lib/store";

interface SectionDef {
  key: string;
  title: string;
  path: string;
  mediaType: MediaType;
  ranked: boolean;
}

const SECTIONS: SectionDef[] = [
  { key: "movie-top", title: "Top 10 film", path: "/api/tmdb/movies/popular", mediaType: "movie", ranked: true },
  { key: "tv-top", title: "Top 10 serie", path: "/api/tmdb/tv/popular", mediaType: "tv", ranked: true },
  { key: "movie-now", title: "Al cinema", path: "/api/tmdb/movies/now-playing", mediaType: "movie", ranked: false },
  { key: "tv-air", title: "In onda oggi", path: "/api/tmdb/tv/airing-today", mediaType: "tv", ranked: false },
];

interface LoadedSection extends SectionDef {
  entries: RailEntry[];
}

export default function HomePage() {
  const library = useLibrary();
  const [sections, setSections] = useState<LoadedSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return Promise.all(
      SECTIONS.map(async (s) => {
        const data = await apiGet<Paged<TitleItem>>(s.path);
        const entries = data.results.slice(0, 10).map((item) => ({ item, mediaType: s.mediaType }));
        return { ...s, entries };
      })
    )
      .then(setSections)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Errore"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hero = sections[0]?.entries.find((e) => e.item.backdrop_path)?.item ?? null;
  const backdrop = img(hero?.backdrop_path, "w1280");
  const heroSaved = hero
    ? {
        type: "movie" as const,
        id: hero.id,
        title: titleOf(hero),
        poster: hero.poster_path,
        backdrop: hero.backdrop_path,
      }
    : null;
  const heroInList = heroSaved ? isInList(library, "movie", heroSaved.id) : false;

  return (
    <Page name="home">
      <Navbar large title="Inizio" />

      {hero && heroSaved && (
        <div className="hero">
          {backdrop && <img src={backdrop} alt="" className="hero-art" />}
          <div className="hero-body">
            <p className="hero-kicker">In primo piano</p>
            <h2 className="hero-title">{titleOf(hero)}</h2>
            <div className="hero-actions">
              <Button
                round
                fill
                large
                href={`/detail/movie/${hero.id}/`}
                text="Riproduci"
                iconIos="f7:play_fill"
                iconMd="material:play_arrow"
              />
              <Button
                round
                tonal
                large
                aria-label={heroInList ? "Rimuovi dalla mia lista" : "Aggiungi alla mia lista"}
                iconIos={heroInList ? "f7:checkmark" : "f7:plus"}
                iconMd={heroInList ? "material:check" : "material:add"}
                onClick={() => toggleInList(heroSaved)}
              />
            </div>
          </div>
        </div>
      )}

      {loading && sections.length === 0 && (
        <>
          <RailSkeleton />
          <RailSkeleton />
        </>
      )}

      {error && (
        <Block className="empty-state">
          <h3>Impossibile caricare i contenuti</h3>
          <p>{error}</p>
          <Button round tonal text="Riprova" onClick={load} />
        </Block>
      )}

      {sections.map((s) => (
        <Rail key={s.key} title={s.title} entries={s.entries} ranked={s.ranked} />
      ))}
    </Page>
  );
}
