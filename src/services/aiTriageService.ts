/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  AI TRIAGE SERVICE — Bilingual Keyword-Based Complaint Classifier  ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                     ║
 * ║  MODULE OVERVIEW:                                                   ║
 * ║  Core deterministic AI triage engine that classifies citizen        ║
 * ║  grievance text into departments, categories, urgency levels, and   ║
 * ║  sentiment. Operates entirely offline — no network calls.           ║
 * ║                                                                     ║
 * ║  ALGORITHM SUMMARY:                                                 ║
 * ║  1. Ward Detection    — text-match against 36 ward names/landmarks ║
 * ║  2. Category Scoring  — weighted bilingual keyword matching        ║
 * ║     (English=3pts, Tamil=4pts per keyword hit)                     ║
 * ║  3. Urgency Evaluation — hazard keyword escalation (CRITICAL/HIGH) ║
 * ║  4. Sentiment Mapping — urgency → sentiment label                  ║
 * ║  5. Rationale Generation — human-readable explainable output       ║
 * ║                                                                     ║
 * ║  DATA DEPENDENCIES:                                                 ║
 * ║  • POLLACHI_DEPARTMENTS (src/data/departments.ts)                   ║
 * ║    — 8 departments, 24 categories, ~200 bilingual keywords          ║
 * ║  • POLLACHI_WARDS (src/data/pollachiWards.ts)                       ║
 * ║    — 36 wards with Tamil/English names and landmark strings         ║
 * ║                                                                     ║
 * ║  CONFIDENCE SCORE FORMULA:                                          ║
 * ║  confidence = min(0.98, 0.65 + (totalKeywordScore × 0.05))         ║
 * ║  • 0 keyword hits  → 0.62 (fallback baseline)                     ║
 * ║  • 1 English hit   → 0.65 + 3×0.05 = 0.80                        ║
 * ║  • 1 Tamil hit     → 0.65 + 4×0.05 = 0.85                        ║
 * ║  • 7+ hits         → capped at 0.98                               ║
 * ║                                                                     ║
 * ║  UNIT TESTING GUIDANCE:                                             ║
 * ║  Test runAiTriage() with these categories:                          ║
 * ║  • Empty/whitespace input       → returns fallback (0.5 conf)      ║
 * ║  • English-only input           → department match + keywords      ║
 * ║  • Tamil Unicode input          → Tamil keyword detection          ║
 * ║  • Mixed Tanglish input         → both keyword arrays fire         ║
 * ║  • CRITICAL hazard keywords     → urgency=CRITICAL, score≥88      ║
 * ║  • HIGH hazard keywords         → urgency=HIGH, score≥70          ║
 * ║  • Ward name in text            → suggestedWardId populated       ║
 * ║  • Landmark in text             → suggestedWardId via landmark    ║
 * ║  • No keyword match             → default dept, confidence=0.62   ║
 * ║                                                                     ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { POLLACHI_DEPARTMENTS } from '../data/departments';
import { POLLACHI_WARDS } from '../data/pollachiWards';
import { UrgencyLevel } from '../types/grievance';

/**
 * AiTriageResult — The output contract of the triage engine.
 *
 * Downstream consumers (aiAssistantService, GrievanceWizard, AITriageOverview)
 * depend on this shape. Changes here require updates to:
 *  - AIComplaintAnalysis mapping in aiAssistantService.ts
 *  - AI preview cards in GrievanceWizard.tsx
 *
 * @property departmentId      — Matched department identifier (e.g., 'dept-water')
 * @property departmentName    — Human-readable department label
 * @property categoryId        — Matched sub-category identifier (e.g., 'cat-pipe-leak')
 * @property categoryName      — Human-readable category label
 * @property confidenceScore   — Classification confidence, range [0.0 .. 1.0]
 * @property urgency           — Escalation level: CRITICAL | HIGH | MEDIUM | LOW
 * @property urgencyScore      — Numeric urgency, range [1 .. 100]
 * @property detectedKeywords  — Array of exact keywords that matched the input
 * @property suggestedWardId   — Ward number if detected from text (1–36), or undefined
 * @property sentiment         — Emotional categorization of the complaint
 * @property rationale         — XAI explanation string for human review
 */
