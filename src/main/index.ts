import { app, BrowserWindow, ipcMain, nativeTheme, screen } from "electron"
import path from "path"
import fs from "fs"
import os from "os"
import { execSync } from "child_process"
import { startTailer } from "./events-tailer"

let win: BrowserWindow | null = null
let settingsWin: BrowserWindow | null = null

const settingsState: {
  theme: "light" | "dark"
  locale: "zh" | "en"
  colorScheme: "redUp" | "greenUp"
} = {
  theme: "dark",
  locale: "zh",
  colorScheme: "redUp",
}

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

function createSettingsWindow() {
  if (settingsWin) {
    settingsWin.focus()
    return
  }

  settingsWin = new BrowserWindow({
    width: 280,
    height: 380,
    resizable: false,
    frame: false,
    transparent: true,
    backgroundMaterial: "acrylic",
    hasShadow: true,
    alwaysOnTop: false,
    skipTaskbar: true,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    settingsWin.loadURL(`${process.env.ELECTRON_RENDERER_URL.replace(/\/?$/, "")}?view=settings`)
  } else {
    settingsWin.loadFile(path.join(__dirname, "../renderer/index.html"), { query: { view: "settings" } })
  }

  settingsWin.on("closed", () => {
    settingsWin = null
  })
}

function pluginSourceDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "plugin")
  }
  return path.join(app.getAppPath(), "plugin")
}

function sendToMainWindow(channel: string, data: any) {
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, data)
  }
}

function sendToSettingsWindow(channel: string, data: any) {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.webContents.send(channel, data)
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
    settingsState.theme = theme
    nativeTheme.themeSource = theme
    sendToMainWindow("theme:changed", theme)
    sendToSettingsWindow("settings:changed", { theme })
  })

  ipcMain.on("window:open-settings", () => {
    const bounds = win ? win.getBounds() : { x: 0, y: 60, width: 480 }
    const display = screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y })
    const { x: dx, width: dw } = display.workArea
    const leftSpace = bounds.x - dx
    const rightSpace = dx + dw - (bounds.x + bounds.width)
    const GW = 280
    const showOnRight = leftSpace >= GW && rightSpace < GW ? false : true
    const sx = showOnRight ? bounds.x + bounds.width : bounds.x - GW
    createSettingsWindow()
    if (settingsWin) {
      settingsWin.setPosition(sx, bounds.y)
    }
  })

  // --- Settings window IPC ---

  ipcMain.handle("settings:get", () => ({
    ...settingsState,
  }))

  ipcMain.on("settings:close", () => {
    settingsWin?.destroy()
    settingsWin = null
  })

  ipcMain.on("settings:set-theme", (_, theme: "light" | "dark") => {
    settingsState.theme = theme
    nativeTheme.themeSource = theme
    sendToMainWindow("theme:changed", theme)
    sendToSettingsWindow("settings:changed", { theme })
  })

  ipcMain.on("settings:set-locale", (_, locale: "zh" | "en") => {
    settingsState.locale = locale
    sendToMainWindow("settings:changed", { locale })
    sendToSettingsWindow("settings:changed", { locale })
  })

  ipcMain.on("settings:toggle-color-scheme", () => {
    settingsState.colorScheme = settingsState.colorScheme === "redUp" ? "greenUp" : "redUp"
    sendToMainWindow("settings:changed", { colorScheme: settingsState.colorScheme })
    sendToSettingsWindow("settings:changed", { colorScheme: settingsState.colorScheme })
  })

  // --- Plugin install ---

  ipcMain.handle("plugin:install", async () => {
    const pluginDir = path.join(os.homedir(), ".config", "opencode", "plugin")
    try {
      fs.mkdirSync(pluginDir, { recursive: true })
      const src = pluginSourceDir()
      for (const file of ["monitor.ts", "package.json"]) {
        const srcFile = path.join(src, file)
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, path.join(pluginDir, file))
        }
      }
      execSync(`npm install`, { cwd: pluginDir, stdio: "pipe" })
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message ?? String(e) }
    }
  })
})

app.on("window-all-closed", () => {
  app.quit()
})
