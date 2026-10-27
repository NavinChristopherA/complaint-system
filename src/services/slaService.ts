/**
 * Namma Pollachi — AI Civic Redressal Portal
 * Service Level Agreement (SLA) & Municipal Escalation Engine
 * 
 * Municipal Governance Hierarchy & Escalation Ladder:
 * ─────────────────────────────────────────────────────────────────────────────
 * Pollachi Municipality enforces strict Citizen Charter timelines. When an active
 * grievance exceeds its statutory resolution window (`slaDeadline`), the system
 * triggers an automated multi-tiered administrative escalation:
 * 
 * - Level 0 (Active SLA):
 *   Within standard window (e.g. 6h for live wire, 18h for pipe leak, 48h for pothole).
 *   Assigned to ward Sanitary Inspector (SI) or Junior Engineer (JE).
 * 
 * - Warning Zone (< 4 hours remaining):
 *   Highlights ticket with yellow warning badge (`warning`), notifying ward officer.
 * 
 * - Level 1 (SLA Breached: 0 to 24 hours overdue):
 *   Escalates supervisory oversight to Junior Engineer (JE).
 * 
 * - Level 2 (SLA Breached: 24 to 48 hours overdue):
 *   Escalates disciplinary oversight to Executive Engineer (EE) / City Health Officer.
 * 
 * - Level 3 (SLA Breached: > 48 hours overdue):
 *   Escalates directly to the Municipal Commissioner & Chairman for emergency docket review.
 */

import { GrievanceTicket } from '../types/grievance';

/**
 * Calculated real-time SLA metrics for display on citizen trackers and admin tables.
 */
export interface SlaStatusInfo {
  /** True if current timestamp has surpassed the statutory deadline */
  isOverdue: boolean;
  /** Floating-point hours remaining until deadline (negative if overdue) */
  hoursRemaining: number;
  /** Human-readable string formatted for badges and progress cards */
  displayText: string;
  /** UI badge style classification */
  badgeClass: 'urgent' | 'warning' | 'normal' | 'resolved';
  /** Escalation tier (0=Normal, 1=JE, 2=EE, 3=Municipal Commissioner) */
  escalationLevel: number;
  /** Designation of the municipal authority currently accountable for the ticket */
  escalationRole: string;
}

/**
 * Computes live countdown, breach status, and escalation hierarchy for a grievance.
 * 
 * @param ticket The grievance ticket to evaluate.
 * @returns Comprehensive SlaStatusInfo with countdown and escalation authority.
 */
export function computeSlaStatus(ticket: GrievanceTicket): SlaStatusInfo {
  // Case 1: Resolved tickets require no countdown
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

  // Case 2: Rejected or closed tickets
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

  const now = Date.now();
  const deadline = new Date(ticket.slaDeadline).getTime();
  const diffHours = (deadline - now) / (1000 * 3600);

  // Case 3: Breached ticket (diffHours < 0)
  if (diffHours < 0) {
    const overdueHours = Math.abs(Math.round(diffHours));
    let escalationLevel = 1;
    let escalationRole = 'Junior Engineer (Level 1)';

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

  // Case 4: Critical warning zone (< 4 hours remaining)
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

  // Case 5: Standard healthy SLA countdown
  return {
    isOverdue: false,
    hoursRemaining: Math.round(diffHours),
    displayText: `${Math.round(diffHours)}h Remaining`,
    badgeClass: 'normal',
    escalationLevel: 0,
    escalationRole: 'Normal'
  };
}
