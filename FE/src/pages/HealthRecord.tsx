import { useState, useEffect } from "react"
import { RefreshCw, CheckCircle, MoreVertical, FlaskRound, Pill, HeartPulse, ChevronDown, Loader2, AlertCircle } from "lucide-react"
import { listRecords, syncFiles } from "../api/client"
import type { HealthRecord as HealthRecordType } from "../api/client"

type EntryTag = "Lab Result" | "Prescription" | "Vital Signs"

interface Entry {
  id: string
  type: EntryTag
  date: string
  time: string
  title: string
  details: { label: string; value: string }[]
}

const tagStyles: Record<EntryTag, { bg: string; text: string; icon: typeof FlaskRound }> = {
  "Lab Result": { bg: "bg-[#DCEBFF]", text: "text-[#1D4ED8]", icon: FlaskRound },
  Prescription: { bg: "bg-[#DCFCE7]", text: "text-[#15803D]", icon: Pill },
  "Vital Signs": { bg: "bg-[#EDE4FF]", text: "text-[#7C3AED]", icon: HeartPulse },
}

const TAG_MAP: Record<string, EntryTag> = {
  lab_result: "Lab Result",
  prescription: "Prescription",
  note: "Vital Signs",
  other: "Vital Signs",
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = d.toLocaleDateString("en-CA")
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  return { date, time }
}

function recordToEntry(r: HealthRecordType): Entry {
  const e = r.extracted
  const { date, time } = formatDateTime(e.date || r.created_at)
  const tag = TAG_MAP[e.document_type] || "Vital Signs"

  if (e.document_type === "lab_result") {
    return {
      id: r.id,
      type: tag,
      date,
      time,
      title: e.lab_values.length ? e.lab_values.map((l) => l.name).join(", ") : "Lab Results",
      details: e.lab_values.map((lv) => ({
        label: lv.name,
        value: `${lv.value} ${lv.unit}`,
      })),
    }
  }

  if (e.document_type === "prescription") {
    const meds = e.medications
    return {
      id: r.id,
      type: tag,
      date,
      time,
      title: meds.length ? meds[0].name : "Prescription",
      details: meds.flatMap((m) => [
        { label: "Medication", value: m.name },
        { label: "Dosage", value: m.dosage },
        { label: "Frequency", value: m.frequency },
      ]),
    }
  }

  const details: { label: string; value: string }[] = []
  if (e.provider) details.push({ label: "Provider", value: e.provider })
  if (e.notes) details.push({ label: "Notes", value: e.notes })
  if (e.medications.length) {
    details.push({ label: "Medications", value: e.medications.map((m) => m.name).join(", ") })
  }
  if (e.lab_values.length) {
    details.push({ label: "Lab Values", value: e.lab_values.map((l) => `${l.name} ${l.value} ${l.unit}`).join(", ") })
  }

  return {
    id: r.id,
    type: tag,
    date,
    time,
    title: e.provider || "Clinical Note",
    details,
  }
}

export default function HealthRecord() {
  const [records, setRecords] = useState<HealthRecordType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [folder, setFolder] = useState("Mock Upload Folder")
  const [filter, setFilter] = useState<EntryTag | "All">("All")

  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listRecords()
      setRecords(data.records)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    try {
      await syncFiles([{ filename: `sync-${Date.now()}.pdf`, source: folder }])
      await fetchRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed")
    } finally {
      setSyncing(false)
    }
  }

  const entries: Entry[] = records.map(recordToEntry)
  const typeCounts = new Map<EntryTag, number>()
  entries.forEach((e) => typeCounts.set(e.type, (typeCounts.get(e.type) || 0) + 1))

  const filteredEntries = filter === "All" ? entries : entries.filter((e) => e.type === filter)

  const lastSync = records.length
    ? formatDateTime(records[0].created_at)
    : null

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Sync Control Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[#111827]">Storage Sync (Manual)</span>
          <div className="relative">
            <select
              className="appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 pr-7 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] cursor-pointer"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            >
              <option>Mock Upload Folder</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-[#2F6FED] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#1E4FBE] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Run Manual Drive Sync
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {lastSync ? (
            <>
              <CheckCircle className="w-4 h-4 text-[#16A34A]" />
              <span className="text-[#6B7280]">
                Last synced: {lastSync.date} at {lastSync.time}
              </span>
            </>
          ) : (
            <span className="text-[#6B7280]">No records synced yet</span>
          )}
        </div>
      </div>

      {/* Timeline Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">Your Timeline</h2>
          <p className="text-sm text-[#6B7280]">Append-only history log of your extracted health data.</p>
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 pr-7 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value as EntryTag | "All")}
          >
            <option value="All">All Types</option>
            {Array.from(typeCounts.entries()).map(([type, count]) => (
              <option key={type} value={type}>
                {type} ({count})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-sm">Loading records...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredEntries.length === 0 && (
        <div className="text-center py-20 text-[#6B7280]">
          <p className="text-sm">No records found. Sync your files to get started.</p>
        </div>
      )}

      {/* Timeline Entries */}
      {!loading && (
        <div className="space-y-6">
          {filteredEntries.map((entry, idx) => {
            const { bg, text, icon: Icon } = tagStyles[entry.type]
            return (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${text}`} />
                  </div>
                  {idx < filteredEntries.length - 1 && (
                    <div className="w-px flex-1 bg-[#E5E7EB] mt-1" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-6">
                  <p className="text-xs text-[#6B7280] mb-1">
                    {entry.date} — {entry.time}
                  </p>
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#111827]">{entry.title}</span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${bg} ${text}`}>
                          {entry.type}
                        </span>
                      </div>
                      <button className="text-[#6B7280] hover:text-[#111827] cursor-pointer" aria-label="More options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {entry.details.map((d) => (
                        <div key={d.label} className="flex items-center gap-2 text-sm">
                          <span className="text-[#6B7280] w-32 shrink-0">{d.label}</span>
                          <span className="text-[#111827] font-medium">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}