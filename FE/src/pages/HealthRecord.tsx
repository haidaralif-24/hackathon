import { useState, useEffect } from "react"
import { RefreshCw, CheckCircle, FolderOpen, MoreVertical, FlaskRound, Pill, HeartPulse, ChevronDown, Loader2 } from "lucide-react"
import { fetchRecords, runSync } from "../api/client"
import DrivePicker from "../components/DrivePicker"
import { useLanguage } from "../contexts/LanguageContext"

const STORAGE_KEY = "cek-in_drive_folder"

const TAG_STYLES: Record<string, { bg: string; text: string; icon: typeof FlaskRound }> = {
  lab_result: { bg: "bg-[#DCEBFF]", text: "text-[#1D4ED8]", icon: FlaskRound },
  prescription: { bg: "bg-[#DCFCE7]", text: "text-[#15803D]", icon: Pill },
}

function getTag(docType: string) {
  return TAG_STYLES[docType] || { bg: "bg-[#EDE4FF]", text: "text-[#7C3AED]", icon: HeartPulse }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function HealthRecord() {
  const { t } = useLanguage()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(`${t("hr_last_synced")}: —`)
  const [folderId, setFolderId] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [folderName, setFolderName] = useState(() => localStorage.getItem(`${STORAGE_KEY}_name`))
  const [filter, setFilter] = useState(t("hr_all_types"))

  useEffect(() => {
    fetchRecords().then(setRecords).catch(() => {}).finally(() => setLoading(false))
  }, [])

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
      const result = await runSync()
      const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
      setSyncStatus(`${t("hr_last_synced")}: ${now} (${result.synced} ${t("hr_new_files")})`)
    } catch {
      setSyncStatus(t("hr_sync_failed"))
    } finally {
      setSyncing(false)
    }
  }

  const filtered = filter === t("hr_all_types")
    ? records
    : records.filter((r) => r.extracted?.document_type === filter.toLowerCase().replace(" ", "_"))

  const docTypes = [...new Set(records.map((r) => r.extracted?.document_type).filter(Boolean))] as string[]

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Sync Control Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center justify-between md:justify-start gap-4 min-w-0">
            <span className="text-sm font-medium text-[#111827] shrink-0">{t("hr_sync")}</span>
            {folderId ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5 min-w-0">
                  <FolderOpen className="w-4 h-4 text-[#2F6FED] shrink-0" />
                  <span className="text-sm font-medium text-[#111827] truncate">{folderName || t("hr_selected_folder")}</span>
                </div>
                <button onClick={() => { setFolderId(null); setFolderName(null) }} className="text-xs font-medium text-[#6B7280] hover:text-[#2F6FED] transition-colors">{t("hr_change")}</button>
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">{t("hr_no_folder")}</p>
            )}
          </div>
          <div className="flex items-center justify-between md:justify-end gap-3">
            {folderId && (
              <button onClick={handleSync} disabled={syncing}
                className="flex items-center gap-2 bg-[#2F6FED] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#1E4FBE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {syncing ? t("hr_syncing") : t("hr_sync_now")}
              </button>
            )}
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-[#16A34A]" />
              <span className="text-[#6B7280]">{syncStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Folder picker when no folder */}
      {!folderId && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 flex flex-col items-center gap-3 shadow-sm">
          <FolderOpen className="w-10 h-10 text-[#2F6FED]" />
          <p className="text-sm font-medium text-[#111827]">{t("hr_choose_folder")}</p>
          <p className="text-xs text-[#6B7280] text-center max-w-md">
            {t("hr_folder_desc")}
          </p>
          <DrivePicker onFolderSelected={(id, name) => { setFolderId(id); setFolderName(name) }} />
        </div>
      )}

      {/* Timeline Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">{t("hr_your_timeline")}</h2>
          <p className="text-sm text-[#6B7280]">{t("hr_timeline_desc")}</p>
        </div>
        <div className="relative">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 pr-7 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] cursor-pointer"
          >
            <option>{t("hr_all_types")}</option>
            {docTypes.map((t) => (
              <option key={t}>{t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Timeline Entries */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-[#2F6FED]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#6B7280] text-center py-20">{t("hr_no_records")}</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((rec, idx) => {
            const e = rec.extracted || {}
            const docType = e.document_type || "other"
            const { bg, text, icon: Icon } = getTag(docType)

            const details: { label: string; value: string }[] = []
            if (e.medications) {
              for (const med of e.medications) {
                details.push({ label: med.name || "Medication", value: `${med.dosage || ""} ${med.frequency || ""}`.trim() })
              }
            }
            if (e.lab_values) {
              for (const lab of e.lab_values) {
                const flag = lab.flag ? ` (${lab.flag})` : ""
                details.push({ label: lab.name || "Lab", value: `${lab.value || ""}${lab.unit || ""}${flag}` })
              }
            }

            return (
              <div key={rec.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${text}`} />
                  </div>
                  {idx < filtered.length - 1 && <div className="w-px flex-1 bg-[#E5E7EB] mt-1" />}
                </div>

                <div className="flex-1 min-w-0 pb-6">
                  <p className="text-xs text-[#6B7280] mb-1">{formatDate(rec.created_at)} — {formatTime(rec.created_at)}</p>
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#111827]">
                          {rec.filename || t("nav_health_record")}
                        </span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${bg} ${text}`}>
                          {docType.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </span>
                      </div>
                      <button className="text-[#6B7280] hover:text-[#111827] cursor-pointer" aria-label="More options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    {details.length > 0 ? (
                      <div className="space-y-1.5">
                        {details.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="text-[#6B7280] w-32 shrink-0 truncate">{d.label}</span>
                            <span className="text-[#111827] font-medium">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6B7280]">{e.notes || t("hr_no_structured_data")}</p>
                    )}
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
