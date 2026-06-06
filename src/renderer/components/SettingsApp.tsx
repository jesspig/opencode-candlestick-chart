import { useState, useEffect } from "react"
import { t, type Locale } from "../locale"

declare global {
  interface Window {
    settingsAPI: {
      getSettings: () => Promise<{ theme: string; locale: string; colorScheme: string }>
      setTheme: (t: string) => void
      setLocale: (l: string) => void
      toggleColorScheme: () => void
      installPlugin: () => Promise<{ success: boolean; error?: string }>
      onSettingsChanged: (cb: (data: any) => void) => () => void
      close: () => void
    }
  }
}

type Theme = "light" | "dark"
type ColorScheme = "redUp" | "greenUp"

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.5-4.5-10-10-10z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--glass-border)",
      }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2.5">
      <span style={{ color: "var(--text-dim)" }} className="shrink-0">
        {icon}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
        {label}
      </span>
    </div>
  )
}

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  renderLabel,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  renderLabel: (v: T) => React.ReactNode
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              height: 36,
              background: active ? "var(--accent)" : "transparent",
              color: active ? "#fff" : "var(--text-secondary)",
              border: active ? "none" : "1px solid var(--glass-border)",
            }}
          >
            {renderLabel(opt)}
          </button>
        )
      })}
    </div>
  )
}

export default function SettingsApp() {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("redUp")
  const [locale, setLocaleState] = useState<Locale>("zh")
  const [installState, setInstallState] = useState<"idle" | "installing" | "ok" | "fail">("idle")

  useEffect(() => {
    window.settingsAPI.getSettings().then((s: any) => {
      setThemeState(s.theme)
      setColorSchemeState(s.colorScheme)
      setLocaleState(s.locale)
    })
    const unsub = window.settingsAPI.onSettingsChanged((data) => {
      if (data.theme) setThemeState(data.theme)
      if (data.locale) setLocaleState(data.locale)
      if (data.colorScheme) setColorSchemeState(data.colorScheme as ColorScheme)
    })
    return unsub
  }, [])

  function handleSetTheme(t: Theme) {
    setThemeState(t)
    window.settingsAPI.setTheme(t)
  }

  function handleSetLocale(l: Locale) {
    setLocaleState(l)
    window.settingsAPI.setLocale(l)
  }

  function handleToggleColorScheme() {
    const next = colorScheme === "redUp" ? "greenUp" : "redUp"
    setColorSchemeState(next)
    window.settingsAPI.toggleColorScheme()
  }

  async function handleInstallPlugin() {
    setInstallState("installing")
    const res = await window.settingsAPI.installPlugin()
    setInstallState(res.success ? "ok" : "fail")
    if (res.success) {
      setTimeout(() => setInstallState("idle"), 2500)
    }
  }

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 12,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "var(--text-primary)",
        boxShadow: "var(--shadow)",
      }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-3 shrink-0"
        style={{ height: 40, borderBottom: "1px solid var(--glass-border)", WebkitAppRegion: "drag" } as any}
      >
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="text-xs font-semibold tracking-wide" style={{ color: "var(--text-primary)" }}>
            {t(locale, "settings")}
          </span>
        </div>
        <button
          onClick={() => window.settingsAPI.close()}
          className="flex items-center justify-center rounded-md transition-colors hover:bg-red-500/15 shrink-0"
          style={{ width: 28, height: 28, WebkitAppRegion: "no-drag" } as any}
          aria-label="Close settings"
        >
          <XIcon />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-3 py-3 space-y-2.5 overflow-y-auto">

        {/* Theme */}
        <SectionCard>
          <SectionLabel icon={<MoonIcon />} label={t(locale, "theme")} />
          <ToggleGroup
            options={["dark", "light"] as Theme[]}
            value={theme}
            onChange={handleSetTheme}
            renderLabel={(v) => (
              <>
                {v === "dark" ? <MoonIcon /> : <SunIcon />}
                {v === "dark" ? t(locale, "dark") : t(locale, "light")}
              </>
            )}
          />
        </SectionCard>

        {/* Color Scheme */}
        <SectionCard>
          <SectionLabel icon={<PaletteIcon />} label={t(locale, "colorScheme")} />
          <button
            onClick={handleToggleColorScheme}
            className="w-full flex items-center justify-between rounded-md text-xs font-medium transition-all"
            style={{
              height: 36,
              padding: "0 12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
            }}
          >
            <div className="flex items-center gap-2">
              <ArrowUpIcon />
              <ArrowDownIcon />
            </div>
            <span>{t(locale, colorScheme)}</span>
          </button>
        </SectionCard>

        {/* Language */}
        <SectionCard>
          <SectionLabel icon={<GlobeIcon />} label={t(locale, "language")} />
          <ToggleGroup
            options={["zh", "en"] as Locale[]}
            value={locale}
            onChange={handleSetLocale}
            renderLabel={(v) => <>{v === "zh" ? "中文" : "EN"}</>}
          />
        </SectionCard>

        {/* Plugin */}
        <SectionCard>
          <SectionLabel icon={<DownloadIcon />} label="Plugin" />
          <button
            onClick={handleInstallPlugin}
            disabled={installState === "installing"}
            className="w-full flex items-center justify-center gap-2 rounded-md text-xs font-semibold transition-all"
            style={{
              height: 38,
              background:
                installState === "ok" ? "var(--green)" :
                installState === "fail" ? "var(--red)" :
                installState === "installing" ? "var(--accent)" :
                "transparent",
              color: installState === "idle" ? "var(--text-secondary)" : "#fff",
              border: installState === "idle" ? "1px solid var(--glass-border)" : "none",
              opacity: installState === "installing" ? 0.65 : 1,
            }}
          >
            {installState === "installing" ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                {t(locale, "installing")}
              </>
            ) : installState === "ok" ? (
              <>
                <CheckIcon />
                {t(locale, "installOk")}
              </>
            ) : installState === "fail" ? (
              <>
                <XIcon />
                {t(locale, "installFail")}
              </>
            ) : (
              <>
                <RefreshIcon />
                {t(locale, "reinstallPlugin")}
              </>
            )}
          </button>
        </SectionCard>

      </div>
    </div>
  )
}
