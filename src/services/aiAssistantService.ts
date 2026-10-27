/**
 * Namma Pollachi — AI Civic Redressal Portal
 * AI Smart Complaint Assistant & Orchestration Facade
 * 
 * Architectural Role & Extension Point:
 * ─────────────────────────────────────────────────────────────────────────────
 * This service acts as the central AI Facade for the Namma Pollachi portal.
 * It coordinates:
 * 1. Natural language triage and explainability generation (`analyzeComplaint`).
 * 2. Automated title synthesis and structured complaint reformulations.
 * 3. Spatial and categorical duplicate detection (`checkDuplicates`).
 * 4. Human-in-the-Loop (HITL) calibration logging (`recordFeedback`, `getFeedbackRecords`).
 * 5. Triage telemetry metrics aggregation (`computeAITriageStats`).
 * 6. GPS Centroid Ward Correlation via Euclidean distance (`findNearestWard`).
 * 
 * Cloud LLM Pluggability:
 * Designed with standard typed interfaces so local keyword-based heuristics can
 * be substituted with enterprise cloud LLMs (e.g. Gemini 2.0 Flash, Vertex AI)
 * with zero changes to downstream UI components.
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

/** LocalStorage key for storing human-in-the-loop review calibration events */
const FEEDBACK_STORAGE_KEY = 'pollachi_ai_feedback_v1';

// ─── Title Generation ─────────────────────────────────────────

/**
 * Synthesizes a concise, professional civic complaint title from raw citizen text.
 * 
 * If a clear opening clause is present, title-cases it up to 60 characters.
 * Otherwise, combines the detected service category with any extracted landmark hints.
 * 
 * @param rawText Unstructured text submitted by the citizen.
 * @param categoryName Display name of the classified service category.
 * @returns Clean, formatted title string (<= 60 characters).
 */
function generateTitle(rawText: string, categoryName: string): string {
  const text = rawText.trim();
  // Extract first meaningful sentence or clause up to 60 chars
  const firstSentence = text.split(/[.!?\n]/)[0].trim();

  if (firstSentence.length <= 60 && firstSentence.length > 10) {
    // Capitalize first letter of each word for clean presentation
    return firstSentence
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .slice(0, 60);
  }

  // Fallback: concatenate category with detected location hints
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

/**
 * Formulates a standardized municipal incident summary for field dispatchers.
 * 
 * @param rawText Original citizen submission.
 * @param categoryName Detected category name.
 * @param priority Urgency level (CRITICAL, HIGH, MEDIUM, LOW).
 * @returns Formal administrative complaint description.
 */
function generateStructuredDescription(rawText: string, categoryName: string, priority: string): string {
  const text = rawText.trim();
  const priorityLabel = priority === 'CRITICAL' || priority === 'HIGH'
    ? 'creating an acute safety concern'
    : 'causing civic inconvenience to local residents';

  return `Citizen reports a ${categoryName.toLowerCase()} issue that is ${priorityLabel}. ` +
    `Original description: "${text.length > 200 ? text.slice(0, 200) + '...' : text}"`;
}

// ─── AI Explanation (XAI) ─────────────────────────────────────

/**
 * Generates an explainable attribution summary detailing why a specific department,
 * category, and urgency was selected by the AI engine.
 * 
 * @param keywords Keywords that triggered the classification.
 * @param categoryName Name of the identified category.
 * @param departmentName Name of the assigned municipal department.
 * @param priority Computed urgency priority.
 * @returns Transparent explainable rationale string.
 */
function generateExplanation(
  keywords: string[],
  categoryName: string,
  departmentName: string,
  priority: string
): string {
  if (keywords.length === 0) {
    return `The complaint was routed to ${departmentName} based on contextual heuristics. ` +
      `Confidence is moderate as no specific category keywords were identified.`;
  }

  const kwList = keywords.slice(0, 4).map(k => `"${k}"`).join(', ');
  return `Keywords ${kwList} related to ${categoryName.toLowerCase()} were detected. ` +
    `This triggered automatic routing to ${departmentName} with ${priority} priority. ` +
    `Classification is cross-verified against Pollachi municipal service taxonomy.`;
}

// ─── Suggested Field Action ───────────────────────────────────

/**
 * Synthesizes actionable dispatch instructions for municipal field crews.
 * 
 * @param priority Urgency level of the ticket.
 * @param departmentName Target department.
 * @param categoryName Specific service category.
 * @returns Operational directive for field supervisors and Junior Engineers.
 */
function generateSuggestedAction(
  priority: string,
  departmentName: string,
  categoryName: string
): string {
  if (priority === 'CRITICAL') {
    return `Immediate emergency dispatch required. Mobilize ${departmentName} rapid response team to site. ` +
      `Escalate to Junior Engineer if unresolved within 6 hours.`;
  }
  if (priority === 'HIGH') {
    return `Priority dispatch recommended. Assign to ${departmentName} ward-level engineer for inspection within 24 hours.`;
  }
  if (priority === 'MEDIUM') {
    return `Schedule site inspection by ${departmentName} field staff within standard SLA timeline. ` +
      `Monitor for duplicate citizen reports in this sector.`;
  }
  return `Log for routine maintenance attention by ${departmentName}. Standard charter timeline applies.`;
}

// ─── Main Analysis Function ──────────────────────────────────

/**
 * End-to-end complaint analysis function.
 * Evaluates raw description text and returns comprehensive AI metadata.
 * 
 * @param rawText Natural language text entered by the citizen.
 * @returns AIComplaintAnalysis object with title, structured description, SLA, XAI rationale, and actions.
 */
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

  // Determine whether photographic evidence or GPS coordinate lock is strongly urged
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

/**
 * Evaluates pending citizen draft for existing active duplicates in the locality.
 * 
 * @param text Complaint description.
 * @param wardId Pollachi ward number (1–36).
 * @param categoryId Service category ID.
 * @returns Array of DuplicateMatch items (empty if no duplicates found).
 */
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
      message: result.message || 'Similar active complaint found in this municipal ward.',
    }];
  }

  return [];
}

