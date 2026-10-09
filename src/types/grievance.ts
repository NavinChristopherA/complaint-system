/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  MUNICIPAL GRIEVANCE DOMAIN SCHEMA & TYPE SPECIFICATIONS                   ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Project: Namma Pollachi (நம்ம பொள்ளாச்சி) AI Civic Redressal Portal       ║
 * ║  Entity Models: GrievanceTicket, TimelineEvent, OfficerAssignment,          ║
 * ║                 CitizenFeedback, Department, DepartmentCategory             ║
 * ║                                                                              ║
 * ║  DATABASE RELATIONS & FOREIGN KEYS:                                          ║
 * ║  • GrievanceTicket.departmentId  -> Department.id                            ║
 * ║  • GrievanceTicket.categoryId    -> DepartmentCategory.id                    ║
 * ║  • GrievanceTicket.wardId        -> PollachiWard.id (1..36)                  ║
 * ║  • GrievanceTicket.assignedOfficer.officerId -> MunicipalOfficer.id          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Priority classification determining SLA countdown thresholds and escalation triggers.
 * - 'CRITICAL': 6h SLA - Public safety hazard, live wire, water main rupture, structural collapse
 * - 'HIGH': 24h SLA - Significant utility interruption, blocked primary storm drain, overflowing waste
 * - 'MEDIUM': 48h SLA - Non-functional streetlight, minor road defect, stray animal report
 * - 'LOW': 72h SLA - General civic inquiry, tree trimming, routine maintenance
 */
export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * State machine enum representing the grievance redressal lifecycle.
 * Valid transitions:
 *   PENDING_TRIAGE -> ASSIGNED | REJECTED
 *   ASSIGNED       -> IN_PROGRESS
 *   IN_PROGRESS    -> RESOLVED | REJECTED
 *   RESOLVED       -> (Terminal state with CitizenFeedback loop)
 */
export type TicketStatus = 
  | 'PENDING_TRIAGE'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

/**
 * Immutable audit trail event tracking every action taken on a grievance ticket.
 * Serves as the primary evidence log for municipal transparency and citizen review.
 */
export interface TimelineEvent {
  /** UUID or timestamp-based event identifier (e.g., 'evt-1712658921-1') */
  id: string;
  /** ISO 8601 UTC timestamp of event creation (e.g., '2026-10-09T08:30:00.000Z') */
  timestamp: string;
  /** Resulting ticket status after this action */
  status: TicketStatus;
  /** Display name of the person or system performing the action */
  actor: string;
  /** Role/Designation of the actor (e.g., 'Citizen', 'Junior Engineer', 'System AI Engine') */
  actorRole: string;
  /** Official remarks, status note, dispatch order, or resolution explanation */
  comment: string;
  /** Optional verification photo URL attached during dispatch or resolution */
  photoUrl?: string;
  /** Flag indicating whether this event was triggered autonomously by the AI triage engine */
  isAiAction?: boolean;
}

/**
 * Citizen satisfaction rating and qualitative feedback collected post-resolution.
 */
export interface CitizenFeedback {
  /** 1 to 5 star rating (1=Very Dissatisfied, 5=Excellent) */
  rating: number;
  /** Qualitative comments detailing citizen experience */
  comment: string;
  /** ISO 8601 UTC timestamp when feedback was recorded */
  submittedAt: string;
}

/**
 * Field officer dispatch record linking an active ticket to assigned municipal personnel.
 */
export interface OfficerAssignment {
  /** Unique municipal staff ID (e.g., 'OFF-SAN-14') */
  officerId: string;
  /** Officer full name */
  name: string;
  /** Designation (e.g., 'Sanitary Inspector', 'Junior Engineer - Roads') */
  role: string;
  /** Direct contact telephone for citizen coordination */
  phone: string;
  /** Municipal department name */
  department: string;
  /** ISO 8601 UTC timestamp when assignment was dispatched */
  assignedAt: string;
}

/**
 * Core Grievance Ticket Entity.
 * Represents a registered civic complaint within Pollachi Municipality.
 */
export interface GrievanceTicket {
  /** Unique municipal tracking ID (e.g. "POL-2026-W12-0104") */
  id: string;
  /** Short summary / title of the complaint */
  title: string;
  /** Full citizen narrative describing the civic issue */
  description: string;
  /** Language detected at ingestion: English, Tamil, or mixed Tanglish */
  originalLanguage?: 'en' | 'ta' | 'mixed';
  /** Foreign key pointing to Department.id (e.g., 'dept-roads', 'dept-sanitation') */
  departmentId: string;
  /** Foreign key pointing to DepartmentCategory.id (e.g., 'cat-pothole', 'cat-garbage-dump') */
  categoryId: string;
  /** Pollachi municipal administrative ward number: 1 through 36 */
  wardId: number;
  /** Official ward locality name (e.g., 'Mahalingapuram', 'Venkatramapuram') */
  wardName: string;
  /** Citizen-provided recognizable landmark (e.g., 'Near Mariamman Temple') */
  landmark: string;
  /** Geolocation latitude coordinate (WGS84) */
  latitude?: number;
  /** Geolocation longitude coordinate (WGS84) */
  longitude?: number;
  
