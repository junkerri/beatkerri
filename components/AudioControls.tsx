import React from "react";
import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { useSoundscapes } from "@/hooks/useSoundscapes";

interface AudioControlsProps {
  className?: string;
  showVolumeSlider?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  className = "",
  showVolumeSlider = true,
}) => {
  const { isMuted, volume, toggleMute, updateVolume } = useSoundscapes();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    updateVolume(newVolume);
  };

  const handleMuteClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMute();
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 0.5) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleMuteClick}
        onTouchEnd={handleMuteClick}
        className="p-2 text-gray-400 hover:text-white active:text-white transition-colors touch-manipulation"
        title={isMuted ? "Unmute" : "Mute"}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {getVolumeIcon()}
      </button>

      {showVolumeSlider && (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            onInput={handleVolumeChange} // Add onInput for better mobile support
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="w-16 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
            title="Volume"
            style={{
              WebkitTapHighlightColor: "transparent",
              WebkitAppearance: "none",
              appearance: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          />
          <span className="text-xs text-gray-400 font-mono w-8 select-none">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
