import { useState, useEffect } from "react"
import { RefreshCw, CheckCircle, FolderOpen, MoreVertical, FlaskRound, Pill, HeartPulse, ChevronDown, Loader2 } from "lucide-react"
import { runSync } from "../api/client"
import DrivePicker from "../components/DrivePicker"

const STORAGE_KEY = "cek-in_drive_folder"

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

const mockEntries: Entry[] = [
  {
    id: "1",
    type: "Lab Result",
    date: "2026-05-12",
    time: "10:30 AM",
    title: "Complete Blood Count (CBC)",
    details: [
      { label: "WBC", value: "7.2 x10³/µL" },
      { label: "RBC", value: "5.1 x10⁶/µL" },
      { label: "Hemoglobin", value: "14.8 g/dL" },
    ],
  },
  {
    id: "2",
    type: "Prescription",
    date: "2026-05-10",
    time: "02:15 PM",
    title: "Amoxicillin 500mg",
    details: [
      { label: "Dosage", value: "500 mg" },
      { label: "Frequency", value: "3x daily" },
      { label: "Duration", value: "7 days" },
    ],
  },
  {
    id: "3",
    type: "Vital Signs",
    date: "2026-05-08",
    time: "09:00 AM",
    title: "Routine Checkup",
    details: [
      { label: "Blood Pressure", value: "120/80 mmHg" },
      { label: "Heart Rate", value: "72 bpm" },
      { label: "Temperature", value: "98.6 °F" },
    ],
  },
]

export default function HealthRecord({ providerToken }: { providerToken?: string | null }) {
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState("Last synced: —")
  const [folderId, setFolderId] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [folderName, setFolderName] = useState(() => localStorage.getItem(`${STORAGE_KEY}_name`))

  useEffect(() => {
    if (folderId) localStorage.setItem(STORAGE_KEY, folderId)
    else localStorage.removeItem(STORAGE_KEY)
  }, [folderId])

  useEffect(() => {
    if (folderName) localStorage.setItem(`${STORAGE_KEY}_name`, folderName)
    else localStorage.removeItem(`${STORAGE_KEY}_name`)
  }, [folderName])

  async function handleSync() {
    setSyncing(true)
    try {
      const provider_token = providerToken || undefined
      const result = await runSync(provider_token, folderId || undefined)
      const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
      setSyncStatus(`Last synced: ${now} (${result.synced} new file${result.synced !== 1 ? "s" : ""})`)
    } catch {
      setSyncStatus("Sync failed")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Sync Control Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[#111827]">Storage Sync (Manual)</span>
          {folderId ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5">
                <FolderOpen className="w-4 h-4 text-[#2F6FED]" />
                <span className="text-sm font-medium text-[#111827]">{folderName || "Selected folder"}</span>
              </div>
              <button
                onClick={() => { setFolderId(null); setFolderName(null) }}
                className="text-xs font-medium text-[#6B7280] hover:text-[#2F6FED] transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#6B7280]">No folder selected</p>

          )}
        </div>
        <div className="flex items-center gap-3">
          {folderId && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-[#2F6FED] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#1E4FBE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
          )}
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-[#16A34A]" />
            <span className="text-[#6B7280]">{syncStatus}</span>
          </div>
        </div>
      </div>

      {/* Folder picker when no folder */}
      {!folderId && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 flex flex-col items-center gap-3 shadow-sm">
          <FolderOpen className="w-10 h-10 text-[#2F6FED]" />
          <p className="text-sm font-medium text-[#111827]">Choose a Google Drive folder to sync</p>
          <p className="text-xs text-[#6B7280] text-center max-w-md">
            Paste a Google Drive folder link or ID below. Health documents in that folder
            (lab results, prescriptions, medical notes) will be synced and analyzed.
          </p>
          <DrivePicker onFolderSelected={(id, name) => { setFolderId(id); setFolderName(name) }} />
        </div>
      )}

      {/* Timeline Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">Your Timeline</h2>
          <p className="text-sm text-[#6B7280]">Append-only history log of your extracted health data.</p>
        </div>
        <div className="relative">
          <select className="appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 pr-7 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] cursor-pointer">
            <option>All Types</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Timeline Entries */}
      <div className="space-y-6">
        {mockEntries.map((entry, idx) => {
          const { bg, text, icon: Icon } = tagStyles[entry.type]
          return (
            <div key={entry.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${text}`} />
                </div>
                {idx < mockEntries.length - 1 && (
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
    </div>
  )
}
