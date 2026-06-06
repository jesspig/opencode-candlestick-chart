import en from "./locales/en.json"
import zh from "./locales/zh.json"

export type Locale = "en" | "zh"

const messages: Record<Locale, Record<string, string>> = { en, zh }

export function t(locale: Locale, key: string): string {
  return messages[locale]?.[key] ?? key
}
