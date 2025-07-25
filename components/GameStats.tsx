interface GameStatsProps {
  bpm: number;
  score?: number;
  highestScore?: number;
  attemptsLeft?: number;
  beatsCompleted?: number;
  perfectSolves?: number;
  showExtendedStats?: boolean;
}

export const GameStats: React.FC<GameStatsProps> = ({
  bpm,
  score,
  highestScore,
  attemptsLeft,
  beatsCompleted,
  perfectSolves,
  showExtendedStats = false,
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-end">
      <div className="text-xs font-mono text-gray-400">
        BPM
        <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
          {bpm}
        </span>
      </div>

      {score !== undefined && (
        <div className="text-xs font-mono text-gray-400">
          SCORE
          <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
            {score}
          </span>
        </div>
      )}

      {highestScore !== undefined && (
        <div className="text-xs font-mono text-gray-400">
          HIGHEST
          <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
            {highestScore}
          </span>
        </div>
      )}

      {attemptsLeft !== undefined && (
        <div className="text-xs font-mono text-gray-400">
          ATTEMPTS
          <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
            {attemptsLeft}
          </span>
        </div>
      )}

      {showExtendedStats && (
        <>
          {beatsCompleted !== undefined && (
            <div className="text-xs font-mono text-gray-400">
              COMPLETED
              <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
                {beatsCompleted}
              </span>
            </div>
          )}
          {perfectSolves !== undefined && (
            <div className="text-xs font-mono text-gray-400">
              PERFECT
              <span className="ml-1 inline-block px-2 py-0.5 bg-black border border-gray-700 text-red-500 font-mono rounded min-w-[2rem] text-center">
                {perfectSolves}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
