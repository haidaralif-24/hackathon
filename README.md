# BenHealthy — Personal Health Companion

**Garuda Hacks 7.0 — Health Track**

An AI-powered health literacy assistant. It triages symptoms, extracts medical records from documents, finds nearby healthcare facilities, and tracks daily mood — all in one chat-based interface.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Leaflet |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| LLM | Nvidia NIM (Palmyra-Med 70B, Neva-22B) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Google OAuth |
| Maps | OpenStreetMap Overpass API |
| Deployment | Vercel (FE), Railway (BE) |

---

## Features

**Symptom Triage** — Describe your symptoms, and Ben assesses the urgency and recommends next steps. Supports both general Q&A and structured triage with escalation bias.

**Medical Record Extraction** — Sync documents from Google Drive (mock mode for demo without verification). Documents are processed through OCR (Neva-22B) and structured into medications, lab values, and notes.

**Facility Locator** — Finds nearby hospitals, clinics, and doctors based on triage urgency and specialist recommendation. Uses OpenStreetMap data with Leaflet rendering.

**Mood Journal** — Daily mood logging with emoji selector and free-text notes. Streak tracking and past entry history.

**Weekly Reflections** — Automated weekly summary of journal entries and health records via LLM, sent every Sunday evening WIB.

**Chat Sessions** — Persistent conversation history with auto-titling and session switching. Health context from extracted records is shared across sessions.

**Bilingual UI** — Full Bahasa Indonesia and English language support with in-app toggle.

---

## Architecture

### Repository Structure

```
FE/               — React + Vite frontend
  src/
    api/          — API client with Supabase auth headers
    components/   — Auth, Sidebar, Navbar, MapMessage, DrivePicker
    contexts/     — LanguageProvider
    pages/        — Dashboard, Chat, Journal, HealthRecord, Account
    i18n.ts       — ID/EN translation map
    types.ts      — Shared TypeScript types
BE/               — Python FastAPI backend
  app/
    routes/       — chat, sessions, journal, facilities, files, records, sync, reflection
    services/     — triage, extraction, facilities, reflection
    auth.py       — Supabase auth dependency for route protection
    config.py     — Environment variable settings
    database.py   — Supabase client singleton
    llm.py        — Nvidia NIM OpenAI-compatible client
    schemas.py    — Pydantic request/response models
  seed.py         — Seed mock health records into Supabase
  supabase_schema.sql        — Core table definitions
  supabase_migration.sql      — Per-user isolation migration
mock-data/        — Sample .docx health documents for testing
```

### Data Flow

```
User types symptoms
  -> POST /chat (with auth token)
    -> LLM triages (Palmyra-Med 70B)
      -> Returns urgency + explanation + specialist
        -> Updates chat_messages + chat_sessions tables

User syncs documents
  -> GET /sync (or mock sync)
    -> Files inserted into files table
      -> Records inserted with extracted_json
        -> GET /records returns timeline

User logs mood
  -> POST /journal (with auth token)
    -> journal_entries table (scoped to user)

Weekly reflection
  -> POST /reflect (scheduled Sunday 18:00 WIB)
    -> Queries past week of journal + records
      -> LLM generates reflection
        -> Stored in reflections table
```

---

## Setup

### Prerequisites

- Node.js 18+
- Python 3.12+
- Supabase project
- Nvidia NIM API key (or Groq API key as fallback)

### Frontend

```bash
cd FE
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm run dev
```

### Backend

```bash
cd BE
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in LLM_API_KEY, SUPABASE_URL, SUPABASE_KEY
uvicorn main:app --reload
```

### Database

Run `supabase_schema.sql` in Supabase SQL Editor. Optionally run `seed.py` to populate mock health records.

---

## Deployment

- Frontend: connected to GitHub, auto-deploys to Vercel on push to `main`
- Backend: connected to GitHub, auto-deploys to Railway on push to `main`
- Environment variables must be configured in both Vercel and Railway dashboards

---

## Contributors

Built by **The Fryer** for Garuda Hacks 7.0.
