import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import SettingsApp from "./components/SettingsApp"
import "./styles/app.css"

if (!window.electronAPI) {
  window.electronAPI = {
    close: () => {},
    pin: () => {},
    setTheme: () => {},
    onCandle: () => () => {},
    onThemeChanged: () => () => {},
    onOpencodeStatus: () => () => {},
    onReset: () => () => {},
    onSettingsChanged: () => () => {},
    installPlugin: async () => ({ success: false, error: "Browser mock only" }),
    openSettings: () => {},
  }
}

if (!window.settingsAPI) {
  window.settingsAPI = {
    getSettings: async () => ({ theme: "dark", locale: "zh", colorScheme: "redUp" }),
    setTheme: () => {},
    setLocale: () => {},
    toggleColorScheme: () => {},
    installPlugin: async () => ({ success: false, error: "Browser mock only" }),
    onSettingsChanged: () => () => {},
    close: () => {},
  }
}

const params = new URLSearchParams(window.location.search)
const isSettings = params.get("view") === "settings"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isSettings ? <SettingsApp /> : <App />}
  </React.StrictMode>
)
