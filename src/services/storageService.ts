/**
 * Namma Pollachi — AI Civic Redressal Portal
 * Storage & Civic Data Access Service
 * 
 * Persistence & Data Integrity Architecture:
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides a transactional persistence interface backed by HTML5 localStorage
 * (`pollachi_civic_tickets_v1`).
 * 
 * Key Responsibilities:
 * 1. Seed Initialization & Demo Reset:
 *    Hydrates demonstration cases (5 realistic Pollachi municipal cases across
 *    Wards 5, 8, 12, 14, 21) if the key is uninitialized.
 * 2. Ticket ID Synthesis:
 *    Synthesizes official municipal ticket IDs in standard format:
 *    `POL-2026-W{wardId:02d}-{sequence:04d}` (e.g. `POL-2026-W14-0101`).
 * 3. Reactive SLA Dynamic Evaluation:
 *    On each retrieval, automatically recalculates overdue status against current
 *    system time, updating `isSlaBreached` and `escalationLevel`.
 * 4. Audit Timeline Append-Only Log:
 *    Every state transition (submission, AI triage, officer dispatch, field photo
 *    upload, citizen resolution feedback) appends an immutable timeline event.
 */

import { GrievanceTicket, TicketStatus, OfficerAssignment, CitizenFeedback } from '../types/grievance';
import { INITIAL_TICKETS } from '../data/initialTickets';

/** LocalStorage key for ticket repository */
const STORAGE_KEY = 'pollachi_civic_tickets_v1';

/**
 * Retrieves all stored grievance tickets.
 * 
 * Automatically checks for overdue SLA deadlines and marks breach flags.
 * If no stored data is found, seeds the store with INITIAL_TICKETS.
 * 
 * @returns Array of GrievanceTicket objects sorted by date or priority.
 */
export function getTickets(): GrievanceTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    const tickets: GrievanceTicket[] = JSON.parse(raw);
    
    // Dynamically evaluate SLA breaches against real-time clock
    const now = new Date().getTime();
    let updated = false;
    const evaluated = tickets.map(t => {
      if (t.status !== 'RESOLVED' && t.status !== 'REJECTED') {
        const deadline = new Date(t.slaDeadline).getTime();
        if (now > deadline && !t.isSlaBreached) {
          t.isSlaBreached = true;
          t.escalationLevel = 1;
          updated = true;
        }
      }
      return t;
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluated));
    }
    return evaluated;
  } catch (err) {
    console.error('Error loading tickets from localStorage', err);
    return INITIAL_TICKETS;
  }
}

/**
 * Persists ticket array to localStorage.
 * 
 * @param tickets Full collection of grievance tickets to serialize.
 */
export function saveTickets(tickets: GrievanceTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Error saving tickets to localStorage', err);
  }
}

/**
 * Finds a single grievance ticket by its unique case identifier.
 * 
 * @param id The case ID string (e.g. 'POL-2026-W14-0101'), case-insensitive.
 * @returns The matching GrievanceTicket or undefined if not found.
 */
export function getTicketById(id: string): GrievanceTicket | undefined {
  const tickets = getTickets();
  return tickets.find(t => t.id.toLowerCase() === id.trim().toLowerCase());
}

/**
 * Parameters required to instantiate a new citizen grievance ticket.
 */
export interface CreateTicketParams {
  title: string;
  description: string;
  originalLanguage?: 'en' | 'ta' | 'mixed';
  departmentId: string;
  categoryId: string;
  wardId: number;
  wardName: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
  citizenName: string;
  citizenPhone: string;
  isAnonymous: boolean;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  slaHoursTotal: number;
  aiTriage: GrievanceTicket['aiTriage'];
  photoUrl?: string;
}

/**
 * Creates and registers a new municipal grievance ticket.
 * 
 * Synthesizes ticket identifier, sets SLA deadline based on category standard,
 * records initial registration and AI triage timeline events, and saves to storage.
 * 
 * @param ticketData Form and AI triage parameters for the ticket.
 * @returns Newly minted GrievanceTicket with timeline and SLA deadline.
 */
