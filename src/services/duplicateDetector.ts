import { GrievanceTicket } from '../types/grievance';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarityScore: number; // 0 to 100
  matchingTicket?: GrievanceTicket;
  message?: string;
}

function calculateJaccardSimilarity(textA: string, textB: string): number {
  const tokenize = (str: string) => 
    new Set(str.toLowerCase().replace(/[^a-zA-Z0-9\u0B80-\u0BFF\s]/g, '').split(/\s+/).filter(w => w.length > 2));
  
  const setA = tokenize(textA);
  const setB = tokenize(textB);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

export function detectDuplicateGrievance(
  newDescription: string,
  newWardId: number,
  newCategoryId: string,
  existingTickets: GrievanceTicket[]
): DuplicateCheckResult {
  // Only compare against active tickets (not resolved or rejected)
  const activeTickets = existingTickets.filter(
    t => t.status !== 'RESOLVED' && t.status !== 'REJECTED'
  );

  let highestScore = 0;
  let candidateTicket: GrievanceTicket | undefined;

  for (const ticket of activeTickets) {
    let score = 0;

    // 1. Same ward bonus
    if (ticket.wardId === newWardId) {
      score += 35;
    }

    // 2. Same category bonus
    if (ticket.categoryId === newCategoryId) {
      score += 35;
    }

    // 3. Description semantic similarity
    const textSim = calculateJaccardSimilarity(newDescription, ticket.description);
    score += Math.round(textSim * 30);

    if (score > highestScore) {
      highestScore = score;
      candidateTicket = ticket;
    }
  }

  // Threshold: 70+ indicates high probability of duplicate issue in the same locality
  if (highestScore >= 70 && candidateTicket) {
    return {
      isDuplicate: true,
      similarityScore: highestScore,
      matchingTicket: candidateTicket,
      message: `A similar active grievance (${candidateTicket.id}) for ${candidateTicket.title} has already been reported in ${candidateTicket.wardName}.`
    };
  }

  return {
    isDuplicate: false,
    similarityScore: highestScore,
    matchingTicket: candidateTicket
  };
}
