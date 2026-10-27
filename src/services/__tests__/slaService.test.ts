import { describe, it, expect } from 'vitest';
import { computeSlaStatus } from '../slaService';
import { GrievanceTicket } from '../../types/grievance';

describe('slaService - Dynamic Countdown & Municipal Escalation Tiers', () => {
  const baseTicket: GrievanceTicket = {
    id: 'POL-TEST-001',
    title: 'Test Grievance',
    description: 'Test description',
    departmentId: 'eng',
    categoryId: 'roads_damage',
    wardId: 10,
    wardName: 'Ward 10',
    landmark: 'Central Market',
    citizenName: 'Sundar',
    citizenPhone: '9842100000',
    isAnonymous: false,
    status: 'IN_PROGRESS',
    urgency: 'HIGH',
    slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    slaHoursTotal: 24,
    isSlaBreached: false,
    escalationLevel: 0,
    aiTriage: {
      categoryConfidence: 0.9,
      urgencyScore: 75,
      detectedKeywords: ['road'],
      sentiment: 'DISTRESSED',
      rationale: 'Road damage',
    },
    timeline: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('computes normal remaining time when deadline is well in the future', () => {
    const ticket: GrievanceTicket = {
      ...baseTicket,
      slaDeadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    };

    const status = computeSlaStatus(ticket);
    expect(status.isOverdue).toBe(false);
    expect(status.badgeClass).toBe('normal');
    expect(status.hoursRemaining).toBeGreaterThanOrEqual(17);
    expect(status.displayText).toContain('Remaining');
    expect(status.escalationLevel).toBe(0);
  });

  it('flags urgent warning when deadline has less than 4 hours remaining', () => {
    const ticket: GrievanceTicket = {
      ...baseTicket,
      slaDeadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    };

    const status = computeSlaStatus(ticket);
    expect(status.isOverdue).toBe(false);
    expect(status.badgeClass).toBe('warning');
    expect(status.displayText).toContain('Critical SLA');
  });

  it('detects SLA breach and escalates to Junior Engineer (Level 1) for overdue under 24h', () => {
    // 6 hours overdue
    const ticket: GrievanceTicket = {
      ...baseTicket,
      slaDeadline: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    };

    const status = computeSlaStatus(ticket);
    expect(status.isOverdue).toBe(true);
    expect(status.badgeClass).toBe('urgent');
    expect(status.escalationLevel).toBe(1);
    expect(status.escalationRole).toContain('Junior Engineer');
    expect(status.displayText).toContain('SLA Breached');
  });

  it('escalates to Executive Engineer (Level 2) for overdue between 24h and 48h', () => {
    // 30 hours overdue
    const ticket: GrievanceTicket = {
      ...baseTicket,
      slaDeadline: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    };

    const status = computeSlaStatus(ticket);
    expect(status.isOverdue).toBe(true);
    expect(status.escalationLevel).toBe(2);
    expect(status.escalationRole).toContain('Executive Engineer');
  });

  it('escalates to Municipal Commissioner (Level 3) for chronic overdue > 48h', () => {
    // 55 hours overdue
    const ticket: GrievanceTicket = {
      ...baseTicket,
      slaDeadline: new Date(Date.now() - 55 * 3600 * 1000).toISOString(),
    };

    const status = computeSlaStatus(ticket);
    expect(status.isOverdue).toBe(true);
    expect(status.escalationLevel).toBe(3);
    expect(status.escalationRole).toContain('Municipal Commissioner');
  });

  it('handles resolved tickets as completed with 0 remaining hours', () => {
    const ticket: GrievanceTicket = {
      ...baseTicket,
      status: 'RESOLVED',
      slaDeadline: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    };

    const status = computeSlaStatus(ticket);
    expect(status.isOverdue).toBe(false);
    expect(status.badgeClass).toBe('resolved');
    expect(status.displayText).toContain('Resolved');
  });

  it('handles rejected tickets with closed status', () => {
    const ticket: GrievanceTicket = {
      ...baseTicket,
      status: 'REJECTED',
    };

    const status = computeSlaStatus(ticket);
    expect(status.isOverdue).toBe(false);
    expect(status.badgeClass).toBe('normal');
    expect(status.displayText).toContain('Closed');
  });
});
