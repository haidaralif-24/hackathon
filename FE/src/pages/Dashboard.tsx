import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MessageCircle } from "lucide-react"
import Button from "../components/Button"

export default function Dashboard({ userName }: { userName?: string }) {
  const [input, setInput] = useState("")
  const navigate = useNavigate()
  const firstName = userName?.split(" ")[0] || "there"

  const handleSubmit = (text: string) => {
    if (!text.trim()) return
    navigate(`/chat?q=${encodeURIComponent(text.trim())}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h1 className="text-5xl font-bold text-gray-900">Welcome, {firstName}!</h1>
      <p className="text-gray-500 text-lg mt-4">
        You feel unwell today? Let me know! I'll analyse your symptoms
      </p>

      <div className="relative mt-8 w-full max-w-lg">
        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(input)}
          placeholder="Consult your condition now!"
          className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mt-8 w-full max-w-2xl bg-white p-6 rounded-2xl shadow-md flex gap-4 justify-between items-center">
        <div>
          <span className="text-lg font-semibold text-gray-900">
            Synchronize Record!
          </span>
          <p className="text-gray-500 text-lg mt-4">
            Let me know your record for more relevant analysis.
          </p>
        </div>
        <Button className="ml-auto" border="full">
          Sync Now
        </Button>
      </div>
    </div>
  );
}