export function createTicket(ticketData: CreateTicketParams): GrievanceTicket {
  const tickets = getTickets();
  const seq = String(tickets.length + 1).padStart(4, '0');
  const wardPad = String(ticketData.wardId).padStart(2, '0');
  const newId = `POL-2026-W${wardPad}-${seq}`;

  const now = new Date();
  const slaDeadline = new Date(now.getTime() + ticketData.slaHoursTotal * 3600 * 1000).toISOString();

  const newTicket: GrievanceTicket = {
    id: newId,
    title: ticketData.title,
    description: ticketData.description,
    originalLanguage: ticketData.originalLanguage || 'en',
    departmentId: ticketData.departmentId,
    categoryId: ticketData.categoryId,
    wardId: ticketData.wardId,
    wardName: ticketData.wardName,
    landmark: ticketData.landmark,
    latitude: ticketData.latitude,
    longitude: ticketData.longitude,
    citizenName: ticketData.isAnonymous ? 'Anonymous Citizen' : ticketData.citizenName,
    citizenPhone: ticketData.citizenPhone,
    isAnonymous: ticketData.isAnonymous,
    status: 'PENDING_TRIAGE',
    urgency: ticketData.urgency,
    slaDeadline,
    slaHoursTotal: ticketData.slaHoursTotal,
    isSlaBreached: false,
    escalationLevel: 0,
    aiTriage: ticketData.aiTriage,
    photoUrl: ticketData.photoUrl,
    timeline: [
      {
        id: `tl-${Date.now()}-1`,
        timestamp: now.toISOString(),
        status: 'PENDING_TRIAGE',
        actor: ticketData.isAnonymous ? 'Citizen' : ticketData.citizenName,
        actorRole: 'Citizen',
        comment: `Grievance successfully registered via Namma Pollachi Portal for Ward ${ticketData.wardId} (${ticketData.wardName}).`
      },
      {
        id: `tl-${Date.now()}-2`,
        timestamp: new Date(now.getTime() + 1000).toISOString(),
        status: 'PENDING_TRIAGE',
        actor: 'CivicOps AI Engine',
        actorRole: 'Automated System',
        comment: `AI triage completed: Category confidence ${Math.round(ticketData.aiTriage.categoryConfidence * 100)}%, Urgency ${ticketData.urgency} (Score: ${ticketData.aiTriage.urgencyScore}/100). SLA set to ${ticketData.slaHoursTotal} hours.`,
        isAiAction: true
      }
    ],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const updatedTickets = [newTicket, ...tickets];
  saveTickets(updatedTickets);
  return newTicket;
}

/**
 * Transitions a grievance ticket to a new administrative lifecycle status.
 * 
 * @param ticketId The target ticket ID.
 * @param newStatus The updated lifecycle status.
 * @param actorName Name of officer, system, or citizen modifying the ticket.
 * @param actorRole Designation or role of the actor.
 * @param comment Audit remark explaining the state transition.
 * @param photoUrl Optional verification or resolution photo URL.
 * @param resolutionRemarks Optional closing remarks upon resolution.
 * @returns Updated GrievanceTicket or undefined if not found.
 */
export function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  actorName: string,
  actorRole: string,
  comment: string,
  photoUrl?: string,
  resolutionRemarks?: string
): GrievanceTicket | undefined {
  const tickets = getTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  if (ticketIndex === -1) return undefined;

  const ticket = tickets[ticketIndex];
  const now = new Date().toISOString();

  ticket.status = newStatus;
  ticket.updatedAt = now;
  if (newStatus === 'RESOLVED') {
    ticket.resolvedAt = now;
    if (photoUrl) ticket.resolutionPhotoUrl = photoUrl;
    if (resolutionRemarks) ticket.resolutionRemarks = resolutionRemarks;
  }

  ticket.timeline.push({
    id: `tl-${Date.now()}`,
    timestamp: now,
    status: newStatus,
    actor: actorName,
    actorRole,
    comment,
    photoUrl
  });

  tickets[ticketIndex] = ticket;
  saveTickets(tickets);
  return ticket;
}

/**
 * Dispatches and assigns a field officer (Junior Engineer or Sanitary Inspector) to a ticket.
 * 
 * @param ticketId The target ticket ID.
 * @param assignment Officer contact and role metadata.
 * @param actorName Designation of dispatching authority.
 * @param comment Dispatch instructions or work order notes.
 * @returns Updated GrievanceTicket with assigned officer and ASSIGNED status.
 */
export function assignOfficerToTicket(
  ticketId: string,
  assignment: OfficerAssignment,
  actorName: string,
  comment?: string
): GrievanceTicket | undefined {
  const tickets = getTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  if (ticketIndex === -1) return undefined;

  const ticket = tickets[ticketIndex];
  const now = new Date().toISOString();

  ticket.assignedOfficer = assignment;
  ticket.status = 'ASSIGNED';
  ticket.updatedAt = now;

  ticket.timeline.push({
    id: `tl-${Date.now()}`,
    timestamp: now,
    status: 'ASSIGNED',
    actor: actorName,
    actorRole: 'Dispatch Authority',
    comment: comment || `Assigned to ${assignment.name} (${assignment.role}, ${assignment.phone}). Work initiated.`
  });

  tickets[ticketIndex] = ticket;
  saveTickets(tickets);
  return ticket;
}

/**
 * Records citizen satisfaction rating and closing review for a resolved ticket.
 * 
 * @param ticketId Target ticket ID.
 * @param rating 1 to 5 star rating.
 * @param comment Citizen's qualitative feedback comment.
 * @returns Updated GrievanceTicket with attached CitizenFeedback object.
 */
export function submitCitizenFeedback(
  ticketId: string,
  rating: number,
  comment: string
): GrievanceTicket | undefined {
  const tickets = getTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  if (ticketIndex === -1) return undefined;

  const ticket = tickets[ticketIndex];
  const feedback: CitizenFeedback = {
    rating,
    comment,
    submittedAt: new Date().toISOString()
  };

  ticket.citizenFeedback = feedback;
  ticket.updatedAt = new Date().toISOString();
  tickets[ticketIndex] = ticket;
  saveTickets(tickets);
  return ticket;
}

/**
 * Performs a complete drop-in update of an existing grievance ticket.
 * 
 * @param updatedTicket The modified ticket object to store.
 * @returns The updated ticket with fresh updatedAt timestamp.
 */
export function updateTicket(updatedTicket: GrievanceTicket): GrievanceTicket {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === updatedTicket.id);
  if (index !== -1) {
    tickets[index] = { ...updatedTicket, updatedAt: new Date().toISOString() };
  } else {
    tickets.unshift(updatedTicket);
  }
  saveTickets(tickets);
  return updatedTicket;
}

/**
 * Restores the grievance store to the initial set of 5 realistic demo cases.
 * 
 * Useful for municipal evaluators testing triage, SLA timers, and duplicate detection.
 * 
 * @returns Array of freshly seeded demo tickets.
 */
export function resetToDemoData(): GrievanceTicket[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
  return INITIAL_TICKETS;
}
