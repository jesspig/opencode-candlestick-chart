import type { Plugin } from "@opencode-ai/plugin"
import { diffLines } from "diff"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

const LOG = path.join(os.homedir(), ".config", "opencode", "monitor-events.jsonl")
const snapshots = new Map<string, string>()

export const MonitorPlugin: Plugin = async () => {
  if (!fs.existsSync(path.dirname(LOG))) {
    fs.mkdirSync(path.dirname(LOG), { recursive: true })
  }

  return {
    "tool.execute.after": async (input, output) => {
      if (input.tool !== "write" && input.tool !== "edit") return

      const fp = input.args?.filePath
      if (typeof fp !== "string" || !fs.existsSync(fp)) return

      const cwd = (input as any).cwd || (input.args as any)?.cwd || process.cwd()
      const projectName = path.basename(cwd)

      const oldContent = snapshots.get(fp) ?? ""
      const newContent = fs.readFileSync(fp, "utf-8")

      if (oldContent === newContent) return

      const changes = diffLines(oldContent, newContent)
      let added = 0
      let deleted = 0
      for (const part of changes) {
        if (part.added) added += part.count ?? 0
        if (part.removed) deleted += part.count ?? 0
      }

      snapshots.set(fp, newContent)

      const event = JSON.stringify({
        type: "candle",
        time: Date.now(),
        filePath: fp,
        projectName,
        tool: input.tool as "write" | "edit",
        linesAdded: added,
        linesDeleted: deleted,
        netChange: added - deleted,
      }) + "\n"

      fs.appendFileSync(LOG, event, "utf-8")
    },
  }
}

export default MonitorPlugin
