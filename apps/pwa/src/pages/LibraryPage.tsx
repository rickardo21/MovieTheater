import { useState } from "react";
import { Page, Navbar, Block, BlockTitle, List, ListItem, ListInput, Button, SwipeoutActions, SwipeoutButton } from "framework7-react";
import PlayerPopup, { type PlayTarget } from "../components/PlayerPopup";
import { defaultApiBase, getApiBase, img, setApiBase, type MediaType } from "../lib/api";
import { removeProgress, useLibrary, type Progress } from "../lib/store";

const label = (p: Progress) =>
  p.type === "tv" && p.season !== undefined && p.episode !== undefined ? `Stagione ${p.season} · Episodio ${p.episode}` : "Film";

const minutesLeft = (p: Progress) => Math.max(1, Math.round((p.duration - p.position) / 60));

export default function LibraryPage() {
  const library = useLibrary();
  const [playing, setPlaying] = useState<PlayTarget | null>(null);
  const [server, setServer] = useState(getApiBase());

  const resume = (p: Progress) =>
    setPlaying({
      type: p.type,
      id: p.id,
      title: p.title,
      poster: p.poster,
      backdrop: p.backdrop,
      season: p.season,
      episode: p.episode,
      label: label(p),
    });

  const saveServer = () => {
    setApiBase(server);
    window.location.reload();
  };

  const resetServer = () => {
    setApiBase("");
    window.location.reload();
  };

  const recent = [...library.progress].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <Page name="library">
      <Navbar large title="Libreria" />

      {recent.length > 0 && (
        <>
          <BlockTitle medium>Continua a guardare</BlockTitle>
          <List mediaList strong inset dividersIos>
            {recent.map((p) => {
              const thumb = img(p.backdrop ?? p.poster, "w342");
              const pct = Math.min(100, Math.round((p.position / p.duration) * 100));
              return (
                <ListItem
                  key={`${p.type}-${p.id}`}
                  swipeout
                  link="#"
                  title={p.title}
                  subtitle={label(p)}
                  text={`${minutesLeft(p)} min rimasti`}
                  onClick={() => resume(p)}
                >
                  {thumb && (
                    <span slot="media" className="resume-thumb">
                      <img src={thumb} alt="" width="112" height="63" loading="lazy" />
                      <span className="resume-bar" style={{ width: `${pct}%` }} />
                    </span>
                  )}
                  <SwipeoutActions right>
                    <SwipeoutButton color="red" onClick={() => removeProgress(p.type as MediaType, p.id)}>
                      Rimuovi
                    </SwipeoutButton>
                  </SwipeoutActions>
                </ListItem>
              );
            })}
          </List>
        </>
      )}

      <BlockTitle medium>La mia lista</BlockTitle>
      {library.list.length === 0 ? (
        <Block className="empty-state">
          <h3>Ancora nulla qui</h3>
          <p>Tocca + su un film o una serie per ritrovarlo in questa lista.</p>
        </Block>
      ) : (
        <List mediaList strong inset dividersIos>
          {library.list.map((t) => {
            const poster = img(t.poster, "w185");
            return (
              <ListItem
                key={`${t.type}-${t.id}`}
                link={`/detail/${t.type}/${t.id}/`}
                title={t.title}
                subtitle={t.type === "movie" ? "Film" : "Serie"}
              >
                {poster && <img slot="media" src={poster} alt="" width="54" height="81" className="thumb" loading="lazy" />}
              </ListItem>
            );
          })}
        </List>
      )}

      <BlockTitle medium>Server</BlockTitle>
      <List strong inset dividersIos>
        <ListInput
          label="Indirizzo"
          type="url"
          placeholder={defaultApiBase}
          value={server}
          clearButton
          onInput={(e: { target: { value: string } }) => setServer(e.target.value)}
        />
      </List>
      <Block className="server-actions">
        <Button round tonal text="Salva" onClick={saveServer} />
        <Button round text="Ripristina" onClick={resetServer} />
      </Block>
      <Block className="footnote">
        Per usare un server sul tuo computer inserisci il suo indirizzo, ad esempio http://192.168.1.20:4000.
      </Block>

      <PlayerPopup target={playing} onClose={() => setPlaying(null)} />
    </Page>
  );
}
