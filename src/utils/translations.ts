export type Language = 'en' | 'ta';

export const TRANSLATIONS = {
  en: {
    appTitle: 'Pollachi Municipal Corporation',
    appSubtitle: 'Civic Grievance Redressal & Citizen Care Portal',
    nammaPollachi: 'Namma Pollachi',
    civicOps: 'CivicOps Command Center',
    portalSwitchCitizen: 'Citizen Portal',
    portalSwitchAdmin: 'Municipal Command Center',
    languageToggle: 'தமிழ்',
    emergencyHelpline: 'Emergency Municipal Helpline: 04259-223344 / 1913',
    
    // Nav
    navRegister: 'Register Grievance',
    navTrack: 'Track Status',
    navWards: 'Ward Scorecards',
    navHelplines: 'Emergency Contacts',
    navAdminDashboard: 'Dashboard',
    navTriageQueue: 'Triage Queue',
    navWardHeatmap: 'Ward Heatmap',
    navAnalytics: 'Civic Analytics',

    // Hero
    heroHeading: 'Fast, Accountable Grievance Redressal for Pollachi',
    heroSubheading: 'Powered by AI auto-triage, real-time SLA watchdog, and direct dispatch to Ward Sanitary Inspectors & Junior Engineers across all 36 Wards.',
    lodgeGrievanceBtn: 'Lodge New Grievance',
    trackTicketBtn: 'Track Existing Complaint',
    quickStatsActive: 'Active Grievances',
    quickStatsResolved: 'Redressed This Month',
    quickStatsSla: 'SLA Compliance Rate',
    quickStatsAvgTime: 'Avg. Resolution Time',

    // Wizard
    step1Title: '1. Describe the Civic Issue',
    step1Sub: 'Explain in English or Tamil. Our AI will automatically categorize and assess urgency.',
    step2Title: '2. Select Ward & Landmark',
    step2Sub: 'Pick from 36 Pollachi Municipal Wards or type a familiar landmark.',
    step3Title: '3. Photo & Contact Details',
    step3Sub: 'Upload photo evidence and provide mobile number for SMS/ticket updates.',
    step4Title: '4. AI Verification & Submit',
    step4Sub: 'Review AI category matching, SLA timeline, and confirm registration.',

    // AI Box
    aiTriageTitle: 'AI Smart Triage & Priority Engine',
    aiConfidence: 'Confidence Match',
    aiUrgency: 'Urgency Score',
    aiSlaAssigned: 'Estimated SLA',
    aiRationale: 'Explainable AI Analysis',
    aiDuplicateWarning: 'Possible Duplicate Detected in this Ward!',

    // Common
    ward: 'Ward',
    status: 'Status',
    urgency: 'Urgency',
    department: 'Department',
    ticketId: 'Ticket ID',
    createdAt: 'Reported On',
    slaTime: 'SLA Timeline',
    actions: 'Actions',
    close: 'Close',
    cancel: 'Cancel',
    submit: 'Submit Grievance',
    proceed: 'Proceed',
    back: 'Back',
    resetDemo: 'Reset Demo Data',
    persona: 'Current Role'
  },
  ta: {
    appTitle: 'பொள்ளாச்சி நகராட்சி / மாநகராட்சி',
    appSubtitle: 'பொதுமக்கள் குறைதீர்ப்பு மற்றும் குடிமக்கள் நல சேவை தளம்',
    nammaPollachi: 'நம்ம பொள்ளாச்சி',
    civicOps: 'நகராட்சி நிர்வாக கட்டுப்பாட்டு மையம்',
    portalSwitchCitizen: 'பொதுமக்கள் தளம்',
    portalSwitchAdmin: 'அதிகாரிகள் கட்டுப்பாட்டு மையம்',
    languageToggle: 'English',
    emergencyHelpline: 'நகராட்சி அவசர உதவி எண்: 04259-223344 / 1913',

    // Nav
    navRegister: 'புகார் பதிவு செய்க',
    navTrack: 'புகார் நிலை அறிக',
    navWards: 'வார்டு நிலவரம்',
    navHelplines: 'அவசர எண்கள்',
    navAdminDashboard: 'டாஷ்போர்டு',
    navTriageQueue: 'புகார்கள் வரிசை',
    navWardHeatmap: 'வார்டு வரைபடம்',
    navAnalytics: 'நகராட்சி புள்ளிவிவரங்கள்',

    // Hero
    heroHeading: 'பொள்ளாச்சி நகர மக்களுக்கான உடனடி குறைதீர்ப்பு தளம்',
    heroSubheading: 'செயற்கை நுண்ணறிவு (AI) வகைப்படுத்துதல், நேரடி காலக்கெடு கண்காணிப்பு மற்றும் 36 வார்டுகளுக்கும் உடனடி கள ஆய்வு.',
    lodgeGrievanceBtn: 'புதிய புகார் பதிவு செய்க',
    trackTicketBtn: 'புகாரின் நிலை அறிய',
    quickStatsActive: 'நிலுவையில் உள்ளவை',
    quickStatsResolved: 'இம்மாதம் தீர்க்கப்பட்டவை',
    quickStatsSla: 'நேரத்திற்குள் தீர்வு விகிதம்',
    quickStatsAvgTime: 'சராசரி தீர்வு நேரம்',

    // Wizard
    step1Title: '1. குறையை விவரிக்கவும்',
    step1Sub: 'தமிழ் அல்லது ஆங்கிலத்தில் தட்டச்சு செய்யவும். AI தானாகவே வகையை கண்டறியும்.',
    step2Title: '2. வார்டு மற்றும் இடத்தை தேர்ந்தெடுக்கவும்',
    step2Sub: 'பொள்ளாச்சியின் 36 வார்டுகளில் ஒன்றையோ அல்லது முக்கிய அடையாளத்தையோ தேர்ந்தெடுக்கவும்.',
    step3Title: '3. புகைப்படம் மற்றும் தொடர்பு விவரம்',
    step3Sub: 'புகைப்படத்தை இணைத்து, எஸ்.எம்.எஸ் பெற கைபேசி எண்ணை உள்ளிடவும்.',
    step4Title: '4. AI சரிபார்ப்பு மற்றும் சமர்ப்பித்தல்',
    step4Sub: 'AI பரிந்துரைத்த துறை மற்றும் கால அளவை சரிபார்த்து சமர்ப்பிக்கவும்.',

    // AI Box
    aiTriageTitle: 'செயற்கை நுண்ணறிவு (AI) பகுப்பாய்வு மையம்',
    aiConfidence: 'பொருத்தம் உறுதி',
    aiUrgency: 'தீவிரத்தன்மை மதிப்பீடு',
    aiSlaAssigned: 'வழங்கப்பட்ட காலக்கெடு',
    aiRationale: 'AI முடிவின் விளக்கம்',
    aiDuplicateWarning: 'இந்த வார்டில் ஏற்கனவே இதேபோன்ற புகார் பதிவாகியுள்ளது!',

    // Common
    ward: 'வார்டு',
    status: 'நிலை',
    urgency: 'தீவிரம்',
    department: 'துறை',
    ticketId: 'புகார் எண்',
    createdAt: 'பதிவு செய்த நாள்',
    slaTime: 'தீர்வு காலக்கெடு',
    actions: 'செயல்கள்',
    close: 'மூடுக',
    cancel: 'ரத்து செய்க',
    submit: 'புகாரை சமர்ப்பிக்க',
    proceed: 'தொடர்க',
    back: 'பின்செல்க',
    resetDemo: 'மாதிரி தகவலை மீட்டமைக்க',
    persona: 'தற்போதைய பொறுப்பு'
  }
};
