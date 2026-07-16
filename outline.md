# Project Outline: Personal Health Companion
**Garuda Hacks 7.0 — Health Track**

---

## 1. Concept

An AI-powered health literacy/triage assistant that keeps a lightweight, user-owned health record synced from the user's own Google Drive.

**What it is not:** a full medical record system, not a diagnosis tool.

**Positioning:** In line with GH7's Health track focus — access, prevention, literacy — not clinical diagnosis. Framed around "you own your data, we just read a folder you choose," to sidestep both liability risk (diagnosis framing) and privacy risk (storing medical data ourselves).

**Why this scope:** The original idea (full patient DB + diagnosis + maps) was too much for a 30-hour hackathon (~18-20 effective coding hours). Diagnosis framing was cut for liability risk with judges; "we store your medical data" was cut for privacy risk.

---

## 2. Team & Constraints

- Pre-university students
- 30-hour hackathon, ~18-20 effective coding hours
- Stack pool: JS/TS + React, Python (Flask/FastAPI), Go + Gin
- Assumed team split: 3-4 people across Frontend / Backend+DB / AI Pipeline / Integration (swap for actual roster)

---

## 3. Locked-In Architecture

### Stack
- **Web app** — not native. Browser-native OAuth/Picker flow, zero install friction for judges, no separate native toolchain to learn under time pressure.
- **Frontend:** React, deployed on Vercel or Netlify.
- **Backend:** Single Python service using **FastAPI** — one backend, not split with Go, to avoid inter-service glue and extra deployment risk. Deployed on Render or Railway.
- **Database:** Embedded/file-based NoSQL or SQLite (e.g. lowdb/NeDB or SQLite with JSON columns), living alongside the backend — no separate DB server to run or configure.

### Data flow & storage
- Google Sign-In + Picker API (`drive.file` scope) — user picks one Drive folder; app can only ever see that folder.
- Raw documents stay untouched in Drive — this is where the privacy/ownership story lives.
- **Manual "Sync with Drive" button** (not polling/webhooks) — click → list files → diff against locally-stored processed IDs → new files = unprocessed. Doubles as the live-demo moment.
- Extracted structured data + chat history live in the **local DB only**, not Drive — a derived, rebuildable cache.
- **Append-only log design:** each sync appends a new `{timestamp, extracted_fields}` record. No diffing, no conflict resolution, no delete/negation logic. Chat context = last N records, not a maintained "current state" object. (Deliberate simplification to avoid contradictory-patch bugs from an earlier merge-based design.)
- The LLM never gets direct DB/Drive write access — it only outputs structured JSON; the backend validates (schema-checked) before storing.

### Document extraction pipeline
Two-step, not a single VLM call:
1. **Nemotron OCR v2** (via NVIDIA NIM) — OCR step, built for messy real-world images (photos of prescriptions/labels), multilingual.
2. A general reasoning model (e.g. Llama 4 Maverick, or a function-calling-strong model like Nemotron-3-Super/GLM/Qwen 2.5 72B) structures the OCR text into JSON fields.

**Rejected:** MONAI M3 / VILA-M3 — self-hosted, GPU-dependent research model (Docker + CUDA + multi-GB checkpoints), not an API, and radiology-oriented rather than suited to prescription/lab photos. Too high-risk for the time budget.

Model/provider choice is treated as swappable — NVIDIA NIM (OpenAI-compatible endpoint, free tier, ~40 RPM limit) is the current pick.

### Triage chat — two modes
- **General health chat** — freeform Q&A grounded in the last N records, no red-flag gate needed since it's not diagnosing.
- **Symptom-check mode:**
  1. Deterministic red-flag checklist runs first — hardcoded keywords/symptoms (chest pain, difficulty breathing, sudden severe headache, uncontrolled bleeding, stroke signs, loss of consciousness, etc.) → if matched, return `emergency` immediately, **skip the LLM entirely**. This is the concrete answer to "what if the AI is wrong."
  2. If no red flags: LLM asks one structured multiple-choice question at a time, capped at 3-4 rounds, using the last N records as context.
  3. Final round outputs urgency level (`24h` / `monitor` / `emergency`) + plain-language explanation.
  4. Urgency classification is explicitly biased toward over-escalation via the system prompt ("when uncertain between two urgency levels, choose the more urgent one").

### Facility map
- Google Maps Places API, filtered by facility type mapped from urgency (`emergency` → hospital/ER, `24h` → urgent care, `monitor` → GP/clinic).
- Fallback: hardcode a facility list for the actual demo location and use it by default during judging — don't depend on live Places API in front of judges unless tested repeatedly at the venue.

