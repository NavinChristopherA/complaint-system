import React from 'react';
import { Phone, PhoneCall, AlertTriangle, ShieldAlert, X, HeartPulse, Droplets, Zap, Flame, PawPrint } from 'lucide-react';
import { Language } from '../../utils/translations';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const EMERGENCY_SERVICES = [
  {
    name: 'Pollachi Corporation 24/7 Control Room',
    tamilName: 'மாநகராட்சி 24 மணி நேர கட்டுப்பாட்டு அறை',
    number: '04259-223344',
    alt: '1913 (Toll Free)',
    category: 'Civic Control',
    icon: <PhoneCall size={20} color="#059669" />,
    bg: '#ecfdf5',
    color: '#064e3b'
  },
  {
    name: 'Drinking Water & Pipe Burst Emergency',
    tamilName: 'குடிநீர் குழாய் உடைப்பு அவசர பிரிவு',
    number: '04259-222102',
    alt: 'Direct EE Line',
    category: 'Water Works',
    icon: <Droplets size={20} color="#0284c7" />,
    bg: '#f0f9ff',
    color: '#075985'
  },
  {
    name: 'TANGEDCO Electricity Shock & Live Wire Help',
    tamilName: 'மின்வாரிய அவசர உதவி (மின்கம்பி அறுந்தது)',
    number: '94987-94987',
    alt: '1912 Electricity',
    category: 'Electrical',
    icon: <Zap size={20} color="#eab308" />,
    bg: '#fefce8',
    color: '#854d0e'
  },
  {
    name: 'Pollachi District GH Trauma & Ambulance',
    tamilName: 'பொள்ளாச்சி அரசு தலைமை மருத்துவமனை',
    number: '04259-224422',
    alt: '108 Ambulance',
    category: 'Medical',
    icon: <HeartPulse size={20} color="#dc2626" />,
    bg: '#fef2f2',
    color: '#991b1b'
  },
  {
    name: 'Fire & Disaster Rescue Station',
    tamilName: 'தீயணைப்பு மற்றும் மீட்பு பணிகள்',
    number: '04259-222111',
    alt: '101 Fire',
    category: 'Rescue',
    icon: <Flame size={20} color="#ea580c" />,
    bg: '#fff7ed',
    color: '#9a3412'
  },
  {
    name: 'Stray Dog Bite & Rabies Control Cell',
    tamilName: 'வெறிநாய் கடி & தெரு நாய் அவசர கட்டுப்பாட்டு மையம்',
    number: '04259-222105',
    alt: 'ABC Center',
    category: 'Veterinary',
    icon: <PawPrint size={20} color="#a855f7" />,
    bg: '#faf5ff',
    color: '#6b21a8'
  }
];

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
      className="animate-fade-in"
    >
      <div 
        className="card"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'white',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '2px solid #fca5a5'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.4rem', borderRadius: '8px' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#991b1b', fontWeight: 800 }}>
                {language === 'ta' ? 'பொள்ளாச்சி நகராட்சி அவசர உதவி எண்கள்' : 'Pollachi Municipal 24/7 Emergency Helplines'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Direct priority lines for life hazards, water pipeline bursts, and disaster rescue
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: '0.25rem' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Helplines List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {EMERGENCY_SERVICES.map((srv, idx) => (
            <div
              key={idx}
              style={{
                background: srv.bg,
                border: `1px solid ${srv.color}30`,
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {srv.icon}
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: srv.color }}>
                      {srv.category}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', color: 'var(--slate-600)', fontWeight: 600 }}>
                    {srv.alt}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.92rem', color: 'var(--slate-900)' }}>
                  {srv.name}
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginBottom: '0.85rem' }}>
                  {srv.tamilName}
                </div>
              </div>

              <a
                href={`tel:${srv.number}`}
                className="btn"
                style={{
                  background: srv.color,
                  color: 'white',
                  fontSize: '0.85rem',
                  padding: '0.45rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700
                }}
              >
                <PhoneCall size={14} /> Call {srv.number}
              </a>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
          State Emergency Operations Center (Disaster Helpline): <strong>1077</strong> • National Helpline: <strong>112</strong>
        </div>
      </div>
    </div>
  );
};
