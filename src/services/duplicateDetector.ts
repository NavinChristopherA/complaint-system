/**
 * Namma Pollachi — AI Civic Redressal Portal
 * Duplicate Detection & Spatial Clustered Mitigation Engine
 * 
 * Algorithm & Mathematical Formulation:
 * ─────────────────────────────────────────────────────────────────────────────
 * The duplicate detection engine computes a Composite Similarity Metric (0–100%)
 * across three orthogonal dimensions:
 * 
 * 1. Spatial Locality Bonus (Weight: 35 points):
 *    If ticket.wardId === newWardId, adds 35 points. This captures hyper-local
 *    cluster density within the same municipal ward (1 to 36).
 * 
 * 2. Service Taxonomy Alignment (Weight: 35 points):
 *    If ticket.categoryId === newCategoryId, adds 35 points. Complaints affecting
 *    the exact same civic service category (e.g. pipe_burst, pothole, street_light)
 *    are prime duplicate candidates.
 * 
 * 3. Bilingual Semantic Overlap via Jaccard Coefficient (Weight: 30 points):
 *    J(A, B) = |A ∩ B| / |A ∪ B|
 *    Tokenizes description strings using Unicode-aware regex supporting both
 *    Latin alphanumerics and Tamil Unicode script (U+0B80 to U+0BFF).
 *    Tokens of length <= 2 are pruned as noise.
 * 
 * Decision Threshold:
 * - A composite score >= 70 points flags a high-probability duplicate.
 * - Only active tickets (status !== 'RESOLVED' && status !== 'REJECTED') are evaluated.
 */

import { GrievanceTicket } from '../types/grievance';

/**
 * Result structure returned by duplicate detection evaluation.
 */
export interface DuplicateCheckResult {
  /** True if the composite similarity score meets or exceeds the threshold (70%) */
  isDuplicate: boolean;
  /** Normalized composite similarity score from 0 to 100 */
  similarityScore: number;
  /** The existing active grievance ticket identified as the closest match */
  matchingTicket?: GrievanceTicket;
  /** Explanatory message for citizen notification and clustering options */
  message?: string;
}

/**
 * Computes the Jaccard similarity coefficient between two unstructured text strings.
 * 
 * Uses Unicode-aware tokenization supporting both English and Tamil characters:
 * `/[^a-zA-Z0-9\u0B80-\u0BFF\s]/g`
 * 
 * @param textA First text description
 * @param textB Second text description
 * @returns Jaccard coefficient between 0.0 (no overlapping tokens) and 1.0 (identical token sets)
 */
function calculateJaccardSimilarity(textA: string, textB: string): number {
  const tokenize = (str: string) => 
    new Set(
      str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\u0B80-\u0BFF\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2)
    );
  
  const setA = tokenize(textA);
  const setB = tokenize(textB);

  // Return zero if either set is empty after punctuation removal
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

/**
 * Evaluates a newly drafted grievance against existing active tickets in Pollachi.
 * 
 * @param newDescription The unstructured description of the new complaint.
 * @param newWardId The target municipal ward ID (1 to 36).
 * @param newCategoryId The municipal service category identifier.
 * @param existingTickets The pool of currently stored grievance tickets.
 * @returns DuplicateCheckResult detailing whether an active ticket cluster was found.
 */
export function detectDuplicateGrievance(
  newDescription: string,
  newWardId: number,
  newCategoryId: string,
  existingTickets: GrievanceTicket[]
): DuplicateCheckResult {
  // Filter: only compare against active tickets to prevent false matches against historical resolutions
  const activeTickets = existingTickets.filter(
    t => t.status !== 'RESOLVED' && t.status !== 'REJECTED'
  );

  let highestScore = 0;
  let candidateTicket: GrievanceTicket | undefined;

  for (const ticket of activeTickets) {
    let score = 0;

    // 1. Spatial Locality Bonus (35%)
    if (ticket.wardId === newWardId) {
      score += 35;
    }

    // 2. Service Taxonomy Alignment Bonus (35%)
    if (ticket.categoryId === newCategoryId) {
      score += 35;
    }

    // 3. Jaccard Semantic Token Similarity (30%)
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
      message: `A similar active grievance (${candidateTicket.id}) for "${candidateTicket.title}" has already been reported in ${candidateTicket.wardName}.`
    };
  }

  return {
    isDuplicate: false,
    similarityScore: highestScore,
    matchingTicket: candidateTicket
  };
}
