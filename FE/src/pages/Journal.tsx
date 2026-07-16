import { useEffect, useState } from "react"
import { listJournalEntries, saveJournalEntry, deleteJournalEntry } from "../api/client"
import type { JournalEntry, Mood } from "../types"
import { Trash2, Send } from "lucide-react"

const MOODS: { value: Mood; emoji: string; label: string; color: string }[] = [
  { value: "great", emoji: "😁", label: "Great", color: "bg-green-100 border-green-300 hover:bg-green-200" },
  { value: "good", emoji: "😊", label: "Good", color: "bg-blue-100 border-blue-300 hover:bg-blue-200" },
  { value: "okay", emoji: "😐", label: "Okay", color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200" },
  { value: "bad", emoji: "😔", label: "Bad", color: "bg-orange-100 border-orange-300 hover:bg-orange-200" },
  { value: "terrible", emoji: "😢", label: "Terrible", color: "bg-red-100 border-red-300 hover:bg-red-200" },
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

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [mood, setMood] = useState<Mood | null>(null)
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listJournalEntries().then(setEntries).catch(() => {})
  }, [])

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayEntry = entries.find((e) => e.created_at.startsWith(todayStr))
  const streak = streakCount(entries)

  async function handleSave() {
    if (!mood) return
    setSaving(true)
    try {
      const saved = await saveJournalEntry(mood, content)
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
    try {
      await deleteJournalEntry(id)
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
              <h2 className="text-lg font-bold text-[#111827]">Today's entry</h2>
              <span className="text-sm">{MOOD_MAP[todayEntry.mood]?.emoji} {MOOD_MAP[todayEntry.mood]?.label}</span>
            </div>
            {todayEntry.content && <p className="text-sm text-[#6B7280] mt-2">{todayEntry.content}</p>}
            <p className="text-xs text-[#6B7280] mt-1">{formatDate(todayEntry.created_at)}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#111827]">How are you feeling?</h2>
              {streak > 0 && (
                <span className="text-sm text-[#6B7280]">🔥 {streak} day{streak > 1 ? "s" : ""}</span>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    mood === m.value
                      ? `border-[#2F6FED] bg-[#EAF1FE] ring-2 ring-[#2F6FED]/30`
                      : `border-[#E5E7EB] ${m.color}`
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[11px] font-medium text-[#6B7280]">{m.label}</span>
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about your day, thoughts, or anything on your mind..."
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
                {saving ? "Saving..." : "Save"}
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
            <p className="text-sm font-semibold text-[#111827]">{streak} day streak</p>
            <p className="text-xs text-[#6B7280]">Keep it going! Check in every day.</p>
          </div>
        </div>
      )}

      {/* Past entries */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#111827]">Past entries</h3>
        {entries.length === 0 && (
          <p className="text-sm text-[#6B7280]">No journal entries yet. Start by logging how you feel today!</p>
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
                aria-label="Delete entry"
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
