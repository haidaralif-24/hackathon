# Build Spec: Personal Health Companion — Garuda Hacks 7.0

Based on the locked architecture. Budget: ~18-20 effective coding hours.

Two decisions locked in to unblock the plan (flag if you want them changed):
- **Mock-first, OAuth-second.** Build the whole pipeline against a local file upload / mock "Drive folder," wire real Google Sign-In + Picker last, only if time remains. OAuth failing live is a worse demo risk than "not implemented."
- **Team split assumed at 3-4 people** across Frontend / Backend+DB / AI Pipeline / Integration. Swap this for your actual roster and re-cut the hours.

---

## Phase 0 — Setup (1–1.5h, whole team)

- [ ] Repo scaffold: `/frontend` (React + Vite), `/backend` (FastAPI)
- [ ] Deploy skeletons immediately — empty FastAPI on Render/Railway, empty React on Vercel/Netlify. Do this in hour 1, not hour 20. Deployment/cold-start issues need to surface early, not at 2am.
- [ ] `.env` scaffolding: NVIDIA NIM API key, Maps API key, DB path
- [ ] Agree on the JSON schema for extracted fields now (see Phase 2) so frontend/backend can build in parallel against a contract instead of blocking on each other

## Phase 1 — Backend core + DB (2–3h, Backend owner)

**Schema (Supabase / PostgreSQL):**

Run `supabase_schema.sql` in the Supabase SQL Editor:

```sql
files(id UUID PK, filename TEXT, source TEXT, synced_at TIMESTAMPTZ, processed BOOLEAN)
records(id UUID PK, file_id UUID FK→files, created_at TIMESTAMPTZ, extracted_json JSONB)
chat_messages(id UUID PK, session_id UUID, role TEXT, content TEXT, created_at TIMESTAMPTZ)
user_prefs(id UUID PK, persona TEXT DEFAULT 'straightforward')
```

**Endpoints:**
- `POST /sync` — accepts a list of files (mock: user-uploaded; later: Drive Picker output). Diffs against `files` table by filename/id → returns list of unprocessed files.
- `POST /files/{id}/process` — runs the file through the extraction pipeline (Phase 2), inserts a new `records` row. Never edits an existing row.
- `GET /records?limit=N` — returns last N records, newest first, for chat context and the dashboard timeline.
- `POST /chat` — routes to general or symptom-check mode (Phase 3). Accepts an optional `persona` field (Phase 6b) that only affects prompt tone.
- `GET /facilities?urgency=X` — Phase 5.

Keep every LLM-facing endpoint returning **validated, schema-checked JSON only** — Pydantic models on the way in and out. This is your main defense against a flaky demo.

## Phase 2 — Extraction pipeline (4–5h, AI Pipeline owner — this is a differentiator, give it the time)

1. **OCR call:** wrap Nemotron OCR v2 via NIM. Input: image bytes. Output: raw text.
2. **Structuring call:** feed OCR text to the reasoning model (Llama 4 Maverick or similar) with a strict system prompt: "output ONLY JSON matching this schema, no prose." Define the schema now, e.g.:
   ```json
   {
     "document_type": "prescription | lab_result | note | other",
     "date": "YYYY-MM-DD | null",
     "medications": [{"name": str, "dosage": str, "frequency": str}],
     "lab_values": [{"name": str, "value": str, "unit": str, "flag": "normal|high|low|null"}],
     "provider": str | null,
     "notes": str | null
   }
   ```
3. **Validation:** Pydantic model matching the schema above. Reject/retry-with-error-feedback if the LLM output doesn't parse — don't let malformed JSON reach the DB.
4. **Test early** with 3-5 real sample images (prescription photo, lab report, handwritten note) before you trust the pipeline — messy real-world images are exactly what this step is for, so test with messy inputs, not clean screenshots.

## Phase 3 — Triage chat (4–5h, AI Pipeline owner or split with Backend — this is your other differentiator)

