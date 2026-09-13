import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface PlayingVideo {
    type: "movie" | "tv";
    id: number;
    title?: string;
    overview?: string;
    posterUrl?: string;
    backdropUrl?: string;
    season?: number;
    episode?: number;
    episodeTitle?: string;
    item?: any;
}

export interface VideoPlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
}

interface PlayerContextValue {
    playingVideo: PlayingVideo | null;
    playerState: VideoPlayerState;
    playVideo: (video: PlayingVideo) => void;
    closeVideo: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [playingVideo, setPlayingVideo] = useState<PlayingVideo | null>(null);
    const [playerState, setPlayerState] = useState<VideoPlayerState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
    });

    const playVideo = (video: PlayingVideo) => {
        setPlayingVideo(video);
        setPlayerState({ isPlaying: true, currentTime: 0, duration: 0 }); // reset on new video
    };

    const closeVideo = () => {
        setPlayingVideo(null);
        setPlayerState({ isPlaying: false, currentTime: 0, duration: 0 });
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "PLAYER_EVENT") {
                const data = event.data.data;
                if (!data) return;

                console.log(data);
                
                setPlayerState(prev => {
                    const newState = { ...prev };
                    
                    if (data.currentTime !== undefined) newState.currentTime = data.currentTime;
                    if (data.duration !== undefined) newState.duration = data.duration;
                    
                    if (data.event === "play") newState.isPlaying = true;
                    if (data.event === "pause" || data.event === "ended") newState.isPlaying = false;
                    
                    return newState;
                });
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
        <PlayerContext.Provider value={{ playingVideo, playerState, playVideo, closeVideo }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayerManager = (): PlayerContextValue => {
    const ctx = useContext(PlayerContext);
    if (!ctx) {
        throw new Error("usePlayerManager must be used inside <PlayerProvider>");
    }
    return ctx;
};
