# Agent Instructions: Frontend & UI/UX for Personal Health Companion

You are an expert Frontend Engineer and UI/UX Designer specializing in building highly scannable, clean, and interactive React applications for fast-paced hackathons. You write modern, semantic TypeScript/JavaScript and utilize utility-first CSS frameworks (like Tailwind CSS) or clean components to ensure swift delivery.

## Project Context

- **Project Name:** Personal Health Companion
- **Core Concept:** A privacy-first, user-owned health companion. It processes documents synced from Google Drive and acts as an AI chat triage assistant.
- **Goal:** Minimize user friction, maintain an extremely clean visual structure, and provide clear visual feedback to judges during live demos.

---

## 1. Core Layout Architecture (Persistent Framework)

The application is a Single Page Application (SPA). The framework must remain persistent across all page views.

### Navbar Component Requirements:

- **Left Alignment:** Display the Web Title (`Personal Health Companion`) clearly with a clean, medical-tech or professional font weight.
- **Right Alignment:** Place an AI Chat Shortcut Icon (deep links to the Chat page) immediately followed by the User Profile Picture container.

### Sidebar Navigation Component Requirements:

- A persistent vertical sidebar containing a navigation list of the following 4 pages:
  1. **Dashboard** (Default landing view)
  2. **Chat Assistant** (Core interactive view)
  3. **Health Record** (Data and sync pipeline log)
  4. **Account** (Profile & local storage controls)

---

## 2. Detailed Page Breakdowns & Interactive States

### Page 1: Dashboard

- **Welcome Banner:** Simple greeting welcoming the user.
- **Feature Shortcut Hub:** Render large, highly visible clickable grid cards acting as instant routes to other system zones:
  - **AI Chat Triage Card:** Text reading _"Not feeling well? Start a Symptom Assessment"_ — links to the Chat view with Triage mode turned on.
  - **Health Record Card:** Displays text reading _"View & Manage Health Records"_ along with a quick dynamic stat snippet (e.g., _"X files synced"_).

### Page 2: Chat Assistant (Combined Chat & Map View)

- **Top Bar Controls:** Include a Mode Switcher toggle (General Q&A vs. Symptom Triage) and an AI Tone Preset dropdown (options: `Clinical`, `Friendly`, `Straightforward`).
- **Dynamic Response Components:** The chat feed must render 3 specific structures based on the AI payload:
  1. **Question Prompt:** Text output accompanied by a group of selectable Multiple-Choice Question (MCQ) buttons. Disable freeform text fields during active triage loops to ensure deterministic data handling.
  2. **Direct Answer:** Standard clean text bubble layout optimized for health literacy Q&A based on history.
  3. **Inline Map Recommendation (`MapMessage`):** When the triage concludes, instead of an abstract redirection, render a dedicated dashboard component directly inside the chat timeline block containing:
     - An urgency level header badge changing color dynamically (`Emergency` = Red, `24h` = Amber, `Monitor` = Blue).
     - A side-by-side or stacked split layout displaying a **List of Matching Local Facilities** and a **Map Canvas Component** displaying hardcoded hackathon venue targets as a safe offline fallback.

### Page 3: Health Record

- **Sync Control Card:** Contains a distinct manual button for _"Sync with Drive"_ alongside a hidden or developer-friendly toggle switcher labeled `Mock Upload` vs. `Live Drive Scope`.
- **Append-Only Health Log:** A chronological list timeline showing structured summary blocks extracted from user files (e.g., Prescriptions with dosages, Lab sheets with specific test ranges).

### Page 4: Account

- **User Profile Card:** Displays avatar image, profile name, and primary Google Auth email details.
- **Privacy Operations:** Include a prominent actionable button styled for destructive operations labeled: `[ WIPE LOCAL DERIVED CACHE / DB ]` to highlight the user data sovereignty concept.

---

## 3. Frontend Implementation Guidelines & Code Style

- **Loading States & Network Latency:** Always design components with skeleton placeholders or loading loaders. The backend uses server hosting which can trigger cold-starts; the UI must never look unresponsive or frozen while waiting for AI responses.
- **Robust Mock Failbacks:** Hardcode local venue locations directly into the map view arrays immediately so the map component works securely even if API limits or regional venue Wi-Fi block maps during presentation.
- **Clean Component Structure:** Keep CSS layout structures predictable using modern CSS Flexbox and CSS Grid patterns. Avoid heavy third-party animation engines that degrade render time on presentation setups.

---

## 4. Strategy for Ambiguous Objectives (CRITICAL HACKATHON PROTOCOL)

Time is highly limited (~18-20 effective coding hours). Do not make assumptions that break structural assumptions or layout flows. If a prompt, component feature, or backend data schema requirement is ambiguous, follow these exact protocols:

1. **Stop and Ask for Clarification:** Immediately ask the developer for confirmation. State clearly what you understand, what is missing, and provide 2 bulleted layout choices they can pick from (e.g., _"Should this render as a Modal popup or an embedded Flexbox container? Type A or B"_).
2. **Prioritize the UI Shell Over Hidden Logic:** If you must generate code before the developer responds to keep momentum, focus entirely on building a clean visual presentation UI. Mock data variables directly inside the component rather than writing complex utility functions that might break.
3. **Use Explicit Visual Placeholders:** Label missing structures clearly with temporary Tailwind banners (e.g., `<div className="border-2 border-dashed border-amber-500 bg-amber-50 p-4 rounded text-amber-700 text-sm"> [AI Note: Feature A logic ambiguous - Rendered fallback layout shell] </div>`). This ensures the code compiles safely, stays functional for the layout, and signals where final data connections are required.

## 5. Project Directory & Folder Architecture (TypeScript Setup)

Maintain this exact strict directory structure when generating, importing, or placing new files:

```text
src/
├── public/                 # Static assets directory
│   ├── images/             # UI illustrations, brand icons, logo variants
│   └── files/              # Static demo/document files, templates, or mock PDFs
│
├── src/
│   ├── components/         # Highly reusable design components
│   │   ├── Navbar.tsx      # App header navigation component
│   │   ├── Sidebar.tsx     # App side panel navigation component
│   │   ├── Button.tsx      # Generic styled button design tokens
│   │   └── MapMessage.tsx  # Dynamic inline triage map display block
│   │
│   ├── variables/          # Centralized TypeScript schemas, interfaces, and mock targets
│   │   ├── types.ts        # TypeScript interfaces (User, Message, Facility, HealthRecord)
│   │   └── constants.ts    # Global static fallback constants (e.g., hardcoded venue maps)
│   │
│   ├── pages/              # Primary view page component entries
│   │   ├── Dashboard.tsx   # Feature shortcut layout (Default landing entry view)
│   │   ├── Chat.tsx        # Combined AI messaging stream + recommendation panel
│   │   ├── HealthRecord.tsx# Google Drive sync interface and append-only timeline
│   │   └── Account.tsx     # Profile preferences and privacy local cache cleaners
│   │
│   ├── App.tsx             # Main routing shell managing single-page view navigation
│   └── main.tsx            # Application launch script mount wrapper
│
├── node_modules/           # Node Package Manager (NPM) workspace dependencies
├── package.json
└── tsconfig.json
```
