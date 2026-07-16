import { LogOut, MessageCircle } from "lucide-react"

interface NavbarProps {
  email: string
  onSignOut: () => void
}

export default function Navbar({ email, onSignOut }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 px-6 h-16">
      <div className="flex items-center justify-end gap-3 h-full">
        <div className="relative">
          <MessageCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Consult your condition now!"
            className="w-48 pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <span className="text-sm text-gray-500">{email}</span>
        <button onClick={onSignOut} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}
