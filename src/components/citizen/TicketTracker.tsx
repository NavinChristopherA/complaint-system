import React, { useState, useEffect } from 'react';
import { GrievanceTicket } from '../../types/grievance';
import { getTickets, getTicketById, submitCitizenFeedback } from '../../services/storageService';
import { computeSlaStatus } from '../../services/slaService';
import { StatusBadge } from '../common/StatusBadge';
import { AcknowledgementReceiptModal } from '../common/AcknowledgementReceiptModal';
import { AIStatusSummary } from './AIStatusSummary';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { 
  Search, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle, 
  Star, 
  Send,
  Camera,
  AlertTriangle,
  Printer,
  Share2,
  Copy,
  Check
} from 'lucide-react';

interface TicketTrackerProps {
  initialTicketId?: string;
  language: Language;
  onShowToast?: (title: string, msg: string, type?: 'success' | 'warning' | 'info' | 'critical') => void;
}

export const TicketTracker: React.FC<TicketTrackerProps> = ({ initialTicketId, language, onShowToast }) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState(initialTicketId || 'POL-2026-W14-0101');
  const [ticket, setTicket] = useState<GrievanceTicket | undefined>(() => {
    return getTicketById(initialTicketId || 'POL-2026-W14-0101') || getTickets()[0];
  });
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live seconds countdown ticker
  const [timeRemainingStr, setTimeRemainingStr] = useState<string>('');

  useEffect(() => {
    if (!ticket || ticket.status === 'RESOLVED' || ticket.status === 'REJECTED') {
      setTimeRemainingStr('');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const target = new Date(ticket.slaDeadline).getTime();
      const diffMs = target - now;

      if (diffMs <= 0) {
        const absDiff = Math.abs(diffMs);
        const hours = Math.floor(absDiff / (1000 * 3600));
        const mins = Math.floor((absDiff % (1000 * 3600)) / (1000 * 60));
        const secs = Math.floor((absDiff % (1000 * 60)) / 1000);
        setTimeRemainingStr(`Breached by ${hours}h : ${mins}m : ${secs}s`);
      } else {
        const hours = Math.floor(diffMs / (1000 * 3600));
        const mins = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeRemainingStr(`${hours}h : ${mins}m : ${secs}s Remaining`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    let found = getTicketById(query);
    if (!found) {
      const all = getTickets();
      found = all.find(t => t.citizenPhone.includes(query) || t.id.toLowerCase().includes(query.toLowerCase()));
    }

    setTicket(found);
    setFeedbackSubmitted(false);
    if (found && onShowToast) {
      onShowToast('Grievance Loaded', `Tracking #${found.id} for ${found.wardName}`, 'info');
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    const updated = submitCitizenFeedback(ticket.id, feedbackRating, feedbackComment);
    if (updated) {
      setTicket(updated);
      setFeedbackSubmitted(true);
      if (onShowToast) {
        onShowToast('Feedback Received', 'Thank you! Rating recorded for municipal appraisal.', 'success');
      }
    }
  };

  const handleCopyId = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onShowToast) onShowToast('Copied to Clipboard', `Ticket ID ${ticket.id}`, 'info');
  };

  const handleWhatsAppShare = () => {
    if (!ticket) return;
    const text = encodeURIComponent(
      `🏛️ *Pollachi Municipal Grievance Tracking*\n` +
      `*Ticket ID:* ${ticket.id}\n` +
      `*Issue:* ${ticket.title}\n` +
      `*Status:* ${ticket.status}\n` +
      `*Ward:* ${ticket.wardId} (${ticket.wardName})\n` +
      `*Check Live:* http://127.0.0.1:5173/`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const sampleTicketIds = ['POL-2026-W14-0101', 'POL-2026-W18-0102', 'POL-2026-W09-0098', 'POL-2026-W07-0089'];
  const slaInfo = ticket ? computeSlaStatus(ticket) : null;

  return (
    <div className="container" style={{ maxWidth: '920px', margin: '2rem auto' }}>
      {/* Search Header */}
      <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem', color: 'var(--slate-900)' }}>
          {language === 'ta' ? 'புகாரின் தற்போதைய நிலையை அறியவும்' : 'Track Grievance Status Live'}
        </h2>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Enter your unique Pollachi Ticket ID (e.g. POL-2026-W14-0101) or your registered 10-digit mobile number.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. POL-2026-W14-0101 or 98421"
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--slate-300)',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <Search size={16} />
            Search Ticket
          </button>
        </form>

        {/* Quick Click Samples */}
        <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Try Demo Tickets:</span>
          {sampleTicketIds.map(id => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSearchQuery(id);
                const found = getTicketById(id);
                setTicket(found);
                setFeedbackSubmitted(false);
              }}
              style={{
                background: searchQuery === id ? 'var(--primary-100)' : 'var(--slate-100)',
                color: searchQuery === id ? 'var(--primary-800)' : 'var(--slate-700)',
                border: '1px solid var(--slate-200)',
                borderRadius: '4px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Details View */}
      {!ticket ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
          <p style={{ color: 'var(--slate-500)', fontSize: '1rem' }}>
            No grievance found matching "<strong>{searchQuery}</strong>". Please check the ticket number.
          </p>
        </div>
      ) : (
        <div className="card animate-fade-in" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {ticket.id}
                </span>

                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Copy Ticket ID"
                  style={{
                    background: 'var(--slate-100)',
                    border: '1px solid var(--slate-300)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.45rem',
                    cursor: 'pointer',
                    color: 'var(--slate-600)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.72rem'
                  }}
                >
                  {copied ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>

                <StatusBadge status={ticket.status} />
                <StatusBadge urgency={ticket.urgency} />
                {ticket.isSlaBreached && <StatusBadge slaBreached={true} />}
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--slate-800)' }}>
                {ticket.title}
              </h3>
            </div>

            {/* SLA Real-Time Clock & Slip Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              {slaInfo && (
                <div 
                  style={{ 
                    background: slaInfo.isOverdue ? '#fee2e2' : '#f0fdf4',
                    border: `1.5px solid ${slaInfo.isOverdue ? '#fca5a5' : '#bbf7d0'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 1rem',
                    textAlign: 'right'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: slaInfo.isOverdue ? '#991b1b' : '#166534', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                    <Clock size={12} /> {slaInfo.isOverdue ? 'SLA ESCALATED' : 'LIVE SLA COUNTDOWN'}
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: slaInfo.isOverdue ? '#b91c1c' : '#15803d', fontFamily: 'monospace' }}>
                    {timeRemainingStr || slaInfo.displayText}
                  </div>
                  {slaInfo.isOverdue && (
                    <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600 }}>
                      Alert dispatched to: {slaInfo.escalationRole}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setIsReceiptOpen(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  <Printer size={13} /> Official Slip
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: '#16a34a' }}
                >
                  <Share2 size={13} /> WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Key Facts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem', border: '1px solid var(--slate-200)' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Municipal Ward</span>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-800)' }}>
                Ward {ticket.wardId} ({ticket.wardName.split('-')[0].trim()})
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{ticket.landmark}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Field Officer</span>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-800)' }}>
                {ticket.assignedOfficer?.name || 'Awaiting Dispatch'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                {ticket.assignedOfficer ? `${ticket.assignedOfficer.role} (${ticket.assignedOfficer.phone})` : 'Queue in Progress'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>AI Urgency Score</span>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: ticket.aiTriage.urgencyScore > 80 ? '#b91c1c' : '#047857' }}>
                {ticket.aiTriage.urgencyScore} / 100 ({ticket.urgency})
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Match: {Math.round(ticket.aiTriage.categoryConfidence * 100)}%</div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Reported By</span>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-800)' }}>
                {ticket.citizenName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                {new Date(ticket.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>

          {/* AI Status Briefing & Explanation */}
          <AIStatusSummary ticket={ticket} />

          {/* Description & Citizen Photo */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--slate-700)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
              Citizen Statement
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--slate-800)', lineHeight: 1.6, background: 'white', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
              {ticket.description}
            </p>

            {ticket.photoUrl && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={ticket.photoUrl}
                  alt="Citizen Submission"
                  style={{ width: '130px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--slate-300)' }}
                />
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', display: 'block' }}>
                    📸 Field Evidence Uploaded by Citizen
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                    Geotagged & verified for municipal field crew
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Proof (If Resolved) */}
          {ticket.status === 'RESOLVED' && (
            <div style={{ background: '#ecfdf5', border: '1.5px solid #6ee7b7', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#047857' }}>
                <CheckCircle size={20} />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                  Redressal Completed by Municipal Team
                </h4>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#065f46', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {ticket.resolutionRemarks || 'The grievance has been resolved by the municipal engineering department and inspected on-site.'}
              </p>

              {ticket.resolutionPhotoUrl && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', display: 'block', marginBottom: '0.35rem' }}>
                    Resolution Photo Proof:
                  </span>
                  <img
                    src={ticket.resolutionPhotoUrl}
                    alt="Work Done Proof"
                    style={{ width: '200px', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #a7f3d0' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Audit Trail & Timeline */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--slate-900)', fontWeight: 700, marginBottom: '1rem' }}>
              Live Redressal Timeline & Action Log
            </h4>

            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--slate-200)' }}>
              {ticket.timeline.map((event, idx) => (
                <div key={event.id || idx} style={{ marginBottom: '1.25rem', position: 'relative' }}>
                  {/* Dot */}
                  <div 
                    style={{
                      position: 'absolute',
                      left: '-1.85rem',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: event.isAiAction ? '#0284c7' : '#059669',
                      border: '2px solid white',
                      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.4)'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--slate-800)' }}>
                      {event.actor} <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 500 }}>({event.actorRole})</span>
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(event.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--slate-600)', lineHeight: 1.4 }}>
                    {event.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Feedback Rating Section (For Resolved Tickets) */}
          {ticket.status === 'RESOLVED' && (
            <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', color: 'var(--slate-900)' }}>
                Citizen Satisfaction Feedback
              </h4>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Rate the quality and speed of Pollachi Municipality's response to this grievance.
              </p>

              {ticket.citizenFeedback || feedbackSubmitted ? (
                <div style={{ background: '#d1fae5', padding: '0.85rem 1rem', borderRadius: '8px', color: '#065f46', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    {'★'.repeat(ticket.citizenFeedback?.rating || feedbackRating)}
                    <span style={{ fontWeight: 700 }}>Thank you for your feedback!</span>
                  </div>
                  <div>"{ticket.citizenFeedback?.comment || feedbackComment || 'Resolution verified by citizen.'}"</div>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '1.5rem',
                          cursor: 'pointer',
                          color: star <= feedbackRating ? '#f59e0b' : '#cbd5e1'
                        }}
                      >
                        ★
                      </button>
                    ))}
                    <span style={{ fontSize: '0.85rem', alignSelf: 'center', fontWeight: 600, color: 'var(--slate-700)' }}>
                      {feedbackRating === 5 ? 'Excellent & Prompt' : feedbackRating === 4 ? 'Good Resolution' : 'Satisfactory'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Optional feedback comment for the Municipal Commissioner..."
                      style={{
                        flex: 1,
                        padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--slate-300)',
                        fontSize: '0.85rem'
                      }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
                      <Send size={14} /> Submit Feedback
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Official Acknowledgment Slip Modal */}
      {isReceiptOpen && ticket && (
        <AcknowledgementReceiptModal
          ticket={ticket}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}
    </div>
  );
};
