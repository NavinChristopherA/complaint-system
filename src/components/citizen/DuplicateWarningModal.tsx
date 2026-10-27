import React from 'react';
import { GrievanceTicket } from '../../types/grievance';
import { AlertCircle, Link2, PlusCircle, CheckCircle2, MapPin, Clock } from 'lucide-react';
import { Language, TRANSLATIONS } from '../../utils/translations';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchingTicket: GrievanceTicket;
  similarityScore: number;
  onSubscribeExisting: (ticketId: string) => void;
  onProceedAnyway: () => void;
  language: Language;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  onClose,
  matchingTicket,
  similarityScore,
  onSubscribeExisting,
  onProceedAnyway,
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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '1rem'
      }}
      className="animate-fade-in"
    >
      <div 
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid #fed7aa',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div 
            style={{ 
              background: '#ffedd5', 
              color: '#c2410c', 
              padding: '0.65rem', 
              borderRadius: '12px',
              display: 'flex' 
            }}
          >
            <AlertCircle size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#9a3412', fontWeight: 800 }}>
              {language === 'ta' ? 'இதேபோன்ற புகார் ஏற்கனவே பதிவாகியுள்ளது!' : 'Active Duplicate Grievance Detected!'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#c2410c', fontWeight: 600 }}>
              AI Spatial Match: {similarityScore}% Match in {matchingTicket.wardName}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          {language === 'ta'
            ? 'நீங்கள் குறிப்பிடும் பகுதியில் இதேபோன்ற குறை ஏற்கனவே பதிவு செய்யப்பட்டு, கள அதிகாரிகள் ஆய்வில் உள்ளனர். நகராட்சி வளங்களை மிச்சப்படுத்த ஏற்கனவே உள்ள புகாரோடு உங்கள் எண்ணை இணைக்கலாம்.'
            : 'Another citizen has already lodged a verified grievance for this exact problem at this location. Our field team is actively assigned to resolve it.'}
        </p>

        {/* Existing Ticket Summary Card */}
        <div 
          style={{
            background: 'var(--slate-50)',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-800)' }}>
              {matchingTicket.id}
            </span>
            <span className="badge badge-progress" style={{ fontSize: '0.7rem' }}>
              {matchingTicket.status.replace('_', ' ')}
            </span>
          </div>

          <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.4rem 0', color: 'var(--slate-900)' }}>
            {matchingTicket.title}
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
            <MapPin size={13} style={{ color: '#ea580c' }} />
            <span>{matchingTicket.landmark} ({matchingTicket.wardName})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
            <Clock size={13} />
            <span>Reported {new Date(matchingTicket.createdAt).toLocaleDateString()} • Assigned Officer: {matchingTicket.assignedOfficer?.name || 'In Triage'}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => onSubscribeExisting(matchingTicket.id)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <Link2 size={18} />
            {language === 'ta' ? 'இந்த புகாருடன் என்னை இணைக்கவும் (பரிந்துரைக்கப்படுகிறது)' : 'Link Me to Existing Complaint (Recommended)'}
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onProceedAnyway}
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: '0.85rem' }}
            >
              <PlusCircle size={16} />
              {language === 'ta' ? 'புதிய புகாராக தொடர்க' : 'Submit as Separate Issue'}
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              {language === 'ta' ? 'ரத்து' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
