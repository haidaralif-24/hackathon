import { useState } from "react"
import { LogOut, ChevronDown } from "lucide-react"

interface AccountProps {
  userName?: string
  userAvatar?: string
  email: string
  onSignOut: () => void
}

export default function Account({ userName, userAvatar, email, onSignOut }: AccountProps) {
  const [tone, setTone] = useState("Clinical")

  return (
    <div className="max-w-lg mx-auto mt-12 space-y-6 px-6">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(16,24,40,0.06)] p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
          {userAvatar ? (
            <img src={userAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-[#EAF1FE] flex items-center justify-center text-lg font-bold text-[#2F6FED]">
              {(userName || email).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#111827]">{userName || "User"}</h2>
          <p className="text-sm text-[#6B7280]">{email}</p>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(16,24,40,0.06)] p-6 space-y-5">
        <h3 className="text-sm font-semibold text-[#111827]">Preferences</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#111827]">Chat Tone</p>
            <p className="text-xs text-[#6B7280]">Default tone for AI responses</p>
          </div>
          <div className="relative">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 pr-7 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] cursor-pointer"
            >
              <option>Clinical</option>
              <option>Empathetic</option>
              <option>Straightforward</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border border-[#E5E7EB] text-sm text-red-600 font-medium hover:bg-red-50 transition-colors shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  )
}
