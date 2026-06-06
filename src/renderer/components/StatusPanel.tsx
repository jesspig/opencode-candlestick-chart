import { useStore, type OpencodeState } from "../store"
import { t } from "../locale"

const LIGHTS: { key: OpencodeState; color: string; dimColor: string; labelKey: string }[] = [
  { key: "idle", color: "var(--tl-green)", dimColor: "var(--tl-green-dim)", labelKey: "idle" },
  { key: "busy", color: "var(--tl-yellow)", dimColor: "var(--tl-yellow-dim)", labelKey: "busy" },
  { key: "waiting", color: "var(--tl-red)", dimColor: "var(--tl-red-dim)", labelKey: "waiting" },
]

function lightClass(state: OpencodeState, key: OpencodeState) {
  if (state !== key) return ""
  if (key === "idle") return "tl-breathe"
  return "tl-pulse"
}

export default function StatusPanel() {
  const cumulativeLines = useStore((s) => s.cumulativeLines)
  const candles = useStore((s) => s.candles)
  const opencodeState = useStore((s) => s.opencodeState)
  const theme = useStore((s) => s.theme)
  const colorScheme = useStore((s) => s.colorScheme)
  const locale = useStore((s) => s.locale)

  const dark = theme === "dark"

  function upColor() {
    if (colorScheme === "redUp") return "var(--red)"
    return "var(--green)"
  }
  function downColor() {
    if (colorScheme === "redUp") return "var(--green)"
    return "var(--red)"
  }

  const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 0
  const prevClose = candles.length > 1 ? candles[candles.length - 2].close : lastClose
  const change = lastClose - prevClose
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0
  const isUp = change >= 0
  const changeColor = isUp ? upColor() : downColor()

  const history = candles.slice(-6).reverse()

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
        {t(locale, "close")}
      </div>
      <div
        className="font-mono text-lg font-bold leading-none tabular-nums"
        style={{ color: changeColor, marginBottom: 2 }}
      >
        {cumulativeLines}
      </div>
      <div
        className="font-mono text-[10px] tabular-nums"
        style={{ color: changeColor, marginBottom: 6 }}
      >
        {isUp ? "+" : ""}{change} ({isUp ? "+" : ""}{changePct.toFixed(2)}%)
      </div>

      <div className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: "var(--text-dim)", marginBottom: 4 }}>
        {t(locale, "history")}
      </div>

      <div className="flex-1 flex flex-col gap-0.5 min-h-0 overflow-y-auto">
        {history.map((c, i) => {
          const idx = candles.length - 1 - i
          const prevIdx = idx - 1
          const pClose = prevIdx >= 0 ? candles[prevIdx].close : c.close
          const chg = c.close - pClose
          const pct = pClose !== 0 ? (chg / pClose) * 100 : 0
          const col = chg >= 0 ? upColor() : downColor()
          return (
            <div key={c.time} className="flex items-center gap-1 text-[9px] leading-tight">
              <span className="font-mono shrink-0 tabular-nums" style={{ color: "var(--text-primary)", width: 40 }}>
                {c.close}
              </span>
              <span className="font-mono tabular-nums shrink-0 ml-auto" style={{ color: col }}>
                {chg >= 0 ? "+" : ""}{chg} ({pct >= 0 ? "+" : ""}{pct.toFixed(1)}%)
              </span>
            </div>
          )
        })}
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
          {t(locale, LIGHTS.find((l) => l.key === opencodeState)?.labelKey ?? "")}
        </span>
      </div>
    </div>
  )
}
