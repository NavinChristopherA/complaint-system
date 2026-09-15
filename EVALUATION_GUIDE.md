# Namma Pollachi — AI Civic Redressal Portal
## Evaluator & Technical Architecture Guide

> **Project Name:** Namma Pollachi — Municipal Corporation Grievance Redressal Portal  
> **Target Jurisdiction:** Pollachi Municipality (Wards 1 to 36, Coimbatore District, Tamil Nadu)  
> **Key Innovation:** Multi-Lingual AI Smart Complaint Assistant with Explainable Triage, Duplicate Mitigation, Dynamic SLA Countdown, and Human-in-the-Loop Governance.

---

## 1. Executive Summary

Namma Pollachi is an AI-powered municipal grievance redressal web application built for the citizens and administration of Pollachi, Tamil Nadu. It bridges the gap between everyday citizen complaints (often expressed in conversational Tamil, English, or mixed Tanglish) and formal municipal administration by automatically structuring, classifying, deduplicating, and routing issues to the proper municipal departments with transparent SLA accountability.

---

## 2. AI Architecture & Core Innovations

### 2.1 Multi-Lingual & Tanglish Intent Recognition
- **Natural Language Parsing:** Accepts unstructured descriptions in English, pure Tamil (Unicode script), or colloquial Tanglish (e.g., *"kudi thanni pipe odanjuthi"*, *"street light eriyala"*, *"kuppai allala"*).
- **Service Taxonomy Alignment:** Maps raw text against Pollachi Municipality's 8 core departments and 24 specialized service categories (`src/data/departments.ts`).
- **Urgency Scoring & Sentiment:** Evaluates hazard triggers (live wires, open manholes, high-pressure pipeline bursts) to assign urgency levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) with an urgency score (0–100).

### 2.2 Explainable AI (XAI) & Rationale Generation
- **Transparent Attribution:** Every triage outcome provides an explicit explanation citing the exact detected keyword triggers (e.g., `#pothole`, `#pipeline`, `#street-light`) and why a specific priority was assigned.
- **Action Recommendations:** Synthesizes actionable instructions for field teams (e.g., *"Immediate dispatch required. Escalate to Junior Engineer if unresolved within 6 hours"*).

### 2.3 Spatial Matching & Geolocation
- **Dual Location Intake:** Supports browser HTML5 Geolocation (GPS) with fallback to manual ward and landmark selection.
- **Euclidean Ward Locator:** The `findNearestWard(lat, lng)` algorithm dynamically correlates GPS coordinates against centroid coordinates of Pollachi's 36 wards.

### 2.4 Duplicate Detection & Cluster Mitigation
- **Levenshtein & Keyword Similarity:** The duplicate engine (`src/services/duplicateDetector.ts`) analyzes existing ward grievances within the same category to calculate a similarity score.
- **Citizen Clustered Subscription:** When a duplicate is detected, citizens can subscribe to updates on the existing ticket rather than creating duplicate dispatches for municipal crews.

### 2.5 Human-in-the-Loop (HITL) Admin Review Queue
- **Oversight Desk:** Complaints with lower AI confidence (<85%) or critical severity are routed to the **AI Review Queue** (`src/components/admin/AIReviewQueue.tsx`).
- **Administrative Calibration:** Municipal officers can **Approve**, **Edit & Reassign**, or **Reject** suggestions.
- **Persistent Feedback Audit Log:** All decisions are logged to localStorage (`pollachi_ai_feedback_v1`) to record calibration history for continuous model tuning.

---

## 3. Technology Stack & Codebase Structure

```
├── src/
│   ├── types/
│   │   ├── grievance.ts         # GrievanceTicket, TicketStatus, OfficerAssignment, SLA types
│   │   ├── aiAssistant.ts       # AIComplaintAnalysis, LocationData, EvidenceItem, Feedback types
│   │   ├── user.ts              # Municipal administrative personas & role hierarchy
│   │   └── ward.ts              # 36 Pollachi ward definitions with JE & SI contacts
│   ├── services/
│   │   ├── aiAssistantService.ts # Complaint analysis, title generation, explainability, feedback
│   │   ├── aiTriageService.ts   # Bilingual keyword extraction & urgency heuristics
│   │   ├── duplicateDetector.ts # Spatial & text similarity matching
│   │   ├── slaService.ts        # Live SLA countdown, escalation tiers & breach detection
│   │   └── storageService.ts    # LocalStorage persistence, seed data, and ticket CRUD
│   ├── components/
│   │   ├── citizen/
│   │   │   ├── AIAssistantModal.tsx # Multi-step natural language complaint assistant modal
│   │   │   ├── AIStatusSummary.tsx  # Natural language status explanation card
│   │   │   ├── GrievanceWizard.tsx  # 4-step structured complaint lodging wizard
│   │   │   ├── TicketTracker.tsx    # Live tracking with SLA countdown & AI briefing
│   │   │   ├── DuplicateWarningModal.tsx # Duplicate alert and merge dialog
│   │   │   └── CitizenHome.tsx      # Landing page with hero and quick actions
│   │   ├── admin/
│   │   │   ├── AITriageOverview.tsx # Metrics, routing breakdown, evaluation guide
│   │   │   ├── AIReviewQueue.tsx    # Human-in-the-loop review queue & audit drawer
│   │   │   ├── AdminDashboard.tsx   # Command center tab navigation & batch dispatch
│   │   │   ├── TicketTable.tsx      # Comprehensive grievance table with filters
│   │   │   └── WardHeatmap.tsx      # Heatmap across Pollachi wards
│   │   └── common/
│   │       ├── Header.tsx           # Persona switcher, mode toggle (Citizen/Admin), language
│   │       ├── PollachiCityMap.tsx  # Interactive SVG ward map
│   │       └── StatusBadge.tsx      # Accessible status and priority badges
│   └── data/
│       ├── departments.ts       # 8 municipal departments & bilingual keywords
│       ├── pollachiWards.ts     # 36 wards with coordinates, landmarks, and field engineers
│       └── initialTickets.ts    # Seed demonstration cases
```

