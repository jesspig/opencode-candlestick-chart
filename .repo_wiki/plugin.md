# opencode Plugin

The plugin hooks opencode's `tool.execute.after` lifecycle event to record file edits as candle events.

## Location

`plugin/monitor.ts`

## How It Works

1. opencode loads the plugin from `~/.config/opencode/plugin/` (copied from `extraResources` via IPC `plugin:install`)
2. On every `tool.execute.after`, the plugin:
   - Extracts `linesAdded`, `linesDeleted`, `netChange` from the `diff` module output
   - Computes cumulative close from a local counter
   - Appends a `CandleEvent` JSON line to `~/.config/opencode/monitor-events.jsonl`

## Events Data Model

```typescript
interface CandleEvent {
  type: "candle";
  time: number;           // unix ms
  filePath: string;       // file being edited
  tool: "write" | "edit";
  linesAdded: number;
  linesDeleted: number;
  netChange: number;      // linesAdded - linesDeleted
}
```

## Candle OHLC Calculation (in renderer)

Each event becomes one candle:

| Field | Formula |
|-------|---------|
| **open** | Cumulative total before this event |
| **close** | `open + netChange` |
| **high** | `open + linesAdded` (net + absolute) |
| **low** | `open - linesDeleted` (net - absolute) |

- `high` is always `Math.max(open, close, open + linesAdded)`
- `low` is always `Math.min(open, close, open - linesDeleted)`

## Dependencies

- `diff` — computes line-level diff between old and new content
- `@opencode-ai/plugin` — opencode plugin SDK (type definitions)

Only these two deps. No runtime framework.

## Installation

The plugin is bundled as `extraResources` in `electron-builder.yml`:

```yaml
extraResources:
  - from: plugin/
    to: plugin/
```

In dev: loaded from `app.getAppPath()/plugin`
In production: loaded from `process.resourcesPath/plugin`

The settings window provides a "Install Plugin" button that invokes the `plugin:install` IPC handler, which:
1. Copies plugin files to `~/.config/opencode/plugin/`
2. Runs `npm install` in the plugin directory
3. Returns success/failure to the renderer
