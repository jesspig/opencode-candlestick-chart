import { useStore, type OpencodeState } from "../store"

const LIGHTS: { key: OpencodeState; color: string; dimColor: string; label: string }[] = [
  { key: "idle", color: "var(--tl-green)", dimColor: "var(--tl-green-dim)", label: "Idle" },
  { key: "busy", color: "var(--tl-yellow)", dimColor: "var(--tl-yellow-dim)", label: "Busy" },
  { key: "waiting", color: "var(--tl-red)", dimColor: "var(--tl-red-dim)", label: "Waiting" },
]

function lightClass(state: OpencodeState, key: OpencodeState) {
  if (state !== key) return ""
  if (key === "idle") return "tl-breathe"
  return "tl-pulse"
}

export default function StatusPanel() {
  const cumulativeLines = useStore((s) => s.cumulativeLines)
  const totalEvents = useStore((s) => s.totalEvents)
  const totalFiles = useStore((s) => s.totalFiles)
  const recentEvents = useStore((s) => s.recentEvents)
  const opencodeState = useStore((s) => s.opencodeState)
  const theme = useStore((s) => s.theme)

  const dark = theme === "dark"

  return (
    <div
      className="flex flex-col shrink-0 border-l overflow-hidden"
      style={{
        width: 130,
        borderColor: "var(--glass-border)",
        padding: "8px 8px 6px",
      }}
    >
      <div className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: "var(--text-dim)", marginBottom: 6 }}>
        NET CHANGE
      </div>
      <div
        className="font-mono text-lg font-bold leading-none tabular-nums"
        style={{ color: cumulativeLines >= 0 ? "var(--green)" : "var(--red)", marginBottom: 10 }}
      >
        {cumulativeLines >= 0 ? `+${cumulativeLines}` : cumulativeLines}
      </div>

      <div className="flex gap-3 mb-2">
        <div className="flex-1">
          <div className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: "var(--text-dim)" }}>
            EVENTS
          </div>
          <div className="font-mono text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {totalEvents}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: "var(--text-dim)" }}>
            FILES
          </div>
          <div className="font-mono text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {totalFiles}
          </div>
        </div>
      </div>

      <div className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: "var(--text-dim)", marginBottom: 4 }}>
        RECENT
      </div>

      <div className="flex-1 flex flex-col gap-0.5 min-h-0 overflow-y-auto">
        {recentEvents.length === 0 ? (
          <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>
            No events yet
          </div>
        ) : (
          [...recentEvents].reverse().map((e, i) => {
            const t = new Date(e.timestamp)
            const time = `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`
            const file = e.filePath.split(/[/\\]/).pop() || e.filePath
            return (
              <div key={i} className="flex items-center gap-1 text-[9px] leading-tight">
                <span className="font-mono shrink-0" style={{ color: "var(--text-dim)", width: 32 }}>
                  {time}
                </span>
                <span className="truncate min-w-0" style={{ color: "var(--text-primary)" }}>
                  {file}
                </span>
                <span
                  className="font-mono tabular-nums shrink-0 ml-auto"
                  style={{ color: e.netChange >= 0 ? "var(--green)" : "var(--red)" }}
                >
                  {e.netChange >= 0 ? `+${e.netChange}` : e.netChange}
                </span>
              </div>
            )
          })
        )}
      </div>

      <div
        className="flex items-center justify-between pt-1 mt-1"
        style={{ borderTop: "1px solid var(--glass-border)" }}
      >
        <div className="flex items-center gap-0.5">
          {LIGHTS.map((light) => {
            const isActive = opencodeState === light.key
            return (
              <div key={light.key} className="relative flex items-center justify-center" style={{ width: 12, height: 12 }}>
                {isActive ? (
                  <span
                    className="absolute rounded-full"
                    style={{
                      width: 12, height: 12,
                      border: `2px solid ${light.color}`,
                      opacity: opencodeState === "busy" ? 0.6 : 0.4,
                      "--ring-color": light.color,
                    } as any}
                  />
                ) : null}
                <span
                  className={`rounded-full ${lightClass(opencodeState, light.key)}`}
                  style={{
                    width: 8, height: 8,
                    backgroundColor: isActive ? light.color : (dark ? light.dimColor : light.dimColor),
                    boxShadow: isActive ? `0 0 4px ${light.color}` : "none",
                  }}
                />
              </div>
            )
          })}
        </div>
        <span className="text-[8px] tracking-wider uppercase font-semibold" style={{ color: "var(--text-dim)" }}>
          {LIGHTS.find((l) => l.key === opencodeState)?.label}
        </span>
      </div>
    </div>
  )
}
