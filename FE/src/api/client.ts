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

export interface LabValue {
  name: string;
  value: string;
  unit: string;
  flag: string | null;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface ExtractedRecord {
  document_type: string;
  date: string | null;
  medications: Medication[];
  lab_values: LabValue[];
  provider: string | null;
  notes: string | null;
}

export interface HealthRecord {
  id: string;
  file_id: string;
  filename: string | null;
  created_at: string;
  extracted: ExtractedRecord;
}

export async function listRecords(): Promise<{ records: HealthRecord[] }> {
  const res = await fetch(`${API_BASE}/records`);
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

export async function syncFiles(
  files: { filename: string; source?: string }[],
): Promise<{ files: Record<string, unknown>[] }> {
  const res = await fetch(`${API_BASE}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(files),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function getSessionMessages(
  sessionId: string,
): Promise<
  {
    id: string;
    session_id: string;
    role: string;
    content: string;
    created_at: string;
  }[]
> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function listJournalEntries(): Promise<JournalEntry[]> {
  const res = await fetch(`${API_BASE}/journal`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function saveJournalEntry(
  mood: Mood,
  content: string,
): Promise<JournalEntry> {
  const res = await fetch(`${API_BASE}/journal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood, content }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/journal/${entryId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
