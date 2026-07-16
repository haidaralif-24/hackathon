export let API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
if (API_BASE && !/^https?:\/\//.test(API_BASE)) {
  API_BASE = `https://${API_BASE}`;
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

import type { ChatTurn } from "../types";

export async function sendChatMessage(
  message: string,
  history: { role: string; content: string }[],
  persona = "straightforward",
): Promise<ChatTurn> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, persona }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
