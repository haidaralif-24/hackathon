# HealthCompanion — Frontend Design Spec (DESIGN.md)

This document specifies the visual design system and page layouts for the **HealthCompanion** web app, derived from reference screenshots (Dashboard, Chat, Health Records). It is intended for an agent/developer to implement a pixel-close frontend.

---

## 1. Brand Overview

- **Product name:** HealthCompanion
- **Logo:** Rounded-square blue badge with a white heart-plus icon, followed by wordmark "HealthCompanion" — "Health" in dark navy/black, "Companion" in brand blue.
- **Tagline (sidebar footer card):** "Your health, our priority." / "Smart tools for a healthier you."
- **Overall tone:** Clean, clinical-but-friendly SaaS dashboard. Light background, soft shadows, rounded corners, generous white space, blue as the single accent color against neutral grays.

---

## 2. Layout Structure

Fixed **two-zone shell** used on every page:

1. **Left Sidebar** (fixed width ~260–290px, full height, white background, light right border)
   - Logo/wordmark at top
   - Vertical nav list: Dashboard, Chat, Health Records, Account (each with a line icon + label)
   - Active nav item: light blue rounded rectangle background (`#EAF1FE`-ish), blue text/icon, blue left accent
   - Inactive items: gray icon + dark gray text, no background
   - Bottom-anchored promo card: soft blue gradient rounded card with shield+plus icon, bold headline "Your health, our priority.", subtext "Smart tools for a healthier you."

2. **Main Content Area** (flexible width, light gray-blue page background `#F5F7FB`)
   - **Top header bar**, white/transparent, contains:
     - Page title (bold, large) + gray subtitle underneath, left-aligned
     - Right-aligned: chat/message icon (with blue notification dot), circular user avatar photo, user name + dropdown chevron
   - Below header: page-specific content in white rounded-corner cards/panels with subtle drop shadow, laid out in a responsive grid.

---

## 3. Color Palette

| Token | Hex (approx) | Usage |
|---|---|---|
| `--brand-blue` | `#2F6FED` | Primary buttons, active states, links, logo, accents |
| `--brand-blue-dark` | `#1E4FBE` | Hover/darker gradient stop |
| `--brand-blue-light-bg` | `#EAF1FE` | Active nav bg, selected chip bg, user chat bubble bg |
| `--navy-text` | `#111827` | Headings, primary text |
| `--gray-text` | `#6B7280` | Secondary text, subtitles, timestamps |
| `--gray-border` | `#E5E7EB` | Card borders, dividers |
| `--page-bg` | `#F5F7FB` | App background behind cards |
| `--card-bg` | `#FFFFFF` | Card/panel backgrounds |
| `--warning-bg` | `#FDF3E3` | Urgent-care alert banner background |
| `--warning-border` | `#F5C46B` | Alert banner border |
| `--warning-icon` | `#E8A83C` | Alert triangle icon |
| `--warning-text` | `#8A5A12` | Alert heading/body text |
| `--success-green` | `#16A34A` | "Last synced" success check icon |
| `--tag-lab-bg` | `#DCEBFF` / `--tag-lab-text` `#1D4ED8` | "Lab Result" badge |
| `--tag-rx-bg` | `#DCFCE7` / `--tag-rx-text` `#15803D` | "Prescription" badge |
| `--tag-vital-bg` | `#EDE4FF` / `--tag-vital-text` `#7C3AED` | "Vital Signs" badge |
| `--danger-marker` | `#E23B3B` | Red map pin (current location) |

**Icon circle colors (timeline):** blue circle (lab/flask), green circle (pill/prescription), purple circle (heart/vitals) — matching each entry's tag color family.

---

## 4. Typography

- **Font family:** Inter / system-ui sans-serif (rounded, modern, geometric).
- **Scale:**
  - Page H1 (e.g. "Welcome back, Alex!", "Health Record"): 32–36px, bold (700), `--navy-text`
  - Section subtitle: 15–16px, regular, `--gray-text`
  - Card titles (e.g. "Lab Result -- 2026-05-12"): 18px, semibold
  - Body/chat text: 15px, regular, line-height ~1.5
  - Labels/meta (timestamps, small captions): 12–13px, `--gray-text`
  - Nav items: 15px medium
  - Buttons: 15px semibold