  // Citizen Details
  /** Citizen full name (or 'Anonymous Citizen' if isAnonymous=true) */
  citizenName: string;
  /** 10-digit Indian mobile contact number (masked in public views) */
  citizenPhone: string;
  /** When true, citizen identity is concealed from public and councilor rosters */
  isAnonymous: boolean;
  
  // Status & Priority
  /** Current lifecycle status */
  status: TicketStatus;
  /** AI-calculated or officer-overridden priority level */
  urgency: UrgencyLevel;
  /** ISO 8601 UTC timestamp calculated by adding SLA hours to createdAt */
  slaDeadline: string;
  /** Total standard SLA duration allotted for this category in hours (e.g., 24, 48) */
  slaHoursTotal: number;
  /** Computed flag: true if currentTime > slaDeadline and status is not RESOLVED */
  isSlaBreached: boolean;
  /**
   * Hierarchical escalation tier:
   * 0 = Normal / Ward Field Staff
   * 1 = Tier 1 Escalation: Junior Engineer (JE) notified
   * 2 = Tier 2 Escalation: Executive Engineer (EE) notified
   * 3 = Tier 3 Escalation: Municipal Commissioner intervention
   */
  escalationLevel: 0 | 1 | 2 | 3;

  // AI Triage & Deduplication
  /** Machine-extracted intelligence and confidence scores */
  aiTriage: {
    /** Classification confidence score between 0.00 and 1.00 */
    categoryConfidence: number;
    /** Calculated severity score between 0 and 100 */
    urgencyScore: number;
    /** Matched English/Tamil vocabulary keywords */
    detectedKeywords: string[];
    /** Sentiment classification */
    sentiment: 'EMERGENCY' | 'DISTRESSED' | 'DISSATISFIED' | 'INQUIRY';
    /** Transparent explanation justifying the AI categorization */
    rationale: string;
    /** Flag set to true if another active complaint matches spatial + lexical bounds */
    isDuplicateCandidate?: boolean;
    /** Reference ticket ID of the suspected duplicate parent ticket */
    duplicateReferenceId?: string;
    /** Jaccard + spatial similarity percentage (0-100) */
    duplicateSimilarityScore?: number;
  };

  // Media
  /** Citizen-uploaded photographic evidence URL */
  photoUrl?: string;
  /** Officer-uploaded post-rectification proof URL */
  resolutionPhotoUrl?: string;
  /** Formal closure remarks submitted by the resolving officer */
  resolutionRemarks?: string;

  // Assignment & Resolution
  /** Officer currently assigned to resolve this ticket */
  assignedOfficer?: OfficerAssignment;
  /** Chronological history of all actions and state changes */
  timeline: TimelineEvent[];
  /** Optional citizen satisfaction feedback collected after resolution */
  citizenFeedback?: CitizenFeedback;

  /** ISO 8601 UTC timestamp when ticket was registered */
  createdAt: string;
  /** ISO 8601 UTC timestamp of last status or metadata modification */
  updatedAt: string;
  /** ISO 8601 UTC timestamp when status transitioned to 'RESOLVED' */
  resolvedAt?: string;
}

/**
 * Sub-classification within a municipal department defining standard SLAs and keywords.
 */
export interface DepartmentCategory {
  /** Unique category identifier (e.g., 'cat-pothole', 'cat-pipe-leak') */
  id: string;
  /** English display name */
  name: string;
  /** Tamil display name */
  tamilName: string;
  /** Default SLA resolution window in hours */
  standardSlaHours: number;
  /** Baseline urgency level */
  defaultUrgency: UrgencyLevel;
  /** English lexicon for AI keyword matching */
  keywordsEn: string[];
  /** Tamil lexicon for bilingual NLP matching */
  keywordsTa: string[];
}

/**
 * High-level Municipal Department entity.
 */
export interface Department {
  /** Unique department identifier (e.g., 'dept-roads', 'dept-sanitation') */
  id: string;
  /** English department name */
  name: string;
  /** Tamil department name */
  tamilName: string;
  /** Public description of department duties */
  description: string;
  /** Lucide icon identifier */
  iconName: string;
  /** Brand color hex code */
  colorHex: string;
  /** Department head officer name */
  headOfficer: string;
  /** Official helpline / direct extension */
  headContact: string;
  /** Available sub-categories under this department */
  categories: DepartmentCategory[];
}

