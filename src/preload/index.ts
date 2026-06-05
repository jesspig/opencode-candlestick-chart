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
})
