# Main Process

## Entry Point

`src/main/index.ts` — Electron main process: creates windows, registers IPC handlers, manages lifecycle.

### Windows

| Window | Size | Flags | Created |
|--------|------|-------|---------|
| Main | 480×270 | frameless, alwaysOnTop (default), skipTaskbar, resizable | On `app.whenReady()` |
| Settings | 280×380 | frameless, parented to main, not alwaysOnTop | On IPC `window:open-settings` |

### Key Implementation Details

**Settings window positioning** (`index.ts:135`):

```typescript
// Default side: RIGHT
// Switches to LEFT only when right side of main window lacks 280px
const settingsSide: "left" | "right" =
  mainBounds.x + mainBounds.width + SETTINGS_WIDTH <= displayBounds.x + displayBounds.width
    ? "right"
    : "left";
```

Uses `screen.getDisplayNearestPoint()` for correct multi-monitor behavior. Not `alwaysOnTop`.

**DevTools**: Not explicitly set in `webPreferences` (defaults to `true` in electron-vite). No `openDevTools()` calls in source.

## Events Tailer

`src/main/events-tailer.ts` — Polls `~/.config/opencode/monitor-events.jsonl` every 500ms.

```typescript
class EventsTailer {
  private filePath: string;
  private pollInterval: NodeJS.Timeout | null;
  private lastReadSize: number = 0;
  private connected: boolean = false;

  start(): void;     // begins polling
  stop(): void;      // clears interval
  reset(): void;     // truncates file, resets lastReadSize
}
```

- On each tick, reads new bytes from the JSONL file since `lastReadSize`
- Parses each JSON line; if valid `CandleEvent`, emits `candle:new` via IPC
- If the file doesn't exist or read fails, broadcasts `{ connected: false }`
- On successful read, broadcasts `{ connected: true }`

## IPC Handlers

Registered in `index.ts`:

| Channel | Handler |
|---------|---------|
| `window:open-settings` | Creates settings window, positions adaptively |
| `window:set-pin` | Toggles main window `setAlwaysOnTop(boolean)` |
| `window:close` | Closes the requesting window |
| `plugin:install` | Copies plugin files + runs `npm install` |
| `settings:theme-changed` | Forwards to main window via `webContents.send` |
| `settings:color-scheme-changed` | Forwards to main window |
| `settings:locale-changed` | Forwards to main window |
