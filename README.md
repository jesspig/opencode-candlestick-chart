# OpenCode Candlestick Chart

Electron 桌面小组件，实时监控 opencode 的代码编辑并渲染为 K 线图。

![version](https://img.shields.io/badge/version-0.1.0-blue)

## 功能

- **实时监控** — 每 500ms 轮询事件文件，即时获取新的编辑事件
- **K 线图** — 每次 opencode 工具执行（write/edit）生成一根蜡烛
- **状态面板** — 累计净行数、最近 8 根 K 线历史、opencode 连接状态灯
- **深色/浅色主题** — 支持 CSS 自定义属性，设置窗口中一键切换
- **涨跌配色** — 支持红涨绿跌 / 绿涨红跌两种配色
- **国际化** — 中 / 英文界面
- **设置窗口** — 独立设置面板，控制主题、配色、语言、插件
- **跨平台** — 支持 Windows / macOS / Linux

## 快速开始

```bash
pnpm install
pnpm dev            # 开发模式（HMR）
pnpm build          # 生产构建
pnpm package:win    # 打包 Windows 便携版
pnpm package:mac    # 打包 macOS DMG
pnpm package:linux  # 打包 Linux AppImage
```

## 架构

```
opencode plugin → 写入 CandleEvent JSONL
  → Electron 主进程每 500ms 轮询
    → IPC → React + Zustand 渲染进程
      → lightweight-charts K 线图
```

## 插件安装

插件随安装包一起分发，**首次启动自动安装**到 `~/.config/opencode/plugin/`。
设置面板提供"重新安装"按钮，用于手动修复。

## 项目结构

```
├── plugin/               ← opencode 插件
├── src/
│   ├── main/             ← Electron 主进程
│   ├── preload/          ← contextBridge API
│   └── renderer/         ← React 前端
├── .repo_wiki/           ← 详细文档
├── .github/workflows/    ← CI/CD
├── electron-builder.yml
└── package.json
```

## 技术栈

| 层 | 技术 |
|---|------|
| 桌面框架 | Electron（electron-vite） |
| 前端 | React 18 + TypeScript |
| 状态管理 | Zustand |
| 图表 | lightweight-charts（TradingView） |
| IPC 桥 | contextBridge |
| 插件 | TypeScript, @opencode-ai/plugin, diff |
| 构建 | electron-vite + electron-builder |

## 文档

详细架构、数据流、构建指南请参见 [`.repo_wiki/index.md`](.repo_wiki/index.md)。
