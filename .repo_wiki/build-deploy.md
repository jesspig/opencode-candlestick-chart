# Build & Deploy

## Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | electron-vite dev mode — Vite dev server for renderer, HMR enabled |
| `pnpm build` | electron-vite production build → outputs to `out/` |
| `pnpm package:win` | Build + package Windows portable .exe via electron-builder |

There are no lint, typecheck, or test commands.

## electron-vite Configuration

`electron.vite.config.ts` — Builds 3 targets:

| Target | Source | Output |
|--------|--------|--------|
| Main | `src/main/` | `out/main/` |
| Preload | `src/preload/` | `out/preload/` |
| Renderer | `src/renderer/` | `out/renderer/` |

**Important**: electron-vite v5 does not properly support multi-entry for preload or renderer. A single shared preload (`src/preload/index.ts`) serves both main and settings windows via query param routing (`?view=settings`).

## electron-builder

`electron-builder.yml` — Packages as a portable `.exe` (no installer).

```yaml
appId: com.opencode.candlestickchart
win:
  target: portable
  artifactName: ${name}-${version}-portable.${ext}

extraResources:
  - from: plugin/
    to: plugin/
```

The `extraResources` directive copies `plugin/*.ts` + `package.json` into the packaged app's resources directory. In production, plugin files are resolved from `process.resourcesPath/plugin`.

## Plugin Paths

| Environment | Plugin Path |
|-------------|-------------|
| Development | `app.getAppPath()/plugin` |
| Production | `process.resourcesPath/plugin` |

## Output Structure

```
out/
├── main/
│   ├── index.js
│   └── events-tailer.js
├── preload/
│   └── index.js
└── renderer/
    ├── index.html
    └── assets/
        └── ... (bundled JS, CSS)
```
