import { Play, Square, Repeat, Trash2, Zap } from "lucide-react";

interface GameControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  canSubmit?: boolean;
  onTogglePlay: () => void;
  onToggleLoop: () => void;
  onSubmitGuess?: () => void;
  onClearGrid: () => void;
  disabled?: boolean;
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
}) => {
  return (
    <div className="flex justify-center gap-2 mt-2 w-full">
      <button
        onClick={onTogglePlay}
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
        onClick={onToggleLoop}
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
          onClick={onSubmitGuess}
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
        onClick={onClearGrid}
        disabled={disabled}
        className={`p-4 bg-gray-700 hover:bg-gray-600 rounded-lg shadow transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title="Clear"
      >
        <Trash2 className="w-7 h-7" />
      </button>
    </div>
  );
};
