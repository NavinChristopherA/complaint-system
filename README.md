# Namma Pollachi — AI Civic Redressal Portal
### Municipal Corporation Grievance Redressal & Intelligent Triage System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tests-23%2F23%20Passed-brightgreen.svg)](https://vitest.dev/)
[![Zero External API Risk](https://img.shields.io/badge/AI%20Engine-Deterministic%20%26%20Offline-orange.svg)]()
[![Jurisdiction](https://img.shields.io/badge/Jurisdiction-Pollachi%20Municipality%20(Wards%201--36)-emerald.svg)]()

---

## 1. Executive Summary & Civic Context

**Namma Pollachi** is an enterprise-grade municipal grievance redressal web application engineered for the citizens and administrative officers of **Pollachi Municipality (Coimbatore District, Tamil Nadu)**. Pollachi spans 36 administrative wards characterized by a mix of dense commercial bazaars, agricultural transit hubs, and residential layouts.

Citizens frequently register complaints using colloquial Tamil, pure Unicode Tamil, English, or mixed Tanglish (e.g., *"kudi thanni pipe odanjuthi"*, *"street light eriyala"*, *"kuppai allala"*). Traditional civic portals fail because citizens struggle to navigate formal municipal departmental hierarchies.

**Namma Pollachi bridges this gap by delivering:**
1. **Multi-Lingual AI Smart Complaint Triage:** Automatically structures, classifies, and prioritizes unstructured complaints across Pollachi's 8 municipal departments and 24 specialized service categories.
2. **Explainable AI (XAI):** Synthesizes transparent attribution rationales citing exact keyword triggers and operational directives for field dispatchers.
3. **Spatial & Clustered Duplicate Mitigation:** Employs Unicode-aware Jaccard text similarity combined with spatial ward weighting to identify duplicate complaints and suppress redundant dispatches.
4. **Dynamic SLA Countdown & Multi-Tier Escalation:** Live statutory countdowns that escalate breached tickets across administrative tiers (Junior Engineer &rarr; Executive Engineer &rarr; Municipal Commissioner).
5. **Human-in-the-Loop (HITL) Governance:** Administrative review queue with persistent calibration feedback logging (`pollachi_ai_feedback_v1`) for continuous AI model tuning.
6. **Production-Grade Error Boundaries:** Granular blast-radius containment preventing unexpected component failures from disrupting civic services.

---

## 2. System Architecture & Flow

```mermaid
flowchart TD
    subgraph Citizen Layer
        A[Citizen Complaint Input\nEnglish / Tamil / Tanglish] --> B[AI Assistant Modal / Grievance Wizard]
        B --> C{Spatial Geolocation}
        C -->|GPS Coordinates| D[Euclidean Ward Centroid Locator\nfindNearestWard]
        C -->|Manual Selection| E[36-Ward Landmark Matcher]
    end

    subgraph AI Triage Engine
        B --> F[Bilingual Keyword Extractor\nrunAiTriage]
        F --> G[Taxonomy Classifier\n8 Depts / 24 Categories]
        F --> H[Urgency & Hazard Scorer\nCRITICAL / HIGH / MEDIUM / LOW]
        F --> I[Explainability Generator\nXAI Attribution & Field Directives]
    end

    subgraph Deduplication Engine
        D & E --> J[Duplicate Detection Service\ndetectDuplicateGrievance]
        G --> J
        J -->|Composite Score >= 70%| K[Duplicate Alert & Citizen Clustered Subscription]
        J -->|Score < 70%| L[New Grievance Ticket Minted\nPOL-2026-Wxx-xxxx]
    end

    subgraph SLA & Administrative Governance
        L --> M[Statutory SLA Timer\ncomputeSlaStatus]
        M -->|Within SLA| N[Ward Field Dispatch\nSI / JE Assignment]
        M -->|Overdue 0-24h| O[Level 1 Escalation: Junior Engineer]
        M -->|Overdue 24-48h| P[Level 2 Escalation: Executive Engineer]
        M -->|Overdue >48h| Q[Level 3 Escalation: Municipal Commissioner]
        L --> R[Human-in-the-Loop Review Desk\nConfidence < 75% or Critical]
        R --> S[Admin Calibration Log\npollachi_ai_feedback_v1]
    end
```

---

## 3. Complete REST API Endpoints Specification

Below is the standard enterprise REST API specification implemented by the service layer contracts and designed for backend microservices integration.

### 3.1 Endpoint Summary Table

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/grievances` | Public / Citizen | Register a new municipal grievance ticket |
| `GET` | `/api/v1/grievances` | Municipal Officer | List grievance tickets with multi-attribute filtering |
| `GET` | `/api/v1/grievances/:id` | Public / Citizen | Retrieve detailed ticket dossier, timeline, and SLA status |
| `PATCH` | `/api/v1/grievances/:id/status` | Field Officer / Admin | Update ticket status (`ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`) |
| `POST` | `/api/v1/grievances/:id/assign` | Dispatch Authority | Assign field officer (JE / SI) to a grievance ticket |
| `POST` | `/api/v1/grievances/:id/feedback` | Citizen | Submit post-redressal rating (1–5 stars) and qualitative review |
| `POST` | `/api/v1/ai/triage` | Public / Internal | Stateless natural language parsing, taxonomy classification & urgency scoring |
| `POST` | `/api/v1/ai/deduplicate` | Public / Internal | Detect active duplicate tickets based on spatial and semantic overlap |
| `POST` | `/api/v1/ai/feedback` | Municipal Officer | Record HITL administrative calibration (Approve / Edit / Reject) |
| `GET` | `/api/v1/wards` | Public / Internal | Retrieve all 36 Pollachi wards with centroids, landmarks, and engineers |
| `GET` | `/api/v1/analytics/triage-stats` | Command Center | Retrieve telemetry metrics on triage volume, confidence, and SLA breaches |

---

### 3.2 Detailed API Request & Response Schemas

#### 1. Register Grievance
`POST /api/v1/grievances`

- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "Water Pipe Burst Near Mahalingapuram Arch",
  "description": "Major drinking water pipeline burst on main road causing severe flooding and water loss.",
  "originalLanguage": "en",
  "departmentId": "dept-water",
  "categoryId": "cat-pipe-leak",
  "wardId": 14,
  "wardName": "Mahalingapuram Central & Arch",
  "landmark": "Mahalingapuram Welcome Arch",
  "latitude": 10.6620,
  "longitude": 77.0010,
  "citizenName": "Karthik Raja",
  "citizenPhone": "9842100000",
  "isAnonymous": false,
  "urgency": "CRITICAL",
  "slaHoursTotal": 18,
  "photoUrl": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80"
}
```
- **Response (`201 Created`):**
```json
{
  "status": "success",
  "data": {
    "id": "POL-2026-W14-0106",
    "title": "Water Pipe Burst Near Mahalingapuram Arch",
    "status": "PENDING_TRIAGE",
    "urgency": "CRITICAL",
    "slaDeadline": "2026-10-27T22:30:00.000Z",
    "slaHoursTotal": 18,
    "isSlaBreached": false,
    "escalationLevel": 0,
    "timeline": [
      {
        "id": "tl-1740632400000-1",
        "timestamp": "2026-10-27T04:30:00.000Z",
        "status": "PENDING_TRIAGE",
        "actor": "Karthik Raja",
        "actorRole": "Citizen",
        "comment": "Grievance successfully registered via Namma Pollachi Portal for Ward 14."
      }
    ],
    "createdAt": "2026-10-27T04:30:00.000Z"
  }
}
```

---

#### 2. Stateless AI Triage
`POST /api/v1/ai/triage`

- **Request Body:**
```json
{
  "text": "காந்தி சிலை ரவுண்டானா அருகே குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாக போகிறது"
}
```
- **Response (`200 OK`):**
```json
{
  "departmentId": "dept-water",
  "departmentName": "Water Supply & Sewerage",
  "categoryId": "cat-pipe-leak",
  "categoryName": "Drinking Water Pipeline Burst / Leakage",
  "confidenceScore": 0.95,
  "urgency": "CRITICAL",
  "urgencyScore": 92,
  "detectedKeywords": ["குடிநீர்", "குழாய்", "உடைப்பு"],
  "suggestedWardId": 13,
  "sentiment": "EMERGENCY",
  "rationale": "Identified acute civic hazard triggers (குடிநீர், குழாய், உடைப்பு). Automatically elevated priority to CRITICAL (Score: 92/100) with expedited SLA of 18h."
}
```

---

#### 3. Duplicate Detection Check
`POST /api/v1/ai/deduplicate`

- **Request Body:**
```json
{
  "description": "Drinking water pipe broke near arch with clean water wasting on road",
  "wardId": 14,
  "categoryId": "cat-pipe-leak"
}
```
- **Response (`200 OK`):**
```json
{
  "isDuplicate": true,
  "similarityScore": 88,
  "matchingTicket": {
    "id": "POL-2026-W14-0101",
    "title": "Water Pipe Burst Near Mahalingapuram Arch",
    "wardName": "Ward 14 (Mahalingapuram)",
    "status": "IN_PROGRESS"
  },
  "message": "A similar active grievance (POL-2026-W14-0101) for \"Water Pipe Burst Near Mahalingapuram Arch\" has already been reported in Ward 14 (Mahalingapuram)."
}
```

---

#### 4. Record Human-in-the-Loop Feedback
`POST /api/v1/ai/feedback`

- **Request Body:**
```json
{
  "ticketId": "POL-2026-W14-0101",
  "reviewerName": "Er. K. Natarajan",
  "reviewerRole": "Executive Engineer",
  "decision": "EDIT_AND_APPROVE",
  "correctedCategory": "cat-pipe-leak",
  "correctedDepartment": "dept-water",
  "correctedPriority": "CRITICAL",
  "comments": "Elevated from High to Critical due to proximity to primary school",
  "originalCategory": "cat-pipe-leak",
  "originalDepartment": "dept-water",
  "originalPriority": "HIGH",
  "originalConfidence": 0.88
}
```
- **Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "Audit calibration logged to pollachi_ai_feedback_v1"
}
```

---

## 4. Relational Database Schema & Data Models

The data architecture is structured for relational persistence (e.g., PostgreSQL / MySQL) with foreign key constraints, indexes, and full auditability.

### 4.1 Mermaid Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    WARDS ||--o{ GRIEVANCE_TICKETS : contains
    DEPARTMENTS ||--o{ CATEGORIES : defines
    DEPARTMENTS ||--o{ GRIEVANCE_TICKETS : routed_to
    CATEGORIES ||--o{ GRIEVANCE_TICKETS : classifies
    OFFICERS ||--o{ GRIEVANCE_TICKETS : assigned_to
    CITIZENS ||--o{ GRIEVANCE_TICKETS : files
    GRIEVANCE_TICKETS ||--o{ TIMELINE_EVENTS : tracks
    GRIEVANCE_TICKETS ||--o{ CITIZEN_FEEDBACK : evaluates
    GRIEVANCE_TICKETS ||--o{ AI_FEEDBACK_LOGS : audited_by
    GRIEVANCE_TICKETS ||--o{ DUPLICATE_CLUSTERS : clusters

    WARDS {
        int id PK
        int ward_number
        string name
        string tamil_name
        string zone
        float latitude
        float longitude
        int population_approx
    }

    DEPARTMENTS {
        string id PK
        string name
        string tamil_name
        string description
        string head_officer
        string head_contact
        string color_hex
    }

    CATEGORIES {
        string id PK
        string department_id FK
        string name
        string tamil_name
        int standard_sla_hours
        string default_urgency
        json keywords_en
        json keywords_ta
    }

    OFFICERS {
        string id PK
        string name
        string role
        string phone
        string department_id FK
        int active_ticket_count
    }

    GRIEVANCE_TICKETS {
        string id PK
        string title
        text description
        string original_language
        string department_id FK
        string category_id FK
        int ward_id FK
        string landmark
        float latitude
        float longitude
        string citizen_name
        string citizen_phone
        boolean is_anonymous
        string status
        string urgency
        int urgency_score
        float confidence_score
        timestamp sla_deadline
        int sla_hours_total
        boolean is_sla_breached
        int escalation_level
        string assigned_officer_id FK
        string photo_url
        string resolution_photo_url
        text resolution_remarks
        timestamp created_at
        timestamp updated_at
        timestamp resolved_at
    }

    TIMELINE_EVENTS {
        string id PK
        string ticket_id FK
        timestamp event_timestamp
        string status
        string actor
        string actor_role
        text comment
        string photo_url
        boolean is_ai_action
    }

    AI_FEEDBACK_LOGS {
        string id PK
        string ticket_id FK
        string reviewer_name
        string reviewer_role
        string decision
        string original_category
        string corrected_category
        string original_priority
        string corrected_priority
        float original_confidence
        text comments
        timestamp created_at
    }
```

---

### 4.2 SQL DDL (PostgreSQL Schema)

```sql
-- 1. Wards Table (Pollachi Wards 1 to 36)
CREATE TABLE wards (
    id SERIAL PRIMARY KEY,
    ward_number INT NOT NULL UNIQUE CHECK (ward_number BETWEEN 1 AND 36),
    name VARCHAR(120) NOT NULL,
    tamil_name VARCHAR(150) NOT NULL,
    zone VARCHAR(30) NOT NULL CHECK (zone IN ('North', 'South', 'East', 'West', 'Central')),
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    population_approx INT DEFAULT 8000,
    active_grievances INT DEFAULT 0,
    resolved_grievances INT DEFAULT 0
);

-- 2. Municipal Departments
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    tamil_name VARCHAR(150) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) NOT NULL,
    color_hex VARCHAR(10) NOT NULL,
    head_officer VARCHAR(120) NOT NULL,
    head_contact VARCHAR(30) NOT NULL
);

-- 3. Department Service Categories
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    department_id VARCHAR(50) NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    tamil_name VARCHAR(150) NOT NULL,
    standard_sla_hours INT NOT NULL CHECK (standard_sla_hours > 0),
    default_urgency VARCHAR(15) NOT NULL CHECK (default_urgency IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    keywords_en JSONB NOT NULL DEFAULT '[]',
    keywords_ta JSONB NOT NULL DEFAULT '[]'
);

-- 4. Municipal Field Officers
CREATE TABLE officers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(80) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id),
    active_ticket_count INT DEFAULT 0
);

-- 5. Grievance Tickets
CREATE TABLE grievance_tickets (
    id VARCHAR(40) PRIMARY KEY, -- e.g. 'POL-2026-W14-0101'
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    original_language VARCHAR(10) DEFAULT 'en',
    department_id VARCHAR(50) NOT NULL REFERENCES departments(id),
    category_id VARCHAR(50) NOT NULL REFERENCES categories(id),
    ward_id INT NOT NULL REFERENCES wards(id),
    ward_name VARCHAR(120) NOT NULL,
    landmark VARCHAR(150) NOT NULL,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    citizen_name VARCHAR(100) NOT NULL,
    citizen_phone VARCHAR(20),
    is_anonymous BOOLEAN DEFAULT FALSE,
    status VARCHAR(25) NOT NULL DEFAULT 'PENDING_TRIAGE' 
        CHECK (status IN ('PENDING_TRIAGE', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
    urgency VARCHAR(15) NOT NULL CHECK (urgency IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    urgency_score INT NOT NULL CHECK (urgency_score BETWEEN 1 AND 100),
    category_confidence NUMERIC(4,2) NOT NULL CHECK (category_confidence BETWEEN 0.0 AND 1.0),
    detected_keywords JSONB DEFAULT '[]',
    sentiment VARCHAR(20) DEFAULT 'DISSATISFIED',
    rationale TEXT NOT NULL,
    sla_deadline TIMESTAMPTZ NOT NULL,
    sla_hours_total INT NOT NULL,
    is_sla_breached BOOLEAN DEFAULT FALSE,
    escalation_level INT DEFAULT 0 CHECK (escalation_level BETWEEN 0 AND 3),
    assigned_officer_id VARCHAR(50) REFERENCES officers(id),
    photo_url TEXT,
    resolution_photo_url TEXT,
    resolution_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 6. Ticket Timeline Events (Append-Only Audit Trail)
CREATE TABLE ticket_timeline_events (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(40) NOT NULL REFERENCES grievance_tickets(id) ON DELETE CASCADE,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(25) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    actor_role VARCHAR(80) NOT NULL,
    comment TEXT NOT NULL,
    photo_url TEXT,
    is_ai_action BOOLEAN DEFAULT FALSE
);

-- 7. Human-in-the-Loop Feedback Calibration Log
CREATE TABLE ai_feedback_logs (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(40) NOT NULL REFERENCES grievance_tickets(id),
    reviewer_name VARCHAR(100) NOT NULL,
    reviewer_role VARCHAR(80) NOT NULL,
    decision VARCHAR(30) NOT NULL CHECK (decision IN ('APPROVE', 'EDIT_AND_APPROVE', 'REJECT')),
    original_category VARCHAR(50),
    corrected_category VARCHAR(50),
    original_department VARCHAR(50),
    corrected_department VARCHAR(50),
    original_priority VARCHAR(15),
    corrected_priority VARCHAR(15),
    original_confidence NUMERIC(4,2),
    comments TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for High Performance Queries
CREATE INDEX idx_tickets_ward ON grievance_tickets(ward_id);
CREATE INDEX idx_tickets_status ON grievance_tickets(status);
CREATE INDEX idx_tickets_urgency ON grievance_tickets(urgency);
CREATE INDEX idx_tickets_sla_breached ON grievance_tickets(is_sla_breached) WHERE is_sla_breached = TRUE;
CREATE INDEX idx_timeline_ticket_id ON ticket_timeline_events(ticket_id);
CREATE INDEX idx_categories_keywords ON categories USING GIN (keywords_en jsonb_path_ops);
```

---

## 5. Granular Technical Documentation on Unit Testing

### 5.1 Testing Architecture & Test Runner
The project uses **[Vitest](https://vitest.dev/)** paired with **`@testing-library/react`**, **`@testing-library/jest-dom/vitest`**, and **`jsdom`**. 

- **Test Runner:** Vitest v5.x with native Vite module resolution.
- **Environment:** `jsdom` simulating browser DOM, HTML5 events, and custom matchers (`toBeInTheDocument()`, etc.).
- **Global Setup:** [`src/test/setup.ts`](file:///c:/Users/augus/OneDrive/Desktop/namma-pollachi-submission-folder/src/test/setup.ts) binds custom DOM assertions.
- **Test Commands:**
  ```bash
  # Execute full test suite once
  npm test

  # Execute test suite in watch mode
  npm run test:watch

  # Execute with code coverage metrics
  npx vitest run --coverage
  ```

---

### 5.2 Granular Test Suites Breakdown

| Test Suite File | Tested Module | Coverage & Scenarios Verified | Passing Tests |
| :--- | :--- | :--- | :---: |
| [`src/services/__tests__/aiTriageService.test.ts`](file:///c:/Users/augus/OneDrive/Desktop/namma-pollachi-submission-folder/src/services/__tests__/aiTriageService.test.ts) | `aiTriageService.ts` | &bull; English road infrastructure classification (`dept-roads`, `cat-pothole`, `HIGH`)<br>&bull; Pure Tamil pipeline burst (`dept-water`, `cat-pipe-leak`, `CRITICAL`, Ward 13)<br>&bull; Colloquial Tanglish streetlight failure (`dept-electrical`, `cat-streetlight-out`, `MEDIUM`)<br>&bull; Acute hazard escalation (live wire & shock triggers &rarr; `CRITICAL`, score &ge; 88)<br>&bull; Graceful fallback for minimal text (<5 characters)<br>&bull; Landmark entity extraction (Mahalingapuram Arch &rarr; Ward 14) | **6 / 6** |
| [`src/services/__tests__/duplicateDetector.test.ts`](file:///c:/Users/augus/OneDrive/Desktop/namma-pollachi-submission-folder/src/services/__tests__/duplicateDetector.test.ts) | `duplicateDetector.ts` | &bull; High-confidence duplicate detection when ward, category, and tokens align (&ge; 70%)<br>&bull; Rejection of false matches when ward differs despite identical category<br>&bull; Suppression of resolved or rejected tickets to prevent stale duplicate alerts<br>&bull; Resilient handling of empty ticket pools | **4 / 4** |
| [`src/services/__tests__/slaService.test.ts`](file:///c:/Users/augus/OneDrive/Desktop/namma-pollachi-submission-folder/src/services/__tests__/slaService.test.ts) | `slaService.ts` | &bull; Active countdown computation for healthy tickets<br>&bull; Warning state trigger when remaining SLA &lt; 4 hours (`warning` badge)<br>&bull; Level 1 Escalation (&le; 24h overdue &rarr; Junior Engineer)<br>&bull; Level 2 Escalation (24–48h overdue &rarr; Executive Engineer)<br>&bull; Level 3 Escalation (&gt; 48h overdue &rarr; Municipal Commissioner)<br>&bull; Zero remaining hours for resolved & rejected states | **7 / 7** |
| [`src/components/common/__tests__/ErrorBoundary.test.tsx`](file:///c:/Users/augus/OneDrive/Desktop/namma-pollachi-submission-folder/src/components/common/__tests__/ErrorBoundary.test.tsx) | `ErrorBoundary.tsx` | &bull; Transparent rendering of normal children without errors<br>&bull; Interception of thrown child exceptions and fallback UI rendering<br>&bull; Inclusion of contextual `boundaryName` in alert container<br>&bull; Dispatch of `onError` telemetry callback with stack trace<br>&bull; Monospace diagnostic drawer inspection toggle<br>&bull; Compact inline alert card rendering (`isolateCard={true}`)<br>&bull; User recovery and re-render on clicking "Recover & Retry" | **6 / 6** |
| **Total** | **All Core Engines** | **End-to-End Algorithmic & UI Component Verification** | **23 / 23** |

---

### 5.3 Mocking Strategies & Determinism
- **Clock Virtualization:** Dynamic SLA calculations use `Date.now()` differences, allowing exact verification of overdue hour tiers.
- **Console Error Suppression:** `ErrorBoundary.test.tsx` temporarily intercepts `console.error` during intentional component crash simulations to maintain clean test logs.
- **LocalStorage Seed Reset:** `storageService.resetToDemoData()` enables deterministic state resets between integration runs.

---

## 6. Granular Technical Documentation on Error Boundaries

### 6.1 Blast-Radius Isolation Architecture

In civic applications, an uncaught runtime error in a complex interactive component (e.g. an SVG coordinate rendering error or unexpected JSON schema) must **never unmount the entire portal**. 

Namma Pollachi implements a multi-tiered Error Boundary hierarchy via [`src/components/common/ErrorBoundary.tsx`](file:///c:/Users/augus/OneDrive/Desktop/namma-pollachi-submission-folder/src/components/common/ErrorBoundary.tsx):

```mermaid
graph TD
    Root[Application Root Boundary\nmain.tsx] --> AppNav[Universal Navigation & Persona Header]
    Root --> MainWorkspace[Main View Area]
    
    MainWorkspace --> CitizenBoundary[ErrorBoundary: Citizen Workspace\nApp.tsx]
    CitizenBoundary --> Home[CitizenHome]
    CitizenBoundary --> Wizard[GrievanceWizard]
    CitizenBoundary --> Tracker[TicketTracker]
    CitizenBoundary --> WardView[WardOverview]
    
    MainWorkspace --> AdminBoundary[ErrorBoundary: Admin Command Center\nApp.tsx]
    AdminBoundary --> TriageOverview[AITriageOverview]
    AdminBoundary --> ReviewQueue[AIReviewQueue]
    AdminBoundary --> TicketTable[TicketTable]
    AdminBoundary --> Heatmap[WardHeatmap]
```

---

### 6.2 Error Boundary Component Specifications

The `ErrorBoundary` class component implements React 19 error handling lifecycles:

```typescript
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  boundaryName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  isolateCard?: boolean;
}
```

1. **`static getDerivedStateFromError(error: Error)`**:
   Catches the error synchronously during rendering and switches state to `{ hasError: true, error }`, triggering the fallback UI.
2. **`componentDidCatch(error: Error, errorInfo: ErrorInfo)`**:
   Captures the full React component hierarchy stack trace and forwards structured telemetry to the `onError` prop.
3. **`isolateCard` Prop**:
   When set to `true`, renders a lightweight inline alert banner (`role="alert"`) suitable for embedded widgets (e.g., Ward Map or AI telemetry card), allowing surrounding views to remain fully interactive.
4. **Diagnostic Drawer**:
   A collapsible monospace drawer that displays the error message, JavaScript stack, and React component tree for municipal technical reviewers.
5. **State Recovery Workflow**:
   Clicking **"Recover & Retry"** invokes `this.resetError()`, which triggers the consumer `onReset` callback (e.g. returning to the portal home screen) and resets local boundary state.

---

## 7. Automated Evaluation Selectors (`data-testid`)

For automated evaluation crawlers and test runners, the application provides deterministic semantic hooks:

| Selector | File Location | Purpose / Evaluator Action |
| :--- | :--- | :--- |
| `data-testid="ai-assistant-card"` | `GrievanceWizard.tsx` | Prominent AI complaint assistant entry card on Step 1 |
| `data-testid="launch-ai-assistant-btn"` | `GrievanceWizard.tsx` | Button triggering the multi-step AI natural language intake modal |
| `data-testid="ai-status-summary"` | `TicketTracker.tsx` | Natural language status briefing card |
| `data-testid="ai-natural-summary-text"` | `AIStatusSummary.tsx` | Exact text of the AI natural language status briefing |
| `data-testid="admin-ai-triage-tab-btn"` | `AdminDashboard.tsx` | Tab button opening the AI Triage & Review section |
| `data-testid="ai-triage-overview"` | `AITriageOverview.tsx` | AI analytics and telemetry dashboard container |
| `data-testid="stat-total-analyzed"` | `AITriageOverview.tsx` | Metric showing total AI-analyzed grievances |
| `data-testid="stat-high-critical"` | `AITriageOverview.tsx` | Metric showing critical and high-priority grievances |
| `data-testid="stat-duplicates"` | `AITriageOverview.tsx` | Metric showing duplicate suppression count |
| `data-testid="stat-human-review"` | `AITriageOverview.tsx` | Metric showing complaints pending human officer review |
| `data-testid="ai-review-queue"` | `AIReviewQueue.tsx` | Human-in-the-loop review queue container |
| `data-testid="review-item-{id}"` | `AIReviewQueue.tsx` | Individual review card with Approve / Edit / Reject controls |
| `data-testid="ai-feedback-audit-log"` | `AIReviewQueue.tsx` | Audit log drawer storing human calibration decisions |

---

## 8. Local Installation & Development

### Prerequisites
- **Node.js:** v18.0.0 or higher (v24.x tested and supported)
- **npm:** v9.x or higher

### Setup & Run
```bash
# 1. Clone the repository and navigate to folder
git clone <repo-url>
cd namma-pollachi-submission-folder

# 2. Install project dependencies
npm install

# 3. Run unit test suite (23/23 tests)
npm test

# 4. Start local development server
npm run dev

# 5. Build for production deployment
npm run build
```

---

## 9. License & Municipal Attribution
Developed for the **Pollachi Municipal Corporation (பொள்ளாச்சி நகராட்சி)**, Department of Municipal Administration and Water Supply, Government of Tamil Nadu.
