# BeatKerri

A beat-matching game built with Next.js 15, React 19, TypeScript, and Tone.js.

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

#### `useSoundscapes` (`hooks/useSoundscapes.ts`)

Manages ambient audio and sound effects:

- Background music
- Transition sounds
- Victory/loss audio
- Audio context management

### Utility Functions

#### Export Utilities (`utils/exportUtils.ts`)

Handles file export functionality:

- **MIDI Export** - Generate and download MIDI files from beat patterns
- **WAV Export** - Render beat patterns to high-quality WAV audio files
- **Reusable Logic** - Shared export functions across game modes

#### Streak Tracking (`utils/streakUtils.ts`)

Manages user progress and statistics:

- **Streak Management** - Track daily consecutive wins
- **Statistics** - Win rate, perfect solve rate, average score
- **Persistence** - localStorage-based data storage
- **Progress Tracking** - Detailed performance analytics

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

#### `AudioControls` (`components/AudioControls.tsx`)

Audio management interface:

- Volume controls
- Mute/unmute
- Audio context initialization
- Sound effect toggles

## Game Modes

### Beatdle Mode

Daily challenge with:

- Daily beat generation using seedrandom
- 3 attempts per day
- Score tracking with localStorage persistence
- **Streak tracking** - Track daily streaks, win rates, and statistics
- **Pattern export** - Export today's beat as WAV or MIDI files
- **Enhanced sharing** - Multiple social media sharing options
- Social sharing capabilities

### Challenge Mode

Progressive difficulty with:

- Unlocking instruments
- Increasing complexity
- Persistent progress tracking

### Jam Mode

Creative mode for free-form beat creation:

- Unlimited attempts
- Pattern saving
- Creative experimentation

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

### Core Framework

- **Next.js 15.3.5** - React framework with App Router and Turbopack
- **React 19.0.0** - Latest React with concurrent features
- **TypeScript 5** - Type-safe JavaScript

### Audio & Animation

- **Tone.js 15.1.22** - Web Audio API wrapper for audio playback
- **Lottie React 2.4.1** - Animation library for Lottie files
- **React Confetti 6.4.0** - Confetti animation effects

### Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React 0.525.0** - Beautiful icon library

### Utilities & State

- **React Hot Toast 2.5.2** - Toast notifications
- **Seedrandom 3.0.5** - Deterministic random number generation
- **Vercel Analytics 1.5.0** - Performance and usage analytics

### Development Tools

- **ESLint 9** - Code linting with Next.js config
- **PostCSS 4** - CSS processing
- **Turbopack** - Fast bundler for development

## Project Structure

```
beatkerri/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── admin/             # Admin interface
│   ├── beatdle/           # Daily challenge mode
│   ├── challenge/         # Progressive difficulty mode
│   ├── jam/               # Creative mode
│   └── how-to-play/       # Game instructions
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks
├── utils/                 # Shared utilities and helpers
│   ├── exportUtils.ts     # MIDI/WAV export functionality
│   ├── streakUtils.ts     # Streak tracking and statistics
│   ├── gameUtils.ts       # Core game utilities
│   └── soundscapeManager.ts # Audio management
├── public/                # Static assets
│   ├── samples/           # Audio samples (WAV files)
│   ├── audio/             # Game audio (MP3 files)
│   └── animations/        # Lottie animation files
└── README.md
```

## Audio System

The game features a sophisticated audio system built with Tone.js:

- **Sample Management**: WAV files for drum samples, MP3 for ambient audio
- **Audio Context**: Proper initialization and cleanup
- **Performance**: Optimized audio loading and caching
- **Cross-browser**: Compatible with all modern browsers
- **Mobile Support**: Handles mobile audio restrictions
- **Export Capabilities**: High-quality WAV rendering and MIDI file generation

## Performance Features

- **Turbopack**: Fast development builds
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js built-in image optimization
- **Audio Optimization**: Efficient audio file loading and caching
- **TypeScript**: Compile-time error checking

## Latest Features

### 🔥 Streak Tracking

- **Daily Streaks**: Track consecutive Beatdle completions
- **Statistics Dashboard**: View win rate, perfect solve percentage, and average scores
- **Progress Persistence**: All stats saved locally with localStorage
- **Achievement Display**: Visual streak indicators and statistics

### 📥 Pattern Export

- **WAV Export**: Export Beatdle patterns as high-quality 44.1kHz WAV files
- **MIDI Export**: Generate MIDI files compatible with all major DAWs
- **Reusable Logic**: Shared export functionality across game modes
- **Instant Download**: One-click export with proper filename generation

### 📤 Enhanced Sharing

- **Multiple Platforms**: Share to X (Twitter), Facebook, WhatsApp, Messages, Email
- **Separate Menus**: Clean UI with distinct Export and Share buttons
- **Native Sharing**: Device-native sharing API support where available
- **Result Formatting**: Optimized share text with visual grid representation

### 🎯 User Experience Improvements

- **Three-Button Layout**: Listen, Export Beat, and Share Results as separate actions
- **Responsive Design**: Optimized for desktop, mobile landscape, and portrait modes
- **Centered Alignment**: Perfect button alignment across all screen sizes
- **Visual Feedback**: Clear icons and hover states for all interactive elements
