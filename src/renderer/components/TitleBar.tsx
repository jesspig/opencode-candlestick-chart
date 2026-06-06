import { useStore } from "../store"
import { t } from "../locale"

export default function TitleBar() {
  const pinned = useStore((s) => s.pinned)
  const sessionName = useStore((s) => s.sessionName)
  const connected = useStore((s) => s.connected)
  const locale = useStore((s) => s.locale)
  const setPinned = useStore((s) => s.setPinned)

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
          {sessionName ? sessionName.substring(0, 12) : t(locale, "title")}
        </span>
      </div>

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" } as any}>
        <button
          onClick={togglePin}
          className="flex items-center justify-center rounded hover:bg-white/10 transition-colors text-xs"
          style={{ width: 24, height: 24, color: pinned ? "var(--accent)" : "var(--text-secondary)" }}
          title={pinned ? "Unpin" : "Pin"}
        >
          📌
        </button>

        <button
          onClick={() => window.electronAPI.openSettings()}
          className="flex items-center justify-center rounded hover:bg-white/10 transition-colors"
          style={{ width: 24, height: 24, fontSize: 13, color: "var(--text-secondary)" }}
          title={t(locale, "settings")}
        >
          ⚙
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
