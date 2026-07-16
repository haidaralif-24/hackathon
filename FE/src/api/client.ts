let API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
if (API_BASE && !/^https?:\/\//.test(API_BASE)) {
  API_BASE = `https://${API_BASE}`;
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
