import { createContext, useContext, useState, type ReactNode } from "react"
import { id, en } from "../i18n"

type Lang = "id" | "en"

const translations = { id, en }

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: "id",
  setLang: () => {},
  t: (k) => k,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "id")

  const setLangAndStore = (l: Lang) => {
    localStorage.setItem("lang", l)
    setLang(l)
  }

  const t = (key: string) => (translations[lang] as Record<string, string>)[key] ?? (translations.en as Record<string, string>)[key] ?? key

  return (
    <LangContext.Provider value={{ lang, setLang: setLangAndStore, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LangContext)
}
