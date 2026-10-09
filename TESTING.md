# Namma Pollachi — Unit Testing & Error Boundary Technical Documentation

> **Project:** Namma Pollachi — AI Civic Redressal Portal  
> **Phase:** Review 1 Deliverable — Granular Testing & Error Handling Documentation  
> **Last Updated:** 2026-10-09

---

## 1. Testing Strategy Overview

This document provides granular technical documentation on the unit testing approach
and error boundary architecture for the Namma Pollachi grievance redressal system.

### 1.1 Testing Philosophy

| Principle | Implementation |
|:---|:---|
| **Deterministic Core** | All AI triage logic is keyword-based and fully testable without mocks |
| **Offline Independence** | Zero external API calls — every function can be unit tested in isolation |
| **Type Safety** | Complete TypeScript strict mode — compile-time guarantees reduce test surface |
| **Error Containment** | React Error Boundaries isolate rendering crashes per section |
| **Data Resilience** | All localStorage operations wrapped in try/catch with fallback values |

### 1.2 Recommended Testing Stack

```json
{
  "devDependencies": {
    "vitest": "^3.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/user-event": "^14.x",
    "jsdom": "^25.x"
  }
}
```

**Vitest** is recommended over Jest for this Vite project because it shares the same
configuration and transformation pipeline, eliminating ESM/CJS incompatibility issues.

---

## 2. Service Layer Unit Tests

### 2.1 AI Triage Service (`src/services/aiTriageService.ts`)

**Function under test:** `runAiTriage(inputText: string): AiTriageResult`

#### Test Matrix

| # | Test Case | Input | Expected Assertion |
|:--|:----------|:------|:-------------------|
| 1 | Empty input fallback | `''` | `confidenceScore === 0.5`, `sentiment === 'INQUIRY'` |
| 2 | Short input fallback | `'hi'` | `confidenceScore === 0.5` (length < 5 guard) |
| 3 | English pothole detection | `'large pothole on main road'` | `urgency === 'HIGH'`, `departmentId === 'dept-roads'` |
| 4 | CRITICAL hazard escalation | `'pipe burst gushing water'` | `urgency === 'CRITICAL'`, `urgencyScore ≥ 88` |
| 5 | Tamil keyword detection | `'குப்பை அள்ளவில்லை'` | `detectedKeywords` includes Tamil terms |
| 6 | Tanglish mixed input | `'street light eriyala dark'` | `departmentId === 'dept-electrical'` |
| 7 | Ward detection from name | `'problem in Mahalingapuram area'` | `suggestedWardId` is defined |
| 8 | Landmark-based ward detection | Input containing a ward landmark | `suggestedWardId` matches ward ID |
| 9 | No keyword match | `'random xyz abc def ghi'` | `confidenceScore === 0.62` |
| 10 | Confidence cap | Input with 10+ keyword matches | `confidenceScore ≤ 0.98` |

#### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { runAiTriage } from '../services/aiTriageService';

