/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  DUPLICATE DETECTOR — Spatial + Text Similarity Matching Engine ║
 * ╠═══════════════════════════════════════════════════════════════════╣
 * ║                                                                   ║
 * ║  PURPOSE:                                                         ║
 * ║  Prevents redundant municipal dispatch by detecting when a new    ║
 * ║  citizen complaint is substantially similar to an existing active ║
 * ║  grievance in the same ward and category.                         ║
 * ║                                                                   ║
 * ║  SCORING MODEL (Composite 0–100):                                 ║
 * ║  ┌─────────────────────────────────────────────────┐              ║
 * ║  │  Same Ward Bonus      : +35 points              │              ║
 * ║  │  Same Category Bonus  : +35 points              │              ║
 * ║  │  Text Similarity      : +0–30 points (Jaccard)  │              ║
 * ║  │  ────────────────────────────────────            │              ║
 * ║  │  TOTAL: 0–100 (threshold ≥ 70 = duplicate)     │              ║
 * ║  └─────────────────────────────────────────────────┘              ║
 * ║                                                                   ║
 * ║  DUPLICATE THRESHOLD: ≥ 70 / 100                                 ║
 * ║  A score of 70+ means: same ward + same category + ≥0% text      ║
 * ║  overlap, OR different ward/category but very high text match.    ║
 * ║                                                                   ║
 * ║  UNIT TESTING GUIDANCE:                                           ║
 * ║  1. Same ward + same category + identical text → score = 100      ║
 * ║  2. Same ward + same category + unrelated text → score = 70       ║
 * ║  3. Different ward + same category → score ≤ 65 (no duplicate)   ║
 * ║  4. Same ward + different category → score ≤ 65 (no duplicate)   ║
 * ║  5. All resolved tickets should be excluded from comparison       ║
 * ║  6. Empty ticket list → isDuplicate = false, score = 0            ║
 * ║                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import { GrievanceTicket } from '../types/grievance';

/**
 * DuplicateCheckResult — Output of the duplicate detection analysis.
 *
 * @property isDuplicate      — true if similarity score ≥ 70 threshold
 * @property similarityScore  — Composite score 0–100
 * @property matchingTicket   — The best-matching existing ticket (if any)
 * @property message          — Human-readable explanation of the match
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarityScore: number; // 0 to 100
  matchingTicket?: GrievanceTicket;
  message?: string;
}

/**
 * calculateJaccardSimilarity — Computes text similarity using Jaccard Index.
 *
 * The Jaccard Index measures overlap between two sets:
 *   J(A, B) = |A ∩ B| / |A ∪ B|
 *
 * Returns a value between 0.0 (no overlap) and 1.0 (identical token sets).
 *
 * TOKENIZATION RULES:
 * - Converts to lowercase
 * - Strips all characters except: a-z, 0-9, Tamil Unicode range (U+0B80–U+0BFF), whitespace
 * - Splits on whitespace
 * - Filters out tokens with ≤ 2 characters (removes noise: "a", "is", "of")
 *
 * @param textA — First text string (new complaint)
 * @param textB — Second text string (existing complaint)
 * @returns     — Jaccard similarity coefficient, range [0.0, 1.0]
 *
 * UNIT TESTING:
 * - calculateJaccardSimilarity("", "hello")      → 0 (empty set guard)
 * - calculateJaccardSimilarity("abc def", "abc def") → 1.0 (identical)
 * - calculateJaccardSimilarity("abc def", "ghi jkl") → 0.0 (no overlap)
 * - calculateJaccardSimilarity("water pipe leak", "pipe leak road") → ~0.5
 */
function calculateJaccardSimilarity(textA: string, textB: string): number {
  // Tokenizer: lowercase, strip punctuation (preserve Tamil Unicode), split, filter short tokens
  const tokenize = (str: string) => 
    new Set(str.toLowerCase().replace(/[^a-zA-Z0-9\u0B80-\u0BFF\s]/g, '').split(/\s+/).filter(w => w.length > 2));
  
  const setA = tokenize(textA);
  const setB = tokenize(textB);

  // Guard: empty sets have zero similarity
  if (setA.size === 0 || setB.size === 0) return 0;

  // Count intersection (tokens present in both sets)
  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }

  // Union = |A| + |B| - |A ∩ B| (inclusion-exclusion principle)
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * detectDuplicateGrievance — Main duplicate detection function.
 *
 * Compares a new complaint against ALL active (non-resolved, non-rejected)
 * tickets to find the highest-similarity match.
 *
 * @param newDescription   — The raw text of the new complaint
 * @param newWardId        — Ward number (1–36) of the new complaint
 * @param newCategoryId    — Category ID assigned to the new complaint
 * @param existingTickets  — Full array of current GrievanceTicket objects
 *
 * @returns DuplicateCheckResult — Contains isDuplicate flag, score, and match details
 *
 * SCORING BREAKDOWN (per ticket comparison):
 * ┌────────────────────────────────────────────────────────────────┐
 * │ Criterion                  │ Points  │ Rationale              │
 * ├────────────────────────────┼─────────┼────────────────────────┤
 * │ Same Ward (wardId match)   │ +35     │ Geographic proximity   │
 * │ Same Category (catId match)│ +35     │ Issue type similarity  │
 * │ Text Similarity (Jaccard)  │ +0–30   │ Description overlap    │
 * │ ─────────────────────────────────────────────────────────────│
 * │ Maximum possible           │ 100     │                        │
 * │ Duplicate threshold        │ ≥ 70    │                        │
 * └────────────────────────────────────────────────────────────────┘
 *
 * FILTER RULES:
 * - Only active tickets are compared (status ≠ RESOLVED, ≠ REJECTED)
 * - This prevents citizens from being shown stale/closed duplicates
 *
 * EDGE CASES:
 * - No active tickets → { isDuplicate: false, similarityScore: 0 }
 * - Multiple tickets above threshold → returns highest-scoring match only
 * - Exact same text + ward + category → score = 100
 *
 * UNIT TESTING MATRIX:
 * ┌───────────────────────────────────────────┬────────────────────────────┐
 * │ Scenario                                  │ Expected Result            │
 * ├───────────────────────────────────────────┼────────────────────────────┤
 * │ Same ward + category + similar text       │ isDuplicate = true         │
 * │ Same ward + category + different text     │ isDuplicate = true (70+)   │
 * │ Different ward + same category            │ isDuplicate = false (<70)  │
 * │ All tickets resolved                      │ isDuplicate = false        │
 * │ Empty ticket array                        │ isDuplicate = false        │
 * │ Text exactly matches existing ticket      │ score ≈ 100               │
 * └───────────────────────────────────────────┴────────────────────────────┘
 */
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

    // 1. Same ward bonus (+35 points for geographic match)
    if (ticket.wardId === newWardId) {
      score += 35;
    }

    // 2. Same category bonus (+35 points for issue-type match)
    if (ticket.categoryId === newCategoryId) {
      score += 35;
    }

    // 3. Description semantic similarity (+0–30 points via Jaccard index)
    const textSim = calculateJaccardSimilarity(newDescription, ticket.description);
    score += Math.round(textSim * 30);

    if (score > highestScore) {
      highestScore = score;
      candidateTicket = ticket;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // THRESHOLD DECISION: Score ≥ 70 = high probability duplicate
  // 70 = same ward (35) + same category (35) + 0% text overlap
  // This is the minimum bar — same area, same issue type.
  // ──────────────────────────────────────────────────────────────
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

