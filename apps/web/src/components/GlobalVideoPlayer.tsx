import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { usePlayerManager } from "../store/PlayerContext";
import { useClient } from "../store/ClientContext";
import { useAuth } from "../store/AuthContext";
import SFIcon from "@bradleyhodges/sfsymbols-react";

import {
    sfPauseFill,
    sfPlayFill,
    sfXmark,
    sfRectangleExpandDiagonal,
    sfSpeakerSlashFill,
    sfSpeakerWave3Fill,
    // sfArrowDownBackwardAndArrowUpForward,
} from "@bradleyhodges/sfsymbols";

const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.1.114:4000";

// const PLAYBACK_RATES = [2.0, 1.5, 1.25, 1.0, 0.75, 0.5];

// ── Animation Variants ─────────────────────────────────────────────────────────

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit:   { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

const bottomBarVariants: Variants = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0,  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
    exit:    { opacity: 0, y: 16, transition: { duration: 0.2,  ease: "easeIn" } },
};

const topBarVariants: Variants = {
    hidden:  { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0,   transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
    exit:    { opacity: 0, y: -12, transition: { duration: 0.2,  ease: "easeIn" } },
};

const dropdownVariants: Variants = {
    hidden:  { opacity: 0, scale: 0.95, y: 8 },
    visible: { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
    exit:    { opacity: 0, scale: 0.95, y: 6, transition: { duration: 0.12, ease: "easeIn" } },
};

// ── Frosted dropdown panel style ───────────────────────────────────────────────

const DROPDOWN_STYLE: React.CSSProperties = {
    background: "rgba(36, 32, 28, 0.88)",
    backdropFilter: "blur(48px) saturate(180%)",
    WebkitBackdropFilter: "blur(48px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.65)",
};

// ── Subtitle / Audio icon SVGs ─────────────────────────────────────────────────

const IconSubtitles = ({ active }: { active: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"
        className={`transition-colors ${active ? "text-white" : "text-white/60 group-hover:text-white"}`}>
        <rect x="2" y="5" width="20" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="5" y="10" width="5" height="2" rx="1"/>
        <rect x="12" y="10" width="7" height="2" rx="1"/>
        <rect x="5" y="14" width="9" height="2" rx="1"/>
        <rect x="16" y="14" width="3" height="2" rx="1"/>
    </svg>
);

const IconAudio = ({ active }: { active: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"
        className={`transition-colors ${active ? "text-white" : "text-white/60 group-hover:text-white"}`}>
        <rect x="3"  y="11" width="3" height="8"  rx="1.5"/>
        <rect x="8"  y="7"  width="3" height="12" rx="1.5"/>
        <rect x="13" y="4"  width="3" height="15" rx="1.5"/>
        <rect x="18" y="8"  width="3" height="11" rx="1.5"/>
    </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export const GlobalVideoPlayer = () => {
    const { playingVideo, closeVideo, playVideo } = usePlayerManager();
    const client = useClient();
    const { saveWatchProgress, watchHistory } = useAuth();

    const containerRef         = useRef<HTMLDivElement | null>(null);
    const videoRef             = useRef<HTMLVideoElement | null>(null);
    const hlsRef               = useRef<Hls | null>(null);
    const hideControlsTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pauseTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
    const playActionTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
    const anyMenuOpenRef       = useRef(false);
    const isDraggingRef        = useRef(false);
    const lastSavedTimeRef     = useRef(0);

    // Playback
    const [isPlaying,    setIsPlaying]    = useState(false);
    const [playAction,   setPlayAction]   = useState<"play" | "pause" | null>(null);
    const [currentTime,  setCurrentTime]  = useState(0);
    const [duration,     setDuration]     = useState(0);
    const [isMuted,      setIsMuted]      = useState(false);
    const [volume,       setVolume]       = useState(1);

    // HLS tracks
    const [qualities,       setQualities]       = useState<{ label: string; level: number }[]>([]);
    const [currentLevel,    setCurrentLevel]    = useState<number>(-1);

    // Active tab state
    const [activeTab, setActiveTab] = useState<"info" | "upnext" | "recommended" | null>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [nextEpisode,     setNextEpisode]     = useState<any | null>(null);
    const [tabLoading,      setTabLoading]      = useState(false);

    const [audioTracks,     setAudioTracks]     = useState<{ name: string; lang: string; index: number }[]>([]);
    const [currentAudio,    setCurrentAudio]    = useState<number>(0);
    const [subtitleTracks,  setSubtitleTracks]  = useState<{ name: string; lang: string; index: number }[]>([]);
    const [currentSubtitle, setCurrentSubtitle] = useState<number>(-1);

    // Player state
    // const [playbackRate,    setPlaybackRate]    = useState(1.0);
    const [error,           setError]           = useState<string | null>(null);
    const [loading,         setLoading]         = useState(true);
    const [showControls,    setShowControls]    = useState(true);
    const [isFullscreen,    setIsFullscreen]    = useState(false);

    // Dropdowns
    const [showSpeedMenu,     setShowSpeedMenu]     = useState(false);
    const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
    const [showAudioMenu,     setShowAudioMenu]     = useState(false);
    const [showQualityMenu,   setShowQualityMenu]   = useState(false);

    // Keep ref in sync
    useEffect(() => {
        anyMenuOpenRef.current = showSpeedMenu || showSubtitlesMenu || showAudioMenu || showQualityMenu || activeTab !== null;
    }, [showSpeedMenu, showSubtitlesMenu, showAudioMenu, showQualityMenu, activeTab]);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const closeAllMenus = useCallback(() => {
        setShowSpeedMenu(false);
        setShowSubtitlesMenu(false);
        setShowAudioMenu(false);
        setShowQualityMenu(false);
        setActiveTab(null);
    }, []);

    const resetHideControlsTimer = useCallback(() => {
        if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
        setShowControls(true);
        if (videoRef.current && !videoRef.current.paused) {
            hideControlsTimeout.current = setTimeout(() => {
                if (!anyMenuOpenRef.current) setShowControls(false);
            }, 4000);
        }
    }, []);

    const handleUserActivity = useCallback(() => {
        if (pauseTimerRef.current) {
            clearTimeout(pauseTimerRef.current);
            pauseTimerRef.current = setTimeout(() => {
                if (videoRef.current?.paused) { /* cinematic pause if needed */ }
            }, 10000);
        }
        resetHideControlsTimer();
    }, [resetHideControlsTimer]);

    const togglePlay = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        if (playActionTimerRef.current) clearTimeout(playActionTimerRef.current);
        if (v.paused) {
            v.play().catch(() => {});
            setIsPlaying(true);
            setPlayAction("play");
        } else {
            v.pause();
            setIsPlaying(false);
            setPlayAction("pause");
        }
        playActionTimerRef.current = setTimeout(() => setPlayAction(null), 700);
        resetHideControlsTimer();
    }, [resetHideControlsTimer]);

    const skipTime = useCallback((amount: number) => {
        const v = videoRef.current;
        if (!v) return;
        const newTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + amount));
        v.currentTime = newTime;
        setCurrentTime(newTime);
        resetHideControlsTimer();
    }, [resetHideControlsTimer]);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch {}
    }, []);

    const toggleMute = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        if (isMuted || volume === 0) {
            const restored = volume === 0 ? 0.8 : volume;
            setVolume(restored);
            setIsMuted(false);
            v.muted = false;
            v.volume = restored;
        } else {
            setIsMuted(true);
            v.muted = true;
        }
    }, [isMuted, volume]);

    // const changePlaybackRate = (rate: number) => {
    //     if (videoRef.current) videoRef.current.playbackRate = rate;
    //     setPlaybackRate(rate);
    //     setShowSpeedMenu(false);
    // };

    const changeSubtitle = (index: number) => {
        const hls = hlsRef.current;
        if (hls) hls.subtitleTrack = index;
        setCurrentSubtitle(index);
        setShowSubtitlesMenu(false);
    };

    const changeAudio = (index: number) => {
        const hls = hlsRef.current;
        if (hls) hls.audioTrack = index;
        setCurrentAudio(index);
        setShowAudioMenu(false);
    };

    const changeQuality = (level: number) => {
        const hls = hlsRef.current;
        if (hls) hls.currentLevel = level;
        setCurrentLevel(level);
        setShowQualityMenu(false);
    };

    // ── HLS init ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!playingVideo || !videoRef.current) return;

        let cancelled = false;
        let hls: Hls | null = null;

        const init = async () => {
            try {
                setLoading(true);
                setError(null);
                setShowControls(true);
                setCurrentTime(0);
                setDuration(0);
                closeAllMenus();

                const url = playingVideo.type === "movie"
                    ? `${API_BASE}/api/vixsrc/movie/${playingVideo.id}`
                    : `${API_BASE}/api/vixsrc/tv/${playingVideo.id}/${playingVideo.season}/${playingVideo.episode}`;

                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const masterUrl: string = data.masterUrl;
                const video = videoRef.current!;

                if (Hls.isSupported()) {
                    hls = new Hls({ debug: false });
                    hlsRef.current = hls;
                    hls.loadSource(masterUrl);
                    hls.attachMedia(video);

                    hls.once(Hls.Events.MANIFEST_PARSED, () => {
                        if (cancelled || !hls) return;

                        // Quality levels — default to highest
                        const levels = hls.levels.map((lvl: Hls["levels"][number], idx: number) => ({
                            label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}kbps`,
                            level: idx,
                        }));
                        setQualities([{ label: "Auto", level: -1 }, ...levels]);
                        const highest = hls.levels.length - 1;
                        hls.currentLevel = highest;
                        setCurrentLevel(highest);

                        // Audio tracks
                        const tracks = hls.audioTracks.map((t: Hls["audioTracks"][number], idx: number) => ({
                            name: t.name,
                            lang: t.lang || "",
                            index: idx,
                        }));
                        setAudioTracks(tracks);
                        setCurrentAudio(hls.audioTrack);

                        // Subtitle tracks
                        const subs = hls.subtitleTracks.map((t: Hls["subtitleTracks"][number], idx: number) => ({
                            name: t.name,
                            lang: t.lang || "",
                            index: idx,
                        }));
                        setSubtitleTracks(subs);
                        setCurrentSubtitle(-1); // off by default

                        // ── Restore saved watch progress ──────────────────
                        const savedItem = watchHistory.find(
                            (h) => String(h.id) === String(playingVideo.id)
                        );
                        if (
                            savedItem &&
                            savedItem.progressSeconds > 5 &&
                            savedItem.durationSeconds > 0 &&
                            savedItem.progressSeconds / savedItem.durationSeconds < 0.95
                        ) {
                            video.currentTime = savedItem.progressSeconds;
                        }
                        // ─────────────────────────────────────────────────

                        video.play().catch(() => {});
                        setIsPlaying(true);
                        setLoading(false);
                        resetHideControlsTimer();
                    });

                    hls.on(Hls.Events.ERROR, (_: string, err: { fatal: boolean }) => {
                        if (err.fatal && !cancelled) {
                            setError("Errore durante il caricamento dello stream");
                            setLoading(false);
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = masterUrl;
                    video.addEventListener("loadedmetadata", () => {
                        if (!cancelled) {
                            // ── Restore saved watch progress ──────────────
                            const savedItem = watchHistory.find(
                                (h) => String(h.id) === String(playingVideo.id)
                            );
                            if (
                                savedItem &&
                                savedItem.progressSeconds > 5 &&
                                savedItem.durationSeconds > 0 &&
                                savedItem.progressSeconds / savedItem.durationSeconds < 0.95
                            ) {
                                video.currentTime = savedItem.progressSeconds;
                            }
                            // ─────────────────────────────────────────────
                            video.play().catch(() => {});
                            setIsPlaying(true);
                            setLoading(false);
                            resetHideControlsTimer();
                        }
                    });
                } else {
                    setError("HLS non supportato dal browser");
                    setLoading(false);
                }
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : "Errore sconosciuto");
                    setLoading(false);
                }
            }
        };

        init();
        return () => {
            cancelled = true;
            if (hls) { hls.destroy(); hlsRef.current = null; }
        };
    }, [playingVideo, resetHideControlsTimer, closeAllMenus]);

    // ── Video Events ──────────────────────────────────────────────────────────
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay    = () => { setIsPlaying(true); if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); resetHideControlsTimer(); };
        const onPause   = () => { setIsPlaying(false); setShowControls(true); };
        const onTime    = () => setCurrentTime(video.currentTime);
        const onDur     = () => setDuration(video.duration);
        const onVolume  = () => { setVolume(video.volume); setIsMuted(video.muted); };

        video.addEventListener("play",           onPlay);
        video.addEventListener("pause",          onPause);
        video.addEventListener("timeupdate",     onTime);
        video.addEventListener("durationchange", onDur);
        video.addEventListener("volumechange",   onVolume);

        return () => {
            video.removeEventListener("play",           onPlay);
            video.removeEventListener("pause",          onPause);
            video.removeEventListener("timeupdate",     onTime);
            video.removeEventListener("durationchange", onDur);
            video.removeEventListener("volumechange",   onVolume);
            if (pauseTimerRef.current)       clearTimeout(pauseTimerRef.current);
            if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
        };
    }, [playingVideo, resetHideControlsTimer]);

    // ── Save Watch Progress ───────────────────────────────────────────────────
    useEffect(() => {
        if (!playingVideo) return;

        const interval = setInterval(() => {
            if (videoRef.current && !videoRef.current.paused && videoRef.current.duration > 0) {
                const cur = videoRef.current.currentTime;
                const dur = videoRef.current.duration;
                if (Math.abs(cur - lastSavedTimeRef.current) > 3) {
                    lastSavedTimeRef.current = cur;
                    saveWatchProgress(playingVideo, playingVideo.type, cur, dur, {
                        season: (playingVideo as any).season,
                        episode: (playingVideo as any).episode,
                        episodeTitle: (playingVideo as any).episodeTitle
                    });
                }
            }
        }, 4000);

        return () => {
            clearInterval(interval);
            if (videoRef.current && videoRef.current.duration > 0) {
                saveWatchProgress(playingVideo, playingVideo.type, videoRef.current.currentTime, videoRef.current.duration, {
                    season: (playingVideo as any).season,
                    episode: (playingVideo as any).episode,
                    episodeTitle: (playingVideo as any).episodeTitle
                });
            }
        };
    }, [playingVideo, saveWatchProgress]);

    // ── Keyboard ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!playingVideo) return;
            if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;
            handleUserActivity();
            switch (e.key.toLowerCase()) {
                case " ": case "k": e.preventDefault(); togglePlay(); break;
                case "arrowleft": case "j": e.preventDefault(); skipTime(-10); break;
                case "arrowright": case "l": e.preventDefault(); skipTime(10); break;
                case "f": e.preventDefault(); toggleFullscreen(); break;
                case "m": e.preventDefault(); toggleMute(); break;
                case "escape":
                    if (!document.fullscreenElement) closeVideo();
                    else closeAllMenus();
                    break;
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [playingVideo, togglePlay, skipTime, toggleFullscreen, closeVideo, handleUserActivity, toggleMute, closeAllMenus]);

    // ── Tab content fetch ──────────────────────────────────────────────────────
    const fetchRecommendations = useCallback(async () => {
        if (!playingVideo) return;
        setTabLoading(true);
        try {
            if (playingVideo.type === "movie") {
                const resp = await client.movies.getRecommendations(playingVideo.id);
                setRecommendations(resp?.results?.slice(0, 10) ?? []);
            } else {
                const resp = await client.tv.getRecommendations?.(playingVideo.id);
                setRecommendations(resp?.results?.slice(0, 10) ?? []);
            }
        } catch { setRecommendations([]); }
        finally { setTabLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playingVideo]);

    const fetchNextEpisode = useCallback(async () => {
        if (!playingVideo || playingVideo.type !== "tv") return;
        setTabLoading(true);
        setNextEpisode(null);
        try {
            const season = await client.tv.getSeason(playingVideo.id, (playingVideo as any).season ?? 1);
            const currentIdx = season?.episodes?.findIndex((ep: any) => ep.episode_number === (playingVideo as any).episode);
            if (currentIdx !== undefined && currentIdx !== -1 && currentIdx + 1 < season.episodes.length) {
                setNextEpisode(season.episodes[currentIdx + 1]);
            } else {
                // Try first episode of next season
                const nextSeason = await client.tv.getSeason(playingVideo.id, ((playingVideo as any).season ?? 1) + 1).catch(() => null);
                if (nextSeason?.episodes?.length > 0) {
                    setNextEpisode({ ...nextSeason.episodes[0], _nextSeason: true });
                }
            }
        } catch { setNextEpisode(null); }
        finally { setTabLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playingVideo]);

    // Fetch when tab changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (activeTab === "recommended") fetchRecommendations();
        if (activeTab === "upnext")      fetchNextEpisode();
    }, [activeTab]);

    if (!playingVideo) return null;

    // ── Formatting ────────────────────────────────────────────────────────────
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    const formatTime = (sec: number) => {
        if (!sec || isNaN(sec)) return "0:00";
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    const remainingSec       = Math.max(0, Math.floor(duration - currentTime));
    const remainingFormatted = `-${formatTime(remainingSec)}`;

    const showTitle    = playingVideo.title ?? "";
    const isTV         = playingVideo.type === "tv";
    
    let episodeTitle = (playingVideo as any).episodeTitle ?? "";
    if (isTV) {
        episodeTitle = `${episodeTitle} S${(playingVideo as any).season} E${(playingVideo as any).episode}`;
    }

    const qualityLabel = qualities.find(q => q.level === currentLevel)?.label ?? "Auto";
    const areControlsVisible = showControls && !loading && !error;

    // ── Scrub bar handlers ────────────────────────────────────────────────────
    const handleScrubStart = (e: React.MouseEvent<HTMLDivElement>) => {
        isDraggingRef.current = true;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newTime = ratio * duration;
        if (videoRef.current) videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        resetHideControlsTimer();
    };

    const handleScrubMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newTime = ratio * duration;
        if (videoRef.current) videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleScrubEnd = () => { isDraggingRef.current = false; };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onMouseMove={handleUserActivity}
            onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === "VIDEO" || target === containerRef.current) {
                    togglePlay();
                    closeAllMenus();
                } else {
                    handleUserActivity();
                }
            }}
            className={`fixed inset-0 z-2000 flex items-center justify-center bg-black select-none overflow-hidden ${areControlsVisible ? "cursor-default" : "cursor-none"}`}
        >
            {/* ── Video ── */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain bg-black"
                style={{ display: error ? "none" : "block" }}
                playsInline
            />

            {/* ── Loading ── */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        key="loading"
                        variants={overlayVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md z-30"
                    >
                        <div className="w-11 h-11 border-[2.5px] border-white/20 border-t-white rounded-full animate-spin mb-4" />
                        <span className="text-white/70 text-xs tracking-[0.22em] uppercase font-light animate-pulse">
                            Caricamento in corso…
                        </span>
                    </motion.div>
                )}

                {/* ── Error ── */}
                {error && (
                    <motion.div
                        key="error"
                        variants={overlayVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl z-30 px-6 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 text-2xl">!</div>
                        <h2 className="text-white text-xl font-semibold mb-2">Errore di riproduzione</h2>
                        <p className="text-white/60 text-sm max-w-sm mb-6">{error}</p>
                        <button
                            onClick={closeVideo}
                            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                        >
                            Chiudi Player
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Center play/pause flash ── */}
            <AnimatePresence>
                {playAction && (
                    <motion.div
                        key={playAction}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.4 }}
                        transition={{ duration: 0.22 }}
                        className="absolute z-40 w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none"
                    >
                        <SFIcon icon={playAction === "play" ? sfPlayFill : sfPauseFill} size={36} className="text-white" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Controls overlay ── */}
            <AnimatePresence>
                {areControlsVisible && (
                    <motion.div
                        key="controls"
                        variants={overlayVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="absolute inset-0 z-20 pointer-events-none"
                        onClick={(e) => {
                            if ((e.target as HTMLElement) === e.currentTarget) {
                                togglePlay(); closeAllMenus();
                            }
                        }}
                    >
                        {/* Top gradient */}
                        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-transparent pointer-events-none" />
                        {/* Bottom gradient */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

                        {/* ── Top bar: PiP + Close ── */}
                        <motion.div
                            variants={topBarVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="absolute top-0 left-0 right-0 px-10 pt-7 pb-4 flex items-center justify-end gap-3 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Fullscreen button */}
                            <button
                                title={isFullscreen ? "Esci da Schermo Intero" : "Schermo Intero"}
                                onClick={toggleFullscreen}
                                className="w-9 h-9 rounded-full bg-white/12 hover:bg-white/24 flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
                            >
                                <SFIcon icon={sfRectangleExpandDiagonal} size={15} className="text-white" />
                            </button>
                            {/* Close button */}
                            <button
                                onClick={closeVideo}
                                className="w-9 h-9 rounded-full bg-white/12 hover:bg-white/24 flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
                            >
                                <SFIcon icon={sfXmark} size={13} className="text-white" />
                            </button>
                        </motion.div>

                        {/* ── Bottom bar ── */}
                        <motion.div
                            variants={bottomBarVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="absolute bottom-0 left-0 right-0 px-10 pb-8 pt-6 flex flex-col gap-3 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >

                            {/* Row 1: Series title + Episode title */}
                            <div className="flex flex-col">
                                {isTV && showTitle && (
                                    <span className="text-white/50 text-sm font-medium tracking-wide">
                                        {showTitle}
                                    </span>
                                )}
                                <h2 className="text-white text-[1.65rem] font-bold leading-tight">
                                    {isTV ? (episodeTitle || showTitle) : showTitle}
                                </h2>
                            </div>

                            {/* Row 2: Progress bar */}
                            <div className="flex flex-col gap-1.5">
                                {/* Track */}
                                <div
                                    className="relative h-1 hover:h-2.5 transition-all duration-150 rounded-full bg-white/22 cursor-pointer group"
                                    onMouseDown={handleScrubStart}
                                    onMouseMove={handleScrubMove}
                                    onMouseUp={handleScrubEnd}
                                    onMouseLeave={handleScrubEnd}
                                >
                                    {/* Fill */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-white rounded-full"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                    {/* Thumb */}
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ left: `calc(${progressPercent}% - 7px)` }}
                                    />
                                </div>
                                {/* Timestamps */}
                                <div className="flex justify-between text-white/50 text-xs font-medium tabular-nums">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{duration > 0 ? remainingFormatted : ""}</span>
                                </div>
                            </div>

                            {/* ── Tab content panel ── */}
                            <motion.div
                                animate={{ height: activeTab ? 112 : 0, opacity: activeTab ? 1 : 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col justify-end overflow-hidden"
                            >
                                <AnimatePresence mode="wait">
                                    {/* INFO */}
                                    {activeTab === "info" && (
                                        <motion.div
                                            key="info"
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex flex-col gap-1.5"
                                        >
                                            {(playingVideo as any).overview && (
                                                <p className="text-white/70 text-sm leading-relaxed max-w-2xl line-clamp-3">
                                                    {(playingVideo as any).overview}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* UP NEXT */}
                                    {activeTab === "upnext" && (
                                        <motion.div
                                            key="upnext"
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center gap-4"
                                        >
                                            {tabLoading && (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            )}
                                            {!tabLoading && nextEpisode && (
                                                <>
                                                    {nextEpisode.still_path && (
                                                        <div
                                                            className="w-32 h-18 rounded-xl overflow-hidden shrink-0 bg-white/10"
                                                            style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w300${nextEpisode.still_path})`, backgroundSize: "cover", backgroundPosition: "center", height: 72 }}
                                                        />
                                                    )}
                                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                        <span className="text-white text-sm font-semibold truncate">
                                                            {nextEpisode.name} S{nextEpisode._nextSeason ? ((playingVideo as any).season ?? 1) + 1 : (playingVideo as any).season} E{nextEpisode.episode_number}
                                                        </span>
                                                        <p className="text-white/55 text-xs line-clamp-1">{nextEpisode.overview}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            playVideo({
                                                                type: "tv",
                                                                id: playingVideo.id,
                                                                title: playingVideo.title,
                                                                season: nextEpisode._nextSeason ? ((playingVideo as any).season ?? 1) + 1 : (playingVideo as any).season,
                                                                episode: nextEpisode.episode_number,
                                                                episodeTitle: nextEpisode.name,
                                                                overview: nextEpisode.overview,
                                                                backdropUrl: nextEpisode.still_path ? `https://image.tmdb.org/t/p/original${nextEpisode.still_path}` : undefined,
                                                                item: (playingVideo as any).item,
                                                            } as any);
                                                        }}
                                                        className="flex items-center justify-center px-4 py-2 rounded-full bg-white text-black text-xs font-bold shrink-0 hover:bg-white/90 transition-colors"
                                                    >
                                                        Guarda
                                                    </button>
                                                </>
                                            )}
                                            {!tabLoading && !nextEpisode && isTV && (
                                                <span className="text-white/40 text-sm">Nessun episodio successivo disponibile</span>
                                            )}
                                            {!isTV && (
                                                <span className="text-white/40 text-sm">Non disponibile per i film</span>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* RECOMMENDED */}
                                    {activeTab === "recommended" && (
                                        <motion.div
                                            key="recommended"
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide w-full"
                                        >
                                            {tabLoading && (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            )}
                                            {!tabLoading && recommendations.length === 0 && (
                                                <span className="text-white/40 text-sm">Nessun contenuto consigliato</span>
                                            )}
                                            {!tabLoading && recommendations.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    className="shrink-0 w-28 flex flex-col gap-1 cursor-pointer group"
                                                >
                                                    <div
                                                        className="w-28 h-16 rounded-lg overflow-hidden bg-white/10 group-hover:scale-105 transition-transform duration-200"
                                                        style={{
                                                            backgroundImage: item.backdrop_path ? `url(https://image.tmdb.org/t/p/w300${item.backdrop_path})` : undefined,
                                                            backgroundSize: "cover",
                                                            backgroundPosition: "center",
                                                        }}
                                                    />
                                                    <span className="text-white/70 text-[11px] font-medium truncate group-hover:text-white transition-colors">
                                                        {item.title || item.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Row 3: Playback controls + icon toolbar */}
                            <div className="flex items-center justify-between pt-1">

                                {/* Left: Play + Tabs */}
                                <div className="flex items-center gap-6">
                                    <button onClick={togglePlay}
                                        className="text-white hover:text-white/80 transition-colors mr-2">
                                        <SFIcon icon={isPlaying ? sfPauseFill : sfPlayFill} size={30} className="text-inherit" />
                                    </button>

                                    <div className="flex items-center gap-6">
                                        {([
                                            { id: "info",        label: "Info" },
                                            isTV ? { id: "upnext", label: "Prossimo episodio" } : null,
                                            { id: "recommended", label: "Consigliati" },
                                        ].filter(Boolean) as { id: "info"|"upnext"|"recommended"; label: string }[]).map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(prev => prev === tab.id ? null : tab.id)}
                                                className={`text-sm font-semibold transition-colors ${
                                                    activeTab === tab.id ? "text-white" : "text-white/45 hover:text-white/70"
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: icon toolbar */}
                                <div className="flex items-center gap-5">

                                    {/* ── Subtitles ── */}
                                    {subtitleTracks.length > 0 && (
                                        <div className="relative group">
                                            <AnimatePresence>
                                                {showSubtitlesMenu && (
                                                    <motion.div
                                                        variants={dropdownVariants}
                                                        initial="hidden" animate="visible" exit="exit"
                                                        style={DROPDOWN_STYLE}
                                                        className="absolute bottom-10 right-0 min-w-56 rounded-2xl overflow-hidden z-50"
                                                    >
                                                        <div className="px-4 py-2.5 border-b border-white/8">
                                                            <span className="text-white/45 text-[10px] font-semibold uppercase tracking-widest">Sottotitoli</span>
                                                        </div>
                                                        {/* Off option */}
                                                        <button onClick={() => changeSubtitle(-1)}
                                                            className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/8 ${currentSubtitle === -1 ? "text-white font-semibold" : "text-white/75 font-medium"}`}>
                                                            <span>Off</span>
                                                            {currentSubtitle === -1 && <span className="text-white/90 text-base">✓</span>}
                                                        </button>
                                                        {subtitleTracks.map((s) => (
                                                            <button
                                                                key={s.index}
                                                                onClick={() => changeSubtitle(s.index)}
                                                                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/8 ${currentSubtitle === s.index ? "text-white font-semibold" : "text-white/75 font-medium"}`}
                                                            >
                                                                <span>{s.name || s.lang}</span>
                                                                {currentSubtitle === s.index && <span className="text-white/90 text-base">✓</span>}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <button
                                                onClick={() => { setShowSubtitlesMenu(v => !v); setShowSpeedMenu(false); setShowAudioMenu(false); setShowQualityMenu(false); }}
                                                className="flex items-center justify-center"
                                            >
                                                <IconSubtitles active={showSubtitlesMenu || currentSubtitle !== -1} />
                                            </button>
                                        </div>
                                    )}

                                    {/* ── Audio tracks ── */}
                                    {audioTracks.length > 1 && (
                                        <div className="relative group">
                                            <AnimatePresence>
                                                {showAudioMenu && (
                                                    <motion.div
                                                        variants={dropdownVariants}
                                                        initial="hidden" animate="visible" exit="exit"
                                                        style={DROPDOWN_STYLE}
                                                        className="absolute bottom-10 right-0 min-w-52 rounded-2xl overflow-hidden z-50"
                                                    >
                                                        <div className="px-4 py-2.5 border-b border-white/8">
                                                            <span className="text-white/45 text-[10px] font-semibold uppercase tracking-widest">Lingua Audio</span>
                                                        </div>
                                                        {audioTracks.map((t) => (
                                                            <button
                                                                key={t.index}
                                                                onClick={() => changeAudio(t.index)}
                                                                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/8 ${currentAudio === t.index ? "text-white font-semibold" : "text-white/75 font-medium"}`}
                                                            >
                                                                <span>{t.name || t.lang}</span>
                                                                {currentAudio === t.index && <span className="text-white/90 text-base">✓</span>}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <button
                                                onClick={() => { setShowAudioMenu(v => !v); setShowSpeedMenu(false); setShowSubtitlesMenu(false); setShowQualityMenu(false); }}
                                                className="flex items-center justify-center"
                                            >
                                                <IconAudio active={showAudioMenu} />
                                            </button>
                                        </div>
                                    )}

                                    {/* ── Quality ── */}
                                    {qualities.length > 1 && (
                                        <div className="relative">
                                            <AnimatePresence>
                                                {showQualityMenu && (
                                                    <motion.div
                                                        variants={dropdownVariants}
                                                        initial="hidden" animate="visible" exit="exit"
                                                        style={DROPDOWN_STYLE}
                                                        className="absolute bottom-10 right-0 min-w-40 rounded-2xl overflow-hidden z-50"
                                                    >
                                                        <div className="px-4 py-2.5 border-b border-white/8">
                                                            <span className="text-white/45 text-[10px] font-semibold uppercase tracking-widest">Qualità</span>
                                                        </div>
                                                        {qualities.map((q) => (
                                                            <button
                                                                key={q.level}
                                                                onClick={() => changeQuality(q.level)}
                                                                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/8 ${currentLevel === q.level ? "text-white font-semibold" : "text-white/75 font-medium"}`}
                                                            >
                                                                <span>{q.label}</span>
                                                                {currentLevel === q.level && <span className="text-white/90 text-base">✓</span>}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <button
                                                onClick={() => { setShowQualityMenu(v => !v); setShowSpeedMenu(false); setShowSubtitlesMenu(false); setShowAudioMenu(false); }}
                                                className={`text-sm font-semibold tabular-nums transition-colors ${showQualityMenu ? "text-white" : "text-white/60 hover:text-white"}`}
                                            >
                                                {qualityLabel}
                                            </button>
                                        </div>
                                    )}

                                    {/* ── Playback speed ── */}
                                    {/* <div className="relative">
                                        <AnimatePresence>
                                            {showSpeedMenu && (
                                                <motion.div
                                                    variants={dropdownVariants}
                                                    initial="hidden" animate="visible" exit="exit"
                                                    style={DROPDOWN_STYLE}
                                                    className="absolute bottom-10 right-0 min-w-36 rounded-2xl overflow-hidden z-50"
                                                >
                                                    {PLAYBACK_RATES.map((rate) => (
                                                        <button
                                                            key={rate}
                                                            onClick={() => changePlaybackRate(rate)}
                                                            className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/8 ${playbackRate === rate ? "text-white font-semibold" : "text-white/75 font-medium"}`}
                                                        >
                                                            <span>{rate === 1.0 ? "Normale" : `${rate}×`}</span>
                                                            {playbackRate === rate && <span className="text-white/90 text-base">✓</span>}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <button
                                            onClick={() => { setShowSpeedMenu(v => !v); setShowSubtitlesMenu(false); setShowAudioMenu(false); setShowQualityMenu(false); }}
                                            className={`text-sm font-semibold tabular-nums transition-colors ${showSpeedMenu ? "text-white" : "text-white/60 hover:text-white"}`}
                                        >
                                            {playbackRate === 1.0 ? "1×" : `${playbackRate}×`}
                                        </button>
                                    </div> */}

                                    {/* ── Volume ── */}
                                    <button onClick={toggleMute}
                                        className="text-white/60 hover:text-white transition-colors">
                                        <SFIcon icon={isMuted ? sfSpeakerSlashFill : sfSpeakerWave3Fill} size={20} className="text-inherit" />
                                    </button>

                                    {/* ── Fullscreen ── */}
                                    <button onClick={toggleFullscreen}
                                        className="text-white/60 hover:text-white transition-colors">
                                        <SFIcon
                                            // icon={isFullscreen ? sfArrowDownBackwardAndArrowUpForward : sfRectangleExpandDiagonal}
                                            icon={sfRectangleExpandDiagonal}
                                            size={18}
                                            className="text-inherit"
                                        />
                                    </button>

                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};