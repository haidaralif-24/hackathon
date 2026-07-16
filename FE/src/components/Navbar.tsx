import { useLocation } from "react-router-dom"
import { MessageCircle, ChevronDown } from "lucide-react"

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Welcome!", subtitle: "Here's what you can do today." },
  "/chat": { title: "AI Chat Assistant", subtitle: "Get answers. Understand your health. Find care." },
  "/health-record": { title: "Health Record", subtitle: "Your synced files and extracted health history." },
  "/account": { title: "Account", subtitle: "Manage your profile and settings." },
}

interface NavbarProps {
  email: string
  onSignOut: () => void
  userName?: string
  userAvatar?: string
}

export default function Navbar({ email, userName, userAvatar }: NavbarProps) {
  const location = useLocation()
  const meta = pageMeta[location.pathname] || pageMeta["/"]

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-sm border-b border-[#E5E7EB] h-16">
      <div className="flex items-center justify-between h-full px-6">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">{meta.title}</h1>
          <p className="text-xs text-[#6B7280]">{meta.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-gray-500 hover:text-[#2F6FED] cursor-pointer transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#2F6FED] rounded-full border-2 border-white" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-[#EAF1FE] flex items-center justify-center text-sm font-semibold text-[#2F6FED]">
                  {(userName || email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">{userName || email}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      </div>
    </nav>
  )
}
