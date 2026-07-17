import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MessageCircle, Bot, ChevronDown } from "lucide-react"
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

function getInitialTone(): string {
  const raw = localStorage.getItem("chat_tone")
  if (!raw) return "tone_clinical"
  if (TONE_KEYS.includes(raw)) return raw
  if (raw === "Clinical" || raw === "Klinis") return "tone_clinical"
  if (raw === "Empathetic" || raw === "Empati") return "tone_empathetic"
  if (raw === "Straightforward" || raw === "Langsung") return "tone_straightforward"
  if (raw === "Custom" || raw === "Kustom") return "tone_custom"
  return "tone_clinical"
}

export default function Dashboard({ userName }: { userName?: string }) {
  const { t } = useLanguage()
  const [input, setInput] = useState("")
  const navigate = useNavigate()
  const firstName = userName?.split(" ")[0] || "there"
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [moodText, setMoodText] = useState("")
  const [tone, setTone] = useState(getInitialTone)
  const [customName, setCustomName] = useState(() => localStorage.getItem("custom_persona_name") || "")
  const [customDesc, setCustomDesc] = useState(() => localStorage.getItem("custom_persona_desc") || "")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    listJournalEntries().then(setEntries).catch(() => {})
  }, [])

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayEntry = entries.find((e) => e.created_at.startsWith(todayStr))

  const personaLabel = tone === "tone_custom" && (customName || customDesc)
    ? customName || "Custom"
    : t(tone)
  const personaDesc = tone === "tone_custom"
    ? (customName || customDesc ? customDesc : t("home_persona_no_custom"))
    : PRESET_PERSONA_DESC[tone] || ""

  useEffect(() => {
    localStorage.setItem("chat_tone", tone)
  }, [tone])

  async function handleMoodClick(mood: Mood) {
    try {
      const saved = await saveJournalEntry(mood, moodText)
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
          <div className="mt-2 space-y-2">
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-2 pr-6 py-1 text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] cursor-pointer w-full"
              >
                {TONE_KEYS.map((k) => (
                  <option key={k} value={k}>{t(k)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
            {tone === "tone_custom" ? (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={t("account_persona_name_placeholder")}
                  className="w-full px-2 py-1 text-xs border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent"
                />
                <textarea
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder={t("account_persona_desc_placeholder")}
                  rows={2}
                  className="w-full px-2 py-1 text-xs border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent resize-none"
                />
                <button
                  onClick={() => {
                    localStorage.setItem("custom_persona_name", customName)
                    localStorage.setItem("custom_persona_desc", customDesc)
                    setSaved(true)
                    setTimeout(() => setSaved(false), 2000)
                  }}
                  className="px-3 py-1 text-[11px] font-semibold bg-[#2F6FED] text-white rounded-lg hover:bg-[#1E4FBE] transition-colors cursor-pointer"
                >
                  {saved ? t("account_saved") : t("account_save_persona")}
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#111827]">{personaLabel}</p>
                <p className="text-xs text-[#6B7280]">{personaDesc}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
