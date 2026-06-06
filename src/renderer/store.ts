import { create } from "zustand"
import type { Locale } from "./locale"

export type Theme = "light" | "dark"
export type ColorScheme = "redUp" | "greenUp"

export interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  filePath: string
  tool: "write" | "edit"
  linesAdded: number
  linesDeleted: number
  netChange: number
}

export interface RecentEvent {
  filePath: string
  netChange: number
  timestamp: number
  tool: "write" | "edit"
  cumOpen: number
}

export type OpencodeState = "idle" | "busy" | "waiting"

interface AppState {
  candles: CandleData[]
  sessionName: string
  cumulativeLines: number
  totalEvents: number
  totalFiles: number
  recentEvents: RecentEvent[]
  theme: Theme
  colorScheme: ColorScheme
  locale: Locale
  pinned: boolean
  connected: boolean
  opencodeState: OpencodeState

  addCandle: (candle: CandleData, stats: { cumulativeLines: number; totalEvents: number; totalFiles: number }, recent: RecentEvent[]) => void
  resetCandles: () => void
  setOpencodeStatus: (s: { connected: boolean; state: OpencodeState; sessionName?: string }) => void
  setTheme: (t: Theme) => void
  toggleColorScheme: () => void
  setLocale: (l: Locale) => void
  setPinned: (p: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  candles: [],
  sessionName: "",
  cumulativeLines: 0,
  totalEvents: 0,
  totalFiles: 0,
  recentEvents: [],
  theme: "dark",
  colorScheme: "redUp",
  locale: "zh",
  pinned: true,
  connected: false,
  opencodeState: "idle",

  addCandle: (candle, stats, recent) =>
    set((s) => ({
      candles: [...s.candles, candle],
      cumulativeLines: stats.cumulativeLines,
      totalEvents: stats.totalEvents,
      totalFiles: stats.totalFiles,
      recentEvents: recent,
    })),

  resetCandles: () => set({ candles: [], cumulativeLines: 0, totalEvents: 0, totalFiles: 0, recentEvents: [] }),

  setOpencodeStatus: (s) => set({ connected: s.connected, opencodeState: s.state, sessionName: s.sessionName ?? "" }),

  setTheme: (t) => set({ theme: t }),
  toggleColorScheme: () => set((s) => ({ colorScheme: s.colorScheme === "redUp" ? "greenUp" : "redUp" })),
  setLocale: (l) => set({ locale: l }),
  setPinned: (p) => set({ pinned: p }),
}))
