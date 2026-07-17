import { supabase } from "../lib/supabase";

export let API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
if (API_BASE && !/^https?:\/\//.test(API_BASE)) {
  API_BASE = `https://${API_BASE}`;
}

import type { ChatSession, ChatTurn, JournalEntry, Mood } from "../types";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function authGet(url: string): Promise<Response> {
  const headers = await authHeaders();
  return fetch(url, { headers });
}

async function authPost(url: string, body: unknown): Promise<Response> {
  const headers = await authHeaders();
  return fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
}

async function authDelete(url: string): Promise<Response> {
  const headers = await authHeaders();
  return fetch(url, { method: "DELETE", headers });
}

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
): Promise<{ session_id: string; turn: ChatTurn }> {
  const res = await authPost(`${API_BASE}/chat`, { message, history, persona, session_id: sessionId });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function listSessions(): Promise<ChatSession[]> {
  const res = await authGet(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await authDelete(`${API_BASE}/sessions/${sessionId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function getSessionMessages(
  sessionId: string,
): Promise<{ id: string; session_id: string; role: string; content: string; created_at: string }[]> {
  const res = await authGet(`${API_BASE}/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function listJournalEntries(): Promise<JournalEntry[]> {
  const res = await authGet(`${API_BASE}/journal`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function saveJournalEntry(mood: Mood, content: string): Promise<JournalEntry> {
  const res = await authPost(`${API_BASE}/journal`, { mood, content });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const res = await authDelete(`${API_BASE}/journal/${entryId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function runSync(): Promise<{ files: unknown[]; synced: number }> {
  const res = await fetch(`${API_BASE}/sync`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchRecords(): Promise<{ id: string; filename: string | null; created_at: string; extracted: any }[]> {
  const res = await fetch(`${API_BASE}/records`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.records || [];
}
