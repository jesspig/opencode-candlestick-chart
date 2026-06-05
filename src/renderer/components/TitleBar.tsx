import { useStore } from "../store"

export default function TitleBar() {
  const theme = useStore((s) => s.theme)
  const pinned = useStore((s) => s.pinned)
  const cumulativeLines = useStore((s) => s.cumulativeLines)
  const sessionName = useStore((s) => s.sessionName)
  const connected = useStore((s) => s.connected)
  const setTheme = useStore((s) => s.setTheme)
  const setPinned = useStore((s) => s.setPinned)

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    window.electronAPI.setTheme(next)
  }

  const togglePin = () => {
    const next = !pinned
    setPinned(next)
    window.electronAPI.pin(next)
  }

  const dotColor = connected ? "var(--tl-green)" : "var(--tl-red)"

  return (
    <div
      className="titlebar-glass flex items-center justify-between px-3 shrink-0"
      style={{ height: 32, WebkitAppRegion: "drag" } as any}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="inline-block w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor: dotColor,
            boxShadow: `0 0 4px ${dotColor}`,
          }}
        />
        <span className="text-xs font-semibold tracking-wide truncate max-w-[160px]" style={{ color: "var(--text-primary)" }}>
          {sessionName ? sessionName.substring(0, 12) : "CODE DIFF"}
        </span>
      </div>

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" } as any}>
        <span className="text-[10px] font-mono tabular-nums" style={{ color: connected ? "var(--green)" : "var(--text-dim)" }}>
          {cumulativeLines >= 0 ? `+${cumulativeLines}` : cumulativeLines}
        </span>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center rounded hover:bg-white/10 transition-colors"
          style={{ width: 24, height: 24, fontSize: 13 }}
          title={`Theme: ${theme}`}
        >
          {theme === "dark" ? "\u2600\uFE0F" : "\u{1F319}"}
        </button>

        <button
          onClick={togglePin}
          className="flex items-center justify-center rounded hover:bg-white/10 transition-colors text-xs"
          style={{ width: 24, height: 24, color: pinned ? "var(--accent)" : "var(--text-secondary)" }}
          title={pinned ? "Unpin" : "Pin"}
        >
          📌
        </button>

        <button
          onClick={() => window.electronAPI.close()}
          className="flex items-center justify-center rounded hover:bg-red-500/20 transition-colors"
          style={{ width: 24, height: 24, fontSize: 13, color: "var(--text-secondary)" }}
          title="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
