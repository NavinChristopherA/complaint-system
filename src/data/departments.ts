import { Department } from '../types/grievance';

export const POLLACHI_DEPARTMENTS: Department[] = [
  {
    id: 'dept-sanitation',
    name: 'Public Health & Sanitation',
    tamilName: 'பொது சுகாதாரம் மற்றும் துப்புரவு',
    description: 'Solid waste management, garbage clearance, mosquito control, and public sanitation.',
    iconName: 'Trash2',
    colorHex: '#10b981',
    headOfficer: 'Dr. M. Senthil Kumar (City Health Officer)',
    headContact: '04259-222101',
    categories: [
      {
        id: 'cat-garbage-dump',
        name: 'Uncollected Garbage / Dumper Overflow',
        tamilName: 'குப்பை அள்ளப்படாமை / குப்பைத்தொட்டி நிரம்பியது',
        standardSlaHours: 24,
        defaultUrgency: 'MEDIUM',
        keywordsEn: ['garbage', 'trash', 'waste', 'dump', 'bin', 'stench', 'smell', 'uncollected', 'filth'],
        keywordsTa: ['குப்பை', 'துர்நாற்றம்', 'அள்ளவில்லை', 'குப்பைத்தொட்டி', 'நாற்றம்', 'சாக்கடை குப்பை']
      },
      {
        id: 'cat-mosquito-fogging',
        name: 'Mosquito Breeding / Fogging Request',
        tamilName: 'கொசு உற்பத்தி / கொசு மருந்து தெளிப்பு',
        standardSlaHours: 48,
        defaultUrgency: 'MEDIUM',
        keywordsEn: ['mosquito', 'fogging', 'dengue', 'larvae', 'spray', 'stagnant', 'fever'],
        keywordsTa: ['கொசு', 'டெங்கு', 'மருந்து தெளிப்பு', 'காய்ச்சல்', 'கொசுத்தொல்லை']
      },
      {
        id: 'cat-public-toilet',
        name: 'Public Toilet Maintenance & Sanitation',
        tamilName: 'பொதுக் கழிப்பறை பராமரிப்பு மற்றும் சுத்தம்',
        standardSlaHours: 12,
        defaultUrgency: 'HIGH',
        keywordsEn: ['toilet', 'restroom', 'latrine', 'urinal', 'dirty toilet', 'cleaning', 'no water toilet'],
        keywordsTa: ['கழிப்பறை', 'கழிவறை', 'சுத்தம்', 'தண்ணீர் இல்லை']
      },
      {
        id: 'cat-dead-animal',
        name: 'Dead Animal / Carcass Removal',
        tamilName: 'இறந்த விலங்குகள் அகற்றுதல்',
        standardSlaHours: 12,
        defaultUrgency: 'CRITICAL',
        keywordsEn: ['dead dog', 'dead animal', 'carcass', 'corpse', 'dead cat', 'foul smell'],
        keywordsTa: ['செத்த நாய்', 'இறந்த விலங்கு', 'பிணம்', 'நாற்றம்']
      }
    ]
  },
  {
    id: 'dept-water',
    name: 'Water Supply & Sewerage',
    tamilName: 'குடிநீர் வழங்கல் மற்றும் பாதாள சாக்கடை',
    description: 'Drinking water distribution, pipeline repairs, contamination issues, and sewage network.',
    iconName: 'Droplets',
    colorHex: '#0284c7',
    headOfficer: 'Er. K. Natarajan (Executive Engineer - Water)',
    headContact: '04259-222102',
    categories: [
      {
        id: 'cat-pipe-leak',
        name: 'Drinking Water Pipeline Burst / Leakage',
        tamilName: 'குடிநீர் குழாய் உடைப்பு / கசிவு',
        standardSlaHours: 18,
        defaultUrgency: 'HIGH',
        keywordsEn: ['pipe', 'leak', 'pipeline', 'burst', 'water gushing', 'drinking water', 'tap broken'],
        keywordsTa: ['குழாய் உடைப்பு', 'தண்ணீர் கசிவு', 'குடிநீர் வீணாகிறது', 'குழாய்']
      },
      {
        id: 'cat-contaminated-water',
        name: 'Contaminated / Muddy / Discolored Water',
        tamilName: 'மாசுபட்ட / கலங்கலான குடிநீர் விநியோகம்',
        standardSlaHours: 12,
        defaultUrgency: 'CRITICAL',
        keywordsEn: ['contaminated', 'muddy water', 'dirty water', 'yellow water', 'foul smelling water', 'unsafe water', 'chlorine'],
        keywordsTa: ['கலங்கலான தண்ணீர்', 'அழுக்கு நீர்', 'துர்நாற்ற நீர்', 'குடிக்க முடியாத தண்ணீர்']
      },
      {
        id: 'cat-sewer-overflow',
        name: 'Underground Drainage (UGD) Overflow / Blockage',
        tamilName: 'பாதாள சாக்கடை அடைப்பு / வெளியேறுதல்',
        standardSlaHours: 24,
        defaultUrgency: 'HIGH',
        keywordsEn: ['sewage', 'drainage overflow', 'ugd', 'gutter', 'manhole overflowing', 'septic', 'blocked drain'],
        keywordsTa: ['பாதாள சாக்கடை', 'சாக்கடை நிரம்பியது', 'கழிவுநீர்', 'அடைப்பு']
      },
      {
        id: 'cat-no-water-supply',
        name: 'Irregular or No Water Supply',
        tamilName: 'குடிநீர் விநியோகம் இன்மை / முறையற்ற விநியோகம்',
        standardSlaHours: 36,
        defaultUrgency: 'MEDIUM',
        keywordsEn: ['no water', 'supply stopped', 'low pressure', 'water timing', 'water lorry'],
        keywordsTa: ['தண்ணீர் வரவில்லை', 'குடிநீர் வரவில்லை', 'குறைந்த அழுத்தம்']
      }
    ]
  },
  {
    id: 'dept-roads',
    name: 'Roads, Bridges & Infrastructure',
    tamilName: 'சாலைகள் மற்றும் கட்டமைப்பு',
    description: 'Road repairs, pothole filling, storm water drain slabs, and footpath maintenance.',
    iconName: 'Construction',
    colorHex: '#ea580c',
    headOfficer: 'Er. S. Velusamy (City Engineer)',
    headContact: '04259-222103',
    categories: [
      {
        id: 'cat-pothole',
        name: 'Dangerous Potholes / Damaged Road Surface',
        tamilName: 'ஆபத்தான சாலை பள்ளங்கள் / சேதமடைந்த சாலை',
        standardSlaHours: 48,
        defaultUrgency: 'HIGH',
        keywordsEn: ['pothole', 'road damaged', 'crater', 'asphalt broken', 'bike skid', 'accident prone road'],
        keywordsTa: ['பள்ளம்', 'ரோடு சேதம்', 'சாலை பள்ளம்', 'விபத்து']
      },
      {
        id: 'cat-broken-manhole',
        name: 'Broken / Missing Manhole or Drain Slab',
        tamilName: 'உடைந்த / திறந்திருக்கும் கழிவுநீர் தொட்டி மூடி',
        standardSlaHours: 12,
        defaultUrgency: 'CRITICAL',
        keywordsEn: ['open manhole', 'broken slab', 'drain cover', 'chamber cover missing', 'open gutter', 'fall hazard'],
        keywordsTa: ['மூடி உடைந்தது', 'திறந்திருக்கும் சாக்கடை', 'ஆபத்து மூடி', 'சாக்கடை பலகை']
      },
      {
        id: 'cat-footpath-damaged',
        name: 'Damaged Footpath / Paver Blocks',
        tamilName: 'நடைபாதை சேதம் / நடைபாதை கற்கள் பெயர்ந்தது',
        standardSlaHours: 72,
        defaultUrgency: 'LOW',
        keywordsEn: ['footpath', 'pedestrian', 'sidewalk', 'paver blocks', 'broken curb'],
        keywordsTa: ['நடைபாதை', 'நடைபாதை சேதம்']
      }
    ]
  },
  {
    id: 'dept-electrical',
    name: 'Electrical & Street Lighting',
    tamilName: 'மின்சாரம் மற்றும் தெரு விளக்குகள்',
    description: 'Streetlight maintenance, LED replacements, hanging wires, and timer corrections.',
    iconName: 'Lightbulb',
    colorHex: '#eab308',
    headOfficer: 'Er. P. Ramakrishnan (Electrical Superintendent)',
    headContact: '04259-222104',
    categories: [
      {
        id: 'cat-streetlight-out',
        name: 'Streetlight Not Working / Dark Spot',
        tamilName: 'தெரு விளக்கு எரியவில்லை / இருள் பகுதி',
        standardSlaHours: 24,
        defaultUrgency: 'MEDIUM',
        keywordsEn: ['streetlight', 'dark', 'light not working', 'lamp out', 'led bulb off', 'night darkness'],
        keywordsTa: ['தெருவிளக்கு எரியவில்லை', 'விளக்கு அணைந்தது', 'இருட்டாக உள்ளது', 'லைட்']
      },
      {
        id: 'cat-live-hanging-wire',
        name: 'Hanging Live Wire / Damaged Electric Pole',
        tamilName: 'அறுந்து கிடக்கும் மின்கம்பி / சாய்ந்த மின்கம்பம்',
        standardSlaHours: 6,
        defaultUrgency: 'CRITICAL',
        keywordsEn: ['electric wire', 'hanging wire', 'sparks', 'shock', 'leaning pole', 'damaged post', 'current shock'],
        keywordsTa: ['மின்கம்பி தொங்குகிறது', 'மின் அதிர்ச்சி', 'மின்கம்பம் சாய்ந்தது', 'ஷாக்', 'தீப்பொறி']
      },
      {
        id: 'cat-daytime-burning',
        name: 'Streetlights Burning Continuously in Daytime',
        tamilName: 'பகல் நேரத்தில் தெருவிளக்குகள் எரிதல்',
        standardSlaHours: 24,
        defaultUrgency: 'LOW',
        keywordsEn: ['daytime burning', 'light on day', 'timer fault', 'wasting electricity'],
        keywordsTa: ['பகலில் எரிகிறது', 'மின்சாரம் விரயம்']
      }
    ]
  },
  {
    id: 'dept-stray-animals',
    name: 'Stray Animals & Cattle Menace',
    tamilName: 'தெரு நாய்கள் மற்றும் சுற்றித்திரியும் கால்நடைகள்',
    description: 'Controlling stray dog menace, birth control operations, cattle on highways, and rabies prevention.',
    iconName: 'PawPrint',
    colorHex: '#a855f7',
    headOfficer: 'Dr. G. Sivakumar (Veterinary Officer)',
    headContact: '04259-222105',
    categories: [
      {
        id: 'cat-stray-dogs',
        name: 'Stray Dog Menace / Aggressive Dogs / Bite Risk',
        tamilName: 'தெருநாய் தொல்லை / கடிக்கும் அபாயம்',
        standardSlaHours: 24,
        defaultUrgency: 'HIGH',
        keywordsEn: ['stray dog', 'dog bite', 'dog pack', 'rabies', 'barking', 'chasing vehicles', 'puppies'],
        keywordsTa: ['தெரு நாய்', 'நாய் கடி', 'நாய்கள் தொல்லை', 'துரத்துகிறது']
      },
      {
        id: 'cat-cattle-road',
        name: 'Cattle Wandering on Main Roads / Traffic Block',
        tamilName: 'சாலையில் சுற்றித்திரியும் மாடுகள் / போக்குவரத்து நெரிசல்',
        standardSlaHours: 24,
        defaultUrgency: 'MEDIUM',
        keywordsEn: ['cow', 'cattle', 'bull', 'buffalo', 'traffic block', 'highway cattle'],
        keywordsTa: ['மாடு', 'கால்நடை', 'போக்குவரத்து நெரிசல்', 'பசு மாடு']
      }
    ]
  },
  {
    id: 'dept-town-planning',
    name: 'Town Planning & Encroachment',
    tamilName: 'நகரமைப்பு மற்றும் ஆக்கிரமிப்பு அகற்றுதல்',
    description: 'Encroachments on public footpaths, illegal hoardings, and building violations.',
    iconName: 'Building2',
    colorHex: '#64748b',
    headOfficer: 'Thiru. C. Rajendran (Town Planning Officer)',
    headContact: '04259-222106',
    categories: [
      {
        id: 'cat-encroachment-footpath',
        name: 'Encroachment on Public Footpath / Road',
        tamilName: 'பொது நடைபாதை / சாலை ஆக்கிரமிப்பு',
        standardSlaHours: 72,
        defaultUrgency: 'MEDIUM',
        keywordsEn: ['encroachment', 'shop extended', 'blocking pathway', 'illegal stall', 'pavement blocked'],
        keywordsTa: ['ஆக்கிரமிப்பு', 'நடைபாதை ஆக்கிரமிப்பு', 'கடை அடைப்பு']
      },
      {
        id: 'cat-illegal-banner',
        name: 'Unauthorized Flex Banners / Hoardings',
        tamilName: 'அனுமதியற்ற விளம்பரப் பலகைகள் / பேனர்கள்',
        standardSlaHours: 24,
        defaultUrgency: 'LOW',
        keywordsEn: ['banner', 'hoarding', 'flex board', 'illegal billboard', 'poster'],
        keywordsTa: ['விளம்பர பலகை', 'பேனர்', 'அனுமதியற்ற பேனர்']
      }
    ]
  },
  {
    id: 'dept-parks',
    name: 'Parks, Greenery & Trees',
    tamilName: 'பூங்காக்கள் மற்றும் மரங்கள் பராமரிப்பு',
    description: 'Fallen trees clearance during storms, tree pruning near power lines, and park maintenance.',
    iconName: 'Trees',
    colorHex: '#059669',
    headOfficer: 'Thiru. V. Palanisamy (Parks Inspector)',
    headContact: '04259-222107',
    categories: [
      {
        id: 'cat-fallen-tree',
        name: 'Fallen Tree / Branch Blocking Road',
        tamilName: 'விழுந்த மரம் / சாலையில் விழுந்த மரக்கிளைகள்',
        standardSlaHours: 6,
        defaultUrgency: 'CRITICAL',
        keywordsEn: ['fallen tree', 'tree down', 'blocked road tree', 'branch falling', 'tree accident'],
        keywordsTa: ['மரம் சாய்ந்தது', 'மரம் விழுந்தது', 'மரக்கிளை', 'பாதை அடைப்பு']
      },
      {
        id: 'cat-pruning-request',
        name: 'Tree Pruning for Powerline / Visibility',
        tamilName: 'மரக்கிளைகளை வெட்டுதல் / சீரமைத்தல்',
        standardSlaHours: 48,
        defaultUrgency: 'LOW',
        keywordsEn: ['prune', 'tree branch', 'trimming', 'wires touching tree', 'overgrown branch'],
        keywordsTa: ['மரக்கிளை வெட்ட வேண்டும்', 'கம்பி தொடுகிறது']
      }
    ]
  },
  {
    id: 'dept-revenue',
    name: 'Revenue & Municipal Governance',
    tamilName: 'வருவாய் மற்றும் பொது நிர்வாகம்',
    description: 'Property tax assessment, trade licenses, birth/death registration certificates.',
    iconName: 'Receipt',
    colorHex: '#8b5cf6',
    headOfficer: 'Thirumathi. R. Kanchana (Revenue Officer)',
    headContact: '04259-222108',
    categories: [
      {
        id: 'cat-property-tax',
        name: 'Property Tax Billing / Assessment Dispute',
        tamilName: 'சொத்து வரி கணக்கீடு / மதிப்பீட்டு குறைபாடு',
        standardSlaHours: 120,
        defaultUrgency: 'LOW',
        keywordsEn: ['property tax', 'tax bill', 'wrong assessment', 'payment not updated', 'receipt issue'],
        keywordsTa: ['சொத்து வரி', 'வரி ரசீது', 'தவறான வரி']
      },
      {
        id: 'cat-birth-death',
        name: 'Birth / Death Certificate Issuance Delay',
        tamilName: 'பிறப்பு / இறப்பு சான்றிதழ் தாமதம்',
        standardSlaHours: 72,
        defaultUrgency: 'LOW',
        keywordsEn: ['birth certificate', 'death certificate', 'certificate delay', 'correction in name'],
        keywordsTa: ['பிறப்பு சான்றிதழ்', 'இறப்பு சான்றிதழ்', 'சான்றிதழ் தாமதம்']
      }
    ]
  }
];