describe('runAiTriage', () => {
  it('returns fallback for empty input', () => {
    const result = runAiTriage('');
    expect(result.confidenceScore).toBe(0.5);
    expect(result.urgency).toBe('MEDIUM');
    expect(result.sentiment).toBe('INQUIRY');
    expect(result.detectedKeywords).toHaveLength(0);
  });

  it('escalates to CRITICAL for hazard keywords', () => {
    const result = runAiTriage('pipe burst gushing water on the road');
    expect(result.urgency).toBe('CRITICAL');
    expect(result.urgencyScore).toBeGreaterThanOrEqual(88);
    expect(result.sentiment).toBe('EMERGENCY');
  });

  it('detects Tamil keywords and matches department', () => {
    const result = runAiTriage('குப்பை அள்ளவில்லை துர்நாற்றம்');
    expect(result.departmentId).toBe('dept-sanitation');
    expect(result.detectedKeywords.length).toBeGreaterThan(0);
  });

  it('never exceeds confidence cap of 0.98', () => {
    const result = runAiTriage(
      'garbage waste dump bin stench smell uncollected filth trash குப்பை துர்நாற்றம்'
    );
    expect(result.confidenceScore).toBeLessThanOrEqual(0.98);
  });
});
```

---

### 2.2 Duplicate Detector (`src/services/duplicateDetector.ts`)

**Functions under test:**
- `detectDuplicateGrievance(description, wardId, categoryId, tickets): DuplicateCheckResult`
- `calculateJaccardSimilarity(textA, textB): number` (private — test via integration)

#### Test Matrix

| # | Test Case | Setup | Expected |
|:--|:----------|:------|:---------|
| 1 | Perfect duplicate | Same ward + same category + similar text | `isDuplicate === true`, `score ≈ 100` |
| 2 | Same ward & category, different text | Same ward + category, unrelated description | `isDuplicate === true`, `score ≈ 70` |
| 3 | Different ward, same category | Different wardId, same categoryId | `isDuplicate === false`, `score < 70` |
| 4 | Same ward, different category | Same wardId, different categoryId | `isDuplicate === false`, `score < 70` |
| 5 | All tickets resolved | All existing tickets have `status: 'RESOLVED'` | `isDuplicate === false` |
| 6 | Empty ticket list | `existingTickets = []` | `isDuplicate === false`, `score === 0` |
| 7 | Message format | When duplicate found | `message` includes ticket ID and ward name |

#### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { detectDuplicateGrievance } from '../services/duplicateDetector';
import { GrievanceTicket } from '../types/grievance';

const mockTicket: GrievanceTicket = {
  id: 'POL-2026-W14-0001',
  title: 'Water pipe leak',
  description: 'Water pipe burst near temple causing flooding on road',
  wardId: 14,
  wardName: 'Mahalingapuram',
  categoryId: 'cat-pipe-leak',
  status: 'IN_PROGRESS',
  // ... other required fields
} as GrievanceTicket;

describe('detectDuplicateGrievance', () => {
  it('detects duplicate for same ward + category', () => {
    const result = detectDuplicateGrievance(
      'Water pipe leak flooding the street',
      14,              // same ward
      'cat-pipe-leak', // same category
      [mockTicket]
    );
    expect(result.isDuplicate).toBe(true);
    expect(result.similarityScore).toBeGreaterThanOrEqual(70);
  });

  it('returns false for different ward', () => {
    const result = detectDuplicateGrievance(
      'Water pipe leak',
      5,               // different ward
      'cat-pipe-leak',
      [mockTicket]
    );
    expect(result.isDuplicate).toBe(false);
  });

  it('excludes resolved tickets', () => {
    const resolved = { ...mockTicket, status: 'RESOLVED' as const };
    const result = detectDuplicateGrievance(
      'Water pipe leak',
      14,
      'cat-pipe-leak',
      [resolved]
    );
    expect(result.isDuplicate).toBe(false);
  });

  it('returns score 0 for empty ticket list', () => {
    const result = detectDuplicateGrievance('anything', 1, 'cat-x', []);
    expect(result.isDuplicate).toBe(false);
    expect(result.similarityScore).toBe(0);
  });
});
```

---

### 2.3 SLA Service (`src/services/slaService.ts`)

**Function under test:** `computeSlaStatus(ticket: GrievanceTicket): SlaStatusInfo`

> **Important:** Tests MUST use `vi.useFakeTimers()` to control `Date.now()`.

#### Test Matrix

| # | Test Case | Ticket State | Expected |
|:--|:----------|:-------------|:---------|
| 1 | Resolved ticket | `status: 'RESOLVED'` | `badgeClass: 'resolved'`, `hoursRemaining: 0` |
| 2 | Rejected ticket | `status: 'REJECTED'` | `badgeClass: 'normal'`, `escalationLevel: 0` |
| 3 | Level 1 escalation | Overdue by 5 hours | `badgeClass: 'urgent'`, `escalationLevel: 1` |
| 4 | Level 2 escalation | Overdue by 30 hours | `escalationLevel: 2`, role includes "Executive" |
| 5 | Level 3 escalation | Overdue by 60 hours | `escalationLevel: 3`, role includes "Commissioner" |
| 6 | Warning zone | 2 hours remaining | `badgeClass: 'warning'`, `isOverdue: false` |
| 7 | Normal zone | 24 hours remaining | `badgeClass: 'normal'`, `isOverdue: false` |

