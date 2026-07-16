import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import { checkHealth } from "./api/client";
import "./App.css";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [beStatus, setBeStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  async function testConnection() {
    setLoading(true);
    setBeStatus(null);
    try {
      const data = await checkHealth();
      setBeStatus(`Connected — BE says "${data.status}"`);
    } catch (e) {
      setBeStatus(`Failed — ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!session) return <Auth />;

  return (
    <section id="center">
      <h1>Personal Health Companion</h1>
      <p>Signed in as {session.user.email}</p>
      <button type="button" className="counter" onClick={testConnection} disabled={loading}>
        {loading ? "Checking…" : "Test BE Connection"}
      </button>
      {beStatus && <p className={beStatus.startsWith("Connected") ? "status-ok" : "status-err"}>{beStatus}</p>}
      <button
        type="button"
        className="counter"
        style={{ marginTop: 16 }}
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </button>
    </section>
  );
}

export default App;
