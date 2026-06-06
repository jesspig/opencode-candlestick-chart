# Opencode Monitor — AGENTS.md

Electron desktop widget that monitors opencode file edits and renders them as a real-time candlestick chart.

## Data Flow

```
opencode plugin (plugin/monitor.ts)
  → writes CandleEvent JSON lines to ~/.config/opencode/monitor-events.jsonl
  → Electron main process (src/main/events-tailer.ts) polls file every 500ms
    → IPC "candle:new" / "opencode:status" / "opencode:reset"
    → Renderer (React + Zustand) via preload contextBridge
```

## Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | electron-vite dev (HMR, Vite dev server for renderer) |
| `pnpm build` | electron-vite build → `out/` |
| `pnpm package:win` | build + electron-builder portable .exe |

No lint, typecheck, or test commands exist.

## Architecture

- **electron-vite** builds 3 targets: `src/main/` → `out/main/`, `src/preload/` → `out/preload/`, `src/renderer/` → `out/renderer/`
- Single preload (`src/preload/index.ts`) exposes two contextBridge APIs: `electronAPI` (main window) and `settingsAPI` (settings window)
- Single HTML entry (`src/renderer/index.html`); settings window uses `?view=settings` query param to render `SettingsApp` instead of `App`
- **Do NOT try to add multi-entry for preload or renderer** in vite.config.ts — electron-vite v5 doesn't support it properly (settings preload was removed in favor of a single shared preload)
- Two BrowserWindows: main (480×270, right side of primary display) and settings (280×380, positioned adaptively)

## Key Gotchas

### Chart Sizing

- `lightweight-charts` with `autoSize: true` — chart fills container width
- Must set `rightPriceScale.width: 56` to prevent price axis auto-calc from squeezing chart into a square
- Use `timeScale().fitContent()` (not `setVisibleLogicalRange`) — no manual tick range logic

### Settings Window Position

- `ipcMain.on("window:open-settings")` in `src/main/index.ts:135` — adaptively places settings to left or right of main window based on available screen space
- Uses `screen.getDisplayNearestPoint()` for correct multi-monitor behavior
- Default side is RIGHT; switches to LEFT only when right side lacks 280px of space
- NOT `alwaysOnTop` (only the main window is)

### Plugin Bundling

- `electron-builder.yml` copies `plugin/*.ts` + `package.json` as `extraResources`
- Dev path: `app.getAppPath()/plugin`; production: `process.resourcesPath/plugin`
- IPC handler `plugin:install` copies files to `~/.config/opencode/plugin/` and runs `npm install`

### Dev Mode

- `main.tsx` has browser mock objects for `electronAPI` and `settingsAPI` — allows testing renderer outside Electron
- No `openDevTools()` calls in source; `devTools` property removed from webPreferences (defaults to `true`)

## Style & Conventions

- All UI state in Zustand store (`src/renderer/store.ts`)
- IPC is the only bridge between main ↔ renderer (no direct fs in renderer)
- Theme via CSS custom properties + `body[data-theme="dark/light"]`
- Color scheme: `redUp` (red candle up) or `greenUp` (green candle up) — toggled from settings window
- Fonts: Inter (UI), JetBrains Mono (tabular numbers in chart + status panel)
- i18n: `src/renderer/locale.ts` with `t(locale, key)` function, JSON files in `src/renderer/locales/`
- Plugin (`plugin/monitor.ts`) has zero deps except `diff` and `@opencode-ai/plugin`

## Project Layout

```
src/main/index.ts          — Electron main process (window creation, IPC handlers)
src/main/events-tailer.ts  — Polls events.jsonl, broadcasts via IPC
src/preload/index.ts       — contextBridge for both windows (electronAPI + settingsAPI)
src/renderer/main.tsx       — Entry: routes to <App> or <SettingsApp> via ?view=settings
src/renderer/App.tsx        — Main window: chart + status panel + IPC listeners
src/renderer/store.ts       — Zustand: candles, stats, theme, colorScheme, locale, pin, connection state
src/renderer/components/
  CandlestickChart.tsx      — lightweight-charts CandlestickSeries
  StatusPanel.tsx           — Right sidebar: cumulative close, history K-lines, opencode state light
  TitleBar.tsx              — Drag region, pin button, settings button, close button
  SettingsApp.tsx           — Standalone settings window (theme, color scheme, language, plugin install)
plugin/monitor.ts           — opencode plugin: hooks tool.execute.after, writes JSONL
```

## Repository Wiki

For detailed documentation on architecture, components, data flow, and build processes, see [`.repo_wiki/index.md`](.repo_wiki/index.md).

## Events Data Model (from plugin → events.jsonl)

```typescript
// CandleEvent written by plugin:
{ type: "candle", time: number, filePath: string, tool: "write"|"edit",
  linesAdded: number, linesDeleted: number, netChange: number }

// Chart candle OHLC:
// open = cumulative before event, close = cumulative after,
// high = max(open, close), low = min(open, close)
// (high = open + linesAdded, low = open - linesDeleted)
```
