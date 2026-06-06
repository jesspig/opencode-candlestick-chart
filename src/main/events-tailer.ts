import fs from "fs"
import path from "path"
import os from "os"
import { BrowserWindow } from "electron"

const EVENTS_FILE = path.join(os.homedir(), ".config", "opencode", "monitor-events.jsonl")
const POLL_INTERVAL = 500

export interface CandleEvent {
  type: "candle"
  time: number
  filePath: string
  projectName?: string
  tool: "write" | "edit"
  linesAdded: number
  linesDeleted: number
  netChange: number
}

export interface StateEvent {
  type: "state"
  state: "idle" | "busy" | "waiting"
  time: number
}

let filePos = 0
let events: CandleEvent[] = []
let cumulative = 0
let lastEventTime = 0
let opencodeState: "idle" | "busy" | "waiting" = "idle"
let sessionName = ""

function sendOpencodeStatus() {
  const sender = BrowserWindow.getAllWindows()[0]?.webContents
  if (!sender) return

  const fileExists = fs.existsSync(EVENTS_FILE)
  const connected = fileExists

  sender.send("opencode:status", { connected, state: opencodeState, sessionName })
}

function sendReset() {
  const sender = BrowserWindow.getAllWindows()[0]?.webContents
  if (sender) {
    sender.send("opencode:reset")
  }
}

let lastKnownConnected = false

function readAndBroadcast() {
  try {
    if (!fs.existsSync(EVENTS_FILE)) {
      if (lastKnownConnected) {
        lastKnownConnected = false
        sendOpencodeStatus()
      }
      return
    }
    if (!lastKnownConnected) {
      lastKnownConnected = true
      sendOpencodeStatus()
    }

    const stat = fs.statSync(EVENTS_FILE)
    if (stat.size <= filePos) return

    const fd = fs.openSync(EVENTS_FILE, "r")
    const size = stat.size - filePos
    const buf = Buffer.alloc(size)
    const bytesRead = fs.readSync(fd, buf, 0, size, filePos)
    fs.closeSync(fd)

    if (bytesRead === 0) return
    filePos += bytesRead

    const lines = buf.toString("utf-8", 0, bytesRead).split("\n").filter(Boolean)
    for (const line of lines) {
      try {
        const evt = JSON.parse(line)
        if (evt.type === "candle") {
          events.push(evt)
          lastEventTime = evt.time
          const open = cumulative
          cumulative += evt.netChange
          broadcast(evt, open, cumulative, events.length)
        } else if (evt.type === "state") {
          opencodeState = evt.state
          sendOpencodeStatus()
        } else if (evt.type === "session") {
          sessionName = evt.sessionID
          events = []
          cumulative = 0
          sendOpencodeStatus()
          sendReset()
        }
      } catch { }
    }
  } catch { }
}

export function startTailer() {
  if (!fs.existsSync(path.dirname(EVENTS_FILE))) {
    fs.mkdirSync(path.dirname(EVENTS_FILE), { recursive: true })
  }

  filePos = fs.existsSync(EVENTS_FILE) ? fs.statSync(EVENTS_FILE).size : 0
  readAndBroadcast()
  sendOpencodeStatus()

  setInterval(readAndBroadcast, POLL_INTERVAL)
}

function broadcast(evt: CandleEvent, open: number, close: number, index: number) {
  const high = open + evt.linesAdded
  const low = open - evt.linesDeleted
  const candle = {
    time: Math.floor(evt.time / 1000) as any,
    open,
    high: Math.max(high, low),
    low: Math.min(high, low),
    close,
    filePath: evt.filePath,
    tool: evt.tool,
    linesAdded: evt.linesAdded,
    linesDeleted: evt.linesDeleted,
    netChange: evt.netChange,
  }

  const stats = {
    cumulativeLines: close,
    totalEvents: index,
    totalFiles: new Set(events.map(e => e.filePath)).size,
  }

  const recentEvents = events
    .map((e, i) => ({
      filePath: e.filePath,
      netChange: e.netChange,
      timestamp: e.time,
      tool: e.tool,
      cumOpen: i === 0 ? 0 : events.slice(0, i).reduce((s, x) => s + x.netChange, 0),
    }))
    .slice(-4)

  const sender = BrowserWindow.getAllWindows()[0]?.webContents
  if (sender) {
    sender.send("candle:new", { candle, stats, recentEvents })
  }
}
