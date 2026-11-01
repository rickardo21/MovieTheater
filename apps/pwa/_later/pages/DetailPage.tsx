import { useEffect, useState } from "react";
import { Page, Navbar, Link, Block } from "framework7-react";
import { apiGet, img, titleOf, yearOf, type Episode, type MovieDetail, type SeasonDetail, type TvDetail } from "../lib/api";

interface Props {
  f7route: { params: Record<string, string> };
}

export default function DetailPage({ f7route }: Props) {
  const { type, id } = f7route.params;
  const isTv = type === "tv";
  const [item, setItem] = useState<MovieDetail | TvDetail | null>(null);
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [season, setSeason] = useState<SeasonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItem(null);
    setError(null);
    apiGet<MovieDetail | TvDetail>(isTv ? `/api/tmdb/tv/${id}` : `/api/tmdb/movies/${id}`)
      .then((data) => {
        setItem(data);
        if (isTv) {
          const tv = data as TvDetail;
          const first = tv.seasons.find((s) => s.season_number > 0) ?? tv.seasons[0];
          if (first) setSeasonNumber(first.season_number);
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Errore"));
  }, [id, isTv]);

  useEffect(() => {
    if (!isTv) return;
    apiGet<SeasonDetail>(`/api/tmdb/tv/${id}/seasons/${seasonNumber}`)
      .then(setSeason)
      .catch(() => setSeason(null));
  }, [id, isTv, seasonNumber]);

  const backdrop = img(item?.backdrop_path, "w1280");

  return (
    <Page>
      <Navbar transparent backLink="Indietro" />

      {error && <Block className="status-text">Impossibile caricare il titolo: {error}</Block>}
      {!error && !item && <Block className="status-text">Caricamento…</Block>}

      {item && (
        <>
          <div className="detail-hero">
            {backdrop && <img src={backdrop} alt="" />}
          </div>
          <div className="detail-info">
            <h1>{titleOf(item)}</h1>
            <p className="detail-meta">
              {yearOf(item)}
              {!isTv && (item as MovieDetail).runtime ? ` · ${(item as MovieDetail).runtime} min` : ""}
              {isTv ? ` · ${(item as TvDetail).number_of_seasons} stagioni` : ""}
            </p>
            <p className="detail-overview">{item.overview}</p>
            {!isTv && (
              <Link href={`/watch/movie/${item.id}/`} className="button-primary">
                Riproduci
              </Link>
            )}
          </div>

          {isTv && (item as TvDetail).seasons && (
            <>
              <div className="season-picker">
                {(item as TvDetail).seasons
                  .filter((s) => s.season_number > 0)
                  .map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`chip ${s.season_number === seasonNumber ? "chip-active" : ""}`}
                      onClick={() => setSeasonNumber(s.season_number)}
                    >
                      {s.name}
                    </button>
                  ))}
              </div>
              <div className="episode-list">
                {season?.episodes.map((ep: Episode) => (
                  <Link key={ep.id} href={`/watch/tv/${item.id}/${seasonNumber}/${ep.episode_number}/`} className="episode">
                    <div className="episode-still">
                      {img(ep.still_path, "w780") && <img src={img(ep.still_path, "w780") ?? ""} alt="" loading="lazy" />}
                    </div>
                    <div className="episode-text">
                      <p className="episode-kicker">Episodio {ep.episode_number}</p>
                      <p className="episode-name">{ep.name}</p>
                      <p className="episode-overview">{ep.overview}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Page>
  );
}
