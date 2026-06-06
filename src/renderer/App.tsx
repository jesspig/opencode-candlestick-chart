import { useEffect } from "react"
import { useStore } from "./store"
import TitleBar from "./components/TitleBar"
import CandlestickChart from "./components/CandlestickChart"
import StatusPanel from "./components/StatusPanel"

declare global {
  interface Window {
    electronAPI: {
      close: () => void
      pin: (p: boolean) => void
      setTheme: (t: "light" | "dark") => void
      onCandle: (cb: (data: any) => void) => () => void
      onThemeChanged: (cb: (t: string) => void) => () => void
      onOpencodeStatus: (cb: (data: { connected: boolean; state: "idle" | "busy" | "waiting"; sessionName?: string }) => void) => () => void
      onReset: (cb: () => void) => () => void
      installPlugin: () => Promise<{ success: boolean; error?: string }>
      openSettings: () => void
    }
  }
}

export default function App() {
  const addCandle = useStore((s) => s.addCandle)
  const resetCandles = useStore((s) => s.resetCandles)
  const setTheme = useStore((s) => s.setTheme)
  const toggleColorScheme = useStore((s) => s.toggleColorScheme)
  const setLocale = useStore((s) => s.setLocale)
  const setOpencodeStatus = useStore((s) => s.setOpencodeStatus)
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    const unsub1 = window.electronAPI.onCandle(({ candle, stats, recentEvents }) => {
      addCandle(candle, stats, recentEvents)
    })
    const unsub2 = window.electronAPI.onThemeChanged((t) => {
      setTheme(t as "light" | "dark")
    })
    const unsub3 = window.electronAPI.onOpencodeStatus((s) => {
      setOpencodeStatus(s)
    })
    const unsub4 = window.electronAPI.onReset(() => {
      resetCandles()
    })
    const unsub5 = window.electronAPI.onSettingsChanged?.((data) => {
      if (data.colorScheme) toggleColorScheme()
      if (data.locale) setLocale(data.locale as any)
    })
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5?.() }
  }, [])

  useEffect(() => {
    document.body.setAttribute("data-theme", theme)
  }, [theme])

  return (
    <div className="glass w-full h-full flex flex-col overflow-hidden relative">
      <TitleBar />
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0">
          <CandlestickChart />
        </div>
        <StatusPanel />
      </div>
    </div>
  )
}
