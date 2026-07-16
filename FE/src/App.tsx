import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Chat from "./pages/Chat"
import HealthRecord from "./pages/HealthRecord"
import Account from "./pages/Account"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Navbar />
        <div className="pl-60">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/health-record" element={<HealthRecord />} />
              <Route path="/account" element={<Account />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
