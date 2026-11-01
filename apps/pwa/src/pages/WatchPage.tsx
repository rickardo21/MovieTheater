import { useEffect, useRef, useState } from "react";
import { Page, Navbar, Link } from "framework7-react";
import Hls from "hls.js";
import { apiGet, type StreamInfo } from "../lib/api";

interface Props {
  f7route: { params: Record<string, string> };
}

const SEEK_SECONDS = 10;

// Riproduzione con lo stesso flusso della web: /api/vixsrc restituisce masterUrl.
// Safari su iPhone riproduce HLS anche senza hls.js, ma usiamo hls.js per coerenza.
export default function WatchPage({ f7route }: Props) {
  const { type, id, season, episode } = f7route.params;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  const streamPath =
    type === "tv" && season && episode
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
          hls.on(Hls.Events.MANIFEST_PARSED, () => !cancelled && setStatus("ready"));
          hls.on(Hls.Events.ERROR, (_e, err) => {
            if (err.fatal) {
              setStatus("error");
              setMessage("Riproduzione interrotta.");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = data.masterUrl;
          setStatus("ready");
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
  }, [streamPath]);

  const seek = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || Infinity, video.currentTime + delta));
  };

  return (
    <Page className="watch-page">
      <Navbar transparent backLink="Indietro" />
      <div className="player">
        <video ref={videoRef} playsInline controls autoPlay />
        {status === "loading" && <p className="player-status">Caricamento…</p>}
        {status === "error" && (
          <div className="player-status">
            <p>{message}</p>
            <Link href="#" back className="button-primary">
              Torna indietro
            </Link>
          </div>
        )}
      </div>
      <div className="player-controls">
        <button type="button" className="chip" onClick={() => seek(-SEEK_SECONDS)}>
          −{SEEK_SECONDS} s
        </button>
        <button type="button" className="chip" onClick={() => seek(SEEK_SECONDS)}>
          +{SEEK_SECONDS} s
        </button>
      </div>
    </Page>
  );
}
