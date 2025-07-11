import React from "react";

interface ControlsProps {
  onPlay: () => void;
  onPlayTarget: () => void;
  onStop: () => void;
  onSubmit: () => void;
}



export const Controls: React.FC<ControlsProps> = ({ onPlay, onStop, onSubmit }) => (
  <div className="flex space-x-4 mt-4">
    <button
      onClick={onPlay}
      className="px-4 py-2 bg-green-500 text-white rounded"
    >
      Play
    </button>
    <button
      onClick={onStop}
      className="px-4 py-2 bg-yellow-500 text-white rounded"
    >
      Stop
    </button>
    <button
      onClick={onSubmit}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Submit
    </button>
  </div>
);

