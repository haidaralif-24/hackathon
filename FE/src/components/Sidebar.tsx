import { NavLink } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { LayoutDashboard, MessageCircle, ClipboardList, User, ShieldPlus, BookHeart, ArrowRight } from "lucide-react"

const links = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/journal", label: "Journal", icon: BookHeart },
  { to: "/health-record", label: "Health Records", icon: ClipboardList },
  { to: "/account", label: "Account", icon: User },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setOverlayOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      {/* Backdrop for mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      {/* Backdrop for tablet overlay */}
      {overlayOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 hidden md:block lg:hidden"
          onClick={() => setOverlayOpen(false)}
        />
      )}

      {/* Icon strip — always visible on md+, hidden on phone */}
      <aside className="fixed left-0 top-0 z-50 w-16 h-screen bg-white border-r border-[#E5E7EB] flex-col hidden md:flex lg:hidden">
        <div className="h-16 flex items-center justify-center">
          <button onClick={() => setOverlayOpen((prev) => !prev)} className="relative w-9 h-9 cursor-pointer group">
            <div className="absolute inset-0 rounded-lg overflow-hidden transition-opacity duration-300 group-hover:opacity-0">
              <img src="/BenHealthy.png" alt="Ben Healthy" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 rounded-lg bg-[#2F6FED] flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col items-center space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center justify-center px-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#EAF1FE] text-[#2F6FED]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Full overlay sidebar on tablet */}
      <aside
        ref={overlayRef}
        className={`fixed left-0 top-0 z-50 w-64 h-screen bg-white border-r border-[#E5E7EB] flex-col transition-transform duration-200 ease-in-out -translate-x-full hidden md:flex lg:hidden ${
          overlayOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="h-16 flex items-center gap-2.5 px-5">
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
            <img src="/BenHealthy.png" alt="Ben Healthy" className="w-full h-full object-cover" />
          </div>
          <span className="text-base font-bold tracking-tight">
            <span className="text-[#111827]">Ben</span>
            <span className="text-[#2F6FED]">Healthy</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => { onClose(); setOverlayOpen(false) }}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#EAF1FE] text-[#2F6FED]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2F6FED] rounded-r-full" />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pb-5">
          <div className="bg-gradient-to-br from-[#2F6FED] to-[#1E4FBE] rounded-2xl p-5 text-white">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <ShieldPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold leading-tight">Your health, our priority.</h3>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              Smart tools for a healthier you.
            </p>
          </div>
        </div>
      </aside>

      {/* Full sidebar on desktop — always visible */}
      <aside className="fixed left-0 top-0 z-50 w-64 h-screen bg-white border-r border-[#E5E7EB] flex-col hidden lg:flex">
        <div className="h-16 flex items-center gap-2.5 px-5">
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
            <img src="/BenHealthy.png" alt="Ben Healthy" className="w-full h-full object-cover" />
          </div>
          <span className="text-base font-bold tracking-tight">
            <span className="text-[#111827]">Ben</span>
            <span className="text-[#2F6FED]">Healthy</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#EAF1FE] text-[#2F6FED]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2F6FED] rounded-r-full" />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pb-5">
          <div className="bg-gradient-to-br from-[#2F6FED] to-[#1E4FBE] rounded-2xl p-5 text-white">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <ShieldPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold leading-tight">Your health, our priority.</h3>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              Smart tools for a healthier you.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay sidebar (phone only) */}
      <aside
        className={`fixed left-0 top-0 z-50 w-64 h-screen bg-white border-r border-[#E5E7EB] flex-col transition-transform duration-200 ease-in-out -translate-x-full md:hidden ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="h-16 flex items-center gap-2.5 px-5">
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
            <img src="/BenHealthy.png" alt="Ben Healthy" className="w-full h-full object-cover" />
          </div>
          <span className="text-base font-bold tracking-tight">
            <span className="text-[#111827]">Ben</span>
            <span className="text-[#2F6FED]">Healthy</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#EAF1FE] text-[#2F6FED]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2F6FED] rounded-r-full" />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pb-5">
          <div className="bg-gradient-to-br from-[#2F6FED] to-[#1E4FBE] rounded-2xl p-5 text-white">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <ShieldPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold leading-tight">Your health, our priority.</h3>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              Smart tools for a healthier you.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
