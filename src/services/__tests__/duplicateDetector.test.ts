import { describe, it, expect } from 'vitest';
import { detectDuplicateGrievance } from '../duplicateDetector';
import { GrievanceTicket } from '../../types/grievance';

describe('duplicateDetector - Spatial & Semantic Clustered Matching', () => {
  const sampleExistingTickets: GrievanceTicket[] = [
    {
      id: 'POL-2026-W14-0101',
      title: 'Water Pipe Burst Near Mahalingapuram Arch',
      description: 'Major drinking water pipeline burst on main road causing heavy water wastage and water pressure drop.',
      departmentId: 'water',
      categoryId: 'pipe_burst',
      wardId: 14,
      wardName: 'Ward 14 (Mahalingapuram)',
      landmark: 'Mahalingapuram Arch',
      citizenName: 'Karthik Raja',
      citizenPhone: '9842100000',
      isAnonymous: false,
      status: 'IN_PROGRESS',
      urgency: 'CRITICAL',
      slaDeadline: new Date(Date.now() + 86400000).toISOString(),
      slaHoursTotal: 24,
      isSlaBreached: false,
      escalationLevel: 0,
      aiTriage: {
        categoryConfidence: 0.95,
        urgencyScore: 92,
        detectedKeywords: ['pipe burst', 'water'],
        sentiment: 'EMERGENCY',
        rationale: 'Pipeline burst detected',
      },
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'POL-2026-W05-0202',
      title: 'Street Light Failure at Raja Mill Road',
      description: 'Street light pole not working in 1st cross street.',
      departmentId: 'elec',
      categoryId: 'street_light',
      wardId: 5,
      wardName: 'Ward 5 (Raja Mill)',
      landmark: 'Raja Mill Junction',
      citizenName: 'Anonymous',
      citizenPhone: '',
      isAnonymous: true,
      status: 'RESOLVED', // Already resolved
      urgency: 'LOW',
      slaDeadline: new Date().toISOString(),
      slaHoursTotal: 48,
      isSlaBreached: false,
      escalationLevel: 0,
      aiTriage: {
        categoryConfidence: 0.9,
        urgencyScore: 30,
        detectedKeywords: ['street light'],
        sentiment: 'INQUIRY',
        rationale: 'Resolved issue',
      },
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('detects high-confidence duplicate when ward, category, and keywords align', () => {
    const newDesc = 'Drinking water pipeline burst near arch with severe water wastage on main road';
    const result = detectDuplicateGrievance(newDesc, 14, 'pipe_burst', sampleExistingTickets);

    expect(result.isDuplicate).toBe(true);
    expect(result.similarityScore).toBeGreaterThanOrEqual(70);
    expect(result.matchingTicket).toBeDefined();
    expect(result.matchingTicket?.id).toBe('POL-2026-W14-0101');
    expect(result.message).toContain('POL-2026-W14-0101');
  });

  it('does NOT flag duplicate if ward is completely different despite identical category', () => {
    const newDesc = 'Drinking water pipeline burst on main road with heavy water wastage';
    // Submitted in Ward 22 instead of Ward 14
    const result = detectDuplicateGrievance(newDesc, 22, 'pipe_burst', sampleExistingTickets);

    // Score: ward=0, category=35, textSim=~30 -> Total < 70
    expect(result.isDuplicate).toBe(false);
  });

  it('does NOT flag duplicates against resolved or rejected tickets', () => {
    const newDesc = 'Street light pole not working in 1st cross street';
    // Ward 5, Category street_light matches the resolved ticket
    const result = detectDuplicateGrievance(newDesc, 5, 'street_light', sampleExistingTickets);

    expect(result.isDuplicate).toBe(false);
    expect(result.matchingTicket).toBeUndefined();
  });

  it('handles empty ticket list without error', () => {
    const result = detectDuplicateGrievance('Random issue text', 1, 'roads_damage', []);
    expect(result.isDuplicate).toBe(false);
    expect(result.similarityScore).toBe(0);
    expect(result.matchingTicket).toBeUndefined();
  });
});
