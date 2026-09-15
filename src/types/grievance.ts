export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TicketStatus = 
  | 'PENDING_TRIAGE'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  status: TicketStatus;
  actor: string;
  actorRole: string;
  comment: string;
  photoUrl?: string;
  isAiAction?: boolean;
}

export interface CitizenFeedback {
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
}

export interface OfficerAssignment {
  officerId: string;
  name: string;
  role: string;
  phone: string;
  department: string;
  assignedAt: string;
}

export interface GrievanceTicket {
  id: string; // e.g. "POL-2026-W12-0104"
  title: string;
  description: string;
  originalLanguage?: 'en' | 'ta' | 'mixed';
  departmentId: string;
  categoryId: string;
  wardId: number; // 1 to 36
  wardName: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
  
  // Citizen Details
  citizenName: string;
  citizenPhone: string;
  isAnonymous: boolean;
  
  // Status & Priority
  status: TicketStatus;
  urgency: UrgencyLevel;
  slaDeadline: string; // ISO date string
  slaHoursTotal: number;
  isSlaBreached: boolean;
  escalationLevel: 0 | 1 | 2 | 3; // 0=Normal, 1=JE, 2=EE, 3=Commissioner

  // AI Triage & Deduplication
  aiTriage: {
    categoryConfidence: number; // 0 to 1
    urgencyScore: number; // 0 to 100
    detectedKeywords: string[];
    sentiment: 'EMERGENCY' | 'DISTRESSED' | 'DISSATISFIED' | 'INQUIRY';
    rationale: string;
    isDuplicateCandidate?: boolean;
    duplicateReferenceId?: string;
    duplicateSimilarityScore?: number;
  };

  // Media
  photoUrl?: string;
  resolutionPhotoUrl?: string;
  resolutionRemarks?: string;

  // Assignment & Resolution
  assignedOfficer?: OfficerAssignment;
  timeline: TimelineEvent[];
  citizenFeedback?: CitizenFeedback;

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface DepartmentCategory {
  id: string;
  name: string;
  tamilName: string;
  standardSlaHours: number;
  defaultUrgency: UrgencyLevel;
  keywordsEn: string[];
  keywordsTa: string[];
}

export interface Department {
  id: string;
  name: string;
  tamilName: string;
  description: string;
  iconName: string;
  colorHex: string;
  headOfficer: string;
  headContact: string;
  categories: DepartmentCategory[];
}
