/**
 * AI Smart Complaint Assistant Service
 * ─────────────────────────────────────
 * AI Prototype Mode — Deterministic keyword-based analysis.
 * NOT a real ML model. Designed so a real API can replace this
 * by swapping function implementations behind the same signatures.
 */

import { runAiTriage } from './aiTriageService';
import { detectDuplicateGrievance } from './duplicateDetector';
import { getTickets } from './storageService';
import { POLLACHI_DEPARTMENTS } from '../data/departments';
import { POLLACHI_WARDS } from '../data/pollachiWards';
import { GrievanceTicket } from '../types/grievance';
import {
  AIComplaintAnalysis,
  DuplicateMatch,
  AIReviewFeedback,
  AIFeedbackRecord,
  AITriageStats,
} from '../types/aiAssistant';

const FEEDBACK_STORAGE_KEY = 'pollachi_ai_feedback_v1';

// ─── Title Generation ─────────────────────────────────────────

function generateTitle(rawText: string, categoryName: string): string {
  const text = rawText.trim();
  // Extract first meaningful phrase up to 60 chars
  const firstSentence = text.split(/[.!?\n]/)[0].trim();

  if (firstSentence.length <= 60 && firstSentence.length > 10) {
    // Capitalize first letter of each word for title case
    return firstSentence
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .slice(0, 60);
  }

  // Fallback: use category + location hints
  const locationHints = [
    'bus stand', 'main road', 'market', 'school', 'temple', 'hospital',
    'junction', 'colony', 'nagar', 'street', 'cross', 'roundabout',
    'near', 'opposite', 'behind', 'front'
  ];
  const foundLocation = locationHints.find(lh => text.toLowerCase().includes(lh));
  const locationSuffix = foundLocation
    ? ` Near ${foundLocation.charAt(0).toUpperCase() + foundLocation.slice(1)}`
    : '';

  return `${categoryName.split('/')[0].trim()} Issue${locationSuffix}`.slice(0, 60);
}

// ─── Structured Description ───────────────────────────────────

function generateStructuredDescription(rawText: string, categoryName: string, priority: string): string {
  const text = rawText.trim();
  const priorityLabel = priority === 'CRITICAL' || priority === 'HIGH'
    ? 'creating a safety concern'
    : 'causing inconvenience to residents';

  return `Citizen reports a ${categoryName.toLowerCase()} issue that is ${priorityLabel}. ` +
    `Original description: "${text.length > 200 ? text.slice(0, 200) + '...' : text}"`;
}

// ─── AI Explanation ───────────────────────────────────────────

function generateExplanation(
  keywords: string[],
  categoryName: string,
  departmentName: string,
  priority: string
): string {
  if (keywords.length === 0) {
    return `The complaint was assigned to ${departmentName} based on general context analysis. ` +
      `Confidence is lower because no strong category-specific keywords were detected.`;
  }

  const kwList = keywords.slice(0, 4).map(k => `"${k}"`).join(', ');
  return `Keywords ${kwList} related to ${categoryName.toLowerCase()} were detected. ` +
    `This triggered routing to ${departmentName} with ${priority} priority. ` +
    `The classification is based on keyword matching against Pollachi municipal service categories.`;
}

// ─── Suggested Action ─────────────────────────────────────────

function generateSuggestedAction(
  priority: string,
  departmentName: string,
  categoryName: string
): string {
  if (priority === 'CRITICAL') {
    return `Immediate field inspection required. Dispatch ${departmentName} emergency team to the reported location. ` +
      `Escalate to Junior Engineer if unresolved within 6 hours.`;
  }
  if (priority === 'HIGH') {
    return `Priority dispatch recommended. Assign to ${departmentName} ward-level officer for inspection within 24 hours.`;
  }
  if (priority === 'MEDIUM') {
    return `Schedule inspection by ${departmentName} staff within standard SLA timeline. ` +
      `Monitor for duplicate reports from the same area.`;
  }
  return `Log for routine attention by ${departmentName}. Standard processing timeline applies.`;
}

// ─── Main Analysis Function ──────────────────────────────────

