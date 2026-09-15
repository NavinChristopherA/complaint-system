import { GrievanceTicket } from '../types/grievance';

export interface SlaStatusInfo {
  isOverdue: boolean;
  hoursRemaining: number;
  displayText: string;
  badgeClass: 'urgent' | 'warning' | 'normal' | 'resolved';
  escalationLevel: number;
  escalationRole: string;
}

export function computeSlaStatus(ticket: GrievanceTicket): SlaStatusInfo {
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

  const now = Date.now();
  const deadline = new Date(ticket.slaDeadline).getTime();
  const diffHours = (deadline - now) / (1000 * 3600);

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

  return {
    isOverdue: false,
    hoursRemaining: Math.round(diffHours),
    displayText: `${Math.round(diffHours)}h Remaining`,
    badgeClass: 'normal',
    escalationLevel: 0,
    escalationRole: 'Normal'
  };
}
