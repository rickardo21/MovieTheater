import SFIcon from "@bradleyhodges/sfsymbols-react"
import { sfPlayFill } from "@bradleyhodges/sfsymbols";
import { usePopupManager } from "../../../../apps/web/src/store/PopupContext";
import { usePlayerManager, type PlayingVideo } from "../../../../apps/web/src/store/PlayerContext";


export interface PlayButtonProps {
    id?: number;
    item?: any;
    type?: "movie" | "tv";
    title?: string;
    overview?: string;
    posterUrl?: string;
    backdropUrl?: string;
    season?: number;
    episode?: number;
    episodeTitle?: string;
    className?: string;
}

export const PlayButton = ({
    id,
    item,
    type,
    title,
    overview,
    posterUrl,
    backdropUrl,
    season,
    episode,
    episodeTitle,
    className = "w-56 cursor-pointer text-[26px] h-14 rounded-2xl text-white font-semibold gap-4 bg-linear-to-r from-[#ff484b] to-[#ff1e1e] flex items-center justify-center transition-transform hover:brightness-125  active:scale-95",
}: PlayButtonProps) => {
    const { playVideo } = usePlayerManager();
    const { closePopup } = usePopupManager();

    const handlePlay = () => {
        const resolvedId = id ?? item?.id;
        if (!resolvedId) return;

        const resolvedType = type ?? (item?.name && !item?.title ? "tv" : "movie");
        const resolvedTitle = title ?? item?.title ?? item?.name ?? "";
        const resolvedOverview = overview ?? item?.overview ?? "";
        const resolvedPoster =
            posterUrl ??
            (item?.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined);
        const resolvedBackdrop =
            backdropUrl ??
            (item?.backdrop_path
                ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
                : item?.bg
                ? `https://image.tmdb.org/t/p/original${item.bg}`
                : undefined);

        playVideo({
            id: resolvedId,
            type: resolvedType,
            title: resolvedTitle,
            overview: resolvedOverview,
            posterUrl: resolvedPoster,
            backdropUrl: resolvedBackdrop,
            season,
            episode,
            episodeTitle,
            item,
        } as PlayingVideo);

        closePopup();
    };

    return (
        <div onClick={handlePlay} className={className}>
            <SFIcon icon={sfPlayFill} size={26} />
            <span>Watch Now</span>
        </div>
    );
};

export default PlayButton