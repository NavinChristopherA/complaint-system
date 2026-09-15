import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Search,
  MapPin,
  Camera,
  Upload,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Navigation,
  Edit3,
  Shield,
  ArrowRight,
  FileText,
  Eye,
  Info,
  Loader2,
} from 'lucide-react';
import { analyzeComplaint, checkDuplicates, findNearestWard } from '../../services/aiAssistantService';
import { createTicket, getTickets } from '../../services/storageService';
import { POLLACHI_DEPARTMENTS } from '../../data/departments';
import { POLLACHI_WARDS } from '../../data/pollachiWards';
import { StatusBadge } from '../common/StatusBadge';
import { GrievanceTicket, UrgencyLevel } from '../../types/grievance';
import { AIComplaintAnalysis, LocationData, EvidenceItem, DuplicateMatch } from '../../types/aiAssistant';
import { Language } from '../../utils/translations';

type AssistantStep = 'input' | 'analysis' | 'location' | 'evidence' | 'duplicates' | 'review';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticket: GrievanceTicket) => void;
  onTrackTicket: (ticketId: string) => void;
  language: Language;
  onShowToast?: (title: string, msg: string, type?: 'success' | 'warning' | 'info' | 'critical') => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
  onTrackTicket,
  language,
  onShowToast,
}) => {
  // ─── State ────────────────────────────────────────────────
  const [step, setStep] = useState<AssistantStep>('input');
  const [rawText, setRawText] = useState('');
  const [analysis, setAnalysis] = useState<AIComplaintAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  // Location
  const [location, setLocation] = useState<LocationData | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Evidence
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Duplicates
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [dupChecked, setDupChecked] = useState(false);

  // Review edits
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editWardId, setEditWardId] = useState<number>(14);
  const [editLandmark, setEditLandmark] = useState('');
  const [citizenName, setCitizenName] = useState('Karthik Subburam');
  const [citizenPhone, setCitizenPhone] = useState('98421-54321');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Submission
  const [createdTicket, setCreatedTicket] = useState<GrievanceTicket | null>(null);

  if (!isOpen) return null;

  // ─── Handlers ─────────────────────────────────────────────

  const handleAnalyze = () => {
    if (!rawText.trim() || rawText.trim().length < 10) {
      setAnalyzeError('Please describe the civic problem in at least a few words so AI can classify it accurately.');
      return;
    }
    setAnalyzeError('');
    setIsAnalyzing(true);

    // Simulate async processing (deterministic, no real API)
    setTimeout(() => {
      try {
        const result = analyzeComplaint(rawText);
        setAnalysis(result);
        setEditTitle(result.suggestedTitle);
        setEditDescription(result.structuredDescription);
        if (result.suggestedWardId) {
          setEditWardId(result.suggestedWardId);
        }
        setStep('analysis');
      } catch {
        setAnalyzeError("We couldn't analyze the complaint right now. You can continue by entering the details manually.");
      } finally {
        setIsAnalyzing(false);
      }
    }, 1200);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please enter location manually.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearestWardId = findNearestWard(latitude, longitude);
        const ward = POLLACHI_WARDS.find(w => w.id === nearestWardId);
        setLocation({
          latitude,
          longitude,
          readableAddress: ward ? `Near ${ward.name}, Pollachi` : `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
          source: 'gps',
        });
        setEditWardId(nearestWardId);
        setGeoLoading(false);
        if (onShowToast) onShowToast('Location Captured', `GPS coordinates acquired — mapped to Ward ${nearestWardId}`, 'success');
      },
      () => {
        setGeoError('Location permission denied. Please enter the location manually.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleManualLocation = () => {
    if (!manualAddress.trim()) return;
    const ward = POLLACHI_WARDS.find(w => w.id === editWardId) || POLLACHI_WARDS[0];
    setLocation({
      latitude: ward.latitude,
      longitude: ward.longitude,
      readableAddress: manualAddress.trim(),
      source: 'manual',
    });
    setEditLandmark(manualAddress.trim());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onShowToast) onShowToast('Invalid File', 'Please upload an image file (JPG, PNG, etc.).', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (onShowToast) onShowToast('File Too Large', 'Image must be under 5 MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newEvidence: EvidenceItem = {
        id: `ev-${Date.now()}`,
        dataUrl: reader.result as string,
        fileName: file.name,
        note: 'Image uploaded for municipal review.',
      };
      setEvidence(prev => [...prev, newEvidence]);
    };
    reader.onerror = () => {
      if (onShowToast) onShowToast('Upload Failed', 'Could not read the image file. Please try again.', 'warning');
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleCheckDuplicates = () => {
    if (!analysis) return;
    const matches = checkDuplicates(rawText, editWardId, analysis.categoryId);
    setDuplicates(matches);
    setDupChecked(true);
  };

  const handleSubmit = () => {
    if (!analysis) return;

    const ward = POLLACHI_WARDS.find(w => w.id === editWardId) || POLLACHI_WARDS[0];
    const dept = POLLACHI_DEPARTMENTS.find(d => d.id === analysis.departmentId) || POLLACHI_DEPARTMENTS[0];
    const cat = dept.categories.find(c => c.id === analysis.categoryId) || dept.categories[0];

    const newTicket = createTicket({
      title: editTitle || analysis.suggestedTitle,
      description: editDescription || analysis.structuredDescription,
      originalLanguage: rawText.match(/[\u0B80-\u0BFF]/) ? 'ta' : 'en',
      departmentId: dept.id,
      categoryId: cat.id,
      wardId: editWardId,
      wardName: ward.name,
      landmark: editLandmark || location?.readableAddress || ward.landmarks[0] || 'Pollachi Ward Area',
      latitude: location?.latitude,
      longitude: location?.longitude,
      citizenName: isAnonymous ? 'Anonymous Citizen' : (citizenName || 'Pollachi Citizen'),
      citizenPhone: citizenPhone || '98421-00000',
      isAnonymous,
      urgency: analysis.priority,
      slaHoursTotal: cat.standardSlaHours,
      aiTriage: {
        categoryConfidence: analysis.confidence,
        urgencyScore: analysis.urgencyScore,
        detectedKeywords: analysis.detectedKeywords,
        sentiment: analysis.sentiment,
        rationale: analysis.explanation,
      },
      photoUrl: evidence.length > 0 ? evidence[0].dataUrl : undefined,
    });

    setCreatedTicket(newTicket);
    onTicketCreated(newTicket);
    if (onShowToast) onShowToast('Complaint Registered', `AI-assisted complaint ${newTicket.id} created successfully.`, 'success');
  };

  const handleGoToStep = (s: AssistantStep) => setStep(s);

  const priorityColor = (p: UrgencyLevel) => {
    switch (p) {
      case 'CRITICAL': return '#b91c1c';
      case 'HIGH': return '#c2410c';
      case 'MEDIUM': return '#b45309';
      case 'LOW': return '#475569';
    }
  };

  const confidencePercent = analysis ? Math.round(analysis.confidence * 100) : 0;

  // ─── SUCCESS SCREEN ───────────────────────────────────────

  if (createdTicket) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Complaint Created Successfully">
          <div style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#d1fae5', color: '#059669',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)'
            }}>
              <CheckCircle2 size={42} />
            </div>

            <span className="badge badge-resolved" style={{ marginBottom: '0.75rem' }}>
              ✓ AI-Assisted Complaint Registered
            </span>

            <h2 style={{ fontSize: '1.8rem', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
              {createdTicket.id}
            </h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              Your complaint has been registered with AI-assisted classification.
              Municipal staff will verify and process it through the official workflow.
            </p>

            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)', padding: '0.75rem',
              fontSize: '0.8rem', color: '#92400e', marginBottom: '1.5rem'
            }}>
              <Shield size={14} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
              AI recommendation — municipal verification required.
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => { onTrackTicket(createdTicket.id); onClose(); }}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Track Complaint Live
              </button>
              <button onClick={onClose} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ──────────────────────────────────────────

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="AI Smart Complaint Assistant">
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--slate-200)',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: 'white', padding: '0.4rem', borderRadius: '10px', display: 'flex'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-950)' }}>
                AI Smart Complaint Assistant
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary-700)', fontWeight: 500 }}>
                  Describe the problem. AI structures the complaint for you.
                </span>
                <span className="badge badge-ai" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>
                  AI Prototype Mode
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close AI Assistant"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)', padding: '0.35rem' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{
          display: 'flex', gap: '0', overflowX: 'auto',
          borderBottom: '1px solid var(--slate-200)',
          background: 'white',
          padding: '0'
        }}>
          {([
            { key: 'input', label: 'Describe', num: 1 },
            { key: 'analysis', label: 'AI Analysis', num: 2 },
            { key: 'location', label: 'Location', num: 3 },
            { key: 'evidence', label: 'Evidence', num: 4 },
            { key: 'duplicates', label: 'Duplicates', num: 5 },
            { key: 'review', label: 'Review', num: 6 },
          ] as { key: AssistantStep; label: string; num: number }[]).map(s => {
            const stepOrder: AssistantStep[] = ['input', 'analysis', 'location', 'evidence', 'duplicates', 'review'];
            const currentIdx = stepOrder.indexOf(step);
            const thisIdx = stepOrder.indexOf(s.key);
            const isActive = step === s.key;
            const isDone = thisIdx < currentIdx;
            const isClickable = isDone || (s.key === 'analysis' && analysis !== null);

            return (
              <button
                key={s.key}
                onClick={() => isClickable ? handleGoToStep(s.key) : undefined}
                style={{
                  flex: 1, padding: '0.6rem 0.5rem',
                  background: 'none', border: 'none',
                  borderBottom: isActive ? '3px solid var(--primary-700)' : '3px solid transparent',
                  color: isActive ? 'var(--primary-800)' : isDone ? '#059669' : 'var(--slate-400)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.72rem',
                  cursor: isClickable ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: isActive ? 'var(--primary-700)' : isDone ? '#10b981' : 'var(--slate-200)',
                  color: isActive || isDone ? 'white' : 'var(--slate-500)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.62rem', fontWeight: 700, flexShrink: 0
                }}>
                  {isDone ? '✓' : s.num}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(85vh - 160px)' }}>

          {/* ── STEP 1: INPUT ─────────────────────────────── */}
          {step === 'input' && (
            <div className="animate-fade-in">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
                {language === 'ta' ? 'உங்கள் குறையை விவரிக்கவும்' : 'Describe Your Civic Problem'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
                Write in English, Tamil, or Tanglish. You don't need to know the complaint category — AI will classify it.
              </p>

              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => { setRawText(e.target.value); setAnalyzeError(''); }}
                placeholder="Example: There is a large pothole near the bus stand and vehicles are struggling to pass safely."
                aria-label="Describe your civic complaint"
                style={{
                  width: '100%', padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: analyzeError ? '1.5px solid #ef4444' : '1.5px solid var(--slate-300)',
                  fontSize: '0.95rem', outline: 'none',
                  fontFamily: 'inherit', resize: 'vertical',
                  minHeight: '120px',
                  transition: 'border-color 0.2s ease'
                }}
              />

              {analyzeError && (
                <p style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertTriangle size={14} /> {analyzeError}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !rawText.trim()}
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    opacity: isAnalyzing || !rawText.trim() ? 0.6 : 1
                  }}
                >
                  {isAnalyzing ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
                  ) : (
                    <><Search size={16} /> Analyze Complaint</>
                  )}
                </button>
              </div>

              {/* Quick demo examples */}
              <div style={{
                marginTop: '1.25rem', padding: '0.85rem',
                background: 'var(--slate-50)', border: '1px dashed var(--slate-300)',
                borderRadius: 'var(--radius-md)'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  ⚡ Quick Demo Examples (click to populate):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {[
                    { label: '🕳️ Pothole', text: 'There is a huge pothole near the bus stand and bikes are falling. Very dangerous for two-wheelers especially at night.' },
                    { label: '💧 Pipe Burst', text: 'Drinking water pipeline burst near Mahalingapuram arch. Water gushing on road for 4 hours. Urgent repair needed.' },
                    { label: '🗑️ Garbage', text: 'Rotten vegetable waste behind Uzhavar Sandhai on Market Road. Severe foul stench and flies breeding. Not cleared for 3 days.' },
                    { label: '⚡ Dark Street', text: '3 LED streetlights not working on Venkatesa Colony 2nd Cross. Complete darkness at night causing safety issues.' },
                    { label: '🇮🇳 Tamil', text: 'காந்தி சிலை ரவுண்டானா அருகே சாக்கடை பலகை உடைந்து பாதசாரிகள் விழும் அபாயம் ஏற்பட்டுள்ளது' },
                  ].map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRawText(ex.text)}
                      style={{
                        background: 'white', border: '1px solid var(--slate-300)',
                        borderRadius: '6px', padding: '0.3rem 0.55rem',
                        fontSize: '0.75rem', fontWeight: 600,
                        color: 'var(--slate-700)', cursor: 'pointer'
                      }}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: ANALYSIS RESULT ───────────────────── */}
          {step === 'analysis' && analysis && (
            <div className="animate-fade-in">
              {/* AI result card */}
              <div style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
                border: '1.5px solid #a7f3d0',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--primary-950)' }}>
                    AI Complaint Classification
                  </h4>
                  <span className="badge badge-ai" style={{ fontSize: '0.65rem' }}>AI Prototype Mode</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  <InfoField label="Category" value={analysis.category} />
                  <InfoField label="Sub-category" value={analysis.subCategory} />
                  <div style={{ background: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                      AI-Suggested Priority
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <StatusBadge urgency={analysis.priority} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: priorityColor(analysis.priority) }}>
                        Score: {analysis.urgencyScore}/100
                      </span>
                    </div>
                  </div>
                  <InfoField label="Department" value={analysis.departmentName} />
                </div>

                {/* Title & Description */}
                <div style={{ background: 'white', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Suggested Title</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>{analysis.suggestedTitle}</div>
                </div>

                <div style={{ background: 'white', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Structured Description</span>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'var(--slate-700)', lineHeight: 1.5 }}>
                    {analysis.structuredDescription}
                  </p>
                </div>

                {/* Confidence */}
                <div style={{ background: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>AI Confidence (estimate)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                    <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${confidencePercent}%`, height: '100%',
                        background: confidencePercent >= 80 ? 'linear-gradient(90deg, #10b981, #047857)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: confidencePercent >= 80 ? '#047857' : '#b45309' }}>
                      {confidencePercent}%
                    </span>
                  </div>
                </div>

                {/* Keywords */}
                {analysis.detectedKeywords.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>Key Tokens:</span>
                    {analysis.detectedKeywords.map((kw, i) => (
                      <span key={i} style={{
                        background: '#e0f2fe', color: '#0369a1',
                        fontSize: '0.7rem', padding: '0.15rem 0.4rem',
                        borderRadius: '4px', fontWeight: 600
                      }}>#{kw}</span>
                    ))}
                  </div>
                )}

                {/* Suggested Action */}
                <div style={{ background: '#ecfdf5', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid #10b981', fontSize: '0.8rem', color: '#065f46', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  <strong>Suggested Action: </strong>{analysis.suggestedAction}
                </div>

                {/* Expandable Explanation */}
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-700)',
                    padding: '0.25rem 0'
                  }}
                >
                  <Info size={14} />
                  Why did AI classify this complaint?
                  {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showExplanation && (
                  <div style={{
                    background: 'white', border: '1px solid var(--slate-200)',
                    borderRadius: '8px', padding: '0.75rem',
                    fontSize: '0.82rem', color: 'var(--slate-700)',
                    lineHeight: 1.5, marginTop: '0.35rem'
                  }}>
                    {analysis.explanation}
                    <p style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '0.5rem', marginBottom: 0 }}>
                      This is a prototype keyword-based classifier, not a production ML model.
                    </p>
                  </div>
                )}
              </div>

              {/* Priority disclaimer */}
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem',
                fontSize: '0.78rem', color: '#92400e',
                display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'
              }}>
                <Shield size={14} style={{ flexShrink: 0 }} />
                Final priority subject to municipal verification. AI recommendation only.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setStep('location')} className="btn btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: LOCATION ──────────────────────────── */}
          {step === 'location' && (
            <div className="animate-fade-in">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
                Complaint Location
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
                Help us identify the exact area of the problem.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleUseMyLocation}
                  disabled={geoLoading}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {geoLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Navigation size={16} />}
                  Use My Location
                </button>
              </div>

              {geoError && (
                <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertTriangle size={14} /> {geoError}
                </p>
              )}

              {/* Manual entry */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--slate-800)' }}>
                  Or Enter Location Manually
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="e.g. Near Pollachi Bus Stand, Main Road"
                    aria-label="Enter location manually"
                    style={{
                      flex: 1, padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--slate-300)',
                      fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                  <button onClick={handleManualLocation} className="btn btn-secondary" disabled={!manualAddress.trim()}>
                    <MapPin size={16} /> Set
                  </button>
                </div>
              </div>

              {/* Ward selector */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--slate-800)' }}>
                  Municipal Ward
                </label>
                <select
                  value={editWardId}
                  onChange={(e) => setEditWardId(Number(e.target.value))}
                  aria-label="Select ward"
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-300)',
                    fontSize: '0.9rem', outline: 'none', background: 'white'
                  }}
                >
                  {POLLACHI_WARDS.map(w => (
                    <option key={w.id} value={w.id}>Ward {w.wardNumber} - {w.name} [{w.zone} Zone]</option>
                  ))}
                </select>
              </div>

              {/* Location result */}
              {location && (
                <div style={{
                  background: '#ecfdf5', border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                    <CheckCircle2 size={16} style={{ color: '#059669' }} />
                    <strong style={{ fontSize: '0.85rem', color: '#065f46' }}>Location Captured</strong>
                    <span style={{ fontSize: '0.72rem', color: '#047857', background: '#d1fae5', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                      {location.source === 'gps' ? 'GPS' : 'Manual'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#065f46' }}>
                    <div><strong>Address:</strong> {location.readableAddress}</div>
                    <div><strong>Coordinates:</strong> {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E</div>
                  </div>
                </div>
              )}

              {/* Privacy note */}
              <p style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
                <Shield size={11} /> Location is used only to help identify the complaint area. No continuous tracking.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('analysis')} className="btn btn-secondary">Back</button>
                <button onClick={() => setStep('evidence')} className="btn btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: EVIDENCE ──────────────────────────── */}
          {step === 'evidence' && (
            <div className="animate-fade-in">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
                Upload Photo Evidence (Optional)
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
                Attach a photograph to help municipal staff understand the issue.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--slate-300)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  transition: 'border-color 0.2s ease'
                }}
                role="button"
                aria-label="Click to upload photo evidence"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              >
                <Upload size={32} style={{ color: 'var(--slate-400)', marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--slate-700)', fontSize: '0.9rem' }}>
                  Click to upload or drag an image
                </p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  JPG, PNG — max 5 MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                aria-label="Upload photo evidence"
              />

              {/* Thumbnails */}
              {evidence.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {evidence.map(ev => (
                    <div key={ev.id} style={{ position: 'relative' }}>
                      <img
                        src={ev.dataUrl}
                        alt={ev.fileName}
                        style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--slate-300)' }}
                      />
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-600)', marginTop: '0.2rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.fileName}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>
                        {ev.note}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('location')} className="btn btn-secondary">Back</button>
                <button onClick={() => { handleCheckDuplicates(); setStep('duplicates'); }} className="btn btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: DUPLICATES ────────────────────────── */}
          {step === 'duplicates' && (
            <div className="animate-fade-in">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
                Possible Similar Complaints
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
                Checking existing complaints in the system to avoid duplicates.
              </p>

              {!dupChecked ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                  <p>Checking for similar complaints...</p>
                </div>
              ) : duplicates.length > 0 ? (
                <>
                  {duplicates.map(dup => (
                    <div
                      key={dup.ticketId}
                      style={{
                        background: '#fffbeb', border: '1.5px solid #fde68a',
                        borderRadius: 'var(--radius-md)', padding: '1rem',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        <AlertTriangle size={16} style={{ color: '#b45309' }} />
                        <strong style={{ color: '#92400e', fontSize: '0.9rem' }}>Similar complaint found</strong>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
                        <strong>Complaint ID:</strong> {dup.ticketId}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                        <strong>Title:</strong> {dup.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>
                        <strong>Location:</strong> {dup.wardName} • <strong>Status:</strong> <StatusBadge status={dup.status} />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '0.35rem' }}>
                        Similarity: {dup.similarityScore}% — {dup.message}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button
                          onClick={() => { onTrackTicket(dup.ticketId); onClose(); }}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                        >
                          <Eye size={14} /> View Existing Complaint
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{
                  background: '#ecfdf5', border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)', padding: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <CheckCircle2 size={18} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '0.88rem', color: '#065f46', fontWeight: 600 }}>
                    No similar complaint detected. You may proceed.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button onClick={() => setStep('evidence')} className="btn btn-secondary">Back</button>
                <button onClick={() => setStep('review')} className="btn btn-primary">
                  {duplicates.length > 0 ? 'Continue as New Complaint' : 'Continue'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 6: REVIEW & SUBMIT ───────────────────── */}
          {step === 'review' && analysis && (
            <div className="animate-fade-in">
              <div style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
                border: '1.5px solid #a7f3d0',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #d1fae5' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-950)' }}>
                    AI-Generated Complaint Summary
                  </h4>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
                  >
                    <Edit3 size={13} /> {editMode ? 'Done Editing' : 'Edit Details'}
                  </button>
                </div>

                {editMode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase' }}>Title</label>
                      <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} aria-label="Edit complaint title"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--slate-300)', fontSize: '0.9rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase' }}>Description</label>
                      <textarea rows={3} value={editDescription} onChange={e => setEditDescription(e.target.value)} aria-label="Edit complaint description"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--slate-300)', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase' }}>Landmark</label>
                      <input type="text" value={editLandmark} onChange={e => setEditLandmark(e.target.value)} placeholder="Nearest landmark" aria-label="Edit landmark"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--slate-300)', fontSize: '0.9rem' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase' }}>Citizen Name</label>
                        <input type="text" value={citizenName} onChange={e => setCitizenName(e.target.value)} disabled={isAnonymous} aria-label="Citizen name"
                          style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--slate-300)', fontSize: '0.9rem', background: isAnonymous ? 'var(--slate-100)' : 'white' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase' }}>Mobile Phone</label>
                        <input type="text" value={citizenPhone} onChange={e => setCitizenPhone(e.target.value)} aria-label="Citizen phone"
                          style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--slate-300)', fontSize: '0.9rem' }} />
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--slate-700)' }}>
                      <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                      Keep my identity anonymous
                    </label>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <InfoField label="Title" value={editTitle || analysis.suggestedTitle} />
                    <InfoField label="Category" value={analysis.category} />
                    <div style={{ background: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Priority</span>
                      <StatusBadge urgency={analysis.priority} />
                    </div>
                    <InfoField label="Department" value={analysis.departmentName} />
                    <InfoField label="Location" value={location?.readableAddress || `Ward ${editWardId}, Pollachi`} />
                    <InfoField label="Evidence" value={evidence.length > 0 ? `${evidence.length} Photo(s)` : 'None'} />
                    <InfoField label="AI Confidence (estimate)" value={`${confidencePercent}%`} />
                    <InfoField label="Citizen" value={isAnonymous ? 'Anonymous' : citizenName} />

                    {/* Full description */}
                    <div style={{ gridColumn: '1 / -1', background: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Description</span>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem', color: 'var(--slate-700)', lineHeight: 1.5 }}>
                        {editDescription || analysis.structuredDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Human-in-the-loop disclaimer */}
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem',
                fontSize: '0.78rem', color: '#92400e',
                display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'
              }}>
                <Shield size={14} style={{ flexShrink: 0 }} />
                AI recommendation — municipal verification required. Final decisions are made by authorized municipal staff.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep('duplicates')} className="btn btn-secondary">Back</button>
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)', padding: '0.75rem 2rem' }}
                >
                  <CheckCircle2 size={18} /> Submit Complaint
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Helper components ────────────────────────────────────────

const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
    <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)' }}>{value}</span>
  </div>
);

// ─── Styles ───────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '1rem',
};

const modalStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 'var(--radius-xl)',
  width: '100%',
  maxWidth: '780px',
  maxHeight: '90vh',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};
