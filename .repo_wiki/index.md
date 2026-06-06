# opencode-candlestick-chart

Electron desktop widget that monitors opencode file edits and renders them as a real-time candlestick chart.

## Features

- **Real-time monitoring** — Polls `~/.config/opencode/monitor-events.jsonl` every 500ms for new edit events
- **Candlestick chart** — Each opencode tool execution (write/edit) becomes a candlestick: open = cumulative close before the event, close = open + netChange, high = open + linesAdded, low = open - linesDeleted
- **Status panel** — Cumulative close count, last 8 K-line history, opencode connection state light (green = connected, red = disconnected)
- **Dark/light theme** — CSS custom properties, toggled from settings window
- **Color scheme** — Toggle between `redUp` (red candle = up) and `greenUp` (green candle = up)
- **i18n** — English and Chinese locales
- **Settings window** — Standalone window for theme, color scheme, locale, plugin auto-install
- **opencode plugin** — Bundled plugin hooks `tool.execute.after`, writes `CandleEvent` JSONL

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop framework | Electron (via electron-vite) |
| Frontend | React 18 + TypeScript |
| State management | Zustand |
| Charting | lightweight-charts (TradingView) |
| IPC bridge | contextBridge (single shared preload) |
| Plugin | TypeScript, `@opencode-ai/plugin`, `diff` |
| Build | electron-vite (Vite-based) |
| Packaging | electron-builder (portable .exe) |
| Fonts | Inter (UI), JetBrains Mono (tabular numbers) |

## Quick Links

- [Architecture Overview](architecture.md)
- [opencode Plugin](plugin.md)
- [Main Process](main-process.md)
- [Renderer / Frontend](renderer.md)
- [Build & Deploy](build-deploy.md)

## Repository

```
├── .repo_wiki/           ← You are here
├── plugin/
│   ├── package.json      ← Plugin dependencies (diff, @opencode-ai/plugin)
│   └── monitor.ts        ← opencode plugin: hooks tool execution → writes events
├── src/
│   ├── main/
│   │   ├── index.ts      ← Electron main process (windows, IPC handlers)
│   │   └── events-tailer.ts ← Polls events.jsonl, broadcasts via IPC
│   ├── preload/
│   │   └── index.ts      ← Single contextBridge for main + settings windows
│   └── renderer/
│       ├── main.tsx       ← Entry: routes to <App> or <SettingsApp>
│       ├── App.tsx        ← Main window: chart + status + IPC listeners
│       ├── store.ts       ← Zustand store
│       ├── locale.ts      ← i18n system
│       ├── components/
│       │   ├── CandlestickChart.tsx
│       │   ├── StatusPanel.tsx
│       │   ├── TitleBar.tsx
│       │   └── SettingsApp.tsx
│       ├── locales/       ← en.json, zh.json
│       └── styles/        ← CSS files
├── electron-builder.yml   ← electron-builder config
├── electron.vite.config.ts
└── package.json
```
