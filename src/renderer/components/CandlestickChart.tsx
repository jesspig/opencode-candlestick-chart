import { useEffect, useRef } from "react"
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData } from "lightweight-charts"
import { useStore } from "../store"

const VISIBLE_TICKS = 20

export default function CandlestickChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const candles = useStore((s) => s.candles)
  const theme = useStore((s) => s.theme)
  const colorScheme = useStore((s) => s.colorScheme)
  const isDark = theme === "dark"

  function upColor() {
    if (colorScheme === "redUp") return isDark ? "#f87171" : "#dc2626"
    return isDark ? "#4ade80" : "#16a34a"
  }
  function downColor() {
    if (colorScheme === "redUp") return isDark ? "#4ade80" : "#16a34a"
    return isDark ? "#f87171" : "#dc2626"
  }

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      autoSize: true,
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
        width: 56,
      },
      handleScroll: false,
      handleScale: false,
    })

    const uc = upColor()
    const dc = downColor()
    const series = chart.addSeries(CandlestickSeries, {
      upColor: uc,
      downColor: dc,
      borderUpColor: uc,
      borderDownColor: dc,
      wickUpColor: uc,
      wickDownColor: dc,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${price}`,
      },
    })

    chartRef.current = chart
    seriesRef.current = series

    const tooltip = tooltipRef.current
    if (tooltip) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.point) {
          tooltip.style.display = "none"
          return
        }
        const data = param.seriesData.get(series) as CandlestickData | undefined
        if (!data) {
          tooltip.style.display = "none"
          return
        }
        const d = new Date((param.time as number) * 1000)
        const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`
        const idx = candles.findIndex((c) => c.time === (param.time as number) * 1000)
        const prevClose = idx > 0 ? candles[idx - 1].close : data.open
        const change = data.close - prevClose
        const changePct = prevClose !== 0 ? ((change / prevClose) * 100) : 0
        const isUp = change >= 0
        const color = isUp ? upColor() : downColor()
        tooltip.innerHTML = `
          <div style="font-size:9px;font-family:JetBrains Mono,monospace;line-height:1.6;padding:4px 6px;border-radius:4px;background:${isDark ? "rgba(12,12,26,0.9)" : "rgba(245,245,255,0.9)"};color:${isDark ? "#e0e0f0" : "#3a3a5a"};border:1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}">
            <div>${time}</div>
            <div style="color:${color}">${data.close}  ${isUp ? "+" : ""}${change} (${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%)</div>
          </div>
        `
        tooltip.style.display = "block"
        tooltip.style.left = `${param.point.x + 12}px`
        tooltip.style.top = `${param.point.y - 12}px`
      })
    }

    return () => {
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
    const uc = upColor()
    const dc = downColor()
    seriesRef.current?.applyOptions({
      upColor: uc,
      downColor: dc,
      borderUpColor: uc,
      borderDownColor: dc,
      wickUpColor: uc,
      wickDownColor: dc,
    })
  }, [isDark, colorScheme])

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
    chartRef.current?.timeScale().fitContent()
  }, [candles])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none z-10"
        style={{ display: "none" }}
      />
    </div>
  )
}
