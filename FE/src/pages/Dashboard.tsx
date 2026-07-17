import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MessageCircle } from "lucide-react"
import Button from "../components/Button"
import { listJournalEntries, saveJournalEntry } from "../api/client"
import type { JournalEntry, Mood } from "../types"

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: "great", emoji: "😁", label: "Great" },
  { value: "good", emoji: "😊", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "bad", emoji: "😔", label: "Bad" },
  { value: "terrible", emoji: "😢", label: "Terrible" },
]

export default function Dashboard({ userName, userId }: { userName?: string; userId?: string }) {
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

  async function handleMoodClick(mood: Mood) {
    if (!userId) return
    try {
      const saved = await saveJournalEntry(mood, moodText, userId)
      setMoodText("")
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
      <h1 className="text-5xl font-bold text-gray-900">Welcome, {firstName}!</h1>
      <p className="text-gray-500 text-lg mt-4">
        You feel unwell today? Let me know! I'll analyse your symptoms
      </p>

      <div className="relative mt-8 w-full max-w-lg">
        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(input)}
          placeholder="Consult your condition now!"
          className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mt-6 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mood widget */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06)] border border-[#E5E7EB] p-5">
          {todayEntry ? (
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Today's Mood</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-3xl">{MOODS.find((m) => m.value === todayEntry.mood)?.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{MOODS.find((m) => m.value === todayEntry.mood)?.label}</p>
                  {todayEntry.content && <p className="text-xs text-[#6B7280] line-clamp-1">{todayEntry.content}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">How are you feeling?</p>
              <textarea
                value={moodText}
                onChange={(e) => setMoodText(e.target.value)}
                placeholder="Write something..."
                rows={2}
                className="mt-2 w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent resize-none"
              />
              <div className="flex gap-2 mt-2 justify-center">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => handleMoodClick(m.value)}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-lg"
                    aria-label={m.label}
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
          <span className="text-sm font-semibold text-gray-900">Synchronize Record!</span>
          <p className="text-xs text-gray-500 mt-1">Let me know your record for more relevant analysis.</p>
          <Button className="mt-3" border="full">
            Sync Now
          </Button>
        </div>
      </div>
    </div>
  )
}