1. **Red-flag checklist** — hardcoded, runs before any LLM call, and is **completely independent of persona** (see Phase 6b — this code path must never receive persona-tone instructions). Build the keyword/symptom list explicitly (chest pain, difficulty breathing, sudden severe headache, uncontrolled bleeding, stroke signs, loss of consciousness, etc.) → if matched, return `emergency` immediately, skip the LLM. This is your "what if the AI is wrong" answer for judges — make sure it's visibly deterministic in code, not a prompt.
2. **Adaptive question loop** — if no red flags: LLM asks one structured multiple-choice question at a time, capped at 3-4 rounds, using the last N records as context. Output schema per turn:
   ```json
   {"type": "question", "text": str, "options": [str, ...]}
   ```
   or on the final round:
   ```json
   {"type": "result", "urgency": "24h | monitor | emergency", "explanation": str, "specialist": str | null}
   ```
   `specialist` is a hardcoded lookup from urgency level (e.g. `emergency` → `"emergency_room"`, `monitor` + symptom pattern → `"dermatologist"` / `"cardiologist"` / `null`) — same pattern as urgency → facility type in Phase 5, not an LLM decision.
3. **Bias toward over-escalation** — bake this into the system prompt explicitly ("when uncertain between two urgency levels, choose the more urgent one") rather than hoping it falls out of the model's judgment.
4. **General chat mode** — simpler: freeform Q&A grounded in the last N records, no red-flag gate needed since it's not diagnosing. This is where persona (Phase 6b) applies most naturally.
5. **Health literacy links** — static lookup table keyed off urgency level or specialist type. Each key returns 2-3 curated `{title, url}` pairs. Hardcode in a JSON file, verify links before demo. Categories and sample URLs:
   - `emergency` → ER safety, stroke/heart attack signs (WHO, CDC)
   - `24h` → urgent care guidance, when to visit (Mayo Clinic, NHS)
   - `monitor` → self-care, symptom tracking (Kemenkes, WHO)
   - `cardiologist`, `dermatologist`, etc. → condition-specific literacy (trusted specialty orgs)
   - general → health literacy bases (Kemenkes, WHO, Mayo Clinic)
   - **LLM never generates URLs** — eliminates link-injection risk entirely.

## Phase 4 — Frontend (4–5h, Frontend owner, build in parallel against the API contract from Phase 0)

- [ ] Upload/mock-sync screen — file picker (stand-in for Drive Picker), "Sync" button, shows new vs. already-processed files
- [ ] Records dashboard — timeline view of the append-only log, newest first, grouped by document
- [ ] Chat UI — toggle between General and Symptom-check mode; symptom mode renders MCQ buttons for each question turn, not free text input
- [ ] Facility map view (Phase 5 output)
- [ ] Loading/error states for every async call — cold-start on free-tier hosting means your first request in the demo will be slow; design for that instead of getting surprised by it

## Phase 5 — Facility map (1–2h)

- [ ] `GET /facilities?urgency=X` → Google Maps Places API, filtered by facility type mapped from urgency (`emergency` → hospital/ER, `24h` → urgent care, `monitor` → GP/clinic)
- [ ] Hardcode a fallback facility list for your actual demo location and use it by default during judging — don't depend on live Places API in front of judges unless you've tested it repeatedly at the venue

## Phase 6 — Real OAuth (1–2h, only if Phases 1-5 are done and stable)

- [ ] Swap mock upload for Google Sign-In + Picker (`drive.file` scope)
- [ ] Same `/sync` contract, just a different source for the file list — this should be a small diff if Phase 1's contract held
- [ ] If this slips past your time budget, cut it. A working mock demo beats a broken OAuth demo.

## Phase 6b — Chat persona (~1h, stretch, only if ahead of schedule)

- [ ] Add `persona` field to `user_prefs` table (or just pass it per-request from the frontend if you want to skip persistence entirely — simplest version is stateless).
- [ ] Define 2-3 fixed presets only — e.g. "Straightforward," "Friendly & casual," "Detailed/clinical" — as system-prompt snippets. No open-ended custom persona text (prompt-injection risk, unnecessary scope for a demo).
- [ ] Wire persona into **general chat mode's** system prompt and the **final explanation text** in symptom-check mode only.
- [ ] Hard rule: the red-flag checklist function and the urgency-decision system prompt must live in a separate code path that never receives the persona variable — structurally impossible for tone wording to affect the safety-critical decision. Enforce this with a code review pass, not just intent.
- [ ] Frontend: single dropdown/toggle in the chat UI.
- [ ] Good demo moment if time allows — switching persona live and showing the same question answered differently is visual and low-risk to show judges.