export interface AiTriageResult {
  departmentId: string;
  departmentName: string;
  categoryId: string;
  categoryName: string;
  confidenceScore: number; // 0 to 1
  urgency: UrgencyLevel;
  urgencyScore: number; // 1 to 100
  detectedKeywords: string[];
  suggestedWardId?: number;
  sentiment: 'EMERGENCY' | 'DISTRESSED' | 'DISSATISFIED' | 'INQUIRY';
  rationale: string;
}

/**
 * CRITICAL_KEYWORDS — Hazard terms that immediately escalate priority to CRITICAL.
 *
 * These represent life-threatening or infrastructure-emergency situations that
 * require immediate field dispatch (typically within 4–6 hours SLA).
 *
 * Includes both English and Tamil Unicode terms.
 * Tamil terms cover: life danger, electric shock, dead animal, accident, tree fall.
 *
 * UNIT TESTING:
 * - Verify that input containing ANY one of these terms returns urgency='CRITICAL'
 * - Verify urgencyScore is in range [88, 97] (88 + random(0,9))
 */
const CRITICAL_KEYWORDS = [
  'burst', 'pipe burst', 'gushing', 'sparks', 'shock', 'live wire', 'current shock', 
  'open manhole', 'broken slab', 'carcass', 'dead animal', 'fallen tree', 'block road',
  'accident', 'flood', 'contaminated', 'yellow water', 'dengue', 'rabies', 'dog bite',
  'உயிர் ஆபத்து', 'மின் அதிர்ச்சி', 'ஷாக்', 'செத்த நாய்', 'உடைந்தது', 'விபத்து', 'மரம் விழுந்தது'
];

/**
 * HIGH_KEYWORDS — Terms that elevate priority to HIGH (but not CRITICAL).
 *
 * Represent urgent-but-not-immediately-lethal issues like sewage overflows,
 * pothole hazards, or multi-day service outages.
 *
 * UNIT TESTING:
 * - Verify input containing a HIGH keyword (but no CRITICAL keyword) returns urgency='HIGH'
 * - Verify urgencyScore is in range [70, 84] (70 + random(0,14))
 */
const HIGH_KEYWORDS = [
  'overflow', 'leak', 'pothole', 'chasing', 'stray dog', 'deep crater', 'stench',
  '4 days', '3 days', 'urgent', 'drainage block', 'septic', 'no water',
  'துர்நாற்றம்', 'கழிவுநீர்', 'அடைப்பு', 'குழாய் உடைப்பு', 'பள்ளம்'
];

/**
 * runAiTriage — Main triage classification function.
 *
 * Takes raw citizen complaint text (English, Tamil, or Tanglish) and returns
 * a structured AiTriageResult with department routing, urgency, and explanation.
 *
 * @param inputText — Raw complaint text from the citizen. Can be:
 *   - English: "There is a large pothole on Market Road"
 *   - Tamil: "குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாக போகிறது"
 *   - Tanglish: "street light eriyala romba dark ah irukku"
 *
 * @returns AiTriageResult — Complete classification with confidence, urgency, and rationale.
 *
 * ALGORITHM FLOW:
 * ┌─────────────────────────────────────────────────┐
 * │ 1. Normalize input to lowercase + trim          │
 * │ 2. Guard: if <5 chars, return fallback result   │
 * │ 3. WARD DETECTION: scan 36 ward names/landmarks │
 * │ 4. CATEGORY SCORING:                            │
 * │    for each dept → for each category:           │
 * │      score += 3 per English keyword match       │
 * │      score += 4 per Tamil keyword match         │
 * │    pick highest-scoring (dept, category) pair    │
 * │ 5. URGENCY EVALUATION:                          │
 * │    CRITICAL keywords → CRITICAL (score 88–97)   │
 * │    HIGH keywords     → HIGH (score 70–84)       │
 * │    else fallback to category default urgency     │
 * │ 6. SENTIMENT: map urgency → sentiment label     │
 * │ 7. RATIONALE: generate XAI explanation string   │
 * └─────────────────────────────────────────────────┘
 *
 * EDGE CASES:
 * - Empty string → fallback with confidence=0.5
 * - Text under 5 chars → fallback with INQUIRY sentiment
 * - No keyword matches → default department (Public Health), confidence=0.62
 * - Multiple departments with equal score → first match wins (stable order)
 *
 * UNIT TESTING MATRIX:
 * ┌──────────────────────────────────┬───────────────────────────────────────┐
 * │ Test Case                        │ Expected Assertion                    │
 * ├──────────────────────────────────┼───────────────────────────────────────┤
 * │ runAiTriage('')                  │ confidenceScore === 0.5               │
 * │ runAiTriage('hi')               │ confidenceScore === 0.5 (len < 5)     │
 * │ runAiTriage('pothole road')     │ urgency === 'HIGH'                    │
 * │ runAiTriage('pipe burst')       │ urgency === 'CRITICAL'                │
 * │ runAiTriage('street light')     │ departmentId === 'dept-electrical'    │
 * │ runAiTriage('குப்பை')            │ detectedKeywords includes 'குப்பை'    │
 * │ runAiTriage('Mahalingapuram')   │ suggestedWardId === 14 (if in data)   │
 * │ runAiTriage('random xyz abc')   │ confidenceScore === 0.62 (no match)   │
 * └──────────────────────────────────┴───────────────────────────────────────┘
 */
