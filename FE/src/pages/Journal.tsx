import { useEffect, useState } from "react"
import { listJournalEntries, saveJournalEntry, deleteJournalEntry } from "../api/client"
import type { JournalEntry, Mood } from "../types"
import { Trash2, Send } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

const MOODS: { value: Mood; emoji: string; labelKey: string; color: string }[] = [
  { value: "great", emoji: "😁", labelKey: "mood_great", color: "bg-green-100 border-green-300 hover:bg-green-200" },
  { value: "good", emoji: "😊", labelKey: "mood_good", color: "bg-blue-100 border-blue-300 hover:bg-blue-200" },
  { value: "okay", emoji: "😐", labelKey: "mood_okay", color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200" },
  { value: "bad", emoji: "😔", labelKey: "mood_bad", color: "bg-orange-100 border-orange-300 hover:bg-orange-200" },
  { value: "terrible", emoji: "😢", labelKey: "mood_terrible", color: "bg-red-100 border-red-300 hover:bg-red-200" },
]

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.value, m]))

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function streakCount(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0
  const sorted = [...entries]
    .map((e) => new Date(e.created_at).toISOString().slice(0, 10))
    .filter((d, i, a) => a.indexOf(d) === i)
    .sort()
    .reverse()
  let count = 0
  for (const date of sorted) {
    const expected = new Date()
    expected.setDate(expected.getDate() - count)
    if (date === expected.toISOString().slice(0, 10)) {
      count++
    } else {
      break
    }
  }
  return count
}

export default function Journal({ userId }: { userId?: string }) {
  const { t } = useLanguage()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [mood, setMood] = useState<Mood | null>(null)
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userId) listJournalEntries(userId).then(setEntries).catch(() => {})
  }, [])

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayEntry = entries.find((e) => e.created_at.startsWith(todayStr))
  const streak = streakCount(entries)

  async function handleSave() {
    if (!mood || !userId) return
    setSaving(true)
    try {
      const saved = await saveJournalEntry(mood, content, userId!)
      setEntries((prev) => {
        const filtered = prev.filter((e) => !e.created_at.startsWith(todayStr))
        return [saved, ...filtered]
      })
      setMood(null)
      setContent("")
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!userId) return
    try {
      await deleteJournalEntry(id, userId!)
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch {
      // silent
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 min-h-[calc(100vh-12rem)]">
      {/* Today's entry */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(16,24,40,0.06)] p-6">
        {todayEntry ? (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111827]">{t("journal_today")}</h2>
              <span className="text-sm">{MOOD_MAP[todayEntry.mood]?.emoji} {t(MOOD_MAP[todayEntry.mood]?.labelKey || "")}</span>
            </div>
            {todayEntry.content && <p className="text-sm text-[#6B7280] mt-2">{todayEntry.content}</p>}
            <p className="text-xs text-[#6B7280] mt-1">{formatDate(todayEntry.created_at)}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#111827]">{t("journal_how_feeling")}</h2>
              {streak > 0 && (
                <span className="text-sm text-[#6B7280]">🔥 {streak} {streak > 1 ? t("days") : t("day")}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1 px-3 md:px-4 py-2 md:py-3 rounded-xl border-2 transition-all flex-1 min-w-[60px] max-w-[80px] md:flex-none md:min-w-0 md:max-w-none ${
                    mood === m.value
                      ? `border-[#2F6FED] bg-[#EAF1FE] ring-2 ring-[#2F6FED]/30`
                      : `border-[#E5E7EB] ${m.color}`
                  }`}
                >
                  <span className="text-xl md:text-2xl">{m.emoji}</span>
                  <span className="text-[10px] md:text-[11px] font-medium text-[#6B7280] leading-tight text-center">{t(m.labelKey)}</span>
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("journal_placeholder")}
              rows={3}
              className="mt-4 w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent resize-none"
            />

            <div className="flex justify-end mt-3">
              <button
                onClick={handleSave}
                disabled={!mood || saving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#2F6FED] text-white rounded-lg hover:bg-[#1E4FBE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {saving ? t("journal_saving") : t("journal_save")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Streak card when entry exists */}
      {todayEntry && streak > 1 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(16,24,40,0.06)] p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm font-semibold text-[#111827]">{streak} {t("journal_streak")}</p>
            <p className="text-xs text-[#6B7280]">{t("journal_streak_desc")}</p>
          </div>
        </div>
      )}

      {/* Past entries */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#111827]">{t("journal_past_entries")}</h3>
        {entries.length === 0 && (
          <p className="text-sm text-[#6B7280]">{t("journal_no_entries")}</p>
        )}
        {entries.map((e) => {
          const m = MOOD_MAP[e.mood]
          return (
            <div key={e.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">{m?.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#6B7280]">{formatDate(e.created_at)}</p>
                {e.content && <p className="text-sm text-[#111827] mt-0.5">{e.content}</p>}
              </div>
              <button
                onClick={() => handleDelete(e.id)}
                className="shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                aria-label={t("journal_delete")}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
