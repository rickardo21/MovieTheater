// components/VolumeControl.tsx
import { useRef, useState } from "react";
import { SFIcon } from "@bradleyhodges/sfsymbols-react"; // adatta il path

import {
    sfSpeakerSlashFill,
    sfSpeakerFill,
    sfSpeakerWave1Fill,
    sfSpeakerWave2Fill,
    sfSpeakerWave3Fill
} from "@bradleyhodges/sfsymbols";
import { type IconDefinition } from "@bradleyhodges/sfsymbols-types";


type VolumeControlProps = {
    videoRef: React.RefObject<HTMLVideoElement | null>;
};

const VOLUME_ICONS: IconDefinition[] = [
    sfSpeakerSlashFill,
    sfSpeakerFill,
    sfSpeakerWave1Fill,
    sfSpeakerWave2Fill,
    sfSpeakerWave3Fill
];

function getIconForVolume(vol: number): IconDefinition {
    if (vol <= 0.01) return VOLUME_ICONS[0];
    if (vol < 0.33) return VOLUME_ICONS[1];
    if (vol < 0.66) return VOLUME_ICONS[2];
    if (vol < 0.9) return VOLUME_ICONS[3];
    return VOLUME_ICONS[4];
}

export const VolumeControl = ({ videoRef }: VolumeControlProps) => {
    const [volume, setVolume] = useState(videoRef.current?.volume ?? 1);

    const updateVolume = (val: number) => {
        const v = Math.min(1, Math.max(0, val));
        setVolume(v);
        if (videoRef.current) videoRef.current.volume = v;
    };

    const containerRef = useRef<HTMLDivElement | null>(null);
    const dragging = useRef(false);

    const updateFromEvent = (clientX: number) => {
        const rect = containerRef.current!.getBoundingClientRect();
        const ratio = (clientX - rect.left) / rect.width;
        updateVolume(ratio);
    };

    const currentIcon = getIconForVolume(volume);

    return (
        <div
            className="
                absolute top-8 right-25
                 items-center gap-3
                justify-center
                h-10 px-3 rounded-full
                backdrop-blur-3xl w-35
                cursor-pointer text-white
                transition-all
                group group-hover:flex hidden"
        >
            <SFIcon onClick={() => {
                updateVolume(volume > 0 ? 0 : 1)
            }} icon={currentIcon} size={18} />

            {/* Barra custom */}
            <div
                ref={containerRef}
                className="
          relative w-20 h-full
          flex items-center
          cursor-pointer select-none"
                onPointerDown={(e) => {
                    dragging.current = true;
                    (e.target as Element).setPointerCapture(e.pointerId);
                    updateFromEvent(e.clientX);
                }}
                onPointerMove={(e) => {
                    if (!dragging.current) return;
                    updateFromEvent(e.clientX);
                }}
                onPointerUp={(e) => {
                    dragging.current = false;
                    (e.target as Element).releasePointerCapture(e.pointerId);
                }}
                onPointerCancel={() => {
                    dragging.current = false;
                }}
            >
                {/* Sfondo barra */}
                <div className="w-20 flex items-center h-1.5 bg-white/20 rounded-full">
                    <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${(volume * 100).toFixed(2)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};