export function runAiTriage(inputText: string): AiTriageResult {
  const text = inputText.toLowerCase().trim();
  
  // ──────────────────────────────────────────────────────────────
  // GUARD: Reject minimal or empty input with a low-confidence fallback.
  // This prevents false classification on accidental keystrokes.
  // ──────────────────────────────────────────────────────────────
  if (!text || text.length < 5) {
    const defaultDept = POLLACHI_DEPARTMENTS[0];
    const defaultCat = defaultDept.categories[0];
    return {
      departmentId: defaultDept.id,
      departmentName: defaultDept.name,
      categoryId: defaultCat.id,
      categoryName: defaultCat.name,
      confidenceScore: 0.5,
      urgency: 'MEDIUM',
      urgencyScore: 50,
      detectedKeywords: [],
      sentiment: 'INQUIRY',
      rationale: 'Awaiting more detailed grievance description to formulate high-confidence triage.'
    };
  }

  // ──────────────────────────────────────────────────────────────
  // STEP 1: WARD DETECTION
  // Scans the input text for exact matches against:
  //   a) Ward names (English & Tamil) from POLLACHI_WARDS
  //   b) Landmarks associated with each ward
  // First match wins (wards are ordered 1→36).
  // ──────────────────────────────────────────────────────────────
  let suggestedWardId: number | undefined;
  for (const ward of POLLACHI_WARDS) {
    const wardNameMatch = text.includes(ward.name.toLowerCase()) || 
                          text.includes(ward.tamilName.toLowerCase());
    const landmarkMatch = ward.landmarks.some(lm => text.includes(lm.toLowerCase()));
    if (wardNameMatch || landmarkMatch) {
      suggestedWardId = ward.id;
      break;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // STEP 2: DEPARTMENT & CATEGORY SCORING
  // Iterates all 8 departments × their categories (24 total).
  // For each category, scores keyword matches:
  //   - English keyword match: +3 points
  //   - Tamil keyword match:   +4 points (higher weight for vernacular)
  // Tracks the highest-scoring (department, category) pair.
  //
  // DESIGN DECISION: Tamil gets +4 instead of +3 because Tamil keywords
  // are more specific/unique and reduce false positives vs generic English.
  // ──────────────────────────────────────────────────────────────
  let bestDept = POLLACHI_DEPARTMENTS[0];
  let bestCat = bestDept.categories[0];
  let maxScore = 0;
  const matchedKeywords: string[] = [];

  for (const dept of POLLACHI_DEPARTMENTS) {
    for (const cat of dept.categories) {
      let score = 0;

      // Score English keywords (weight: 3 per match)
      for (const kw of cat.keywordsEn) {
        if (text.includes(kw.toLowerCase())) {
          score += 3;
          if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        }
      }

      // Score Tamil keywords (weight: 4 per match — higher specificity)
      for (const kw of cat.keywordsTa) {
        if (text.includes(kw.toLowerCase())) {
          score += 4; // High weight for Tamil exact match
          if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestDept = dept;
        bestCat = cat;
      }
    }
  }

  // ──────────────────────────────────────────────────────────────
  // CONFIDENCE CALCULATION
  // Formula: min(0.98, 0.65 + totalScore × 0.05)
  // • 0 keyword hits → fallback 0.62 (below the 0.75 human-review threshold)
  // • 1 EN match (score=3)  → 0.65 + 0.15 = 0.80
  // • 1 TA match (score=4)  → 0.65 + 0.20 = 0.85
  // • Hard cap at 0.98 to never claim absolute certainty
  //
  // NOTE: Tickets with confidence < 0.75 are automatically flagged for
  // human review in the AIReviewQueue component.
  // ──────────────────────────────────────────────────────────────
  const confidenceScore = maxScore > 0 ? Math.min(0.98, 0.65 + (maxScore * 0.05)) : 0.62;

  // ──────────────────────────────────────────────────────────────
  // STEP 3: URGENCY & HAZARD EVALUATION
  // Priority cascade:
  //   1. CRITICAL keywords present → CRITICAL (score 88–97)
  //   2. HIGH keywords OR category default=HIGH → HIGH (score 70–84)
  //   3. Category default=LOW → LOW (score 25–39)
  //   4. Everything else → MEDIUM (score 45–59)
  //
  // Random jitter added to urgencyScore to simulate confidence variation
  // in the demo. In production, this would be a calibrated score.
  // ──────────────────────────────────────────────────────────────
  let urgency: UrgencyLevel = bestCat.defaultUrgency;
  let urgencyScore = 50;

  const hasCriticalKeyword = CRITICAL_KEYWORDS.some(k => text.includes(k.toLowerCase()));
  const hasHighKeyword = HIGH_KEYWORDS.some(k => text.includes(k.toLowerCase()));

  if (hasCriticalKeyword) {
    urgency = 'CRITICAL';
    urgencyScore = Math.floor(88 + Math.random() * 10);
  } else if (hasHighKeyword || bestCat.defaultUrgency === 'HIGH') {
    urgency = 'HIGH';
    urgencyScore = Math.floor(70 + Math.random() * 15);
  } else if (bestCat.defaultUrgency === 'LOW') {
    urgency = 'LOW';
    urgencyScore = Math.floor(25 + Math.random() * 15);
  } else {
    urgency = 'MEDIUM';
    urgencyScore = Math.floor(45 + Math.random() * 15);
  }

  // ──────────────────────────────────────────────────────────────
  // STEP 4: SENTIMENT DETERMINATION
  // Maps urgency level to a human-readable sentiment label:
  //   CRITICAL → EMERGENCY
  //   HIGH     → DISTRESSED
  //   MEDIUM   → DISSATISFIED (default)
  //   LOW      → INQUIRY
  //
  // Used in AI status summaries and citizen-facing explanations.
  // ──────────────────────────────────────────────────────────────
  let sentiment: 'EMERGENCY' | 'DISTRESSED' | 'DISSATISFIED' | 'INQUIRY' = 'DISSATISFIED';
  if (urgency === 'CRITICAL') sentiment = 'EMERGENCY';
  else if (urgency === 'HIGH') sentiment = 'DISTRESSED';
  else if (urgency === 'LOW') sentiment = 'INQUIRY';

  // ──────────────────────────────────────────────────────────────
  // STEP 5: EXPLAINABLE RATIONALE GENERATION (XAI)
  // Produces a human-readable string explaining:
  //   - Which keywords were detected
  //   - Why this priority was assigned
  //   - What SLA timeline applies
  // This rationale is displayed in the AI Triage Overview and
  // Review Queue for municipal officers.
  // ──────────────────────────────────────────────────────────────
  const rationale = hasCriticalKeyword
    ? `Identified acute civic hazard triggers (${matchedKeywords.slice(0, 3).join(', ')}). Automatically elevated priority to ${urgency} (Score: ${urgencyScore}/100) with expedited SLA of ${bestCat.standardSlaHours}h.`
    : `Matched grievance to ${bestDept.name} -> ${bestCat.name} with ${Math.round(confidenceScore * 100)}% statistical confidence based on key tokens [${matchedKeywords.slice(0, 4).join(', ')}]. Standard SLA: ${bestCat.standardSlaHours} hours.`;

  return {
    departmentId: bestDept.id,
    departmentName: bestDept.name,
    categoryId: bestCat.id,
    categoryName: bestCat.name,
    confidenceScore: Number(confidenceScore.toFixed(2)),
    urgency,
    urgencyScore,
    detectedKeywords: matchedKeywords,
    suggestedWardId,
    sentiment,
    rationale
  };
}

