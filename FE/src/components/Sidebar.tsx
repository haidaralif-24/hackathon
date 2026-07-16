import { NavLink } from "react-router-dom"
import { LayoutDashboard, MessageCircle, ClipboardList, User } from "lucide-react"

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Chat Assistant", icon: MessageCircle },
  { to: "/health-record", label: "Health Record", icon: ClipboardList },
  { to: "/account", label: "Account", icon: User },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 w-60 h-screen bg-white shadow-md flex flex-col">
      <div className="h-16 flex items-center px-6">
        <span className="text-lg font-semibold text-gray-900">Cek-In</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
