import React from 'react';
import { GrievanceTicket } from '../../types/grievance';
import { UserPersona } from '../../types/user';
import { computeSlaStatus } from '../../services/slaService';
import { StatusBadge } from '../common/StatusBadge';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  AlertTriangle,
  FileText
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: GrievanceTicket;
  isOpen: boolean;
  onClose: () => void;
  onOpenAssign: (ticket: GrievanceTicket) => void;
  onOpenResolve: (ticket: GrievanceTicket) => void;
  onUpdateStatus: (newStatus: GrievanceTicket['status']) => void;
  activePersona: UserPersona;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onOpenAssign,
  onOpenResolve,
  onUpdateStatus,
  activePersona
}) => {
  if (!isOpen) return null;

  const slaInfo = computeSlaStatus(ticket);

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
          maxWidth: '780px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {ticket.id}
              </span>
              <StatusBadge status={ticket.status} />
              <StatusBadge urgency={ticket.urgency} />
              {ticket.isSlaBreached && <StatusBadge slaBreached={true} />}
            </div>
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--slate-800)' }}>
              {ticket.title}
            </h3>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* SLA & AI Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: slaInfo.isOverdue ? '#fee2e2' : '#f0fdf4', border: `1px solid ${slaInfo.isOverdue ? '#fca5a5' : '#bbf7d0'}`, borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', color: slaInfo.isOverdue ? '#991b1b' : '#166534', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> Municipal SLA Status
            </span>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: slaInfo.isOverdue ? '#b91c1c' : '#15803d' }}>
              {slaInfo.displayText}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-600)' }}>
              Target: {ticket.slaHoursTotal} hrs • Deadline: {new Date(ticket.slaDeadline).toLocaleString()}
            </span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={12} /> AI Heuristic Score
            </span>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--slate-800)' }}>
              {ticket.aiTriage.urgencyScore} / 100 ({Math.round(ticket.aiTriage.categoryConfidence * 100)}% Match)
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
              Keywords: {ticket.aiTriage.detectedKeywords.slice(0, 3).join(', ')}
            </span>
          </div>
        </div>

        {/* Location & Citizen Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--slate-200)' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Jurisdiction</span>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Ward {ticket.wardId} - {ticket.wardName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>📍 {ticket.landmark}</div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Staff</span>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ticket.assignedOfficer?.name || 'Unassigned'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
              {ticket.assignedOfficer ? `📞 ${ticket.assignedOfficer.phone}` : 'Requires officer dispatch'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Citizen Contact</span>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ticket.citizenName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>📞 {ticket.citizenPhone}</div>
          </div>
        </div>

        {/* Description & Photo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
            Citizen Grievance Statement:
          </span>
          <div style={{ background: 'white', border: '1px solid var(--slate-200)', borderRadius: '8px', padding: '0.85rem', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--slate-800)' }}>
            {ticket.description}
          </div>

          {ticket.photoUrl && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img 
                src={ticket.photoUrl} 
                alt="Issue Evidence" 
                style={{ width: '140px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--slate-300)' }} 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                Citizen uploaded visual proof • GPS coordinates anchored to Pollachi Municipal Ward {ticket.wardId}
              </span>
            </div>
          )}
        </div>

        {/* Resolution Proof (if resolved) */}
        {ticket.status === 'RESOLVED' && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#047857', fontWeight: 700, marginBottom: '0.35rem' }}>
              <CheckCircle2 size={18} /> Resolution Verified & Signed Off
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#065f46', marginBottom: '0.5rem' }}>
              {ticket.resolutionRemarks}
            </p>
            {ticket.resolutionPhotoUrl && (
              <img
                src={ticket.resolutionPhotoUrl}
                alt="After Repair Proof"
                style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #6ee7b7' }}
              />
            )}
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {ticket.status !== 'RESOLVED' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAssign(ticket);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <UserCheck size={16} />
                  {ticket.assignedOfficer ? 'Reassign Officer' : 'Assign Officer'}
                </button>

                {ticket.status === 'ASSIGNED' && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus('IN_PROGRESS')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Set In-Progress
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenResolve(ticket);
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <CheckCircle2 size={16} />
                  Mark Resolved
                </button>
              </>
            )}
          </div>

          <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
