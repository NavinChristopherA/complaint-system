/**
 * Namma Pollachi — AI Civic Redressal Portal
 * Core Grievance & Municipal Entity Data Contracts
 */

/**
 * Statutory urgency levels determining citizen charter SLA timelines.
 */
export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Grievance ticket lifecycle states.
 */
export type TicketStatus = 
  | 'PENDING_TRIAGE'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

/**
 * Immutable audit trail event capturing life-cycle transitions, field updates, or AI actions.
 */
export interface TimelineEvent {
  /** Unique timeline event identifier */
  id: string;
  /** ISO 8601 timestamp of event occurrence */
  timestamp: string;
  /** Resulting status of ticket after this event */
  status: TicketStatus;
  /** Name of the citizen, officer, or automated system executing the action */
  actor: string;
  /** Designation or role of the actor */
  actorRole: string;
  /** Informational or administrative remark */
  comment: string;
  /** Optional URL of progress or resolution photo */
  photoUrl?: string;
  /** True if the event was generated autonomously by the AI engine */
  isAiAction?: boolean;
}

/**
 * Citizen post-resolution satisfaction evaluation.
 */
export interface CitizenFeedback {
  /** 1 to 5 star rating */
  rating: number;
  /** Qualitative comments on redressal quality */
  comment: string;
  /** ISO 8601 timestamp of review submission */
  submittedAt: string;
}

/**
 * Field officer dispatch details.
 */
export interface OfficerAssignment {
  /** Unique officer employee ID */
  officerId: string;
  /** Full name of the officer */
  name: string;
  /** Municipal designation (e.g., 'Junior Engineer - Roads', 'Sanitary Inspector') */
  role: string;
  /** Contact telephone number */
  phone: string;
  /** Associated municipal department */
  department: string;
  /** ISO 8601 timestamp of assignment dispatch */
  assignedAt: string;
}

/**
 * Primary grievance ticket entity model representing a municipal complaint in Pollachi.
 */
export interface GrievanceTicket {
  /** Synthesized case ID: e.g. "POL-2026-W14-0101" */
  id: string;
  /** Concise grievance headline */
  title: string;
  /** Full citizen description */
  description: string;
  /** Linguistic classification of original citizen input */
  originalLanguage?: 'en' | 'ta' | 'mixed';
  /** Target department ID (e.g., 'dept-roads', 'dept-water') */
  departmentId: string;
  /** Target service category ID (e.g., 'cat-pothole', 'cat-pipe-leak') */
  categoryId: string;
  /** Pollachi municipal ward ID (1 to 36) */
  wardId: number;
  /** Local ward display title */
  wardName: string;
  /** Recognized street or landmark */
  landmark: string;
  /** GPS latitude if obtained via device location */
  latitude?: number;
  /** GPS longitude if obtained via device location */
  longitude?: number;
  
  // Citizen Details
  /** Citizen full name */
  citizenName: string;
  /** Citizen mobile number for SMS status updates */
  citizenPhone: string;
  /** True if citizen opted for anonymous submission */
  isAnonymous: boolean;
  
  // Status & Priority
  /** Current lifecycle status */
  status: TicketStatus;
  /** Triage urgency priority */
  urgency: UrgencyLevel;
  /** ISO 8601 deadline calculated from category SLA hours */
  slaDeadline: string;
  /** Total allotted hours under Pollachi Citizen Charter */
  slaHoursTotal: number;
  /** True if resolution window has lapsed */
  isSlaBreached: boolean;
  /** Administrative escalation tier: 0=Normal, 1=JE, 2=EE, 3=Municipal Commissioner */
  escalationLevel: 0 | 1 | 2 | 3;

  // AI Triage & Deduplication Telemetry
  aiTriage: {
    /** Statistical category confidence score (0.0 to 1.0) */
    categoryConfidence: number;
    /** Urgency priority score (1 to 100) */
    urgencyScore: number;
    /** Key tokens extracted from text that drove classification */
    detectedKeywords: string[];
    /** Emotional distress tier inferred from grievance text */
    sentiment: 'EMERGENCY' | 'DISTRESSED' | 'DISSATISFIED' | 'INQUIRY';
    /** Transparent explainable rationale for classification */
    rationale: string;
    /** Flag indicating whether duplicate engine identified similar active tickets */
    isDuplicateCandidate?: boolean;
    /** Identifier of existing ticket if flagged as duplicate */
    duplicateReferenceId?: string;
    /** Jaccard + spatial similarity score (0 to 100) */
    duplicateSimilarityScore?: number;
  };

  // Photographic Evidence
  /** Intake photo URL submitted by citizen */
  photoUrl?: string;
  /** Redressal proof photo uploaded by field engineer upon completion */
  resolutionPhotoUrl?: string;
  /** Field engineer's closing remarks */
  resolutionRemarks?: string;

  // Assignment & Resolution Tracking
  /** Assigned field officer details */
  assignedOfficer?: OfficerAssignment;
  /** Chronological history of all events on this ticket */
  timeline: TimelineEvent[];
  /** Post-resolution citizen feedback */
  citizenFeedback?: CitizenFeedback;

  /** Creation ISO timestamp */
  createdAt: string;
  /** Last update ISO timestamp */
  updatedAt: string;
  /** Completion ISO timestamp */
  resolvedAt?: string;
}

/**
 * Service category specification under a municipal department.
 */
export interface DepartmentCategory {
  /** Unique category identifier */
  id: string;
  /** English display name */
  name: string;
  /** Tamil Unicode display name */
  tamilName: string;
  /** Statutory citizen charter turnaround hours */
  standardSlaHours: number;
  /** Default urgency tier */
  defaultUrgency: UrgencyLevel;
  /** English keyword triggers */
  keywordsEn: string[];
  /** Tamil Unicode keyword triggers */
  keywordsTa: string[];
}

/**
 * Pollachi Municipal Department entity.
 */
export interface Department {
  /** Department identifier (e.g. 'dept-water', 'dept-roads') */
  id: string;
  /** English department name */
  name: string;
  /** Tamil Unicode department name */
  tamilName: string;
  /** Department description and municipal scope */
  description: string;
  /** Lucide icon identifier for UI rendering */
  iconName: string;
  /** Primary department accent hex color */
  colorHex: string;
  /** Name and title of presiding head officer */
  headOfficer: string;
  /** Official helpline contact telephone */
  headContact: string;
  /** Specialized service categories under this department */
  categories: DepartmentCategory[];
}
