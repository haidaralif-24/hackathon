import { MessageCircle } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 w-full bg-white shadow-sm px-6 h-16">
      <div className="flex items-center justify-end gap-2 h-full">
        <div className="relative">
          <MessageCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Consult your condition now!"
            className="w-48 pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
          <img src="" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
    </nav>
  )
}