// ─── Human-In-The-Loop Feedback Storage ───────────────────────

/**
 * Records an administrative triage calibration decision (Approve / Edit / Reject).
 * Stores the human correction alongside original AI predictions for model audit.
 * 
 * @param feedback The human officer review action and adjustment details.
 * @param originalCategory Category originally suggested by the AI engine.
 * @param originalDepartment Department originally suggested by the AI engine.
 * @param originalPriority Urgency level originally computed by the AI engine.
 * @param originalConfidence Confidence score originally computed by the AI engine.
 */
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
    console.error('Failed to store AI feedback calibration log', err);
  }
}

/**
 * Retrieves all stored Human-in-the-Loop review calibration records.
 * 
 * @returns Array of AIFeedbackRecord objects.
 */
export function getFeedbackRecords(): AIFeedbackRecord[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── AI Triage Statistics ─────────────────────────────────────

/**
 * Calculates aggregate telemetry and analytical metrics for the municipal command center.
 * 
 * @param tickets Full collection of registered grievances.
 * @returns AITriageStats summarizing confidence, priority distribution, and review workload.
 */
export function computeAITriageStats(tickets: GrievanceTicket[]): AITriageStats {
  const totalAnalyzed = tickets.length;
  const highPriorityCount = tickets.filter(t => t.urgency === 'HIGH').length;
  const criticalCount = tickets.filter(t => t.urgency === 'CRITICAL').length;

  // Count possible duplicates identified by the duplicate engine
  const possibleDuplicates = tickets.filter(
    t => t.aiTriage.isDuplicateCandidate
  ).length;

  // Average confidence calculation
  const totalConfidence = tickets.reduce(
    (sum, t) => sum + t.aiTriage.categoryConfidence, 0
  );
  const averageConfidence = totalAnalyzed > 0
    ? Number((totalConfidence / totalAnalyzed).toFixed(2))
    : 0;

  // Tickets needing human review: lower confidence (< 0.75) or unassigned pending triage
  const needsHumanReview = tickets.filter(
    t => t.aiTriage.categoryConfidence < 0.75 || t.status === 'PENDING_TRIAGE'
  ).length;

  // Departmental distribution breakdown
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

// ─── Ward lookup from GPS coordinates ─────────────────────────

/**
 * Matches device GPS latitude and longitude against the centroids of Pollachi's 36 wards
 * using Euclidean distance minimization.
 * 
 * Euclidean formula:
 * d = sqrt((lat_ward - lat)^2 + (lng_ward - lng)^2)
 * 
 * @param lat Citizen device latitude.
 * @param lng Citizen device longitude.
 * @returns Ward ID (1 to 36) of the geographically closest Pollachi municipal ward.
 */
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
