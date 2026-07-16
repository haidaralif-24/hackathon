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

function AppLayout({ session }: { session: Session }) {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F5F7FB]">
        <Sidebar />
        <Navbar
          email={session.user.email!}
          onSignOut={() => supabase.auth.signOut()}
          userName={session.user.user_metadata?.full_name}
          userAvatar={session.user.user_metadata?.avatar_url}
        />
        <div className="pl-60">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard userName={session.user.user_metadata?.full_name} />} />
              <Route path="/chat" element={<Chat userName={session.user.user_metadata?.full_name} userAvatar={session.user.user_metadata?.avatar_url} />} />
              <Route path="/health-record" element={<HealthRecord />} />
              <Route path="/account" element={<Account />} />
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
