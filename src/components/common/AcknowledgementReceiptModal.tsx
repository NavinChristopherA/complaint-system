import React from 'react';
import { GrievanceTicket } from '../../types/grievance';
import { POLLACHI_WARDS } from '../../data/pollachiWards';
import { Printer, Share2, Download, X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface AcknowledgementReceiptModalProps {
  ticket: GrievanceTicket;
  isOpen: boolean;
  onClose: () => void;
}

export const AcknowledgementReceiptModal: React.FC<AcknowledgementReceiptModalProps> = ({
  ticket,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const ward = POLLACHI_WARDS.find(w => w.id === ticket.wardId) || POLLACHI_WARDS[0];

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🏛️ *Pollachi Municipal Grievance Redressal Slip*\n` +
      `*Ticket ID:* ${ticket.id}\n` +
      `*Issue:* ${ticket.title}\n` +
      `*Ward:* ${ticket.wardId} (${ticket.wardName})\n` +
      `*Status:* ${ticket.status}\n` +
      `*SLA Target:* ${ticket.slaHoursTotal} Hours\n` +
      `*Track Live:* http://127.0.0.1:5173/`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

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
          maxWidth: '650px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'white',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          border: '2px solid var(--slate-300)'
        }}
      >
        {/* Actions bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
            Official Citizen Redressal Receipt
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
            >
              <Printer size={14} /> Print Receipt
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', color: '#16a34a' }}
            >
              <Share2 size={14} /> WhatsApp Share
            </button>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: '0.3rem' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* The Printable Slip Body */}
        <div 
          id="printable-slip"
          style={{
            border: '2px solid #064e3b',
            borderRadius: '12px',
            padding: '1.5rem',
            background: '#ffffff',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #064e3b', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🌴</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', margin: '0 0 0.2rem 0', textTransform: 'uppercase' }}>
              Pollachi Municipal Corporation
            </h2>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#047857', margin: '0 0 0.25rem 0' }}>
              பொள்ளாச்சி மாநகராட்சி • பொது மக்கள் குறைதீர்ப்பு பிரிவு
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Head Office: Municipal Office Road, Pollachi - 642001 • Control Room: 04259-223344
            </span>
          </div>

          {/* Receipt Title & QR Code Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Official Grievance Acknowledgment
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b' }}>
                {ticket.id}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                Registered: {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Simulated QR Code Stamp */}
            <div 
              style={{ 
                border: '1.5px solid #064e3b', 
                padding: '6px', 
                borderRadius: '8px', 
                textAlign: 'center',
                background: 'white'
              }}
            >
              <div style={{ width: '56px', height: '56px', background: 'repeating-linear-gradient(45deg, #064e3b, #064e3b 5px, #ffffff 5px, #ffffff 10px)', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#064e3b', display: 'block', marginTop: '2px' }}>
                VERIFIED SEAL
              </span>
            </div>
          </div>

          {/* Dossier Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block' }}>Citizen Name:</span>
              <strong style={{ color: 'var(--slate-900)' }}>{ticket.citizenName}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block' }}>Mobile Number:</span>
              <strong style={{ color: 'var(--slate-900)' }}>{ticket.citizenPhone}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block' }}>Ward Jurisdiction:</span>
              <strong style={{ color: 'var(--slate-900)' }}>Ward {ticket.wardId} ({ticket.wardName})</strong>
            </div>

            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block' }}>Specific Landmark:</span>
              <strong style={{ color: 'var(--slate-900)' }}>{ticket.landmark}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block' }}>Urgency Classification:</span>
              <strong style={{ color: ticket.urgency === 'CRITICAL' ? '#b91c1c' : '#047857' }}>
                {ticket.urgency} (AI Score: {ticket.aiTriage.urgencyScore}/100)
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block' }}>SLA Commitment Deadline:</span>
              <strong style={{ color: '#047857' }}>
                {ticket.slaHoursTotal} Hours ({new Date(ticket.slaDeadline).toLocaleDateString()})
              </strong>
            </div>
          </div>

          {/* Issue Summary */}
          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--slate-500)', display: 'block', marginBottom: '0.2rem' }}>Registered Grievance Details:</span>
            <p style={{ margin: 0, color: 'var(--slate-800)', lineHeight: 1.5, background: '#f8fafc', padding: '0.65rem', borderRadius: '6px' }}>
              <strong>{ticket.title}:</strong> {ticket.description}
            </p>
          </div>

          {/* Assigned Officer Contact */}
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#065f46', marginBottom: '1rem' }}>
            <strong>Assigned Ward Officer: </strong>
            {ward.sanitaryInspector.name} ({ward.sanitaryInspector.role}) • Direct Phone: {ward.sanitaryInspector.phone}
          </div>

          {/* Watermark / Footer */}
          <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', fontSize: '0.72rem', color: 'var(--slate-400)' }}>
            This is a computer generated grievance receipt with digital municipal cryptographic hash. No physical signature required.
          </div>
        </div>
      </div>
    </div>
  );
};
