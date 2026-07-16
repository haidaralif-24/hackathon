import { NavLink } from "react-router-dom"
import { LayoutDashboard, MessageCircle, ClipboardList, User, ShieldPlus, BookHeart } from "lucide-react"

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
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-white border-r border-[#E5E7EB] flex flex-col transition-transform duration-200 ease-in-out -translate-x-full md:translate-x-0 ${
          open ? "translate-x-0" : ""
        } md:w-16 lg:w-64`}
      >
        <div className="h-16 flex items-center justify-center md:justify-center lg:justify-start lg:gap-2.5 lg:px-5">
        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
          <img src="/BenHealthy.png" alt="Ben Healthy" className="w-full h-full object-cover" />
        </div>
          <span className="hidden lg:inline text-base font-bold tracking-tight">
            <span className="text-[#111827]">Ben</span>
            <span className="text-[#2F6FED]">Healthy</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 flex flex-col items-center md:items-center lg:items-stretch">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#EAF1FE] text-[#2F6FED]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2F6FED] rounded-r-full hidden lg:block" />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="hidden lg:inline">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block px-4 pb-5">
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
