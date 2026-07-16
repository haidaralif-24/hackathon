import { useState } from 'react'
import { checkHealth } from './api/client'
import './App.css'

function App() {
  const [beStatus, setBeStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function testConnection() {
    setLoading(true)
    setBeStatus(null)
    try {
      const data = await checkHealth()
      setBeStatus(`Connected — BE says "${data.status}"`)
    } catch (e) {
      setBeStatus(`Failed — ${(e as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section id="center">
        <h1>Personal Health Companion</h1>
        <button type="button" className="counter" onClick={testConnection} disabled={loading}>
          {loading ? "Checking…" : "Test BE Connection"}
        </button>
        {beStatus && <p className={beStatus.startsWith("Connected") ? "status-ok" : "status-err"}>{beStatus}</p>}
      </section>
    </>
  )
}

export default App
