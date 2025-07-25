import { Crosshair, Wand2 } from "lucide-react";
import { PlayMode } from "@/utils/gameUtils";

interface ModeToggleProps {
  currentMode: PlayMode;
  onToggleMode: (mode: PlayMode) => void;
  disabled?: boolean;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  currentMode,
  onToggleMode,
  disabled = false,
}) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onToggleMode("target")}
        disabled={disabled}
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-md transition ${
          currentMode === "target"
            ? "bg-purple-700 text-white shadow"
            : "bg-black text-gray-300 border border-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Crosshair size={16} />
        Target
      </button>
      <button
        onClick={() => onToggleMode("recreate")}
        disabled={disabled}
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-md transition ${
          currentMode === "recreate"
            ? "bg-green-700 text-white shadow"
            : "bg-black text-gray-300 border border-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Wand2 size={16} />
        Recreate
      </button>
    </div>
  );
};