---

## 5. Core Components

### 5.1 Sidebar Nav Item
- Icon (20px line icon) + label, horizontal, 12px gap
- Padding: 10px 16px, border-radius: 10px
- Active: bg `--brand-blue-light-bg`, icon+text `--brand-blue`
- Inactive: transparent bg, icon+text `--gray-text` / dark gray
- Hover: subtle light gray bg

### 5.2 Top Header
- Left: page title (bold) stacked over gray subtitle
- Right cluster (flex row, gap 16px): chat-bubble icon button with small blue notification dot (top-right corner) → circular avatar image (36–40px) → name text + small dropdown chevron

### 5.3 Buttons
- **Primary:** solid `--brand-blue` bg, white text, rounded-full or rounded-lg (8–10px radius), icon+label, padding ~10px 20px. Used for "Run Manual Drive Sync", send-message arrow button (circular, icon-only).
- **Segmented/tab toggle** (Chat page "General Q&A" / "Symptom Triage"): pill-shaped container, active segment solid blue with white text + icon, inactive segment transparent gray text.
- **Dropdown select** (e.g. "Tone: Clinical", "Mock Upload Folder", "All Types"): white bg, gray border, rounded-lg, chevron-down icon right-aligned.

### 5.4 Cards / Panels
- White background, `border-radius: 16px`, `box-shadow: 0 1px 3px rgba(0,0,0,0.06)`, border `1px solid --gray-border` (subtle).
- Consistent internal padding ~20–24px.

### 5.5 Chat Bubbles
- **User message:** right-aligned, light blue bg (`--brand-blue-light-bg`), rounded-2xl with flattened bottom-right corner, dark text, avatar photo (circular) to the right, timestamp below in gray small text.
- **Assistant message:** left-aligned, white bg card with border, rounded-2xl with flattened bottom-left corner, small circular blue "+" avatar icon to the left, timestamp below.
- Chat input bar: full-width rounded pill/rect input field with placeholder "Type your message...", circular blue send button (paper-plane icon) at right end. Disclaimer caption below input: "AI responses are for informational purposes only and not a substitute for professional medical advice."

### 5.6 Alert / Urgency Banner
- Full-width rounded card, `--warning-bg` background, `--warning-border` border, warning triangle icon (`--warning-icon`) at left.
- Bold headline (e.g. "24 Hour Urgent Care Recommended") + supporting sentence in `--warning-text`.

### 5.7 Facility List Item (map sidebar list)
- Numbered circular blue badge (1, 2, 3…) + clinic name (bold, blue link-style) + type/hours line (gray) + address (gray, two lines) + distance shown as a small pill/badge (light gray bg, e.g. "0.4 mi away").
- "View more facilities" link at bottom with chevron.

### 5.8 Map View
- Right-hand panel, rounded corners, static/mock map illustration with numbered blue pins matching facility list, one red pin for "current location," street/area labels, zoom +/- controls bottom-right (white circular buttons stacked).

### 5.9 Status Pill / Badge
- Small rounded-full chip, colored bg + colored text (see tag colors above), e.g. "24 HOUR CARE RECOMMENDED", "Lab Result", "Prescription", "Vital Signs".

### 5.10 Timeline (Health Records page)
- Vertical connecting line on the left with circular icon nodes per entry (flask = lab, pill = prescription, heart = vitals).
- Each node aligned with a card row containing: date/time (left, outside card), and a card (right) with title + colored tag badge (top-right of card) + a labeled key-value list (icon + label + value per row) + a "⋮" overflow menu top-right corner.

### 5.11 Storage Sync Control Bar
- White card containing: label "Storage Sync (Manual)", a dropdown ("Mock Upload Folder"), a primary blue button with refresh icon ("Run Manual Drive Sync"), and a right-aligned sync-status indicator (green check circle + "Last synced" gray label + bold timestamp).

