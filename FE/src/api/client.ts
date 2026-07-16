const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
