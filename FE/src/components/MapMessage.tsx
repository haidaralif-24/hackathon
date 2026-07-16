import { ChevronDown, ChevronUp, AlertTriangle, MapPin, Plus, Minus } from "lucide-react"

interface Facility {
  id: number
  name: string
  type: string
  hours: string
  address: string
  distance: string
}

const mockFacilities: Facility[] = [
  { id: 1, name: "City General Hospital", type: "Emergency Room", hours: "Open 24hrs", address: "123 Main St, Cityville", distance: "0.4 mi" },
  { id: 2, name: "Downtown Medical Clinic", type: "Urgent Care", hours: "8AM–8PM", address: "456 Oak Ave, Cityville", distance: "0.8 mi" },
  { id: 3, name: "Wellness Primary Care", type: "Primary Care", hours: "9AM–5PM", address: "789 Pine Rd, Cityville", distance: "1.2 mi" },
]

interface MapMessageProps {
  collapsed: boolean
  onToggle: () => void
  urgency: "emergency" | "monitor" | "24h" | null
  explanation: string
}

export default function MapMessage({ collapsed, onToggle, urgency, explanation }: MapMessageProps) {
  const urgencyLabel =
    urgency === "emergency" ? "EMERGENCY" :
    urgency === "24h" ? "24 HOUR CARE RECOMMENDED" :
    urgency === "monitor" ? "MONITOR AT HOME" :
    null

  return (
    <div className="m-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#111827]">MapMessage</h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          {urgency && (
            <div className="bg-[#FDF3E3] border border-[#F5C46B] rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-[#E8A83C] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#8A5A12]">{urgencyLabel}</h4>
                <p className="text-xs text-[#8A5A12] mt-0.5 leading-relaxed">{explanation}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Urgency Status</p>
            <div className="flex gap-2">
              {(["EMERGENCY", "MODERATE", "MONITOR"] as const).map((label) => {
                const isActive = urgency && (
                  (label === "EMERGENCY" && urgency === "emergency") ||
                  (label === "MODERATE" && urgency === "24h") ||
                  (label === "MONITOR" && urgency === "monitor")
                )
                return (
                  <span
                    key={label}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full ${
                      isActive
                        ? label === "EMERGENCY" ? "bg-red-100 text-red-700"
                        : label === "MODERATE" ? "bg-orange-100 text-orange-700"
                        : "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              {mockFacilities.map((f) => (
                <div key={f.id} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#2F6FED] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {f.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#2F6FED] truncate">{f.name}</p>
                    <p className="text-[11px] text-[#6B7280]">{f.type} — {f.hours}</p>
                    <p className="text-[11px] text-[#6B7280] truncate">{f.address}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full">
                      {f.distance} away
                    </span>
                  </div>
                </div>
              ))}
              <button className="text-xs font-medium text-[#2F6FED] flex items-center gap-1 hover:underline">
                View more facilities
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="w-40 shrink-0 bg-gray-50 rounded-xl h-48 relative overflow-hidden border border-gray-200">
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(#9CA3AF 1px, transparent 1px), linear-gradient(90deg, #9CA3AF 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="absolute top-4 left-5 w-5 h-5 bg-[#2F6FED] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md border border-white/30 z-10">
                1
              </div>
              <div className="absolute top-14 left-14 w-5 h-5 bg-[#2F6FED] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md border border-white/30 z-10">
                2
              </div>
              <div className="absolute top-28 left-8 w-5 h-5 bg-[#2F6FED] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md border border-white/30 z-10">
                3
              </div>
              <div className="absolute bottom-10 right-6 z-10">
                <MapPin className="w-5 h-5 text-[#E23B3B] fill-[#E23B3B]" />
              </div>
              <div className="absolute bottom-2 right-2 flex flex-col gap-0.5 z-10">
                <button className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 border border-gray-200" aria-label="Zoom in">
                  <Plus className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 border border-gray-200" aria-label="Zoom out">
                  <Minus className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
