import { useEffect, useMemo, useState } from "react";
import { Page, Navbar, NavRight, Link, Block, Button, Chip, List, ListItem, ListInput, Preloader } from "framework7-react";
import PlayerPopup, { type PlayTarget } from "../components/PlayerPopup";
import Rail, { type RailEntry } from "../components/Rail";
import {
  apiGet,
  img,
  titleOf,
  yearOf,
  type Episode,
  type MediaType,
  type MovieDetail,
  type Paged,
  type SeasonDetail,
  type TitleItem,
  type TvDetail,
} from "../lib/api";
import { isInList, toggleInList, useLibrary } from "../lib/store";

interface Props {
  f7route: { params: Record<string, string> };
}

export default function DetailPage({ f7route }: Props) {
  const { type, id } = f7route.params;
  const mediaType: MediaType = type === "tv" ? "tv" : "movie";
  const isTv = mediaType === "tv";
  const library = useLibrary();

  const [item, setItem] = useState<MovieDetail | TvDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [season, setSeason] = useState<SeasonDetail | null>(null);
  const [similar, setSimilar] = useState<RailEntry[]>([]);
  const [playing, setPlaying] = useState<PlayTarget | null>(null);

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

    apiGet<Paged<TitleItem>>(isTv ? `/api/tmdb/tv/${id}/recommendations` : `/api/tmdb/movies/${id}/recommendations`)
      .then((data) => setSimilar(data.results.slice(0, 12).map((it) => ({ item: it, mediaType }))))
      .catch(() => setSimilar([]));
  }, [id, isTv, mediaType]);

  useEffect(() => {
    if (!isTv) return;
    setSeason(null);
    apiGet<SeasonDetail>(`/api/tmdb/tv/${id}/seasons/${seasonNumber}`)
      .then(setSeason)
      .catch(() => setSeason(null));
  }, [id, isTv, seasonNumber]);

  const saved = useMemo(
    () =>
      item
        ? { type: mediaType, id: item.id, title: titleOf(item), poster: item.poster_path, backdrop: item.backdrop_path }
        : null,
    [item, mediaType]
  );

  const inList = item ? isInList(library, mediaType, item.id) : false;
  const backdrop = img(item?.backdrop_path ?? item?.poster_path, "w1280");

  const playMovie = () => {
    if (saved) setPlaying({ ...saved });
  };

  const playEpisode = (ep: Episode) => {
    if (!saved) return;
    setPlaying({
      ...saved,
      season: seasonNumber,
      episode: ep.episode_number,
      label: `S${seasonNumber} · E${ep.episode_number} · ${ep.name}`,
    });
  };

  // Episodio successivo nella stessa stagione, se esiste
  const nextEpisode = useMemo(() => {
    if (!isTv || !playing || playing.episode === undefined || !season) return undefined;
    return season.episodes.find((e) => e.episode_number === playing.episode! + 1);
  }, [isTv, playing, season]);

  const share = async () => {
    if (!item) return;
    try {
      await navigator.share({ title: titleOf(item), text: item.overview });
    } catch {
      // l'utente ha annullato la condivisione
    }
  };

  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const tv = isTv ? (item as TvDetail | null) : null;
  const movie = !isTv ? (item as MovieDetail | null) : null;

  const meta = item
    ? [
        yearOf(item),
        movie?.runtime ? `${movie.runtime} min` : "",
        tv ? `${tv.number_of_seasons} ${tv.number_of_seasons === 1 ? "stagione" : "stagioni"}` : "",
        item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <Page name="detail" className="detail-page">
      <Navbar transparent backLink="Indietro">
        {canShare && item && (
          <NavRight>
            <Link aria-label="Condividi" iconIos="f7:square_arrow_up" iconMd="material:share" onClick={share} />
          </NavRight>
        )}
      </Navbar>

      {error && (
        <Block className="empty-state">
          <h3>Impossibile caricare il titolo</h3>
          <p>{error}</p>
        </Block>
      )}

      {!error && !item && (
        <Block className="empty-state">
          <Preloader />
        </Block>
      )}

      {item && saved && (
        <>
          <div className="detail-hero">{backdrop && <img src={backdrop} alt="" />}</div>

          <Block className="detail-head">
            <h1 className="detail-title">{titleOf(item)}</h1>
            <p className="detail-meta">{meta}</p>
            <div className="detail-actions">
              {!isTv && (
                <Button
                  round
                  fill
                  large
                  text="Riproduci"
                  iconIos="f7:play_fill"
                  iconMd="material:play_arrow"
                  onClick={playMovie}
                />
              )}
              <Button
                round
                tonal
                large
                aria-label={inList ? "Rimuovi dalla mia lista" : "Aggiungi alla mia lista"}
                text={isTv ? (inList ? "Nella mia lista" : "Aggiungi alla lista") : undefined}
                iconIos={inList ? "f7:checkmark" : "f7:plus"}
                iconMd={inList ? "material:check" : "material:add"}
                onClick={() => toggleInList(saved)}
              />
            </div>
            <div className="detail-genres">
              {item.genres?.map((g) => (
                <Chip key={g.id} outline text={g.name} />
              ))}
            </div>
            {item.overview && <p className="detail-overview">{item.overview}</p>}
          </Block>

          {tv && tv.seasons.length > 0 && (
            <>
              <List strong inset dividersIos>
                <ListInput
                  label="Stagione"
                  type="select"
                  value={seasonNumber}
                  onChange={(e: { target: { value: string } }) => setSeasonNumber(Number(e.target.value))}
                >
                  {tv.seasons
                    .filter((s) => s.season_number > 0)
                    .map((s) => (
                      <option key={s.id} value={s.season_number}>
                        {s.name}
                      </option>
                    ))}
                </ListInput>
              </List>

              {!season && (
                <Block className="empty-state">
                  <Preloader />
                </Block>
              )}

              {season && (
                <List mediaList strong inset dividersIos>
                  {season.episodes.map((ep) => {
                    const still = img(ep.still_path, "w342");
                    return (
                      <ListItem
                        key={ep.id}
                        link="#"
                        title={`${ep.episode_number}. ${ep.name}`}
                        text={ep.overview}
                        after={ep.runtime ? `${ep.runtime} min` : undefined}
                        onClick={() => playEpisode(ep)}
                      >
                        {still && <img slot="media" src={still} alt="" width="112" height="63" className="thumb" loading="lazy" />}
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </>
          )}

          <Rail title="Ti potrebbe piacere" entries={similar} />
        </>
      )}

      <PlayerPopup
        target={playing}
        onClose={() => setPlaying(null)}
        onNext={
          nextEpisode
            ? () => {
                playEpisode(nextEpisode);
              }
            : undefined
        }
      />
    </Page>
  );
}
