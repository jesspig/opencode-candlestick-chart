# Renderer / Frontend

## Entry & Routing

`src/renderer/main.tsx` — Checks `location.search` for `?view=settings`:

```typescript
const params = new URLSearchParams(location.search);
const isSettings = params.get("view") === "settings";

root.render(
  <StrictMode>
    {isSettings ? <SettingsApp /> : <App />}
  </StrictMode>
);
```

In dev mode (`main.tsx`), mock objects for `electronAPI` and `settingsAPI` are provided to enable testing outside Electron.

## App Component

`src/renderer/App.tsx` — Main window layout and IPC wiring.

- Mounts IPC listeners for `candle:new`, `opencode:status`, `opencode:reset`
- Calls `electronAPI?.windowReady()` on mount to signal renderer is ready
- Children components receive data via Zustand store (not prop drilling)

## Zustand Store

`src/renderer/store.ts` — Single store with all UI state:

```typescript
interface AppState {
  // Candles
  candles: CandleEvent[];
  cumulativeClose: number;
  addCandle: (event: CandleEvent) => void;
  resetCandles: () => void;

  // Connection
  connected: boolean;
  setConnected: (val: boolean) => void;

  // Theme & Appearance
  theme: "dark" | "light";
  colorScheme: "redUp" | "greenUp";
  setTheme: (t: "dark" | "light") => void;
  setColorScheme: (s: "redUp" | "greenUp") => void;

  // i18n
  locale: "en" | "zh";
  setLocale: (l: "en" | "zh") => void;

  // Pin
  isPinned: boolean;
  togglePin: () => void;
}
```

## Components

### CandlestickChart

`src/renderer/components/CandlestickChart.tsx`

- Uses TradingView `lightweight-charts` with `createChart` and `addCandlestickSeries`
- `autoSize: true` — chart fills container width
- `rightPriceScale.width: 56` — prevents price axis auto-calc from squeezing chart into a square
- `timeScale().fitContent()` — no manual tick range logic
- Subscribes to store: candles, theme, colorScheme
- On new candle: calls `series.update(candle)` (append/update last)
- On reset: calls `series.setData([])` then `timeScale().fitContent()`

### StatusPanel

`src/renderer/components/StatusPanel.tsx`

Right sidebar showing:
- **Cumulative Close** — Large tabular number (JetBrains Mono font)
- **History K-lines** — Last 8 candles rendered as mini colored bars (green/red)
- **Status Light** — Green circle = connected to opencode, red = disconnected

Uses `Intl.NumberFormat` for locale-aware number formatting.

### TitleBar

`src/renderer/components/TitleBar.tsx`

Drag region (`-webkit-app-region: drag`) with non-drag buttons:
- **Pin** — Toggles always-on-top (filled/outline icon)
- **Settings** — Opens settings window via IPC
- **Close** — Closes window via IPC
- **Reset** — Resets all candles and truncates events file
- Double-click toggles pin state

### SettingsApp

`src/renderer/components/SettingsApp.tsx`

Standalone settings window, rendered when `?view=settings` is present.

Controls:
- **Theme toggle** — Dark / Light
- **Color scheme** — Red up / Green up
- **Language** — English / Chinese
- **Install Plugin** — Button to invoke `plugin:install` IPC

Each setting change sends IPC to the main window for persistence. Uses the same theme/styling as the main window (CSS custom properties on `<body>`).

## i18n

`src/renderer/locale.ts` — Simple key-based translation:

```typescript
const t = (locale: "en" | "zh", key: string): string =>
  translations[key]?.[locale] ?? key;
```

Locale JSON files in `src/renderer/locales/`:
- `en.json` — English
- `zh.json` — Chinese (中文)

Keys are organized by component prefix (e.g., `chart.`, `status.`, `settings.`).

## Theme System

CSS custom properties on `<body data-theme="dark">` / `<body data-theme="light">`.

Toggle between `redUp` and `greenUp` via `data-color-scheme` attribute, which swaps the CSS variable values for green/red candle colors.
