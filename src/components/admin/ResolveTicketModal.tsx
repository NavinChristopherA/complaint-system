import React, { useState } from 'react';
import { GrievanceTicket } from '../../types/grievance';
import { updateTicketStatus } from '../../services/storageService';
import { UserPersona } from '../../types/user';
import { CheckCircle2, Camera, X, Check, ShieldCheck } from 'lucide-react';

interface ResolveTicketModalProps {
  ticket: GrievanceTicket;
  isOpen: boolean;
  onClose: () => void;
  onResolved: (updated: GrievanceTicket) => void;
  activePersona: UserPersona;
}

export const ResolveTicketModal: React.FC<ResolveTicketModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onResolved,
  activePersona
}) => {
  if (!isOpen) return null;

  const [remarks, setRemarks] = useState(
    'Field repairs successfully executed. Defect rectified, site cleaned, and restored to standard municipal operating condition.'
  );
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80'
  );
  const [verifiedWithCitizen, setVerifiedWithCitizen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateTicketStatus(
      ticket.id,
      'RESOLVED',
      activePersona.name,
      activePersona.designation,
      remarks,
      photoUrl,
      remarks
    );

    if (updated) {
      onResolved(updated);
      onClose();
    }
  };

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
        zIndex: 1000,
        padding: '1rem'
      }}
      className="animate-fade-in"
    >
      <div 
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '2px solid #a7f3d0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: '#d1fae5', color: '#059669', padding: '0.4rem', borderRadius: '8px' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--slate-900)' }}>
                Complete Redressal: #{ticket.id}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                Officer Sign-off & Photographic Proof Upload
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Action Taken Remarks */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--slate-800)' }}>
              Work Execution Summary & Remarks: *
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-300)',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* After Photo Proof */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--slate-800)' }}>
              Resolution Photographic Proof (After Work Done):
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img
                src={photoUrl}
                alt="Resolved Proof"
                style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--slate-300)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                  >
                    Fixed Streetlight
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                  >
                    Cleared Street
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                  >
                    Repaired Pipe
                  </button>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                  This proof will be made public on the citizen's live tracking view.
                </span>
              </div>
            </div>
          </div>

          {/* Verification check */}
          <div style={{ marginBottom: '1.5rem', background: 'var(--slate-50)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--slate-800)' }}>
              <input
                type="checkbox"
                checked={verifiedWithCitizen}
                onChange={(e) => setVerifiedWithCitizen(e.target.checked)}
              />
              <span>Send SMS OTP and rating prompt to citizen {ticket.citizenPhone}</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' }}
            >
              <CheckCircle2 size={16} />
              Mark Resolved & Close Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