export function analyzeComplaint(rawText: string): AIComplaintAnalysis {
  const triageResult = runAiTriage(rawText);

  const dept = POLLACHI_DEPARTMENTS.find(d => d.id === triageResult.departmentId);
  const cat = dept?.categories.find(c => c.id === triageResult.categoryId);

  const categoryName = cat?.name || triageResult.categoryName;
  const departmentName = dept?.name || triageResult.departmentName;

  const suggestedTitle = generateTitle(rawText, categoryName);
  const structuredDescription = generateStructuredDescription(rawText, categoryName, triageResult.urgency);
  const explanation = generateExplanation(
    triageResult.detectedKeywords,
    categoryName,
    departmentName,
    triageResult.urgency
  );
  const suggestedAction = generateSuggestedAction(triageResult.urgency, departmentName, categoryName);

  // Determine if location evidence is strongly recommended
  const locationRequired = triageResult.urgency === 'CRITICAL' || triageResult.urgency === 'HIGH';

  return {
    suggestedTitle,
    structuredDescription,
    category: departmentName,
    subCategory: categoryName,
    departmentId: triageResult.departmentId,
    departmentName,
    categoryId: triageResult.categoryId,
    priority: triageResult.urgency,
    urgencyScore: triageResult.urgencyScore,
    confidence: triageResult.confidenceScore,
    detectedKeywords: triageResult.detectedKeywords,
    sentiment: triageResult.sentiment,
    explanation,
    suggestedAction,
    locationRequired,
    suggestedWardId: triageResult.suggestedWardId,
  };
}

// ─── Duplicate Detection ──────────────────────────────────────

export function checkDuplicates(
  text: string,
  wardId: number,
  categoryId: string
): DuplicateMatch[] {
  const existingTickets = getTickets();
  const result = detectDuplicateGrievance(text, wardId, categoryId, existingTickets);

  if (result.isDuplicate && result.matchingTicket) {
    return [{
      ticketId: result.matchingTicket.id,
      title: result.matchingTicket.title,
      wardName: result.matchingTicket.wardName,
      wardId: result.matchingTicket.wardId,
      status: result.matchingTicket.status,
      similarityScore: result.similarityScore,
      message: result.message || 'Similar complaint found in this area.',
    }];
  }

  return [];
}

// ─── Feedback Storage ─────────────────────────────────────────

export function recordFeedback(
  feedback: AIReviewFeedback,
  originalCategory: string,
  originalDepartment: string,
  originalPriority: GrievanceTicket['urgency'],
  originalConfidence: number
): void {
  const records = getFeedbackRecords();
  const record: AIFeedbackRecord = {
    ...feedback,
    originalCategory,
    originalDepartment,
    originalPriority,
    originalConfidence,
  };
  records.push(record);
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to store AI feedback', err);
  }
}

export function getFeedbackRecords(): AIFeedbackRecord[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── AI Triage Statistics ─────────────────────────────────────

export function computeAITriageStats(tickets: GrievanceTicket[]): AITriageStats {
  const totalAnalyzed = tickets.length;
  const highPriorityCount = tickets.filter(t => t.urgency === 'HIGH').length;
  const criticalCount = tickets.filter(t => t.urgency === 'CRITICAL').length;

  // Count possible duplicates from triage metadata
  const possibleDuplicates = tickets.filter(
    t => t.aiTriage.isDuplicateCandidate
  ).length;

  // Average confidence
  const totalConfidence = tickets.reduce(
    (sum, t) => sum + t.aiTriage.categoryConfidence, 0
  );
  const averageConfidence = totalAnalyzed > 0
    ? Number((totalConfidence / totalAnalyzed).toFixed(2))
    : 0;

  // Tickets needing human review: low confidence or pending triage
  const needsHumanReview = tickets.filter(
    t => t.aiTriage.categoryConfidence < 0.75 || t.status === 'PENDING_TRIAGE'
  ).length;

  // Department breakdown
  const deptMap = new Map<string, number>();
  for (const t of tickets) {
    const dept = POLLACHI_DEPARTMENTS.find(d => d.id === t.departmentId);
    const name = dept?.name || t.departmentId;
    deptMap.set(name, (deptMap.get(name) || 0) + 1);
  }

  const departmentBreakdown = Array.from(deptMap.entries())
    .map(([departmentName, count]) => ({ departmentName, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalAnalyzed,
    highPriorityCount,
    criticalCount,
    possibleDuplicates,
    averageConfidence,
    needsHumanReview,
    departmentBreakdown,
  };
}

// ─── Ward lookup from coordinates ─────────────────────────────

export function findNearestWard(lat: number, lng: number): number {
  let nearestId = POLLACHI_WARDS[0].id;
  let minDist = Infinity;

  for (const ward of POLLACHI_WARDS) {
    const dLat = ward.latitude - lat;
    const dLng = ward.longitude - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDist) {
      minDist = dist;
      nearestId = ward.id;
    }
  }

  return nearestId;
}
