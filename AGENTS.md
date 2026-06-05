# Architecture & Workflow

This is an Electron desktop widget that monitors opencode file edits and renders them as a real-time candlestick chart.

## Architecture

```
opencode CLI
  └─ plugin/monitor.ts (hooks into tool.execute.after)
       └─ writes events to ~/.config/opencode/monitor-events.jsonl
            │
            ▼
  Electron App (main process)
    └─ chokidar watches events.jsonl → parses new lines → IPC
         │
         ▼
    Renderer (React + Zustand)
      ├─ TradingView Lightweight Charts CandlestickSeries
      └─ StatusPanel (stats + recent events)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Package manager | pnpm |
| Desktop framework | Electron + electron-vite |
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Chart | TradingView Lightweight Charts (CandlestickSeries) |
| File watching | chokidar (Electron side) |
| Diff engine | `diff` npm package (plugin side) |
| Build & package | electron-builder |

## Project Structure

```
code_diff-candlestick_chart/
├── plugin/
│   ├── package.json      # deps: diff, @opencode-ai/plugin
│   └── monitor.ts        # opencode plugin - hooks tool.execute.after
├── src/
│   ├── main/
│   │   ├── index.ts       # Electron main process (480x270 frameless transparent)
│   │   ├── events-tailer.ts # chokidar watches events.jsonl
│   │   └── ipc.ts
│   ├── preload/
│   │   └── index.ts
│   └── renderer/
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── TitleBar.tsx      # drag region + theme/pin/close buttons
│       │   ├── CandlestickChart.tsx # Lightweight Charts K-line
│       │   └── StatusPanel.tsx   # right sidebar: stats + recent events
│       ├── store.ts              # Zustand: candles, stats, theme, pin
│       └── styles/
│           └── app.css
├── electron-builder.yml
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Design System (Glassmorphism trading-style)

- Window: 480x270, frameless, transparent, alwaysOnTop
- Theme: Glassmorphism with backdrop-filter: blur(20px)
- 3-button title bar: theme toggle (system→light→dark cycle), pin, close
- Layout: chart on left (~350px), status panel on right (~130px)
- Theme: auto-detect system, three-state toggle
- Fonts: Inter (UI) + JetBrains Mono (tabular numbers)
- K-line colors: green up (bullish), red down (bearish)
- Status panel: cumulative NET, event/file counts, recent event list

## Development Commands

```bash
pnpm dev          # Start dev server with hot reload
pnpm build        # Build for production
pnpm package:win  # Package Windows portable .exe
pnpm package:mac  # Package macOS .dmg
pnpm package:linux# Package Linux .AppImage
```

## Plugin Installation (user side)

Copy `plugin/monitor.ts` and `plugin/package.json` to `~/.config/opencode/plugin/`.
opencode auto-detects and installs dependencies on restart.

## Candle Data Model

```typescript
interface CandleEvent {
  type: "candle"
  time: number           // unix timestamp -> Chart time
  filePath: string
  tool: "write" | "edit"
  linesAdded: number     // from diffLines()
  linesDeleted: number
  netChange: number      // added - deleted
}

// Chart candle OHLC (cumulative):
// open = cumulative before event
// close = cumulative after event
// high = max(open, close)
// low = min(open, close)
```

## Conventions

- All UI state in Zustand store
- IPC for main↔renderer communication (no direct fs in renderer)
- Plugin uses zero external deps except `diff` and `@opencode-ai/plugin`
- Plugin writes to `~/.config/opencode/monitor-events.jsonl` (JSON Lines format)
- Electron main process is the sole reader of the events file
- Events file is append-only, no rotation needed (low volume)
