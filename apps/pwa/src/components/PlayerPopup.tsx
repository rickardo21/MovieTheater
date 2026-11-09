import { useEffect, useRef, useState } from "react";
import { Popup, View, Page, Navbar, NavRight, Link, Button, Block, Preloader } from "framework7-react";
import Hls from "hls.js";
import { apiGet, type StreamInfo } from "../lib/api";
import { findProgress, removeProgress, saveProgress, type SavedTitle } from "../lib/store";

export interface PlayTarget extends SavedTitle {
  season?: number;
  episode?: number;
  label?: string;
}

const SEEK_SECONDS = 10;
const SAVE_EVERY_MS = 5000;

interface PlayerProps {
  target: PlayTarget;
  onNext?: () => void;
}

function Player({ target, onNext }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSave = useRef(0);
  const nextRef = useRef(onNext);
  nextRef.current = onNext;

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  const { type, id, season, episode } = target;
  const streamPath =
    type === "tv" && season !== undefined && episode !== undefined
      ? `/api/vixsrc/tv/${id}/${season}/${episode}`
      : `/api/vixsrc/movie/${id}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hls: Hls | null = null;
    let cancelled = false;
    setStatus("loading");

    apiGet<StreamInfo>(streamPath)
      .then((data) => {
        if (cancelled) return;
        if (Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(data.masterUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (cancelled) return;
            setStatus("ready");
            video.play().catch(() => undefined);
          });
          hls.on(Hls.Events.ERROR, (_e, err) => {
            if (err.fatal && !cancelled) {
              setStatus("error");
              setMessage("La riproduzione si è interrotta.");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari su iPhone riproduce HLS in modo nativo
          video.src = data.masterUrl;
          setStatus("ready");
          video.play().catch(() => undefined);
        } else {
          setStatus("error");
          setMessage("Questo dispositivo non supporta lo streaming.");
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Sorgente non disponibile.");
      });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [streamPath, attempt]);

  const persist = () => {
    const video = videoRef.current;
    if (!video || !video.duration || video.currentTime < 5) return;
    saveProgress({
      type,
      id,
      title: target.title,
      poster: target.poster,
      backdrop: target.backdrop,
      season,
      episode,
      position: video.currentTime,
      duration: video.duration,
      updatedAt: Date.now(),
    });
  };

  const handleTimeUpdate = () => {
    const now = Date.now();
    if (now - lastSave.current < SAVE_EVERY_MS) return;
    lastSave.current = now;
    persist();
  };

  // Riprende da dove eri arrivato, se mancano ancora più di 30 secondi alla fine
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    const saved = findProgress(type, id, season, episode);
    if (saved && saved.position > 10 && saved.position < video.duration - 30) {
      video.currentTime = saved.position;
    }
  };

  const handleEnded = () => {
    if (nextRef.current) {
      nextRef.current();
    } else {
      removeProgress(type, id);
    }
  };

  const seek = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || Infinity, video.currentTime + delta));
  };

  return (
    <>
      <div className="player">
        <video
          ref={videoRef}
          playsInline
          controls
          onTimeUpdate={handleTimeUpdate}
          onPause={persist}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
        {status !== "ready" && (
          <div className="player-overlay">
            {status === "loading" ? (
              <Preloader color="white" />
            ) : (
              <div className="player-error">
                <p>{message}</p>
                <Button small round tonal text="Riprova" onClick={() => setAttempt((n) => n + 1)} />
              </div>
            )}
          </div>
        )}
      </div>
      <Block className="player-controls">
        <Button small round tonal text={`−${SEEK_SECONDS} s`} onClick={() => seek(-SEEK_SECONDS)} />
        <Button small round tonal text={`+${SEEK_SECONDS} s`} onClick={() => seek(SEEK_SECONDS)} />
        {onNext && <Button small round fill text="Episodio successivo" onClick={onNext} />}
      </Block>
    </>
  );
}

interface PlayerPopupProps {
  target: PlayTarget | null;
  onClose: () => void;
  onNext?: () => void;
}

// Il video si apre in una vista modale a schermo intero con un modo chiaro per uscire (HIG › Modality)
export default function PlayerPopup({ target, onClose, onNext }: PlayerPopupProps) {
  // Si ricorda l'ultimo titolo così il contenuto non sparisce durante l'animazione di chiusura
  const last = useRef<PlayTarget | null>(null);
  if (target) last.current = target;
  const shown = last.current;

  return (
    <Popup className="player-popup theme-dark" opened={target !== null} onPopupClosed={onClose}>
      <View>
        <Page className="player-page">
          <Navbar title={shown?.title ?? ""} subtitle={shown?.label}>
            <NavRight>
              <Link popupClose text="Chiudi" />
            </NavRight>
          </Navbar>
          {target && (
            <Player key={`${target.type}-${target.id}-${target.season ?? 0}-${target.episode ?? 0}`} target={target} onNext={onNext} />
          )}
        </Page>
      </View>
    </Popup>
  );
}
