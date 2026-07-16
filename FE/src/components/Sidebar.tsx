import { NavLink } from "react-router-dom"
import { LayoutDashboard, MessageCircle, ClipboardList, User, ShieldPlus, Heart, BookHeart } from "lucide-react"

const links = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/journal", label: "Journal", icon: BookHeart },
  { to: "/health-record", label: "Health Records", icon: ClipboardList },
  { to: "/account", label: "Account", icon: User },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 w-64 h-screen bg-white border-r border-[#E5E7EB] flex flex-col">
      <div className="h-16 flex items-center gap-2.5 px-5">
        <div className="w-9 h-9 rounded-lg bg-[#2F6FED] flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-base font-bold tracking-tight">
          <span className="text-[#111827]">Health</span>
          <span className="text-[#2F6FED]">Companion</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
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
                <Icon className="w-5 h-5" />
                {label}
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
  )
}