#### Example Test

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeSlaStatus } from '../services/slaService';
import { GrievanceTicket } from '../types/grievance';

describe('computeSlaStatus', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const createTicket = (slaDeadline: string, status = 'IN_PROGRESS'): GrievanceTicket =>
    ({ status, slaDeadline } as GrievanceTicket);

  it('returns resolved for completed tickets', () => {
    const ticket = createTicket('2026-01-01T00:00:00Z', 'RESOLVED');
    const result = computeSlaStatus(ticket);
    expect(result.badgeClass).toBe('resolved');
    expect(result.isOverdue).toBe(false);
  });

  it('escalates to Level 2 when overdue by 30h', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    vi.setSystemTime(now);
    // Deadline was 30 hours ago
    const deadline = new Date(now.getTime() - 30 * 3600 * 1000).toISOString();
    const ticket = createTicket(deadline);
    const result = computeSlaStatus(ticket);
    expect(result.isOverdue).toBe(true);
    expect(result.escalationLevel).toBe(2);
    expect(result.escalationRole).toContain('Executive Engineer');
  });

  it('shows warning when < 4 hours remain', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    vi.setSystemTime(now);
    const deadline = new Date(now.getTime() + 2 * 3600 * 1000).toISOString();
    const ticket = createTicket(deadline);
    const result = computeSlaStatus(ticket);
    expect(result.badgeClass).toBe('warning');
    expect(result.isOverdue).toBe(false);
  });
});
```

---

### 2.4 Storage Service (`src/services/storageService.ts`)

**Functions under test:** `getTickets`, `createTicket`, `updateTicketStatus`,
`assignOfficerToTicket`, `submitCitizenFeedback`, `getTicketById`, `resetToDemoData`

> **Setup:** Mock `localStorage` before each test:
> ```typescript
> const localStorageMock = (() => {
>   let store: Record<string, string> = {};
>   return {
>     getItem: (key: string) => store[key] ?? null,
>     setItem: (key: string, value: string) => { store[key] = value; },
>     removeItem: (key: string) => { delete store[key]; },
>     clear: () => { store = {}; },
>   };
> })();
> Object.defineProperty(global, 'localStorage', { value: localStorageMock });
> ```

#### Test Matrix

| # | Function | Test Case | Expected |
|:--|:---------|:----------|:---------|
| 1 | `getTickets()` | Empty localStorage | Seeds and returns `INITIAL_TICKETS` |
| 2 | `getTickets()` | Corrupt JSON in storage | Returns `INITIAL_TICKETS` fallback |
| 3 | `getTickets()` | Overdue ticket in storage | Sets `isSlaBreached: true` |
| 4 | `createTicket()` | Valid input | ID format: `POL-2026-W{XX}-{YYYY}` |
| 5 | `createTicket()` | Valid input | `slaDeadline` = now + `slaHoursTotal` hours |
| 6 | `createTicket()` | Valid input | Timeline has 2 entries (citizen + AI) |
| 7 | `createTicket()` | `isAnonymous: true` | `citizenName === 'Anonymous Citizen'` |
| 8 | `updateTicketStatus()` | Status → RESOLVED | `resolvedAt` is set |
| 9 | `updateTicketStatus()` | Invalid ticket ID | Returns `undefined` |
| 10 | `getTicketById()` | Case-insensitive search | `'pol-2026-w14-0101'` finds ticket |
| 11 | `resetToDemoData()` | Any state | Returns exactly `INITIAL_TICKETS` |

---

### 2.5 AI Assistant Service (`src/services/aiAssistantService.ts`)

**Functions under test:** `analyzeComplaint`, `checkDuplicates`, `findNearestWard`,
`recordFeedback`, `getFeedbackRecords`, `computeAITriageStats`

#### Test Matrix

| # | Function | Test Case | Expected |
|:--|:---------|:----------|:---------|
| 1 | `analyzeComplaint()` | English input | Returns complete `AIComplaintAnalysis` shape |
| 2 | `analyzeComplaint()` | CRITICAL keywords | `priority === 'CRITICAL'`, `locationRequired === true` |
| 3 | `checkDuplicates()` | Matching ward+category | Returns non-empty `DuplicateMatch[]` |
| 4 | `checkDuplicates()` | No matching tickets | Returns empty array `[]` |
| 5 | `findNearestWard()` | Pollachi coordinates | Returns valid ward ID (1–36) |
| 6 | `findNearestWard()` | Far-away coordinates | Still returns a ward (nearest, not null) |
| 7 | `computeAITriageStats()` | Mixed ticket array | Correct counts for high/critical/duplicates |
| 8 | `computeAITriageStats()` | Empty array | All counts are 0, `averageConfidence === 0` |
| 9 | `recordFeedback()` | Valid feedback | Persists to localStorage |
| 10 | `getFeedbackRecords()` | Corrupt storage | Returns empty array (no crash) |

---

## 3. Error Boundary Architecture

### 3.1 Component: `ErrorBoundary` (`src/components/common/ErrorBoundary.tsx`)

The `ErrorBoundary` is a React class component that implements
`getDerivedStateFromError` and `componentDidCatch` to intercept rendering errors
in child components and display a graceful fallback UI.

#### Boundary Placement in App.tsx

```
<App>
  ├── <Header />                                    (unprotected — critical)
  ├── <main>
  │   ├── [Citizen Mode]
  │   │   ├── <ErrorBoundary fallbackTitle="Citizen Home — Display Error">
  │   │   │   └── <CitizenHome />
  │   │   ├── <ErrorBoundary fallbackTitle="Grievance Registration — Processing Error">
  │   │   │   └── <GrievanceWizard />
  │   │   ├── <ErrorBoundary fallbackTitle="Ticket Tracker — Loading Error">
  │   │   │   └── <TicketTracker />
  │   │   └── <ErrorBoundary fallbackTitle="Ward Overview — Rendering Error">
  │   │       └── <WardOverview />
  │   └── [Admin Mode]
  │       └── <ErrorBoundary fallbackTitle="Admin Command Center — Critical Error">
  │           └── <AdminDashboard />
  ├── <Footer />                                    (unprotected — static)
  ├── <EmergencyContactsModal />
  └── <ToastContainer />
