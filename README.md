# ProspectIQ

AI-powered lead generation and management platform for real estate agents, teams, and brokerages. Agents search for leads by zip code and lead type; the platform scores each lead 0–100, classifies it warm or cold, explains *why* in plain English, and guides the agent toward the highest-probability prospects.

This repo currently contains the **Phase 1 (MVP) frontend** — a React + TypeScript app running on realistic mock data. There is no backend yet; data ingestion, scoring, and enrichment services come next.

## What the app does

| Screen | Description |
|---|---|
| **Daily Feed** | Personalized morning feed of warm leads in the agent's farm areas, ranked by score, with stats (hot leads, follow-ups due, new overnight) and a plain-English reason for every lead |
| **Lead Search** | Search by zip, city, address, or owner. Filter across all 14 lead types (7 warm, 7 cold), minimum equity, ownership length, and property type. Results sorted by score, exportable to CSV |
| **Lead Profile** | Slide-over drawer with the full picture: score breakdown across the five weighted signal categories, detected signals, property data (equity, value, ownership history), contact info with DNC and consent status, pipeline stage, follow-up reminders, private notes and tags, and data source attribution |
| **Pipeline** | Drag-and-drop Kanban board tracking leads through New → Contacted → Appointment Set → Closed |
| **Settings** | Farm-area zip codes, feed lead-type preferences, notification toggles, saved searches, and CRM connections (Follow Up Boss, KVCore, Chime, HubSpot — Phase 2) |

## Lead scoring model

Composite 0–100 score from five weighted signal categories, per the PRD:

| Category | Weight |
|---|---|
| Intent signals (form fills, FSBO listings, home value inquiries) | 35% |
| Life event signals (marriage, divorce, job change, new child) | 25% |
| Property data (equity, ownership length, assessed value) | 20% |
| Market timing (local conditions, days on market) | 15% |
| Contact quality (verified phone/email) | 5% |

Tiers: **Hot** 80–100 (call within 24h) · **Warm** 55–79 (follow up in 72h) · **Cold** 25–54 (nurture) · **Low** 0–24.

## Compliance built into the UI

- Every phone number shows DNC registry status; calling is disabled for DNC-listed numbers
- Consent status (opt-in vs. none) surfaced on every lead profile
- No protected-class characteristics anywhere in search filters (Fair Housing)
- Data source attribution displayed on every lead profile
- Fair Housing disclosure and audit-log notice on profiles and in the sidebar

## Running it

```bash
cd app
npm install
npm run dev
```

Opens on http://localhost:5173 (or the next free port).

## Project structure

```
app/
  src/
    App.tsx              app shell, sidebar nav, drawer + toast state
    types.ts             lead model, scoring weights, tier logic
    data.ts              lead type definitions + mock Charlotte NC dataset
    index.css            design system (ivory/ink/gold, thermal score colors)
    components/          ScoreDial, chips, icons, LeadDrawer (lead profile)
    views/               Feed, Search, Pipeline, Settings
ProspectIQ PRD.docx      product requirements document
CLAUDE.md                project guidance for Claude Code
```

## Roadmap (from the PRD)

- **Phase 1 (MVP)** — lead search, scoring, classification, profiles, reminders, CSV export ← *UI done, backend next*
- **Phase 2 (Growth)** — AI outreach generator (Claude), saved search alerts, CRM sync, team lead distribution
- **Phase 3 (Scale)** — predictive ML scoring, market overlays, drip campaigns, brokerage dashboard, REST API
