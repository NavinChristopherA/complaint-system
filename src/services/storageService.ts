import { GrievanceTicket, TicketStatus, OfficerAssignment, CitizenFeedback } from '../types/grievance';
import { INITIAL_TICKETS } from '../data/initialTickets';

const STORAGE_KEY = 'pollachi_civic_tickets_v1';

export function getTickets(): GrievanceTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    const tickets: GrievanceTicket[] = JSON.parse(raw);
    
    // Dynamically check SLA breaches
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

export function saveTickets(tickets: GrievanceTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Error saving tickets to localStorage', err);
  }
}

export function getTicketById(id: string): GrievanceTicket | undefined {
  const tickets = getTickets();
  return tickets.find(t => t.id.toLowerCase() === id.trim().toLowerCase());
}

export function createTicket(ticketData: {
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
}): GrievanceTicket {
  const tickets = getTickets();
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
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

export function resetToDemoData(): GrievanceTicket[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
  return INITIAL_TICKETS;
}