</main>
```

#### What ErrorBoundary Catches vs. Doesn't Catch

| Catches ✅ | Does NOT Catch ❌ |
|:-----------|:------------------|
| Errors in `render()` | Event handler errors (use try/catch) |
| Errors in lifecycle methods | Async errors in `setTimeout`, `fetch` |
| Errors in child constructors | Errors in the boundary itself |
| Errors during reconciliation | Server-side rendering errors |

#### Fallback UI Features

1. **Error icon** with gradient background
2. **Contextual title** (e.g., "Grievance Registration — Processing Error")
3. **User-friendly message** with IT helpdesk contact suggestion
4. **"Try Again" button** that resets error state and re-renders children
5. **Development-only features:**
   - Error message display with monospace formatting
   - Expandable React component stack trace
   - Bug icon indicator

#### Error Boundary Props

| Prop | Type | Required | Description |
|:-----|:-----|:---------|:------------|
| `children` | `ReactNode` | Yes | Components to protect |
| `fallbackTitle` | `string` | No | Custom error heading (default: "Something Went Wrong") |
| `onError` | `(error, errorInfo) => void` | No | External error reporting callback |

### 3.2 Error Boundary Test Matrix

| # | Test Case | Setup | Expected |
|:--|:----------|:------|:---------|
| 1 | Child throws during render | Wrap a component that throws | Fallback UI displayed |
| 2 | Child renders normally | Wrap a healthy component | Children rendered, no fallback |
| 3 | Try Again resets state | Click "Try Again" after error | Children re-render attempt |
| 4 | Custom fallbackTitle | Pass `fallbackTitle="Custom"` | Title shows "Custom" |
| 5 | onError callback invoked | Pass `onError` spy + throw | Spy called with error + errorInfo |
| 6 | Dev mode shows stack trace | `import.meta.env.DEV = true` | Stack trace toggle visible |
| 7 | Prod mode hides details | `import.meta.env.DEV = false` | No error message or stack trace |

#### Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// A component that always throws during render
const BombComponent = () => {
  throw new Error('Test explosion 💥');
};

// A component that renders normally
const SafeComponent = () => <div>Safe Content</div>;

describe('ErrorBoundary', () => {
  // Suppress console.error noise from React's error boundary logging
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  afterAll(() => consoleSpy.mockRestore());

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary fallbackTitle="Test Error">
        <BombComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders children normally when no error', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe Content')).toBeInTheDocument();
  });

  it('invokes onError callback', () => {
    const onErrorSpy = vi.fn();
    render(
      <ErrorBoundary onError={onErrorSpy}>
        <BombComponent />
      </ErrorBoundary>
    );
    expect(onErrorSpy).toHaveBeenCalledTimes(1);
    expect(onErrorSpy.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('resets error state on Try Again click', () => {
    let shouldThrow = true;
    const MaybeThrow = () => {
      if (shouldThrow) throw new Error('Conditional throw');
      return <div>Recovered</div>;
    };

    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Try Again')).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByText('Try Again'));
    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
});
```

