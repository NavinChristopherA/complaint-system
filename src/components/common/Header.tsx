import React from 'react';
import { UserPersona, PRESET_PERSONAS } from '../../types/user';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { 
  Building, 
  Users, 
  ShieldCheck, 
  Globe, 
  RotateCcw, 
  PhoneCall, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  viewMode: 'citizen' | 'admin';
  setViewMode: (mode: 'citizen' | 'admin') => void;
  activePersona: UserPersona;
  setActivePersona: (p: UserPersona) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onResetDemo: () => void;
  onOpenEmergencyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  activePersona,
  setActivePersona,
  language,
  setLanguage,
  onResetDemo,
  onOpenEmergencyModal
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header style={{ borderBottom: '1px solid var(--slate-200)', background: 'white', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' }}>
      {/* Top Civic Strip */}
      <div style={{ background: 'linear-gradient(90deg, #022c22 0%, #064e3b 100%)', color: '#ecfdf5', padding: '0.35rem 0', fontSize: '0.78rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>
              🇮🇳 தமிழ் நாடு அரசு | GOVERNMENT OF TAMIL NADU
            </span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ color: '#6ee7b7' }}>Pollachi Municipal Corporation (பொள்ளாச்சி மாநகராட்சி)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Emergency Hotline Button */}
            <button
              onClick={onOpenEmergencyModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#fef08a',
                background: 'rgba(254, 240, 138, 0.15)',
                border: '1px solid rgba(254, 240, 138, 0.4)',
                borderRadius: 'var(--radius-full)',
                padding: '0.15rem 0.65rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
              title="Click to view 24/7 Municipal Emergency Helplines"
            >
              <PhoneCall size={12} style={{ animation: 'pulseGlow 2s infinite ease' }} />
              <span>{t.emergencyHelpline}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 600
              }}
              title="Toggle English / தமிழ்"
            >
              <Globe size={12} />
              {t.languageToggle}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container" style={{ padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div 
            style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 10px rgba(6, 78, 59, 0.3)',
              fontSize: '1.4rem'
            }}
          >
            🌴
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: 'var(--slate-900)' }}>
                {language === 'ta' ? 'நம்ம பொள்ளாச்சி' : 'Namma Pollachi'}
              </h1>
              <span className="badge badge-ai" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                <Sparkles size={10} /> AI Powered
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 500 }}>
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Portal Switcher (Citizen vs CivicOps Admin) */}
        <div 
          style={{ 
            display: 'flex', 
            background: 'var(--slate-100)', 
            padding: '0.25rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--slate-200)' 
          }}
        >
          <button
            onClick={() => setViewMode('citizen')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: viewMode === 'citizen' ? 'white' : 'transparent',
              color: viewMode === 'citizen' ? 'var(--primary-800)' : 'var(--slate-600)',
              fontWeight: viewMode === 'citizen' ? 700 : 500,
              boxShadow: viewMode === 'citizen' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={16} />
            {t.portalSwitchCitizen}
          </button>

          <button
            onClick={() => setViewMode('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: viewMode === 'admin' ? 'var(--primary-800)' : 'transparent',
              color: viewMode === 'admin' ? 'white' : 'var(--slate-600)',
              fontWeight: viewMode === 'admin' ? 700 : 500,
              boxShadow: viewMode === 'admin' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={16} />
            {t.portalSwitchAdmin}
          </button>
        </div>

        {/* Persona Switcher & Demo Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--slate-50)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '1.1rem' }}>{activePersona.avatar}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                {t.persona}
              </span>
              <select
                value={activePersona.id}
                onChange={(e) => {
                  const selected = PRESET_PERSONAS.find(p => p.id === e.target.value);
                  if (selected) {
                    setActivePersona(selected);
                    if (selected.role !== 'CITIZEN' && viewMode === 'citizen') {
                      setViewMode('admin');
                    } else if (selected.role === 'CITIZEN' && viewMode === 'admin') {
                      setViewMode('citizen');
                    }
                  }
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: 'var(--slate-800)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {PRESET_PERSONAS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onResetDemo}
            title={t.resetDemo}
            style={{
              background: 'transparent',
              border: '1px solid var(--slate-300)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem',
              color: 'var(--slate-600)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
