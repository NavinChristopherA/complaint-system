import { UrgencyLevel, GrievanceTicket } from './grievance';

// ─── AI Complaint Analysis ────────────────────────────────────

export interface AIComplaintAnalysis {
  /** AI-generated short title */
  suggestedTitle: string;
  /** AI-rewritten structured description */
  structuredDescription: string;
  /** Top-level category name (e.g. "Roads, Bridges & Infrastructure") */
  category: string;
  /** Sub-category (e.g. "Pothole / Damaged Road") */
  subCategory: string;
  /** Matched department ID from POLLACHI_DEPARTMENTS */
  departmentId: string;
  /** Human-readable department name */
  departmentName: string;
  /** Matched category ID */
  categoryId: string;
  /** AI-suggested priority level */
  priority: UrgencyLevel;
  /** Urgency score 0-100 */
  urgencyScore: number;
  /** Classification confidence 0 to 1 */
  confidence: number;
  /** Keywords that drove the classification */
  detectedKeywords: string[];
  /** Sentiment read */
  sentiment: 'EMERGENCY' | 'DISTRESSED' | 'DISSATISFIED' | 'INQUIRY';
  /** AI explanation of why this classification was chosen */
  explanation: string;
  /** Suggested next action for the municipality */
  suggestedAction: string;
  /** Whether location evidence is strongly recommended */
  locationRequired: boolean;
  /** Suggested ward if detected from text */
  suggestedWardId?: number;
}

// ─── Location ─────────────────────────────────────────────────

export interface LocationData {
  latitude: number;
  longitude: number;
  readableAddress: string;
  source: 'gps' | 'manual';
}

// ─── Evidence ─────────────────────────────────────────────────

export interface EvidenceItem {
  id: string;
  dataUrl: string;
  fileName: string;
  /** Note attached by the system (not fake AI vision results) */
  note: string;
}

// ─── Duplicate Detection ──────────────────────────────────────

export interface DuplicateMatch {
  ticketId: string;
  title: string;
  wardName: string;
  wardId: number;
  status: GrievanceTicket['status'];
  similarityScore: number;
  message: string;
}

// ─── Admin AI Review Queue ────────────────────────────────────

export type AIReviewDecision = 'APPROVED' | 'EDITED' | 'REJECTED';

export interface AIReviewFeedback {
  ticketId: string;
  decision: AIReviewDecision;
  /** If edited, the corrected category/department/priority */
  correctedCategory?: string;
  correctedDepartment?: string;
  correctedPriority?: UrgencyLevel;
  reviewerName: string;
  reviewerRole: string;
  comment: string;
  timestamp: string;
}

export interface AIFeedbackRecord extends AIReviewFeedback {
  originalCategory: string;
  originalDepartment: string;
  originalPriority: UrgencyLevel;
  originalConfidence: number;
}

// ─── AI Triage Dashboard Stats ────────────────────────────────

export interface AITriageStats {
  totalAnalyzed: number;
  highPriorityCount: number;
  criticalCount: number;
  possibleDuplicates: number;
  averageConfidence: number;
  needsHumanReview: number;
  departmentBreakdown: { departmentName: string; count: number }[];
}