## Phase 7 — Integration + demo prep (2–3h, whole team)

- [ ] Full end-to-end run-through: upload → sync → extract → dashboard → chat → facility map
- [ ] Warm-up ping script for the backend, run it a few minutes before you present (biggest literal failure risk per the summary — treat it as a checklist item, not an afterthought)
- [ ] Local tunnel (ngrok or similar) tested as a live fallback in case hosted backend misbehaves
- [ ] Seed 3-5 realistic demo documents ahead of time — don't extract live in front of judges unless you've rehearsed it and it's fast
- [ ] Rehearse the demo script once start-to-finish with actual timing

---

## Rough time ledger

| Phase | Hours | Can run in parallel with |
|---|---|---|
| 0 Setup | 1–1.5 | — |
| 1 Backend/DB | 2–3 | Phase 4 (frontend against contract) |
| 2 Extraction | 4–5 | Phase 4 |
| 3 Triage chat | 4–5 | Phase 4 |
| 4 Frontend | 4–5 | Phases 1-3 |
| 5 Facility map | 1–2 | tail end of 1-3 |
| 6 OAuth (optional) | 1–2 | only if ahead of schedule |
| 6b Chat persona (optional) | ~1 | only if ahead of schedule, after Phase 3 is solid |
| 7 Integration/demo | 2–3 | last, whole team |

Total core path (0,1,2,3,4,5,7) ≈ 18–24h depending on how much of 2-4 genuinely overlaps. That's tight against your ~18-20h budget — Phase 6 is the first thing to cut if you're behind, followed by trimming Phase 5 to the hardcoded-only fallback (skip live Places API entirely). Phase 6b (persona) is cut alongside Phase 6 if time runs short.

---

## Git workflow

Monorepo, one repo for both `frontend/` and `backend/` — simpler to manage than two repos under time pressure, and both Vercel/Netlify and Render/Railway support deploying from a subdirectory of a monorepo, so this doesn't complicate Phase 0.

**Branch structure:**
```
main                    # always deployable, this is what gets demoed
├── feat/backend-core     # Phase 1
├── feat/extraction       # Phase 2
├── feat/triage-chat      # Phase 3
├── feat/frontend-*       # Phase 4, split further if useful (feat/frontend-dashboard, feat/frontend-chat)
├── feat/facility-map     # Phase 5
├── feat/persona          # Phase 6b, if attempted
```

**Rules:**

1. **`main` stays running at all times.** Never commit broken code straight to it — if `main` breaks 2 hours before judging, you're debugging instead of polishing. Everyone branches off `main`, merges back into it.
2. **Branch per phase/feature, not per person.** Since Phases 1-4 run in parallel against the Phase 0 API contract, each phase = one branch = one owner (or pair). Keeps conflicts rare because you're mostly touching different files (`backend/` vs `frontend/`).
3. **Merge early and often, not once at the end.** The moment a piece works (even partially — e.g. `/sync` returns mock data), merge into `main` and let dependent branches pull from `main` again. Don't sit on a branch for 6 hours.
4. **Skip PR review ceremony, keep PR-as-checkpoint.** No need for teammate approval on every merge — open a PR, glance at your own diff, merge. It's mainly so `git log` on `main` stays readable and you can `git revert` fast if a merge breaks the demo.
5. **No rebasing past hour ~10.** `git merge` conflicts are annoying but recoverable; rebase conflicts under time pressure with tired teammates risk corrupting the repo at 3am. Merge, resolve inline, move on.
6. **Tag or branch off `main` right before the demo** (e.g. `demo-final`) once Phase 7 is done and tested, so a last-minute "quick fix" that breaks something has an instant fallback to redeploy.

---

Open items not decided: actual name-to-role mapping, and whether symptom-check's adaptive questions are LLM-generated each turn or a smaller hardcoded decision tree with LLM only for the final explanation (the latter is safer/faster to build if Phase 3 is running short on time — worth a fallback plan going in).
