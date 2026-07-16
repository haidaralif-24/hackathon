import { MessageCircle } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h1 className="text-5xl font-bold text-gray-900">Welcome Back!</h1>
      <p className="text-gray-500 text-lg mt-4">
        You feel unwell today? Tell me! I'll help you
      </p>

      <div className="relative mt-8 w-full max-w-lg">
        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Consult your condition now!"
          className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mt-8 w-full max-w-lg bg-white p-6 rounded-2xl shadow-md flex flex-col items-center gap-4">
        <span className="text-lg font-semibold text-gray-900">Cek-In</span>
      </div>
    </div>
  );
}
