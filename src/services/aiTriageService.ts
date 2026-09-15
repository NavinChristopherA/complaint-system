import { POLLACHI_DEPARTMENTS } from '../data/departments';
import { POLLACHI_WARDS } from '../data/pollachiWards';
import { UrgencyLevel } from '../types/grievance';

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

const CRITICAL_KEYWORDS = [
  'burst', 'pipe burst', 'gushing', 'sparks', 'shock', 'live wire', 'current shock', 
  'open manhole', 'broken slab', 'carcass', 'dead animal', 'fallen tree', 'block road',
  'accident', 'flood', 'contaminated', 'yellow water', 'dengue', 'rabies', 'dog bite',
  'உயிர் ஆபத்து', 'மின் அதிர்ச்சி', 'ஷாக்', 'செத்த நாய்', 'உடைந்தது', 'விபத்து', 'மரம் விழுந்தது'
];

const HIGH_KEYWORDS = [
  'overflow', 'leak', 'pothole', 'chasing', 'stray dog', 'deep crater', 'stench',
  '4 days', '3 days', 'urgent', 'drainage block', 'septic', 'no water',
  'துர்நாற்றம்', 'கழிவுநீர்', 'அடைப்பு', 'குழாய் உடைப்பு', 'பள்ளம்'
];

export function runAiTriage(inputText: string): AiTriageResult {
  const text = inputText.toLowerCase().trim();
  
  if (!text || text.length < 5) {
    // Default fallback if minimal text
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

  // 1. Detect Ward mentions from text
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

  // 2. Score Departments & Categories based on bilingual keyword hits
  let bestDept = POLLACHI_DEPARTMENTS[0];
  let bestCat = bestDept.categories[0];
  let maxScore = 0;
  const matchedKeywords: string[] = [];

  for (const dept of POLLACHI_DEPARTMENTS) {
    for (const cat of dept.categories) {
      let score = 0;
      for (const kw of cat.keywordsEn) {
        if (text.includes(kw.toLowerCase())) {
          score += 3;
          if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        }
      }
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

  // Calculate confidence score (normalized)
  const confidenceScore = maxScore > 0 ? Math.min(0.98, 0.65 + (maxScore * 0.05)) : 0.62;

  // 3. Evaluate Urgency & Hazard Level
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

  // 4. Sentiment determination
  let sentiment: 'EMERGENCY' | 'DISTRESSED' | 'DISSATISFIED' | 'INQUIRY' = 'DISSATISFIED';
  if (urgency === 'CRITICAL') sentiment = 'EMERGENCY';
  else if (urgency === 'HIGH') sentiment = 'DISTRESSED';
  else if (urgency === 'LOW') sentiment = 'INQUIRY';

  // 5. Generate human-readable explainable rationale
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