---

## 4. Key Scenarios for AI Evaluators to Test

### Scenario 1: English Road Damage (Pothole)
- **Input:** *"There is a large dangerous pothole on Market Road near the bus stand causing two-wheelers to slip."*
- **Expected Outcome:**
  - **Category:** Roads, Bridges & Infrastructure
  - **Department:** Engineering (Roads & Infrastructure)
  - **Priority:** HIGH or CRITICAL
  - **Action:** Field inspection dispatched within 24 hours.

### Scenario 2: Pure Tamil Water Supply Breakdown
- **Input:** *"காந்தி சிலை ரவுண்டானா அருகே குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாக போகிறது"*
- **Expected Outcome:**
  - **Category:** Water Supply & Sewerage
  - **Department:** Water Supply & Sewerage
  - **Priority:** CRITICAL (Pipeline burst)
  - **Detected Keywords:** `#குடிநீர்`, `#குழாய்`, `#உடைப்பு`

### Scenario 3: Tanglish Streetlight Failure
- **Input:** *"Venkatesa colony 2nd cross la street light eriyala, romba dark ah irukku night la."*
- **Expected Outcome:**
  - **Category:** Street Lighting & Electrical
  - **Department:** Electrical & Street Lighting
  - **Priority:** MEDIUM (Standard SLA)

### Scenario 4: Duplicate Grievance Detection
- **Steps:** In Ward 14 (Mahalingapuram), submit a complaint about a drinking water leak or pipe burst.
- **Outcome:** System detects existing ticket `POL-2026-W14-0101` and alerts the user with similarity score and option to track existing ticket.

---

## 5. Automated Testing & Verification Selectors (`data-testid`)

The application provides semantic attributes for automated evaluation crawlers:

| Selector | Location | Description |
| :--- | :--- | :--- |
| `data-testid="ai-assistant-card"` | `GrievanceWizard.tsx` | Prominent AI Assistant entry card on Step 1 |
| `data-testid="launch-ai-assistant-btn"` | `GrievanceWizard.tsx` | Button that triggers the 6-step AI Assistant modal |
| `data-testid="ai-status-summary"` | `TicketTracker.tsx` | Natural language status explanation card |
| `data-testid="ai-natural-summary-text"` | `AIStatusSummary.tsx` | Exact text of the AI status briefing |
| `data-testid="admin-ai-triage-tab-btn"` | `AdminDashboard.tsx` | Tab button to open AI Triage & Review section |
| `data-testid="ai-triage-overview"` | `AITriageOverview.tsx` | AI analytics and telemetry dashboard |
| `data-testid="stat-total-analyzed"` | `AITriageOverview.tsx` | Metric showing total AI-analyzed complaints |
| `data-testid="stat-high-critical"` | `AITriageOverview.tsx` | Metric showing high & critical priority complaints |
| `data-testid="stat-duplicates"` | `AITriageOverview.tsx` | Metric showing duplicate suppression count |
| `data-testid="stat-human-review"` | `AITriageOverview.tsx` | Metric showing complaints pending human review |
| `data-testid="ai-review-queue"` | `AIReviewQueue.tsx` | Human-in-the-loop triage review container |
| `data-testid="review-item-{id}"` | `AIReviewQueue.tsx` | Individual review card with Approve/Edit/Reject actions |
| `data-testid="ai-feedback-audit-log"` | `AIReviewQueue.tsx` | Audit log drawer storing human calibration decisions |

---

## 6. Offline Independence & Determinism

- **Zero External API Failure Risk:** The system uses a local, deterministic AI triage engine designed specifically for municipal offline evaluations. Evaluators will not encounter authentication failures, rate limits, or network timeouts.
- **Pluggable Architecture:** The service layer in `aiAssistantService.ts` exposes standard asynchronous signatures (`analyzeComplaint`, `checkDuplicates`), enabling seamless substitution with production cloud LLM endpoints (e.g., Gemini Flash, Vertex AI) without modifying UI components.
- **Complete TypeScript Typing:** Zero `any` casts in core triage flows; compiled cleanly with strict mode.
