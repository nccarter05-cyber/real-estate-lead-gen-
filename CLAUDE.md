# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: ProspectIQ

AI-powered lead generation and management SaaS platform for real estate agents, teams, and brokerages. Agents search for leads by zip code and lead type; the platform scores leads 0–100, classifies them warm/cold, and generates AI-assisted outreach drafts via Claude.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, mobile-responsive PWA |
| Backend | Node.js or Python (FastAPI), RESTful API |
| Database | Supabase (Postgres + Auth + Storage) |
| Search | Elasticsearch for lead search/filtering |
| Cache | Redis for sessions and caching |
| AI | Anthropic Claude API — outreach generation |
| ML Scoring | scikit-learn or XGBoost — lead scoring model |
| Data Ingestion | ETL pipelines from county assessor, RESO MLS API, permissioned data partners |
| Infrastructure | Docker/Kubernetes on AWS or GCP |
| CRM Integrations | Webhooks + OAuth 2.0 (Follow Up Boss, KVCore, Chime, HubSpot) |

## Architecture Overview

**Lead data flow:** External data sources (county records, ATTOM/CoreLogic, MLS via RESO Web API, DNC registry) → ETL ingestion pipelines → Postgres (structured data) + Elasticsearch (search index) → scoring model (runs on ingestion and daily refresh) → API → React frontend.

**Scoring model:** Composite 0–100 score from four signal categories — Intent (35%), Life Event (25%), Property Data (20%), Market Timing (15%), Contact Quality (5%). Tiers: Hot 80–100, Warm 55–79, Cold 25–54, Low 0–24. Model refreshes daily minimum.

**AI outreach:** Claude API generates per-lead call scripts, emails, and SMS drafts in Phase 2. All generated messages require human review before send — no auto-send.

**Lead types:** 7 warm types (expired listings, FSBO, form fills, home value inquiries, life events, relocation signals, past clients) + 7 cold types (high equity, long-term owners, absentee owners, pre-foreclosure/NOD, probate, absentee landlords, empty nesters, multi-property investors).

## Phased Delivery

- **Phase 1 (MVP, months 1–3):** Lead search + filters, warm/cold classification, lead scoring, lead profiles, property data, contact enrichment, warm lead feed, follow-up reminders, notes/tags, CSV export.
- **Phase 2 (Growth, months 4–6):** AI outreach generator (Claude), saved searches + alerts, CRM sync, team lead distribution, outreach tracking.
- **Phase 3 (Scale, months 7–12):** Predictive ML scoring, market overlay maps, drip campaigns, brokerage admin dashboard, REST API access.

## Hard Compliance Requirements

These are non-negotiable and must be enforced at the data and API layer:

- **TCPA:** All phone numbers must be scrubbed against the national DNC registry before display. No auto-dialing — all outreach is agent-initiated only. Track consent status per lead.
- **Fair Housing:** Search filters must never include protected class characteristics (race, religion, national origin, sex, disability, familial status, color). Neighborhood-level displays require Fair Housing disclosures. Retain audit logs of all search parameters for 24 months.
- **Data Privacy:** PII encrypted at rest (AES-256). 24-month retention then purge/anonymize. CCPA and GDPR compliant. Every lead profile must display data source attribution.

## Key Domain Terms

- **Farm area:** The geographic territory an agent targets for consistent prospecting
- **NOD:** Notice of Default — first formal foreclosure step
- **FSBO:** For Sale By Owner
- **RESO:** Real Estate Standards Organization — defines MLS data standards (RESO Web API is the standard MLS feed format)
- **Equity:** Property market value minus outstanding mortgage balance
- **CMA:** Comparative Market Analysis

## Out of Scope (v1)

Transaction management, contract generation, direct MLS listing creation, automated dialers/VOIP, social media management, mortgage/title marketplace, public consumer portal.
