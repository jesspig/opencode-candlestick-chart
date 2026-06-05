import { useEffect, useRef } from "react"
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData } from "lightweight-charts"
import { useStore } from "../store"

const VISIBLE_TICKS = 12

export default function CandlestickChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const candles = useStore((s) => s.candles)
  const theme = useStore((s) => s.theme)
  const isDark = theme === "dark"

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { type: "solid", color: isDark ? "#0c0c1a" : "#f5f5ff" },
        textColor: isDark ? "#9898b0" : "#4a4a6a",
        fontSize: 10,
        fontFamily: "JetBrains Mono, monospace",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)" },
        horzLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)" },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)", style: 2, labelBackgroundColor: isDark ? "#1a1a2e" : "#ffffff" },
        horzLine: { color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)", style: 2, labelBackgroundColor: isDark ? "#1a1a2e" : "#ffffff" },
      },
      timeScale: {
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        timeVisible: false,
        tickMarkFormatter: (t: number) => {
          const d = new Date(t * 1000)
          return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
        },
        visible: true,
      },
      rightPriceScale: {
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      handleScroll: false,
      handleScale: false,
    })

    const upColor = isDark ? "#4ade80" : "#16a34a"
    const downColor = isDark ? "#f87171" : "#dc2626"
    const series = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${price >= 0 ? "+" : ""}${price}`,
      },
    })

    chartRef.current = chart
    seriesRef.current = series

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      chart.applyOptions({ width, height })
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.applyOptions({
      layout: {
        background: { type: "solid", color: isDark ? "#0c0c1a" : "#f5f5ff" },
        textColor: isDark ? "#9898b0" : "#4a4a6a",
      },
      grid: {
        vertLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)" },
        horzLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)" },
      },
    })
    const upColor = isDark ? "#4ade80" : "#16a34a"
    const downColor = isDark ? "#f87171" : "#dc2626"
    seriesRef.current?.applyOptions({
      upColor,
      downColor,
      borderUpColor: upColor,
      borderDownColor: downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
    })
  }, [isDark])

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return
    const data: CandlestickData[] = candles.map((c) => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))
    seriesRef.current.setData(data)
    const chart = chartRef.current
    if (chart) {
      const range = Math.max(candles.length, VISIBLE_TICKS)
      chart.timeScale().setVisibleLogicalRange({
        from: range - VISIBLE_TICKS,
        to: range,
      })
    }
  }, [candles])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    />
  )
}
