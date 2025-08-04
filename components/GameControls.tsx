import {
  Play,
  Square,
  Repeat,
  Trash2,
  Zap,
  Share2,
  ChevronDown,
  Copy,
  Facebook,
  Mail,
  Camera,
} from "lucide-react";
import {
  playButtonClick,
  playToggleClick,
  playSubmitClick,
  playClearClick,
} from "@/utils/clickSounds";

interface GameControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  canSubmit?: boolean;
  onTogglePlay: () => void;
  onToggleLoop: () => void;
  onSubmitGuess?: () => void;
  onClearGrid: () => void;
  disabled?: boolean;
  // Share functionality (for Jam mode)
  showShare?: boolean;
  shareMenuOpen?: boolean;
  onToggleShareMenu?: () => void;
  onCopyShareLink?: () => void;
  onShareToX?: () => void;
  onShareToFacebook?: () => void;
  onShareToWhatsApp?: () => void;
  onShareToEmail?: () => void;
  onShareToInstagram?: () => void;
  shareMenuRef?: React.RefObject<HTMLDivElement | null>;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isPlaying,
  isLooping,
  canSubmit = false,
  onTogglePlay,
  onToggleLoop,
  onSubmitGuess,
  onClearGrid,
  disabled = false,
  // Share props
  showShare = false,
  shareMenuOpen = false,
  onToggleShareMenu,
  onCopyShareLink,
  onShareToX,
  onShareToFacebook,
  onShareToWhatsApp,
  onShareToEmail,
  onShareToInstagram,
  shareMenuRef,
}) => {
  const handleTogglePlay = () => {
    playButtonClick();
    onTogglePlay();
  };

  const handleToggleLoop = () => {
    playToggleClick();
    onToggleLoop();
  };

  const handleSubmitGuess = () => {
    playSubmitClick();
    onSubmitGuess?.();
  };

  const handleClearGrid = () => {
    playClearClick();
    onClearGrid();
  };

  return (
    <div className="flex justify-center gap-2 mt-2 w-full">
      <button
        onClick={handleTogglePlay}
        disabled={disabled}
        className={`p-4 rounded-lg shadow transition-colors ${
          isPlaying
            ? "bg-red-600 hover:bg-red-500"
            : "bg-blue-600 hover:bg-blue-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        title={isPlaying ? "Stop" : "Play"}
      >
        {isPlaying ? (
          <Square className="w-7 h-7" />
        ) : (
          <Play className="w-7 h-7" />
        )}
      </button>

      <button
        onClick={handleToggleLoop}
        disabled={disabled}
        className={`p-4 rounded-lg shadow transition ${
          isLooping
            ? "bg-purple-600 hover:bg-purple-500"
            : "bg-gray-700 hover:bg-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        title="Toggle Looping"
      >
        <Repeat className="w-7 h-7" />
      </button>

      {canSubmit && onSubmitGuess && (
        <button
          onClick={handleSubmitGuess}
          disabled={disabled}
          className={`p-4 bg-green-600 hover:bg-green-500 rounded-lg shadow transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Submit Guess"
        >
          <Zap className="w-7 h-7" />
        </button>
      )}

      <button
        onClick={handleClearGrid}
        disabled={disabled}
        className={`p-4 bg-gray-700 hover:bg-gray-600 rounded-lg shadow transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title="Clear"
      >
        <Trash2 className="w-7 h-7" />
      </button>

      {/* Share Button (Jam Mode) */}
      {showShare && (
        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={onToggleShareMenu}
            disabled={disabled}
            className={`p-4 bg-green-700 hover:bg-green-600 rounded-lg shadow transition-colors ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Share Beat"
          >
            <div className="flex items-center gap-1">
              <Share2 className="w-6 h-6" />
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  shareMenuOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {shareMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
              <div className="py-2">
                <button
                  onClick={onCopyShareLink}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2 text-sm"
                >
                  <Copy size={16} />
                  Copy Link
                </button>
                <button
                  onClick={onShareToX}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2 text-sm"
                >
                  <span className="text-lg font-bold">𝕏</span>X
                </button>
                <button
                  onClick={onShareToFacebook}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2 text-sm"
                >
                  <Facebook size={16} />
                  Facebook
                </button>
                <button
                  onClick={onShareToInstagram}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2 text-sm"
                >
                  <Camera size={16} />
                  Instagram
                </button>
                <button
                  onClick={onShareToWhatsApp}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2 text-sm"
                >
                  <span className="text-lg">💬</span>
                  WhatsApp
                </button>
                <button
                  onClick={onShareToEmail}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2 text-sm"
                >
                  <Mail size={16} />
                  Email
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
