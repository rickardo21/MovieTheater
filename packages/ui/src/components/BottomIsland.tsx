import '../shared.css';
import {
  sfPlayFill,
  sfPauseFill,
  sfBackwardFrameFill,
  sfForwardFrameFill,
  sfXmark,
  sfSpeakerWave3Fill,
  sfSpeakerWave2Fill,
  sfSpeakerSlashFill,
} from "@bradleyhodges/sfsymbols";
import { SFIcon } from '@bradleyhodges/sfsymbols-react';
import React from 'react';

interface BottomIslandProps {
  title?: string;
  description?: string;
  posterUrl?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onClose?: () => void;
  currentTimeStr?: string;
  durationStr?: string;
  progressPercentage?: number; // 0 to 100
  onForward?: () => void;
  onRewind?: () => void;
  volume?: number; // 0 to 1
  onToggleMute?: () => void;
  isMuted?: boolean;
}

export const BottomIsland: React.FC<BottomIslandProps> = ({
  title = 'Titolo',
  description = 'Descrizione',
  posterUrl,
  isPlaying = false,
  onTogglePlay,
  onClose,
  currentTimeStr = '00:00',
  durationStr = '00:00',
  progressPercentage = 0,
  onForward,
  onRewind,
  volume = 1,
  onToggleMute,
  isMuted = false,
}) => {
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return sfSpeakerSlashFill;
    if (volume < 0.4) return sfSpeakerWave2Fill;
    return sfSpeakerWave3Fill;
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 animate-fade-in">
      {/* Premium Apple TV style Player HUD container */}
      <div className="relative w-full h-18 rounded-2xl tvos-glass shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 flex items-center justify-between px-6 select-none">
        
        {/* Left: Poster & Meta */}
        <div className="flex items-center gap-3.5 w-1/3 min-w-0">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-12 h-8 object-cover rounded-lg border border-white/10 shadow-md shrink-0"
            />
          ) : (
            <div className="w-12 h-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center shrink-0">
              <span className="text-[8px] text-zinc-500">HD</span>
            </div>
          )}
          <div className="flex flex-col text-left min-w-0">
            <span className="text-white text-xs font-extrabold truncate apple-body tracking-tight">
              {title}
            </span>
            <span className="text-white/40 text-[10px] truncate apple-body">
              {description}
            </span>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center justify-center gap-4 w-1/3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-white/10 active:bg-white/20 rounded-full transition outline-none focus:bg-white/15"
            >
              <SFIcon icon={sfXmark} className="h-4 w-4" color="#ffffff" />
            </button>
          )}

          {onRewind && (
            <button
              onClick={onRewind}
              className="p-2 cursor-pointer hover:bg-white/10 active:bg-white/20 rounded-full transition outline-none focus:bg-white/15"
            >
              <SFIcon icon={sfBackwardFrameFill} className="h-4 w-4" color="#ffffff" />
            </button>
          )}

          <button
            onClick={onTogglePlay}
            className="flex cursor-pointer bg-white text-black w-10 h-10 rounded-full items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,255,255,0.2)] outline-none focus:ring-4 focus:ring-white/30"
          >
            {isPlaying ? (
              <SFIcon icon={sfPauseFill} className="h-4 w-4" color="#000000" />
            ) : (
              <SFIcon icon={sfPlayFill} className="h-4 w-4" color="#000000" />
            )}
          </button>

          {onForward && (
            <button
              onClick={onForward}
              className="p-2 cursor-pointer hover:bg-white/10 active:bg-white/20 rounded-full transition outline-none focus:bg-white/15"
            >
              <SFIcon icon={sfForwardFrameFill} className="h-4 w-4" color="#ffffff" />
            </button>
          )}
        </div>

        {/* Right: Progress Timeline & Audio */}
        <div className="flex items-center justify-end gap-5 w-1/3">
          {/* Progress Time & Slider HUD */}
          <div className="flex flex-col items-end gap-1.5 select-none w-28">
            <span className="text-white/70 text-[9px] font-bold tracking-wider tabular-nums font-mono">
              {currentTimeStr} / {durationStr}
            </span>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
              />
            </div>
          </div>

          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className="p-2 cursor-pointer hover:bg-white/10 active:bg-white/20 rounded-full transition outline-none focus:bg-white/15 animate-fade-in"
            >
              <SFIcon icon={getVolumeIcon()} className="h-4 w-4" color="#ffffff" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomIsland;