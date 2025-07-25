# BeatKerri

A beat-matching game built with Next.js, TypeScript, and Tone.js.

## Architecture

The project has been refactored to follow DRY principles with shared components and hooks:

### Shared Utilities (`utils/gameUtils.ts`)

- `createEmptyGrid()` - Creates a 7x16 grid for the sequencer
- `instruments` - Array of instrument names
- `instrumentNames` - Display names for instruments
- `createPadPlayers()` - Creates Tone.js players for individual pad sounds
- `createPlayers()` - Creates Tone.js players for pattern playback
- Type definitions for `Feedback`, `PlayMode`, and `GameMode`

### Custom Hooks

#### `useAudioPlayback` (`hooks/useAudioPlayback.ts`)

Manages all audio playback logic:

- Pattern playback with Tone.js
- Active step tracking
- Play/pause state management
- Individual pad sound playback

#### `useGameState` (`hooks/useGameState.ts`)

Manages common game state:

- Grid state and updates
- Score tracking
- Attempt management
- Game win/lose state
- Feedback grid

### Shared Components

#### `GameLayout` (`components/GameLayout.tsx`)

Main layout component that combines:

- Drum machine styling
- Stats display
- Mode toggles
- Controls
- Game over/win overlays

#### `SequencerGrid` (`components/SequencerGrid.tsx`)

Reusable sequencer grid with:

- 7x16 grid layout
- Instrument labels
- Step toggling
- Visual feedback
- Active step highlighting

#### `GameControls` (`components/GameControls.tsx`)

Standard control buttons:

- Play/Stop
- Loop toggle
- Submit guess
- Clear grid

#### `GameStats` (`components/GameStats.tsx`)

Displays game statistics:

- BPM
- Score
- Highest score
- Attempts left
- Extended stats (optional)

#### `ModeToggle` (`components/ModeToggle.tsx`)

Toggle between target and recreate modes

## Game Modes

### Beatdle Mode

Daily challenge with:

- Daily beat generation
- 3 attempts per day
- Score tracking
- Social sharing

### Challenge Mode

Progressive difficulty with:

- Unlocking instruments
- Increasing complexity
- Persistent progress

## Usage Example

```tsx
import { GameLayout } from "@/components/GameLayout";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useGameState } from "@/hooks/useGameState";

export default function MyGameMode() {
  const { activeStep, isPlaying, playPattern, stopPlayback } = useAudioPlayback(
    {
      bpm: 120,
      isLooping: true,
    }
  );

  const { grid, score, gameWon, toggleStep, clearGrid } = useGameState();

  return (
    <GameLayout
      mode="challenge"
      beatLabel="Beat #1"
      bpm={120}
      grid={grid}
      activeStep={activeStep}
      isPlaying={isPlaying}
      gameWon={gameWon}
      onToggleStep={toggleStep}
      onClearGrid={clearGrid}
      score={score}
    />
  );
}
```

## Development

```bash
npm install
npm run dev
```

## Technologies

- Next.js 14
- TypeScript
- Tone.js (audio)
- Tailwind CSS
- React Hot Toast
- Lucide React (icons)
