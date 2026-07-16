import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { supabase } from "./lib/supabase"
import Auth from "./components/Auth"
import Navbar from "./components/Navbar"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Chat from "./pages/Chat"
import HealthRecord from "./pages/HealthRecord"
import Account from "./pages/Account"
import Journal from "./pages/Journal"

function AppLayout({ session }: { session: Session }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F5F7FB]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Navbar
          email={session.user.email!}
          onSignOut={() => supabase.auth.signOut()}
          userName={session.user.user_metadata?.full_name}
          userAvatar={session.user.user_metadata?.avatar_url}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <div className="md:pl-16 lg:pl-64">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard userName={session.user.user_metadata?.full_name} />} />
              <Route path="/chat" element={<Chat userName={session.user.user_metadata?.full_name} userAvatar={session.user.user_metadata?.avatar_url} />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/health-record" element={<HealthRecord providerToken={session.provider_token} />} />
              <Route path="/account" element={<Account userName={session.user.user_metadata?.full_name} userAvatar={session.user.user_metadata?.avatar_url} email={session.user.email!} onSignOut={() => supabase.auth.signOut()} />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (!session) return <Auth />
  return <AppLayout session={session} />
}
