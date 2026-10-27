import { describe, it, expect } from 'vitest';
import { runAiTriage } from '../aiTriageService';

describe('aiTriageService - Bilingual Triage & Urgency Heuristics', () => {
  it('correctly classifies an English road infrastructure issue with high priority', () => {
    const input = 'There is a deep dangerous pothole near the bus stand causing two-wheelers to slip.';
    const result = runAiTriage(input);

    expect(result.departmentId).toBe('dept-roads');
    expect(result.categoryId).toBe('cat-pothole');
    expect(result.confidenceScore).toBeGreaterThan(0.65);
    expect(result.urgency).toBe('HIGH');
    expect(result.sentiment).toBe('DISTRESSED');
    expect(result.detectedKeywords).toContain('pothole');
    expect(result.rationale).toContain('Roads, Bridges & Infrastructure');
  });

  it('correctly handles pure Tamil input with critical urgency for a water pipeline burst', () => {
    const input = 'காந்தி சிலை ரவுண்டானா அருகே குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாக போகிறது';
    const result = runAiTriage(input);

    expect(result.departmentId).toBe('dept-water');
    expect(result.categoryId).toBe('cat-pipe-leak');
    expect(result.urgency).toBe('CRITICAL');
    expect(result.sentiment).toBe('EMERGENCY');
    expect(result.urgencyScore).toBeGreaterThanOrEqual(88);
    // Should extract Tamil keywords
    expect(result.detectedKeywords.some(kw => kw.includes('குடிநீர்') || kw.includes('குழாய்'))).toBe(true);
    // Ward suggestion should detect Gandhi statue landmark (Ward 13)
    expect(result.suggestedWardId).toBe(13);
  });

  it('handles colloquial Tanglish input for streetlight failure with medium urgency', () => {
    const input = 'Venkatesa colony 2nd cross la street light eriyala, romba dark ah irukku night la.';
    const result = runAiTriage(input);

    expect(result.departmentId).toBe('dept-electrical');
    expect(result.categoryId).toBe('cat-streetlight-out');
    expect(result.urgency).toBe('MEDIUM');
    expect(result.detectedKeywords.some(kw => kw.toLowerCase().includes('street light'))).toBe(true);
    expect(result.rationale).toContain('Standard SLA');
  });

  it('identifies critical life-safety electrical hazards (live wire, electric shock)', () => {
    const input = 'Live wire snapped hanging low near school gate sparks flying live wire danger!';
    const result = runAiTriage(input);

    expect(result.departmentId).toBe('dept-electrical');
    expect(result.urgency).toBe('CRITICAL');
    expect(result.sentiment).toBe('EMERGENCY');
    expect(result.urgencyScore).toBeGreaterThanOrEqual(88);
  });

  it('falls back gracefully to default department when input is minimal or under 5 characters', () => {
    const result = runAiTriage('bad');

    expect(result.departmentId).toBeDefined();
    expect(result.categoryId).toBeDefined();
    expect(result.confidenceScore).toBe(0.5);
    expect(result.urgency).toBe('MEDIUM');
    expect(result.rationale).toContain('Awaiting more detailed grievance description');
  });

  it('detects ward based on explicit ward name or recognized landmark in the text', () => {
    const input = 'Garbage overflow near Mahalingapuram Arch causing foul smell';
    const result = runAiTriage(input);

    // Mahalingapuram is Ward 14 in Pollachi
    expect(result.suggestedWardId).toBe(14);
    expect(result.departmentId).toBe('dept-sanitation');
    expect(result.categoryId).toBe('cat-garbage-dump');
  });
});
