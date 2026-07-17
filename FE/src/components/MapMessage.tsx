import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp, AlertTriangle, Loader2 } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { API_BASE } from "../api/client"

interface Facility {
  name: string
  type: string
  address: string
  lat: number
  lng: number
  phone?: string
}

interface MapMessageProps {
  collapsed: boolean
  onToggle: () => void
  urgency: "emergency" | "monitor" | "24h" | null
  explanation: string
}

const urgencyLabelMap: Record<string, string> = {
  emergency: "EMERGENCY",
  "24h": "24 HOUR CARE RECOMMENDED",
  monitor: "MONITOR AT HOME",
}

function createColoredIcon(n: number, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;background:${color};color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)">${n}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export default function MapMessage({ collapsed, onToggle, urgency, explanation }: MapMessageProps) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loadingFacilities, setLoadingFacilities] = useState(false)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserPos({ lat: -6.2088, lng: 106.8456 }),
      { timeout: 5000 },
    )
  }, [])

  useEffect(() => {
    if (!urgency) return
    setLoadingFacilities(true)
    setFacilities([])
    const params = new URLSearchParams({ urgency })
    if (userPos) {
      params.set("lat", userPos.lat.toString())
      params.set("lng", userPos.lng.toString())
    }
    fetch(`${API_BASE}/facilities?${params}`)
      .then((r) => r.json())
      .then((data) => setFacilities(data.facilities ?? []))
      .catch(() => setFacilities([]))
      .finally(() => setLoadingFacilities(false))
  }, [urgency, userPos])

  const center = userPos || { lat: -6.2088, lng: 106.8456 }
  const allCoords = [...facilities.map((f) => ({ lat: f.lat, lng: f.lng })), center]

  useEffect(() => {
    if (collapsed || !mapRef.current || facilities.length === 0) return
    if (mapInstance.current) {
      mapInstance.current.remove()
      mapInstance.current = null
    }
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 13)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)

    facilities.forEach((f, i) => {
      const dirs = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`
      L.marker([f.lat, f.lng], { icon: createColoredIcon(i + 1, "#2F6FED") })
        .addTo(map)
        .bindPopup(`<b>${f.name}</b><br/>${f.address}<br/><a href="${dirs}" target="_blank" style="color:#2F6FED;font-size:11px;font-weight:600">Directions</a>`)
    })

    if (userPos) {
      L.marker([userPos.lat, userPos.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="color:#E23B3B"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 20],
        }),
      }).addTo(map)
    }

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords.map((c) => [c.lat, c.lng]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }

    mapInstance.current = map
    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [collapsed, facilities, userPos])

  const urgencyLabel = urgency ? urgencyLabelMap[urgency] : null

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
                const isActive =
                  (label === "EMERGENCY" && urgency === "emergency") ||
                  (label === "MODERATE" && urgency === "24h") ||
                  (label === "MONITOR" && urgency === "monitor")
                return (
                  <span
                    key={label}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full ${
                      isActive
                        ? label === "EMERGENCY"
                          ? "bg-red-100 text-red-700"
                          : label === "MODERATE"
                            ? "bg-orange-100 text-orange-700"
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

          <div className="space-y-3">
            {loadingFacilities && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-[#2F6FED]" />
              </div>
            )}
            {!loadingFacilities && facilities.length === 0 && (
              <p className="text-xs text-gray-400">No facilities found for this urgency level.</p>
            )}
            {!loadingFacilities && facilities.map((f, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#2F6FED] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2F6FED] truncate">{f.name}</p>
                  <p className="text-[11px] text-[#6B7280]">{f.type}</p>
                  <p className="text-[11px] text-[#6B7280] truncate">{f.address}</p>
                  {f.phone && <p className="text-[11px] text-[#6B7280]">{f.phone}</p>}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 text-[11px] font-medium text-[#2F6FED] hover:underline"
                  >
                    Directions
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div
            ref={mapRef}
            className="w-full rounded-xl h-64 overflow-hidden border border-gray-200 z-0"
          />
        </div>
      )}
    </div>
  )
}
