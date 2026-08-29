import { usePopupManager } from "../store/PopupContext";
import SFIcon from "@bradleyhodges/sfsymbols-react";
import { sfXmark } from "@bradleyhodges/sfsymbols";
// import { sf10ArrowTriangleheadClockwise } from "@bradleyhodges/sfsymbols";
// import { sf10ArrowTriangleheadCounterclockwise } from "@bradleyhodges/sfsymbols";
// import { sfSpeakerWave1 } from "@bradleyhodges/sfsymbols";
// import { sfSpeakerWave2 } from "@bradleyhodges/sfsymbols";
// import { sfSpeakerWave3 } from "@bradleyhodges/sfsymbols";
// import { useState } from "react";

export const GlobalVideoPlayer = () => {
    const { playingVideoId, closeVideo } = usePopupManager();

    if (!playingVideoId) return null;

    // const [isPlaying, setIsPlaying] = useState(true);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            {/* Pulsante di chiusura (Sopra l'overlay) */}
            <div
                className="absolute top-8 right-8 z-[60] cursor-pointer text-white/70 hover:text-white bg-black/50 p-3 rounded-full backdrop-blur-md transition-all hover:scale-105"
                onClick={closeVideo}
            >
                <SFIcon icon={sfXmark} size={28} />
            </div>

            {/* Overlay sfumato per mascherare watermark e pulsanti dell'iframe */}
            {/* <div className="w-full absolute bottom-0 h-[100px] backdrop-blur-3xl left-0 z-100 pointer-events-none">
                {isPlaying ? (
                    <SFIcon className="absolute bottom-4 left-7" color="#FFFFFF" icon={sfPlayFill} size={28} />
                ) : (
                    <SFIcon className="absolute bottom-4 left-7" color="#FFFFFF" icon={sfPauseFill} size={28} />
                )}

                <SFIcon className="absolute bottom-4 left-37" color="#FFFFFF" icon={sf10ArrowTriangleheadClockwise} size={28} />
                <SFIcon className="absolute bottom-4 left-22" color="#FFFFFF" icon={sf10ArrowTriangleheadCounterclockwise} size={28} />

                <SFIcon className="absolute bottom-4 left-52" color="#FFFFFF" icon={sfSpeakerWave3} size={28} />
            </div> */}


            {/* Iframe del video */}
            <iframe
                src={`https://vixsrc.to/movie/${playingVideoId}`}
                className="w-full h-full border-none z-40 relative"
                allowFullScreen
                allow="autoplay; fullscreen"
            ></iframe>
        </div>
    );
};