### 5.12 Dashboard Shortcut Cards
- Two large rounded cards side-by-side, ~equal width, tall aspect ratio.
- Each has a small "QUICK SHORTCUT" pill label at top, large bold multi-line uppercase title (e.g. "START SYMPTOM CHECK"), short gray/white descriptive line, a decorative icon/illustration in the corner (large, semi-transparent), and a circular arrow-forward button bottom-left.
- Primary card: solid blue gradient background, white text/icon.
- Secondary card: white/light gray background, dark text, gray icon.

---

## 6. Page Specs

### 6.1 Dashboard
- Header: "Welcome back, {name}!" + "Here's what you can do today."
- Body: two Quick Shortcut cards (Start Symptom Check — primary blue; View Health Records — secondary light) in a horizontal grid.

### 6.2 Chat (AI Chat Assistant)
- Header: "AI Chat Assistant" + "Get answers. Understand your health. Find care."
- Row under header: segmented tab toggle (General Q&A / Symptom Triage) on the left, "Tone" labeled dropdown (e.g. Clinical) on the right.
- Two-column split below:
  - **Left (chat column, ~60% width):** scrolling message thread (user + assistant bubbles, timestamps), message input bar pinned at bottom with disclaimer caption.
  - **Right (contextual panel, ~40% width):** collapsible "MapMessage" card containing: urgency alert banner, "Urgency Status" pill row, two-column sub-layout of Facilities list + Map View, collapse/expand chevron top-right of panel.

### 6.3 Health Records
- Header: "Health Record" + "Your synced files and extracted health history."
- Storage Sync control bar (card) below header.
- "Your Timeline" section title + gray subtitle ("Append-only history log of your extracted health data.") with a right-aligned "All Types" filter dropdown.
- Vertical timeline list of entry cards (Lab Result, Prescription, Vital Signs, etc.), newest first, each styled per §5.10.

---

## 7. Spacing, Radius & Elevation

- Base spacing unit: 4px grid (common gaps: 8, 12, 16, 20, 24, 32px).
- Card radius: 16px (large cards), 12px (chat bubbles/list items), full-round (pills, avatars, circular buttons).
- Shadows: soft, low-opacity, no harsh drop shadows — `0 1px 3px rgba(16,24,40,0.06)` to `0 4px 12px rgba(16,24,40,0.08)` for elevated panels like the MapMessage card.
- Icons: outline/line-style (stroke ~1.5–2px), 18–24px, consistent stroke weight across sidebar, headers, and card content.

---

## 8. Iconography

Line-icon set (e.g. lucide-react) suggested for: house (Dashboard), message-circle (Chat), folder (Health Records/Storage), user (Account), shield-plus (promo card), send/paper-plane (chat send), triangle-alert (urgency banner), flask/droplet (lab), pill (prescription), heart-pulse (vitals), map-pin (facility markers), plus/minus (zoom controls), chevron-down (dropdowns/collapse), more-vertical (card overflow menu), refresh-cw (sync button), check-circle (sync success).

---

## 9. Responsive Notes

- Sidebar collapses to icon-only or off-canvas drawer below ~1024px.
- Chat page's two-column split (chat + MapMessage panel) stacks vertically on narrower/mobile widths, MapMessage panel becomes a collapsible section below the chat thread.
- Dashboard shortcut cards stack to single column on mobile.
- Timeline entries remain single-column; the connecting line/icon column stays but date labels may move above the card instead of beside it on small screens.

---

## 10. Accessibility

- Maintain minimum 4.5:1 contrast for body text on white/light backgrounds (navy/gray text passes; verify warning-banner text against `--warning-bg`).
- All icon-only buttons (send, sync, zoom, overflow menu) require `aria-label`.
- Status pills/badges should not rely on color alone — pair with text label (already the case in reference designs).
- Chat thread should be a live region (`aria-live="polite"`) so new assistant messages are announced.
