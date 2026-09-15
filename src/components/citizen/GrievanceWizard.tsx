import React, { useState, useEffect } from 'react';
import { POLLACHI_WARDS } from '../../data/pollachiWards';
import { POLLACHI_DEPARTMENTS } from '../../data/departments';
import { runAiTriage, AiTriageResult } from '../../services/aiTriageService';
import { detectDuplicateGrievance } from '../../services/duplicateDetector';
import { createTicket, getTickets } from '../../services/storageService';
import { GrievanceTicket } from '../../types/grievance';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { AIPreviewCard } from './AIPreviewCard';
import { DuplicateWarningModal } from './DuplicateWarningModal';
import { AIAssistantModal } from './AIAssistantModal';
import { PollachiCityMap } from '../common/PollachiCityMap';
import { AcknowledgementReceiptModal } from '../common/AcknowledgementReceiptModal';
import { 
  CheckCircle2, 
  MapPin, 
  Camera, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Phone, 
  User, 
  Copy,
  ExternalLink,
  ShieldAlert,
  Mic,
  MicOff,
  Printer,
  FileText
} from 'lucide-react';

interface GrievanceWizardProps {
  language: Language;
  onTicketCreated: (ticket: GrievanceTicket) => void;
  onTrackTicket: (ticketId: string) => void;
  onShowToast?: (title: string, msg: string, type?: 'success' | 'warning' | 'info' | 'critical') => void;
}

const SAMPLE_GRIEVANCES = [
  {
    label: '💧 Pipe Burst (Mahalingapuram)',
    title: 'Drinking water pipeline burst near Mahalingapuram Arch',
    desc: 'The main drinking water line broke near Mahalingapuram 4th cross arch. Water is gushing on the road with high pressure for the past 4 hours.',
    wardId: 14,
    landmark: 'Mahalingapuram Welcome Arch, 4th Cross',
    img: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80'
  },
  {
    label: '🗑️ Market Garbage (Ward 18)',
    title: 'Severe rotting vegetable dump uncleared in Market Road',
    desc: 'Rotten vegetable waste and dumper overflow behind Uzhavar Sandhai on Market Road. Severe foul stench and flies breeding.',
    wardId: 18,
    landmark: 'Behind Uzhavar Sandhai, Market Road',
    img: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80'
  },
  {
    label: '💡 Dark Streetlights (Venkatesa Colony)',
    title: 'Streetlights not working on Venkatesa Colony 2nd Cross',
    desc: '3 LED streetlights have failed completely on Venkatesa Colony 2nd Cross. Complete darkness at night causing difficulty for residents.',
    wardId: 9,
    landmark: 'Near Venkatesa Perumal Kovil, 2nd Cross',
    img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    label: '⚠️ Broken Slab (Gandhi Statue)',
    title: 'சாக்கடை பலகை உடைந்து பெரும் பள்ளம் ஏற்பட்டுள்ளது',
    desc: 'காந்தி சிலை ரவுண்டானா அருகே சாக்கடை பலகை உடைந்து பாதசாரிகள் விழும் அபாயம் ஏற்பட்டுள்ளது. உடனே புதிய மூடி அமைக்க வேண்டும்.',
    wardId: 13,
    landmark: 'Gandhi Statue Roundabout, Bazaar Street',
    img: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
  }
];

