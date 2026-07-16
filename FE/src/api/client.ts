export let API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
if (API_BASE && !/^https?:\/\//.test(API_BASE)) {
  API_BASE = `https://${API_BASE}`;
}

import type { ChatSession, ChatTurn, JournalEntry, Mood } from "../types";

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function sendChatMessage(
  message: string,
  history: { role: string; content: string }[],
  persona = "straightforward",
  sessionId?: string,
): Promise<ChatTurn> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, persona, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function listSessions(): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createSession(): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function getSessionMessages(
  sessionId: string,
): Promise<{ id: string; session_id: string; role: string; content: string; created_at: string }[]> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function listJournalEntries(): Promise<JournalEntry[]> {
  const res = await fetch(`${API_BASE}/journal`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function saveJournalEntry(mood: Mood, content: string): Promise<JournalEntry> {
  const res = await fetch(`${API_BASE}/journal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood, content }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/journal/${entryId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function runSync(providerToken?: string, folderId?: string): Promise<{ files: unknown[]; synced: number }> {
  const params = new URLSearchParams();
  if (folderId) params.set("folder_id", folderId);
  const qs = params.toString();
  const headers: Record<string, string> = {};
  if (providerToken) {
    headers["Authorization"] = `Bearer ${providerToken}`;
  }
  const res = await fetch(`${API_BASE}/sync?${qs}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
