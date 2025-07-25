import React from "react";
import { instrumentNames, Feedback } from "@/utils/gameUtils";

interface SequencerGridProps {
  grid: boolean[][];
  toggleStep?: (row: number, col: number) => void;
  feedbackGrid?: Feedback[][];
  activeStep?: number | null;
}

export const SequencerGrid: React.FC<SequencerGridProps> = ({
  grid,
  toggleStep,
  feedbackGrid,
  activeStep,
}) => (
  <div className="space-y-2">
    {grid.map((row, rowIndex) => (
      <div key={rowIndex} className="flex items-center space-x-0.5">
        <div className="w-6 text-xs text-gray-300 text-center font-mono">
          {instrumentNames[rowIndex]}
        </div>
        {row.map((step, colIndex) => {
          let extraClass = "";
          if (feedbackGrid) {
            if (feedbackGrid[rowIndex][colIndex] === "correct") {
              extraClass = "border-green-400";
            }
            if (feedbackGrid[rowIndex][colIndex] === "incorrect") {
              extraClass = "border-red-400";
            }
          }

          const isActive = activeStep === colIndex;

          return (
            <button
              key={colIndex}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded border-2 flex items-center justify-center relative
                ${
                  step
                    ? "bg-amber-500 border-amber-500"
                    : "bg-gray-700 border-gray-600"
                }
                ${extraClass}
                ${isActive ? "ring-2 ring-purple-400" : ""}
                hover:border-amber-300 transition`}
              onClick={() => toggleStep?.(rowIndex, colIndex)}
            >
              {colIndex % 4 === 0 && colIndex !== 0 && (
                <div className="absolute -left-1 top-0 bottom-0 w-px bg-gray-400"></div>
              )}
            </button>
          );
        })}
      </div>
    ))}
  </div>
);