export const GrievanceWizard: React.FC<GrievanceWizardProps> = ({
  language,
  onTicketCreated,
  onTrackTicket,
  onShowToast
}) => {
  const t = TRANSLATIONS[language];
  const [step, setStep] = useState<number>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWardId, setSelectedWardId] = useState<number>(14);
  const [landmark, setLandmark] = useState('');
  const [citizenName, setCitizenName] = useState('Karthik Subburam');
  const [citizenPhone, setCitizenPhone] = useState('98421-54321');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80');

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);

  // AI & Duplicate State
  const [aiTriage, setAiTriage] = useState<AiTriageResult>(() => runAiTriage(''));
  const [duplicateWarning, setDuplicateWarning] = useState<{
    isOpen: boolean;
    matchingTicket?: GrievanceTicket;
    similarityScore: number;
  }>({ isOpen: false, similarityScore: 0 });

  // Post Submission Success & Receipt State
  const [createdTicket, setCreatedTicket] = useState<GrievanceTicket | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Trigger AI Triage live as user types description or title
  useEffect(() => {
    const combinedText = `${title} ${description}`;
    const result = runAiTriage(combinedText);
    setAiTriage(result);

    // If AI extracts a specific ward and user hasn't explicitly customized ward yet
    if (result.suggestedWardId && step === 1) {
      setSelectedWardId(result.suggestedWardId);
    }
  }, [title, description]);

  // Web Speech API Handler
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is supported in modern browsers (Chrome/Edge). Please type your complaint.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        if (onShowToast) onShowToast('Listening...', 'Speak your grievance in English or Tamil.', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
        if (!title) {
          setTitle(transcript.slice(0, 60));
        }
        setIsListening(false);
        if (onShowToast) onShowToast('Speech Transcribed', 'AI Triage processed your voice input.', 'success');
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_GRIEVANCES[0]) => {
    setTitle(sample.title);
    setDescription(sample.desc);
    setSelectedWardId(sample.wardId);
    setLandmark(sample.landmark);
    setPhotoUrl(sample.img);
    if (onShowToast) onShowToast('Demo Case Loaded', `Populated ${sample.label}`, 'info');
  };

  const handleNextStep = () => {
    if (step === 3) {
      // Before proceeding to step 4 or submitting, check for duplicates in the ward
      const existing = getTickets();
      const dupCheck = detectDuplicateGrievance(
        description,
        selectedWardId,
        aiTriage.categoryId,
        existing
      );

      if (dupCheck.isDuplicate && dupCheck.matchingTicket) {
        setDuplicateWarning({
          isOpen: true,
          matchingTicket: dupCheck.matchingTicket,
          similarityScore: dupCheck.similarityScore
        });
        return;
      }
    }
    setStep(s => Math.min(4, s + 1));
  };

  const handleFinalSubmit = () => {
    const wardObj = POLLACHI_WARDS.find(w => w.id === selectedWardId) || POLLACHI_WARDS[0];
    const deptObj = POLLACHI_DEPARTMENTS.find(d => d.id === aiTriage.departmentId) || POLLACHI_DEPARTMENTS[0];
    const catObj = deptObj.categories.find(c => c.id === aiTriage.categoryId) || deptObj.categories[0];

    const newTicket = createTicket({
      title: title || `${catObj.name} issue in ${wardObj.name}`,
      description,
      originalLanguage: description.match(/[\u0B80-\u0BFF]/) ? 'ta' : 'en',
      departmentId: deptObj.id,
      categoryId: catObj.id,
      wardId: selectedWardId,
      wardName: wardObj.name,
      landmark: landmark || wardObj.landmarks[0] || 'Pollachi Ward Area',
      citizenName: citizenName || 'Pollachi Citizen',
      citizenPhone: citizenPhone || '98421-00000',
      isAnonymous,
      urgency: aiTriage.urgency,
      slaHoursTotal: catObj.standardSlaHours,
      aiTriage: {
        categoryConfidence: aiTriage.confidenceScore,
        urgencyScore: aiTriage.urgencyScore,
        detectedKeywords: aiTriage.detectedKeywords,
        sentiment: aiTriage.sentiment,
        rationale: aiTriage.rationale
      },
      photoUrl
    });

    setCreatedTicket(newTicket);
    onTicketCreated(newTicket);
    if (onShowToast) onShowToast('Ticket Generated', `Registered ${newTicket.id} with ${catObj.standardSlaHours}h SLA`, 'success');
  };

  // SUCCESS SCREEN
  if (createdTicket) {
    return (
      <div 
        className="card animate-fade-in"
        style={{
          maxWidth: '720px',
          margin: '2rem auto',
          padding: '2.5rem',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid #a7f3d0',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <div 
          style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '50%', 
            background: '#d1fae5', 
            color: '#059669', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)'
          }}
        >
          <CheckCircle2 size={42} />
        </div>

        <span className="badge badge-resolved" style={{ marginBottom: '0.75rem' }}>
          ✓ Grievance Registered Successfully
        </span>

        <h2 style={{ fontSize: '1.9rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
          {createdTicket.id}
        </h2>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Your civic complaint has been registered into the Pollachi Municipal Grievance Registry and prioritized by the AI triage engine.
        </p>

        {/* SMS Simulation Card */}
        <div 
          style={{
            background: 'var(--slate-50)',
            border: '1px dashed var(--slate-300)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--slate-500)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
            <Phone size={13} /> Simulated SMS Confirmation Dispatched to {createdTicket.citizenPhone}
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--slate-800)', fontFamily: 'monospace', lineHeight: 1.5 }}>
            "Dear Citizen, your grievance #{createdTicket.id} ({createdTicket.title.slice(0, 45)}...) for Ward {createdTicket.wardId} has been logged. SLA: {createdTicket.slaHoursTotal} hrs. Track status at namma.pollachi.gov.in - Pollachi Municipality"
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsReceiptOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.25rem' }}
          >
            <Printer size={16} />
            Official Acknowledgment Slip
          </button>

          <button
            onClick={() => onTrackTicket(createdTicket.id)}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <ExternalLink size={18} />
            Track Grievance Live
          </button>

          <button
            onClick={() => {
              setCreatedTicket(null);
              setStep(1);
              setTitle('');
              setDescription('');
            }}
            className="btn btn-secondary"
          >
            Lodge Another
          </button>
        </div>

        {/* Receipt Modal */}
        {isReceiptOpen && (
          <AcknowledgementReceiptModal
            ticket={createdTicket}
            isOpen={isReceiptOpen}
            onClose={() => setIsReceiptOpen(false)}
          />
        )}
      </div>
    );
  }

  const currentWard = POLLACHI_WARDS.find(w => w.id === selectedWardId) || POLLACHI_WARDS[0];

  return (
    <div className="card" style={{ maxWidth: '860px', margin: '1.5rem auto', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
      {/* Wizard Progress Stepper */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1.25rem' }}>
        {[
          { num: 1, label: language === 'ta' ? 'விளக்கம்' : 'Issue Details' },
          { num: 2, label: language === 'ta' ? 'வரைபடம் & வார்டு' : 'City Map & Ward' },
          { num: 3, label: language === 'ta' ? 'புகைப்படம்' : 'Proof & Contact' },
          { num: 4, label: language === 'ta' ? 'உறுதிசெய்க' : 'AI Review & Submit' }
        ].map(s => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step === s.num ? 'var(--primary-700)' : step > s.num ? '#10b981' : 'var(--slate-200)',
                color: step >= s.num ? 'white' : 'var(--slate-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              {step > s.num ? <Check size={16} /> : s.num}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: step === s.num ? 700 : 500, color: step === s.num ? 'var(--slate-900)' : 'var(--slate-500)' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1 AI ASSISTANT PROMINENT CALLOUT */}
      {step === 1 && (
        <div
          data-testid="ai-assistant-card"
          style={{
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={22} color="white" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                AI Smart Complaint Assistant
                <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(255,255,255,0.25)', padding: '0.15rem 0.45rem', borderRadius: '10px' }}>
                  ONE-CLICK INTAKE
                </span>
              </h4>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#d1fae5' }}>
                Describe your grievance in everyday English, தமிழ், or Tanglish. AI automatically drafts, classifies, locates, and checks duplicates.
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="launch-ai-assistant-btn"
            onClick={() => setIsAiAssistantOpen(true)}
            className="btn"
            style={{
              background: 'white',
              color: '#065f46',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Sparkles size={16} color="#059669" /> Launch AI Assistant
          </button>
        </div>
      )}

      {/* Quick Test Samples */}
      {step === 1 && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--slate-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--slate-300)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ⚡ Quick Evaluator Demos (Click to populate realistic Pollachi cases):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {SAMPLE_GRIEVANCES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSample(sample)}
                style={{
                  background: 'white',
                  border: '1px solid var(--slate-300)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: DESCRIPTION & AI TRIAGE */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--slate-800)' }}>
              {language === 'ta' ? 'புகாரின் தலைப்பு' : 'Grievance Headline'} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pipeline burst opposite Subramaniar temple, Mahalingapuram"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-300)',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-800)' }}>
                {language === 'ta' ? 'குறையின் விரிவான விளக்கம் (தமிழ் அல்லது ஆங்கிலம்)' : 'Detailed Description (English, Tamil or Tanglish)'} *
              </label>

              {/* Voice Input Dictation Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: isListening ? '#fee2e2' : '#ecfdf5',
                  color: isListening ? '#dc2626' : '#047857',
                  border: isListening ? '1px solid #fca5a5' : '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  animation: isListening ? 'pulseGlow 1.5s infinite ease' : 'none'
                }}
              >
                {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                {isListening ? 'Listening... Click to Stop' : '🎙️ Speak Issue (Tamil / English)'}
              </button>
            </div>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, exact location details, how long the issue has persisted, and if there is any immediate danger..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-300)',
                fontSize: '0.92rem',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Real-time AI Analysis Card */}
          <AIPreviewCard triage={aiTriage} />
        </div>
      )}

      {/* STEP 2: INTERACTIVE POLLACHI MAP & WARD SELECTOR */}
      {step === 2 && (
        <div className="animate-fade-in">
          {/* Interactive City Map Pinning */}
          <div style={{ marginBottom: '1.5rem' }}>
            <PollachiCityMap
              selectedWardId={selectedWardId}
              onSelectWard={(wardId, lm) => {
                setSelectedWardId(wardId);
                if (lm) setLandmark(lm);
                if (onShowToast) onShowToast('Pinned Location', `Selected Ward ${wardId} (${lm || 'Spot'})`, 'info');
              }}
              interactive={true}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--slate-800)' }}>
                {language === 'ta' ? 'பொள்ளாச்சி நகராட்சி வார்டு' : 'Pollachi Municipal Ward (1 to 36)'} *
              </label>
              <select
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-300)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  background: 'white'
                }}
              >
                {POLLACHI_WARDS.map(w => (
                  <option key={w.id} value={w.id}>
                    Ward {w.wardNumber} - {w.name} [{w.zone} Zone]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--slate-800)' }}>
                {language === 'ta' ? 'முக்கிய அடையாளம் / தெரு பெயர்' : 'Prominent Landmark / Street Name'} *
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Mahalingapuram Welcome Arch, 4th Cross Road"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-300)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Assigned Ward Officer Info Preview */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>
                Designated Field Officer for Ward {currentWard.wardNumber}
              </span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                {currentWard.sanitaryInspector.name} ({currentWard.sanitaryInspector.role})
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                Direct Hotline: {currentWard.sanitaryInspector.phone} • Approx Population: {currentWard.populationApprox.toLocaleString()}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#065f46', background: 'white', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #a7f3d0', fontWeight: 600 }}>
              📍 Coords: {currentWard.latitude.toFixed(4)}°N, {currentWard.longitude.toFixed(4)}°E
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PHOTO & CONTACT */}
      {step === 3 && (
        <div className="animate-fade-in">
          {/* Photo Evidence */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--slate-800)' }}>
              {language === 'ta' ? 'தள புகைப்படம் (Photo Evidence)' : 'Photo Evidence of Civic Issue'}
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <img
                src={photoUrl}
                alt="Civic Issue Proof"
                style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--slate-300)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    Water Leak Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    Garbage Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    Broken Slab Photo
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  📸 Geotag and timestamp will be automatically anchored for field verification.
                </span>
              </div>
            </div>
          </div>

          {/* Citizen Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--slate-800)' }}>
                {language === 'ta' ? 'குடிமகன் பெயர்' : 'Citizen Full Name'} *
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                disabled={isAnonymous}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-300)',
                  background: isAnonymous ? 'var(--slate-100)' : 'white'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--slate-800)' }}>
                {language === 'ta' ? 'கைபேசி எண் (SMS அறிவிப்புக்கு)' : 'Mobile Phone (for SMS updates)'} *
              </label>
              <input
                type="text"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-300)',
                  background: 'white'
                }}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span>{language === 'ta' ? 'பெயர் வெளியிடாமல் மறைமுகமாக சமர்ப்பிக்கவும்' : 'Keep my identity anonymous (Grievance will show as Anonymous Citizen)'}</span>
          </label>
        </div>
      )}

      {/* STEP 4: AI REVIEW & SUBMIT */}
      {step === 4 && (
        <div className="animate-fade-in">
          <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '1rem', color: 'var(--slate-900)' }}>
              Final Grievance Registration Dossier
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Grievance Category</span>
                <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{aiTriage.categoryName}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Location</span>
                <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>Ward {selectedWardId} - {currentWard.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Urgency Score</span>
                <div style={{ fontWeight: 700, color: aiTriage.urgency === 'CRITICAL' ? '#b91c1c' : '#047857' }}>
                  {aiTriage.urgency} ({aiTriage.urgencyScore}/100)
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Committed SLA</span>
                <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
                  Standard SLA: 24 Hours (Ward Team Alerted)
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
              <strong>Description: </strong>{description || title}
            </div>
          </div>

          <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={20} style={{ color: '#059669', flexShrink: 0 }} />
            <div>
              <strong>Pollachi AI Civic Commitment:</strong> Your grievance will be immediately cataloged into the Municipal Commissioner's central queue and assigned to Ward {selectedWardId}'s sanitary inspection unit with real-time audit trail.
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem' }}>
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="btn btn-secondary"
          >
            <ArrowLeft size={16} />
            {t.back}
          </button>
        ) : <div />}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={step === 1 && (!title && !description)}
            className="btn btn-primary"
            style={{ opacity: (step === 1 && (!title && !description)) ? 0.6 : 1 }}
          >
            {t.proceed}
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)', padding: '0.75rem 2rem' }}
          >
            <CheckCircle2 size={18} />
            {t.submit}
          </button>
        )}
      </div>

      {/* Duplicate Warning Dialog */}
      {duplicateWarning.isOpen && duplicateWarning.matchingTicket && (
        <DuplicateWarningModal
          isOpen={duplicateWarning.isOpen}
          matchingTicket={duplicateWarning.matchingTicket}
          similarityScore={duplicateWarning.similarityScore}
          onClose={() => setDuplicateWarning(d => ({ ...d, isOpen: false }))}
          onSubscribeExisting={(ticketId) => {
            setDuplicateWarning(d => ({ ...d, isOpen: false }));
            onTrackTicket(ticketId);
          }}
          onProceedAnyway={() => {
            setDuplicateWarning(d => ({ ...d, isOpen: false }));
            setStep(4);
          }}
          language={language}
        />
      )}

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onTicketCreated={(ticket) => {
          setIsAiAssistantOpen(false);
          setCreatedTicket(ticket);
          onTicketCreated(ticket);
        }}
        onTrackTicket={onTrackTicket}
        language={language}
        onShowToast={onShowToast}
      />
    </div>
  );
};
