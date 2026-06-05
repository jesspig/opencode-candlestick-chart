import { app, BrowserWindow, ipcMain, nativeTheme, screen } from "electron"
import path from "path"
import { startTailer } from "./events-tailer"

let win: BrowserWindow | null = null

function createWindow() {
  const { width: sw } = screen.getPrimaryDisplay().workAreaSize

  win = new BrowserWindow({
    width: 480,
    height: 270,
    x: sw - 480 - 20,
    y: 60,
    resizable: false,
    frame: false,
    transparent: true,
    backgroundMaterial: "acrylic",
    hasShadow: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: !app.isPackaged,
    },
  })

  win.webContents.on("console-message", (_e, level, msg) => {
    console.log(`[renderer ${level}] ${msg}`)
  })

  win.webContents.on("did-fail-load", (_e, code, desc) => {
    console.error(`Failed to load: ${code} ${desc}`)
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"))
  }
}

app.whenReady().then(() => {
  createWindow()
  startTailer()

  ipcMain.on("window:close", () => {
    win?.destroy()
    app.quit()
  })

  ipcMain.on("window:pin", (_, pinned: boolean) => {
    win?.setAlwaysOnTop(pinned)
  })

  ipcMain.on("window:theme", (_, theme: "light" | "dark") => {
    nativeTheme.themeSource = theme
    win?.webContents.send("theme:changed", theme)
  })
})

app.on("window-all-closed", () => {
  app.quit()
})
