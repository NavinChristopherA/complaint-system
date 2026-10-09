/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SLA SERVICE — Live Countdown, Escalation & Breach Detection   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                  ║
 * ║  PURPOSE:                                                        ║
 * ║  Computes the real-time Service Level Agreement (SLA) status     ║
 * ║  for any given grievance ticket. Determines whether the SLA     ║
 * ║  has been breached, how many hours remain, and which escalation  ║
 * ║  tier applies based on overdue duration.                         ║
 * ║                                                                  ║
 * ║  ESCALATION TIERS (Municipal Hierarchy):                         ║
 * ║  ┌─────────────────────────────────────────────────────────────┐ ║
 * ║  │ Level │ Trigger            │ Escalation Target             │ ║
 * ║  ├───────┼────────────────────┼───────────────────────────────┤ ║
 * ║  │   0   │ Within SLA         │ Normal (no escalation)        │ ║
 * ║  │   1   │ Overdue 0–24h      │ Junior Engineer (Level 1)     │ ║
 * ║  │   2   │ Overdue 24–48h     │ Executive Engineer (Level 2)  │ ║
 * ║  │   3   │ Overdue > 48h      │ Municipal Commissioner (L3)   │ ║
 * ║  └─────────────────────────────────────────────────────────────┘ ║
 * ║                                                                  ║
 * ║  BADGE CLASSES (for UI rendering):                               ║
 * ║  • 'resolved' — Green, ticket completed                         ║
 * ║  • 'normal'   — Neutral, plenty of time remaining               ║
 * ║  • 'warning'  — Amber, less than 4 hours remaining              ║
 * ║  • 'urgent'   — Red, SLA has been breached                      ║
 * ║                                                                  ║
 * ║  UNIT TESTING GUIDANCE:                                          ║
 * ║  Use Date mocking (jest.useFakeTimers / vi.useFakeTimers) to    ║
 * ║  control `Date.now()` and test all four SLA phases:              ║
 * ║  1. Resolved ticket → 'resolved' badge, 0h remaining            ║
 * ║  2. Rejected ticket → 'normal' badge, 0h remaining              ║
 * ║  3. Overdue by 5h   → 'urgent', escalationLevel=1               ║
 * ║  4. Overdue by 30h  → 'urgent', escalationLevel=2               ║
 * ║  5. Overdue by 60h  → 'urgent', escalationLevel=3               ║
 * ║  6. 2h remaining    → 'warning', < 4h critical SLA              ║
 * ║  7. 24h remaining   → 'normal', standard processing             ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { GrievanceTicket } from '../types/grievance';

/**
 * SlaStatusInfo — Computed SLA status for a single ticket at the current moment.
 *
 * @property isOverdue        — true if the SLA deadline has passed
 * @property hoursRemaining   — Hours until deadline (negative if overdue)
 * @property displayText      — Human-readable status string for UI badges
 * @property badgeClass       — CSS class key: 'urgent' | 'warning' | 'normal' | 'resolved'
 * @property escalationLevel  — Current escalation tier (0–3)
 * @property escalationRole   — Human-readable role name for the escalation target
 *
 * UNIT TESTING:
 * - Verify all properties are always defined (no undefined fields)
 * - Verify badgeClass is always one of the 4 valid string literals
 * - Verify escalationLevel is always 0, 1, 2, or 3 (never negative or > 3)
 */
export interface SlaStatusInfo {
  isOverdue: boolean;
  hoursRemaining: number;
  displayText: string;
  badgeClass: 'urgent' | 'warning' | 'normal' | 'resolved';
  escalationLevel: number;
  escalationRole: string;
}