---

### 3.3 Event Handler Error Handling

Error Boundaries do NOT catch event handler errors. The following pattern is used
throughout the codebase for safe event handling:

```typescript
// Pattern used in GrievanceWizard, AdminDashboard, etc.
const handleSubmit = async () => {
  try {
    const ticket = createTicket(formData);
    onTicketCreated(ticket);
    onShowToast?.('Success', 'Grievance registered', 'success');
  } catch (err) {
    console.error('Failed to create ticket:', err);
    onShowToast?.('Error', 'Failed to register grievance', 'critical');
  }
};
```

### 3.4 LocalStorage Error Resilience

All localStorage operations in `storageService.ts` use defensive patterns:

```typescript
// READ pattern — fallback to seed data on any failure
export function getTickets(): GrievanceTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { /* seed and return */ }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading tickets from localStorage', err);
    return INITIAL_TICKETS; // ← never crashes, always returns valid data
  }
}

// WRITE pattern — log error, never throw
export function saveTickets(tickets: GrievanceTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Error saving tickets to localStorage', err);
    // localStorage may be full (5MB limit) or unavailable in incognito
  }
}
```

---

## 4. Running Tests

### 4.1 Setup (if not already configured)

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `vite.config.ts`:
```typescript
/// <reference types="vitest" />
export default defineConfig({
  // ... existing config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

### 4.2 Executing Tests

```bash
npx vitest run              # Run all tests once
npx vitest                  # Watch mode
npx vitest run --coverage   # With coverage report
```

### 4.3 Coverage Targets

| Module | Target | Rationale |
|:-------|:-------|:----------|
| `aiTriageService.ts` | ≥ 95% | Core AI logic — must be fully verified |
| `duplicateDetector.ts` | ≥ 90% | Affects user experience (false positives/negatives) |
| `slaService.ts` | ≥ 95% | Escalation logic is governance-critical |
| `storageService.ts` | ≥ 85% | CRUD + error handling paths |
| `ErrorBoundary.tsx` | ≥ 90% | Must verify fallback and recovery |

---

## 5. `data-testid` Selectors for E2E / Integration Tests

The application provides semantic `data-testid` attributes for automated evaluation:

| Selector | Component | Description |
|:---------|:----------|:------------|
| `ai-assistant-card` | GrievanceWizard | AI Assistant entry card |
| `launch-ai-assistant-btn` | GrievanceWizard | Button to launch AI modal |
| `ai-status-summary` | TicketTracker | Natural language status card |
| `ai-natural-summary-text` | AIStatusSummary | Exact AI briefing text |
| `admin-ai-triage-tab-btn` | AdminDashboard | Tab for AI Triage section |
| `ai-triage-overview` | AITriageOverview | Analytics dashboard |
| `stat-total-analyzed` | AITriageOverview | Total analyzed metric |
| `stat-high-critical` | AITriageOverview | High/critical count metric |
| `stat-duplicates` | AITriageOverview | Duplicate suppression count |
| `stat-human-review` | AITriageOverview | Pending review count |
| `ai-review-queue` | AIReviewQueue | HITL review container |
| `review-item-{id}` | AIReviewQueue | Individual review card |
| `ai-feedback-audit-log` | AIReviewQueue | Audit log drawer |
