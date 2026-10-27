import { GrievanceTicket } from '../types/grievance';

export const INITIAL_TICKETS: GrievanceTicket[] = [
  {
    id: 'POL-2026-W14-0101',
    title: 'Drinking water pipeline burst gushing high pressure water on road',
    description: 'Main 6-inch pipeline burst opposite to Subramaniar Temple near Mahalingapuram 4th cross arch. Water has been continuously gushing onto the road since morning, flooding the roadway and causing severe water wastage.',
    originalLanguage: 'en',
    departmentId: 'dept-water',
    categoryId: 'cat-pipe-leak',
    wardId: 14,
    wardName: 'Mahalingapuram Central & Arch',
    landmark: 'Opposite Subramaniar Temple, 4th Cross Arch',
    latitude: 10.6620,
    longitude: 77.0010,
    citizenName: 'Karthik Subburam',
    citizenPhone: '98421-54321',
    isAnonymous: false,
    status: 'IN_PROGRESS',
    urgency: 'CRITICAL',
    slaDeadline: new Date(Date.now() + 10 * 3600 * 1000).toISOString(), // 10h remaining
    slaHoursTotal: 18,
    isSlaBreached: false,
    escalationLevel: 0,
    aiTriage: {
      categoryConfidence: 0.98,
      urgencyScore: 92,
      detectedKeywords: ['pipeline burst', 'gushing', 'high pressure', 'water wastage', 'flooding road'],
      sentiment: 'EMERGENCY',
      rationale: 'High-pressure water distribution pipe breach causing municipal clean drinking water loss and vehicle obstruction. Critical priority tagged.'
    },
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
    assignedOfficer: {
      officerId: 'je-5',
      name: 'Er. P. Ramakrishnan',
      role: 'Junior Engineer (Water Works)',
      phone: '94432-20005',
      department: 'dept-water',
      assignedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    timeline: [
      {
        id: 'tl-1',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        status: 'PENDING_TRIAGE',
        actor: 'Karthik Subburam',
        actorRole: 'Citizen',
        comment: 'Grievance submitted via Citizen Portal with location pin at Mahalingapuram Arch.'
      },
      {
        id: 'tl-2',
        timestamp: new Date(Date.now() - 4.8 * 3600 * 1000).toISOString(),
        status: 'ASSIGNED',
        actor: 'AI Dispatch Engine',
        actorRole: 'Automated System',
        comment: 'AI classified as Critical Water Supply emergency (98% confidence). Auto-assigned to Ward 14 Junior Engineer Er. P. Ramakrishnan.',
        isAiAction: true
      },
      {
        id: 'tl-3',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'IN_PROGRESS',
        actor: 'Er. P. Ramakrishnan',
        actorRole: 'Junior Engineer',
        comment: 'Maintenance crew arrived on site with replacement 6-inch collar valve. Water valve isolated. Excavation underway.'
      }
    ],
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'POL-2026-W18-0102',
    title: 'Severe garbage accumulation and rotting vegetable waste behind Market Road',
    description: 'Huge dump of rotten vegetables, packaging boxes, and solid waste uncleared for past 3 days behind the Uzhavar Sandhai market. Extremely bad foul odor affecting surrounding shop owners and pedestrians.',
    originalLanguage: 'en',
    departmentId: 'dept-sanitation',
    categoryId: 'cat-garbage-dump',
    wardId: 18,
    wardName: 'Market Road & Daily Vegetable Sandhai',
    landmark: 'Behind Uzhavar Sandhai, Market Road 2nd lane',
    latitude: 10.6480,
    longitude: 77.0040,
    citizenName: 'M. Anandhan',
    citizenPhone: '97890-12345',
    isAnonymous: false,
    status: 'ASSIGNED',
    urgency: 'HIGH',
    slaDeadline: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
    slaHoursTotal: 24,
    isSlaBreached: false,
    escalationLevel: 0,
    aiTriage: {
      categoryConfidence: 0.95,
      urgencyScore: 78,
      detectedKeywords: ['garbage accumulation', 'rotting vegetable', 'uncleared 3 days', 'foul odor'],
      sentiment: 'DISTRESSED',
      rationale: 'Public health hazard due to decomposing organic matter in high-density market zone. High priority.'
    },
    photoUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80',
    assignedOfficer: {
      officerId: 'si-9',
      name: 'A. Ravichandran',
      role: 'Sanitary Inspector',
      phone: '94431-10009',
      department: 'dept-sanitation',
      assignedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    timeline: [
      {
        id: 'tl-10',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        status: 'PENDING_TRIAGE',
        actor: 'M. Anandhan',
        actorRole: 'Citizen',
        comment: 'Grievance submitted regarding market waste dump.'
      },
      {
        id: 'tl-11',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        status: 'ASSIGNED',
        actor: 'CivicOps Triage Officer',
        actorRole: 'Admin Staff',
        comment: 'Reviewed AI suggestion and assigned Sanitary Inspector A. Ravichandran for tipper truck deployment.'
      }
    ],
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: 'POL-2026-W13-0103',
    title: 'Broken heavy concrete drain slab right on Gandhi Statue circle walkway',
    description: 'சாக்கடை பலகை உடைந்து பெரிய குழி ஏற்பட்டுள்ளது. பாதசாரிகள் மற்றும் இருசக்கர வாகன ஓட்டிகளுக்கு பெரும் விபத்து ஏற்படும் அபாயம். உடனே புதிய மூடி அமைக்க வேண்டும்.',
    originalLanguage: 'ta',
    departmentId: 'dept-roads',
    categoryId: 'cat-broken-manhole',
    wardId: 13,
    wardName: 'Gandhi Statue & Bazaar Street',
    landmark: 'Near Gandhi Statue Roundabout, Bazaar Street entrance',
    latitude: 10.6575,
    longitude: 77.0065,
    citizenName: 'S. Loganathan',
    citizenPhone: '94422-99881',
    isAnonymous: false,
    status: 'IN_PROGRESS',
    urgency: 'CRITICAL',
    slaDeadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    slaHoursTotal: 12,
    isSlaBreached: false,
    escalationLevel: 0,
    aiTriage: {
      categoryConfidence: 0.96,
      urgencyScore: 95,
      detectedKeywords: ['சாக்கடை பலகை', 'பெரிய குழி', 'விபத்து அபாயம்', 'உடைந்த மூடி'],
      sentiment: 'EMERGENCY',
      rationale: 'Pedestrian hazard at prime commercial roundabout. Risk of severe injury or fall into storm water drainage. SLA tightened to 12 hours.'
    },
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    assignedOfficer: {
      officerId: 'je-4',
      name: 'Er. S. Velusamy',
      role: 'Junior Engineer (Roads)',
      phone: '94432-20004',
      department: 'dept-roads',
      assignedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    },
    timeline: [
      {
        id: 'tl-20',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        status: 'PENDING_TRIAGE',
        actor: 'S. Loganathan',
        actorRole: 'Citizen',
        comment: 'Submitted in Tamil with photo of collapsed drain slab.'
      },
      {
        id: 'tl-21',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        status: 'ASSIGNED',
        actor: 'AI Fast-Track',
        actorRole: 'AI Engine',
        comment: 'High hazard detected in Tamil text (விபத்து அபாயம்). Escalated to Critical and dispatched to Er. S. Velusamy.',
        isAiAction: true
      },
      {
        id: 'tl-22',
        timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        status: 'IN_PROGRESS',
        actor: 'Er. S. Velusamy',
        actorRole: 'Junior Engineer',
        comment: 'Barricades placed around broken slab. Precast concrete slab dispatched from municipal workshop.'
      }
    ],
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'POL-2026-W09-0098',
    title: 'Streetlights not working on Venkatesa Colony 3rd Cross for 4 nights',
    description: 'Four consecutive LED streetlights from door number 12 to 28 have been completely dark. Senior citizens unable to take evening walks and feeling unsafe due to total darkness.',
    originalLanguage: 'en',
    departmentId: 'dept-electrical',
    categoryId: 'cat-streetlight-out',
    wardId: 9,
    wardName: 'Venkatesa Colony West',
    landmark: 'Venkatesa Colony 3rd Cross, near Post Office',
    latitude: 10.6590,
    longitude: 77.0160,
    citizenName: 'Mrs. Lakshmi Narayanan',
    citizenPhone: '98433-44556',
    isAnonymous: false,
    status: 'RESOLVED',
    urgency: 'MEDIUM',
    slaDeadline: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    slaHoursTotal: 24,
    isSlaBreached: false,
    escalationLevel: 0,
    aiTriage: {
      categoryConfidence: 0.97,
      urgencyScore: 52,
      detectedKeywords: ['streetlights', 'not working', 'dark', 'consecutive LED', 'unsafe darkness'],
      sentiment: 'DISSATISFIED',
      rationale: 'Cluster streetlight outage affecting public lighting. Standard 24h SLA.'
    },
    photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
    resolutionRemarks: 'Inspection revealed phase wire loose connection inside junction box of pole #14. Fixed connection and replaced 2 blown 45W Philips LED fixtures. All lights now fully functional.',
    assignedOfficer: {
      officerId: 'si-5',
      name: 'S. Murugesan',
      role: 'Sanitary & Civic Inspector',
      phone: '94431-10005',
      department: 'dept-electrical',
      assignedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
    },
    citizenFeedback: {
      rating: 5,
      comment: 'Very fast resolution! The electrical line team came within 18 hours and fixed all lights. Thank you Pollachi Municipality!',
      submittedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    timeline: [
      {
        id: 'tl-30',
        timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
        status: 'PENDING_TRIAGE',
        actor: 'Mrs. Lakshmi Narayanan',
        actorRole: 'Citizen',
        comment: 'Grievance lodged.'
      },
      {
        id: 'tl-31',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        status: 'ASSIGNED',
        actor: 'CivicOps Dispatch',
        actorRole: 'Admin Staff',
        comment: 'Assigned to S. Murugesan for electrical team inspection.'
      },
      {
        id: 'tl-32',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        status: 'IN_PROGRESS',
        actor: 'Field Lineman',
        actorRole: 'Field Staff',
        comment: 'Maintenance vehicle with ladder arrived. Troubleshooting wiring.'
      },
      {
        id: 'tl-33',
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        status: 'RESOLVED',
        actor: 'S. Murugesan',
        actorRole: 'Sanitary & Civic Inspector',
        comment: 'Repairs completed and verified. Before/After proof uploaded.',
        photoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80'
      }
    ],
    createdAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
  },
  {
    id: 'POL-2026-W12-0095',
    title: 'Pack of aggressive stray dogs chasing commuters at Pollachi Bus Stand',
    description: 'A pack of 6-7 stray dogs gathered near bay 3 and 4 of Pollachi Central Bus Stand. Chasing two-wheelers and threatening school children in the evening. Urgent dog catchers required.',
    originalLanguage: 'en',
    departmentId: 'dept-stray-animals',
    categoryId: 'cat-stray-dogs',
    wardId: 12,
    wardName: 'Pollachi Central Bus Stand & Railway Feeder Road',
    landmark: 'Bus Bay 3 & 4, Pollachi Central Bus Stand',
    latitude: 10.6605,
    longitude: 77.0090,
    citizenName: 'B. Sureshkumar',
    citizenPhone: '99441-23789',
    isAnonymous: false,
    status: 'PENDING_TRIAGE',
    urgency: 'HIGH',
    slaDeadline: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    slaHoursTotal: 24,
    isSlaBreached: false,
    escalationLevel: 0,
    aiTriage: {
      categoryConfidence: 0.94,
      urgencyScore: 84,
      detectedKeywords: ['stray dogs', 'pack of dogs', 'chasing', 'bus stand', 'school children'],
      sentiment: 'DISTRESSED',
      rationale: 'High public transit area with threat to pedestrian and passenger safety. Veterinary Animal Birth Control (ABC) unit dispatch recommended.'
    },
    timeline: [
      {
        id: 'tl-40',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'PENDING_TRIAGE',
        actor: 'B. Sureshkumar',
        actorRole: 'Citizen',
        comment: 'Grievance registered. Awaiting municipal dispatch.'
      }
    ],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'POL-2026-W07-0089',
    title: 'SLA Escalated (L1): Stagnant sewage overflow in front of Meenkarai Road houses',
    description: 'Drainage blocked and black foul smelling water overflowing onto house steps for the past 4 days. Reported earlier but no action taken yet. Severe mosquito menace.',
    originalLanguage: 'en',
    departmentId: 'dept-water',
    categoryId: 'cat-sewer-overflow',
    wardId: 7,
    wardName: 'CTC Colony & Meenkarai Road',
    landmark: 'Near Meenkarai Railway Gate, Cross 2',
    latitude: 10.6520,
    longitude: 77.0310,
    citizenName: 'K. Meenakshi Sundaram',
    citizenPhone: '94435-66778',
    isAnonymous: false,
    status: 'IN_PROGRESS',
    urgency: 'HIGH',
    slaDeadline: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // Breached 6h ago!
    slaHoursTotal: 24,
    isSlaBreached: true,
    escalationLevel: 1, // Escalated to Level 1 (Junior Engineer & Executive Engineer alert)
    aiTriage: {
      categoryConfidence: 0.93,
      urgencyScore: 88,
      detectedKeywords: ['drainage blocked', 'sewage overflow', 'foul smelling', '4 days', 'mosquito menace'],
      sentiment: 'EMERGENCY',
      rationale: 'SLA breached by 6 hours. Automatic system escalation triggered to Level 1 (Executive Engineer).'
    },
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
    assignedOfficer: {
      officerId: 'je-3',
      name: 'Er. R. Anbarasan',
      role: 'Junior Engineer',
      phone: '94432-20003',
      department: 'dept-water',
      assignedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString()
    },
    timeline: [
      {
        id: 'tl-50',
        timestamp: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
        status: 'PENDING_TRIAGE',
        actor: 'K. Meenakshi Sundaram',
        actorRole: 'Citizen',
        comment: 'Grievance logged.'
      },
      {
        id: 'tl-51',
        timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        status: 'ASSIGNED',
        actor: 'CivicOps Admin',
        actorRole: 'Admin Staff',
        comment: 'Assigned to Ward 7 team.'
      },
      {
        id: 'tl-52',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        status: 'IN_PROGRESS',
        actor: 'Automated SLA Watchdog',
        actorRole: 'AI Escalation System',
        comment: 'SLA 24-hour limit breached. Escalation Level 1 active: Alert SMS dispatched to Executive Engineer & City Engineer.',
        isAiAction: true
      }
    ],
    createdAt: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  }
];