### Chat persona (stretch feature)
- A small fixed set of tone presets (e.g. "Straightforward," "Friendly & casual," "Detailed/clinical") selectable by the user — a dropdown/toggle in the chat UI, not open-ended custom text (avoids prompt-injection and scope creep).
- Persona affects **tone/wording only** — applies to general chat and the final explanation text in symptom-check mode. It never touches the red-flag checklist or the urgency-level decision, which stay in a separate, persona-independent code path so persona wording can't structurally leak into safety-critical logic.
- Rationale: ties into the track's "cultural attitudes toward wellbeing" and younger-population engagement themes — tone is a real barrier to health engagement for younger users, and this is a cheap, low-risk way to address it (one stored preference + system-prompt variant, no new schema or pipeline changes).
- Priority: build only after the red-flag logic and adaptive questioning are solid — same tier as Phase 6 (OAuth), i.e. "add if ahead of schedule," not core path.

---

## 4. Key Risk Mitigations

- Deterministic safety net for emergency symptoms (not LLM-dependent).
- Structured/multiple-choice LLM outputs throughout (not free text) — keeps parsing predictable, easier to debug live.
- Pydantic-validated JSON on every LLM-facing endpoint, in and out.
- Real engineering effort reserved for the two genuine differentiators — multimodal extraction and adaptive triage chat — everything else uses the simplest reliable option.
- Mock-first, OAuth-second: build the full pipeline against local file upload / mock "Drive folder"; wire real Google Sign-In + Picker last, only if time remains.
- Backend free-tier spin-down (Render/Railway) is the top literal demo-failure risk — mitigate with a warm-up ping a few minutes before presenting, plus a tested local tunnel (ngrok) fallback.
- Seed 3-5 realistic demo documents ahead of time — don't extract live in front of judges unless rehearsed and fast.

---

## 5. Explicitly Deferred / Cut

- Full patient DB, multi-user auth/history.
- Real-time Drive webhooks/auto-polling.
- Live OAuth as a hard dependency (mock upload is the fallback-first build order).
- Mutable/patchable summary state (replaced by append-only log).
- Live Places API as a hard demo dependency (hardcoded fallback list instead).

---

## 6. Build Phases (Summary)

| Phase | Owner | Hours | Notes |
|---|---|---|---|
| 0. Setup | Whole team | 1–1.5h | Repo scaffold, deploy skeletons immediately, `.env`, agree on JSON schema up front |
| 1. Backend core + DB | Backend | 2–3h | SQLite schema, `/sync`, `/files/{id}/process`, `/records`, `/chat`, `/facilities` |
| 2. Extraction pipeline | AI Pipeline | 4–5h | OCR → structuring → Pydantic validation; test with real messy images early |
| 3. Triage chat | AI Pipeline / Backend | 4–5h | Red-flag checklist, adaptive MCQ loop, over-escalation bias |
| 4. Frontend | Frontend | 4–5h | Upload/sync screen, records dashboard, chat UI, map view, loading/error states |
| 5. Facility map | — | 1–2h | Places API + hardcoded fallback |
| 6. Real OAuth (optional) | — | 1–2h | Only if Phases 1-5 are done and stable; first cut if behind schedule |
| 6b. Chat persona (optional) | — | ~1h | Same priority tier as Phase 6 — build only if ahead of schedule |
| 7. Integration + demo prep | Whole team | 2–3h | End-to-end run-through, warm-up ping, tunnel fallback, rehearse |

**Total core path** (0,1,2,3,4,5,7) ≈ 18–24h depending on parallel overlap — tight against the ~18-20h budget. Cut order if behind: Phase 6 first, then trim Phase 5 to hardcoded-only.

**Full endpoint list, schemas, and step-by-step tasks:** see the separate build spec document.

---

## 7. Git Workflow (Summary)

- Monorepo: `frontend/` + `backend/` in one repo.
- `main` always deployable — this is what gets demoed.
- Branch per phase/feature (`feat/backend-core`, `feat/extraction`, `feat/triage-chat`, `feat/frontend-*`, `feat/facility-map`).
- Merge early and often, not once at the end.
- Skip PR review ceremony, keep PR-as-checkpoint for a clean, revertable `main`.
- No rebasing past ~hour 10 — merge conflicts over rebase conflicts under time pressure.
- Tag/branch off `main` right before the demo (`demo-final`) as an instant fallback.

---

## 8. Open Items

- Actual name-to-role mapping for the team.
- Whether symptom-check's adaptive questions are LLM-generated each turn, or a smaller hardcoded decision tree with LLM only for the final explanation (latter is the safer/faster fallback if Phase 3 runs short on time).
- Final confirmation of OAuth vs. mock-upload sequencing (currently leaning mock-first).
