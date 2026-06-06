import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
  close: () => ipcRenderer.send("window:close"),
  pin: (pinned: boolean) => ipcRenderer.send("window:pin", pinned),
  setTheme: (theme: "light" | "dark") => ipcRenderer.send("window:theme", theme),

  onCandle: (cb: (data: any) => void) => {
    const handler = (_: any, data: any) => cb(data)
    ipcRenderer.on("candle:new", handler)
    return () => ipcRenderer.removeListener("candle:new", handler)
  },
  onThemeChanged: (cb: (theme: string) => void) => {
    const handler = (_: any, t: string) => cb(t)
    ipcRenderer.on("theme:changed", handler)
    return () => ipcRenderer.removeListener("theme:changed", handler)
  },
  onOpencodeStatus: (cb: (data: { connected: boolean; state: "idle" | "busy" | "waiting"; sessionName?: string }) => void) => {
    const handler = (_: any, data: any) => cb(data)
    ipcRenderer.on("opencode:status", handler)
    return () => ipcRenderer.removeListener("opencode:status", handler)
  },
  onReset: (cb: () => void) => {
    const handler = () => cb()
    ipcRenderer.on("opencode:reset", handler)
    return () => ipcRenderer.removeListener("opencode:reset", handler)
  },
  onSettingsChanged: (cb: (data: { theme?: string; locale?: string; colorScheme?: string }) => void) => {
    const handler = (_: any, data: any) => cb(data)
    ipcRenderer.on("settings:changed", handler)
    return () => ipcRenderer.removeListener("settings:changed", handler)
  },

  installPlugin: () => ipcRenderer.invoke("plugin:install"),
  openSettings: () => ipcRenderer.send("window:open-settings"),
})

contextBridge.exposeInMainWorld("settingsAPI", {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  setTheme: (t: "light" | "dark") => ipcRenderer.send("settings:set-theme", t),
  setLocale: (l: "zh" | "en") => ipcRenderer.send("settings:set-locale", l),
  toggleColorScheme: () => ipcRenderer.send("settings:toggle-color-scheme"),
  installPlugin: () => ipcRenderer.invoke("plugin:install"),
  onSettingsChanged: (cb: (data: any) => void) => {
    const handler = (_: any, data: any) => cb(data)
    ipcRenderer.on("settings:changed", handler)
    return () => ipcRenderer.removeListener("settings:changed", handler)
  },
  close: () => ipcRenderer.send("settings:close"),
})
