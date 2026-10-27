import React from 'react';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { POLLACHI_DEPARTMENTS } from '../../data/departments';
import { getTickets } from '../../services/storageService';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  Droplets,
  Trash2,
  Construction,
  Lightbulb,
  PawPrint,
  Trees,
  Building2,
  Receipt,
  PhoneCall,
  MapPin
} from 'lucide-react';

interface CitizenHomeProps {
  language: Language;
  onNavigate: (tab: 'wizard' | 'tracker' | 'wards') => void;
  onSelectDepartmentCategory?: (deptId: string, catId: string) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({ language, onNavigate }) => {
  const t = TRANSLATIONS[language];
  const allTickets = getTickets();

  const activeCount = allTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'REJECTED').length;
  const resolvedCount = allTickets.filter(t => t.status === 'RESOLVED').length;

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplets size={22} />;
      case 'Trash2': return <Trash2 size={22} />;
      case 'Construction': return <Construction size={22} />;
      case 'Lightbulb': return <Lightbulb size={22} />;
      case 'PawPrint': return <PawPrint size={22} />;
      case 'Trees': return <Trees size={22} />;
      case 'Building2': return <Building2 size={22} />;
      case 'Receipt': return <Receipt size={22} />;
      default: return <Sparkles size={22} />;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section 
        style={{ 
          background: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #047857 100%)',
          color: 'white',
          padding: '4.5rem 0 3.5rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Decorative Circles */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '820px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              <Sparkles size={14} style={{ color: '#6ee7b7' }} />
              <span>Pollachi Municipal Grievance Redressal • Wards 1 to 36</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, color: '#f0fdf4', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              {t.heroHeading}
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#a7f3d0', lineHeight: 1.6, marginBottom: '2.25rem', maxWidth: '720px' }}>
              {t.heroSubheading}
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button 
                onClick={() => onNavigate('wizard')}
                className="btn"
                style={{ 
                  background: '#ffffff', 
                  color: '#064e3b', 
                  fontSize: '1rem', 
                  padding: '0.85rem 1.75rem', 
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                  fontWeight: 700
                }}
              >
                <Sparkles size={18} style={{ color: '#059669' }} />
                {t.lodgeGrievanceBtn}
                <ArrowRight size={18} />
              </button>

              <button 
                onClick={() => onNavigate('tracker')}
                className="btn"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.15)', 
                  color: 'white', 
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  fontSize: '1rem', 
                  padding: '0.85rem 1.5rem', 
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Search size={18} />
                {t.trackTicketBtn}
              </button>

              <button 
                onClick={() => onNavigate('wards')}
                className="btn"
                style={{ 
                  background: 'transparent', 
                  color: '#d1fae5', 
                  fontSize: '0.95rem', 
                  padding: '0.85rem 1.25rem', 
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600
                }}
              >
                <MapPin size={18} />
                {t.navWards}
              </button>
            </div>

            {/* Quick Municipal Statistics Pill Row */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                background: 'rgba(2, 44, 34, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem'
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  {t.quickStatsActive}
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                  {activeCount}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  {t.quickStatsResolved}
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                  {1420 + resolvedCount}+
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  {t.quickStatsSla}
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fef08a' }}>
                  96.8%
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  {t.quickStatsAvgTime}
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                  21.4 hrs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Municipal Departments Taxonomy Grid */}
      <section className="container" style={{ padding: '3.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-ai" style={{ marginBottom: '0.5rem' }}>
            Pollachi Civic Services
          </span>
          <h2 style={{ fontSize: '1.9rem', color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
            {language === 'ta' ? 'அனைத்து வகை நகராட்சி குறைதீர்ப்பு சேவைகள்' : 'Select a Municipal Service Category'}
          </h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem' }}>
            Click on any category to launch the AI Grievance Assistant pre-configured for that department.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {POLLACHI_DEPARTMENTS.map(dept => (
            <div 
              key={dept.id}
              className="card"
              onClick={() => onNavigate('wizard')}
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-xl)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${dept.colorHex}`
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div 
                    style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '12px', 
                      background: `${dept.colorHex}15`, 
                      color: dept.colorHex,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getDeptIcon(dept.iconName)}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase' }}>
                    {dept.categories.length} Sub-categories
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.35rem 0', color: 'var(--slate-900)' }}>
                  {language === 'ta' ? dept.tamilName : dept.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {dept.description}
                </p>

                {/* Subcategories preview tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                  {dept.categories.map(c => (
                    <span 
                      key={c.id} 
                      style={{ 
                        fontSize: '0.7rem', 
                        background: 'var(--slate-100)', 
                        color: 'var(--slate-700)', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        fontWeight: 500
                      }}
                    >
                      {c.name.split('/')[0].trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                <span>File Complaint</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Smart Triage How-It-Works Feature Banner */}
      <section style={{ background: '#f0fdf4', borderTop: '1px solid #bbf7d0', borderBottom: '1px solid #bbf7d0', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-ai" style={{ marginBottom: '0.75rem' }}>
                Next-Gen Civic AI Engine
              </span>
              <h2 style={{ fontSize: '1.75rem', color: '#064e3b', marginBottom: '0.75rem' }}>
                How Pollachi's AI Ensures Transparent Redressal
              </h2>
              <p style={{ color: 'var(--slate-700)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Unlike static web forms, this portal integrates continuous natural language understanding, spatial deduplication, and automated SLA escalation to safeguard citizen interests.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ background: '#d1fae5', color: '#047857', padding: '0.35rem', borderRadius: '6px' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)' }}>Bilingual Keyword Classifier:</strong>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--slate-600)' }}>Understands pure Tamil, English, and Tanglish phrases to accurately tag the municipal department.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ background: '#d1fae5', color: '#047857', padding: '0.35rem', borderRadius: '6px' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)' }}>Spatial Duplicate Preventer:</strong>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--slate-600)' }}>Detects when neighbors in the same ward report the same issue, pooling subscribers instead of spamming field staff.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ background: '#d1fae5', color: '#047857', padding: '0.35rem', borderRadius: '6px' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)' }}>Automated SLA Escalation Watchdog:</strong>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--slate-600)' }}>Breached deadlines automatically escalate up the hierarchy to Junior Engineer, Executive Engineer, and Commissioner.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Simulation Graphic */}
            <div 
              style={{ 
                background: 'white', 
                borderRadius: 'var(--radius-xl)', 
                padding: '1.75rem', 
                border: '1px solid #a7f3d0', 
                boxShadow: 'var(--shadow-lg)' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#064e3b' }}>
                  AI Triage Simulation in Action
                </span>
                <span className="badge badge-ai" style={{ fontSize: '0.68rem' }}>
                  100% Client-Side Ready
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.85rem', fontSize: '0.82rem', fontFamily: 'monospace', color: '#334155', border: '1px solid #e2e8f0' }}>
                "Water pipeline burst near Mahalingapuram arch, road flooded"
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857', fontWeight: 600 }}>
                  <span>✓ Department: Water Supply & Sewerage</span>
                  <span>98% Match</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c', fontWeight: 600 }}>
                  <span>⚠️ Urgency: CRITICAL (Score 92/100)</span>
                  <span>SLA: 18h</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ea580c', fontWeight: 600 }}>
                  <span>📍 Extracted Ward: Ward 14 (Mahalingapuram)</span>
                  <span>Field Staff Auto-Targeted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