/**
 * computeSlaStatus — Real-time SLA computation for a single ticket.
 *
 * Calculates the current SLA status by comparing Date.now() against
 * the ticket's slaDeadline. Returns a structured result with badge class,
 * escalation tier, and human-readable text.
 *
 * @param ticket — A GrievanceTicket with valid `slaDeadline` ISO string
 * @returns SlaStatusInfo — Current SLA status snapshot
 *
 * DECISION TREE:
 * ┌──────────────────────────────────────────────────────┐
 * │ ticket.status === 'RESOLVED'                        │
 * │   → { resolved, 0h, "Resolved on time" }           │
 * │                                                      │
 * │ ticket.status === 'REJECTED'                        │
 * │   → { normal, 0h, "Closed / Rejected" }            │
 * │                                                      │
 * │ diffHours < 0 (deadline passed)                     │
 * │   → OVERDUE: compute escalation tier                │
 * │     overdue ≤ 24h → Level 1 (Junior Engineer)      │
 * │     overdue 24–48h → Level 2 (Executive Engineer)  │
 * │     overdue > 48h → Level 3 (Commissioner)         │
 * │                                                      │
 * │ diffHours < 4                                       │
 * │   → WARNING: "< Xh Remaining (Critical SLA)"      │
 * │                                                      │
 * │ diffHours ≥ 4                                       │
 * │   → NORMAL: "Xh Remaining"                         │
 * └──────────────────────────────────────────────────────┘
 *
 * EDGE CASES:
 * - Invalid slaDeadline string → Date.parse returns NaN → diffHours = NaN
 *   (consumers should validate slaDeadline before calling)
 * - Ticket exactly at deadline (diffHours ≈ 0) → falls into overdue branch
 *
 * UNIT TESTING MATRIX:
 * ┌─────────────────────────────┬──────────────────────────────────┐
 * │ Input State                  │ Expected Output                  │
 * ├─────────────────────────────┼──────────────────────────────────┤
 * │ status='RESOLVED'           │ badgeClass='resolved', level=0   │
 * │ status='REJECTED'           │ badgeClass='normal', level=0     │
 * │ deadline 5h ago             │ badgeClass='urgent', level=1     │
 * │ deadline 30h ago            │ badgeClass='urgent', level=2     │
 * │ deadline 60h ago            │ badgeClass='urgent', level=3     │
 * │ deadline in 2h              │ badgeClass='warning', level=0    │
 * │ deadline in 24h             │ badgeClass='normal', level=0     │
 * └─────────────────────────────┴──────────────────────────────────┘
 */
export function computeSlaStatus(ticket: GrievanceTicket): SlaStatusInfo {
  // ── TERMINAL STATES ──────────────────────────────────────────
  // Resolved and rejected tickets have no active SLA.
  if (ticket.status === 'RESOLVED') {
    return {
      isOverdue: false,
      hoursRemaining: 0,
      displayText: 'Resolved on time',
      badgeClass: 'resolved',
      escalationLevel: 0,
      escalationRole: 'Redressed'
    };
  }

  if (ticket.status === 'REJECTED') {
    return {
      isOverdue: false,
      hoursRemaining: 0,
      displayText: 'Closed / Rejected',
      badgeClass: 'normal',
      escalationLevel: 0,
      escalationRole: 'Closed'
    };
  }

  // ── LIVE SLA COMPUTATION ─────────────────────────────────────
  // Calculate hours remaining until the SLA deadline.
  // Negative value = SLA breached, positive = time remaining.
  const now = Date.now();
  const deadline = new Date(ticket.slaDeadline).getTime();
  const diffHours = (deadline - now) / (1000 * 3600);

  // ── OVERDUE BRANCH ───────────────────────────────────────────
  // SLA has been breached. Determine escalation tier based on
  // how many hours past the deadline we are.
  if (diffHours < 0) {
    const overdueHours = Math.abs(Math.round(diffHours));
    let escalationLevel = 1;
    let escalationRole = 'Junior Engineer (Level 1)';

    // Escalation cascade: JE → EE → Commissioner
    if (overdueHours > 48) {
      escalationLevel = 3;
      escalationRole = 'Municipal Commissioner (Level 3)';
    } else if (overdueHours > 24) {
      escalationLevel = 2;
      escalationRole = 'Executive Engineer (Level 2)';
    }

    return {
      isOverdue: true,
      hoursRemaining: diffHours,
      displayText: `SLA Breached by ${overdueHours}h`,
      badgeClass: 'urgent',
      escalationLevel,
      escalationRole
    };
  }

  // ── WARNING BRANCH (< 4 hours remaining) ─────────────────────
  // SLA is approaching breach. Highlighted with amber/warning badge.
  if (diffHours < 4) {
    return {
      isOverdue: false,
      hoursRemaining: Math.round(diffHours),
      displayText: `< ${Math.max(1, Math.round(diffHours))}h Remaining (Critical SLA)`,
      badgeClass: 'warning',
      escalationLevel: 0,
      escalationRole: 'Normal'
    };
  }

  // ── NORMAL BRANCH (≥ 4 hours remaining) ──────────────────────
  // Standard processing, well within SLA timeline.
  return {
    isOverdue: false,
    hoursRemaining: Math.round(diffHours),
    displayText: `${Math.round(diffHours)}h Remaining`,
    badgeClass: 'normal',
    escalationLevel: 0,
    escalationRole: 'Normal'
  };
}

