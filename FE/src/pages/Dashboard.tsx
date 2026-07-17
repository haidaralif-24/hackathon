import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MessageCircle, Bot } from "lucide-react"
import Button from "../components/Button"
import { listJournalEntries, saveJournalEntry } from "../api/client"
import type { JournalEntry, Mood } from "../types"
import { useLanguage } from "../contexts/LanguageContext"

const MOODS: { value: Mood; emoji: string; labelKey: string }[] = [
  { value: "great", emoji: "😁", labelKey: "mood_great" },
  { value: "good", emoji: "😊", labelKey: "mood_good" },
  { value: "okay", emoji: "😐", labelKey: "mood_okay" },
  { value: "bad", emoji: "😔", labelKey: "mood_bad" },
  { value: "terrible", emoji: "😢", labelKey: "mood_terrible" },
]

const TONE_KEYS = ["tone_clinical", "tone_empathetic", "tone_straightforward", "tone_custom"]

const PRESET_PERSONA_DESC: Record<string, string> = {
  tone_clinical: "Direct, clinical tone — concise and factual",
  tone_empathetic: "Warm, approachable — empathetic and encouraging",
  tone_straightforward: "Thorough, educational — explains reasoning",
}

function getPersonaInfo(t: (k: string) => string): {
  label: string
  desc: string
  isCustom: boolean
  isConfigured: boolean
} {
  const raw = localStorage.getItem("chat_tone")
  let key = "tone_clinical"

  if (raw) {
    if (TONE_KEYS.includes(raw)) {
      key = raw
    } else if (raw === "Clinical" || raw === "Klinis") {
      key = "tone_clinical"
    } else if (raw === "Empathetic" || raw === "Empati") {
      key = "tone_empathetic"
    } else if (raw === "Straightforward" || raw === "Langsung") {
      key = "tone_straightforward"
    } else if (raw === "Custom" || raw === "Kustom") {
      key = "tone_custom"
    }
  }

  if (key === "tone_custom") {
    const name = localStorage.getItem("custom_persona_name")
    const desc = localStorage.getItem("custom_persona_desc")
    if (name || desc) {
      return { label: name || "Custom", desc: desc || "", isCustom: true, isConfigured: true }
    }
    return { label: t("tone_custom"), desc: t("home_persona_no_custom"), isCustom: true, isConfigured: false }
  }

  return {
    label: t(key),
    desc: PRESET_PERSONA_DESC[key] || "",
    isCustom: false,
    isConfigured: true,
  }
}

export default function Dashboard({ userName, userId }: { userName?: string; userId?: string }) {
  const { t } = useLanguage()
  const [input, setInput] = useState("")
  const navigate = useNavigate()
  const firstName = userName?.split(" ")[0] || "there"
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [moodText, setMoodText] = useState("")

  useEffect(() => {
    if (userId) listJournalEntries(userId).then(setEntries).catch(() => {})
  }, [userId])

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayEntry = entries.find((e) => e.created_at.startsWith(todayStr))

  const persona = getPersonaInfo(t)

  async function handleMoodClick(mood: Mood) {
    if (!userId) return
    try {
      const saved = await saveJournalEntry(mood, moodText, userId)
      setMoodText("")
      setEntries((prev) => {
        const filtered = prev.filter((e) => !e.created_at.startsWith(todayStr))
        return [saved, ...filtered]
      })
    } catch {
      // silent
    }
  }

  const handleSubmit = (text: string) => {
    if (!text.trim()) return
    navigate(`/chat?q=${encodeURIComponent(text.trim())}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6">
      <h1 className="text-5xl font-bold text-gray-900">{t("home_welcome")}, {firstName}!</h1>
      <p className="text-gray-500 text-lg mt-4">
        {t("home_welcome_desc")}
      </p>

      <div className="relative mt-8 w-full max-w-lg">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(input)}
              placeholder={t("home_input_placeholder")}
              className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => handleSubmit(input)}
            disabled={!input.trim()}
            className="shrink-0 w-10 h-10 bg-[#2F6FED] text-white rounded-full flex items-center justify-center hover:bg-[#1E4FBE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Mood widget */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06)] border border-[#E5E7EB] p-5">
          {todayEntry ? (
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{t("home_today_mood")}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-3xl">{MOODS.find((m) => m.value === todayEntry.mood)?.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{t(MOODS.find((m) => m.value === todayEntry.mood)?.labelKey || "")}</p>
                  {todayEntry.content && <p className="text-xs text-[#6B7280] line-clamp-1">{todayEntry.content}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{t("home_how_feeling")}</p>
              <textarea
                value={moodText}
                onChange={(e) => setMoodText(e.target.value)}
                placeholder={t("home_mood_placeholder")}
                rows={2}
                className="mt-2 w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent resize-none"
              />
              <div className="flex gap-2 mt-2 justify-center">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => handleMoodClick(m.value)}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-lg"
                    aria-label={t(m.labelKey)}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sync card */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06)] border border-[#E5E7EB] p-5">
          <span className="text-sm font-semibold text-gray-900">{t("home_sync_title")}</span>
          <p className="text-xs text-gray-500 mt-1">{t("home_sync_desc")}</p>
          <Button className="mt-3" border="full" onClick={() => navigate("/health-record")}>
            {t("home_sync_button")}
          </Button>
        </div>

        {/* Persona card */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06)] border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#2F6FED]" />
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{t("home_ai_tone")}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm font-semibold text-[#111827]">{persona.label}</p>
            <p className="text-xs text-[#6B7280] mt-1">{persona.desc}</p>
            {persona.isCustom && !persona.isConfigured && (
              <button
                onClick={() => navigate("/account")}
                className="mt-2 text-xs font-medium text-[#2F6FED] hover:underline cursor-pointer"
              >
                {t("account_preferences")} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
