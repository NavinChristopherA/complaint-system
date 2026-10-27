import React, { useState } from 'react';
import { GrievanceTicket, UrgencyLevel } from '../../types/grievance';
import {
  recordFeedback,
  getFeedbackRecords,
} from '../../services/aiAssistantService';
import { updateTicket } from '../../services/storageService';
import { POLLACHI_DEPARTMENTS } from '../../data/departments';
import {
  CheckCircle2,
  Edit3,
  XCircle,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  History,
  Info,
  Check,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface AIReviewQueueProps {
  tickets: GrievanceTicket[];
  onTicketUpdated: (ticket: GrievanceTicket) => void;
  onShowToast?: (title: string, msg: string, type?: 'success' | 'warning' | 'info' | 'critical') => void;
}

export const AIReviewQueue: React.FC<AIReviewQueueProps> = ({
  tickets,
  onTicketUpdated,
  onShowToast,
}) => {
  // Filter tickets that benefit from human oversight:
  // pending triage, or confidence < 0.75, or urgency is CRITICAL
  const queueTickets = tickets.filter(
    t => t.status === 'PENDING_TRIAGE' || t.aiTriage.categoryConfidence < 0.85 || t.urgency === 'CRITICAL'
  );

  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [editDeptId, setEditDeptId] = useState<string>('');
  const [editUrgency, setEditUrgency] = useState<UrgencyLevel>('HIGH');
  const [editComment, setEditComment] = useState<string>('');
  const [feedbackCount, setFeedbackCount] = useState<number>(() => getFeedbackRecords().length);
  const [feedbackHistoryOpen, setFeedbackHistoryOpen] = useState(false);

  const getCategoryName = (catId: string): string =>
    POLLACHI_DEPARTMENTS.flatMap(d => d.categories).find(c => c.id === catId)?.name || catId;

  const handleApprove = (ticket: GrievanceTicket) => {
    const catName = getCategoryName(ticket.categoryId);

    // Record feedback
    recordFeedback(
      {
        ticketId: ticket.id,
        decision: 'APPROVED',
        reviewerName: 'Admin Desk Officer',
        reviewerRole: 'Municipal Triage Operator',
        comment: 'AI categorization and priority verified and approved without alterations.',
        timestamp: new Date().toISOString(),
      },
      catName,
      ticket.departmentId,
      ticket.urgency,
      ticket.aiTriage.categoryConfidence
    );

    // Transition ticket status to ASSIGNED
    const updated: GrievanceTicket = {
      ...ticket,
      status: 'ASSIGNED',
      timeline: [
        ...ticket.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'ASSIGNED',
          actor: 'Municipal AI Triage Desk',
          actorRole: 'Municipal Triage Operator',
          comment: 'AI recommendation verified and ratified by civic administration officer.',
        },
      ],
    };

    updateTicket(updated);
    onTicketUpdated(updated);
    setFeedbackCount(prev => prev + 1);

    if (onShowToast) {
      onShowToast('Triage Ratified', `Grievance ${ticket.id} approved and advanced to field dispatch.`, 'success');
    }
  };

  const handleStartEdit = (ticket: GrievanceTicket) => {
    setEditingTicketId(ticket.id);
    setEditDeptId(ticket.departmentId);
    setEditUrgency(ticket.urgency);
    setEditComment('');
  };

  const handleSaveEdit = (ticket: GrievanceTicket) => {
    const targetDept = POLLACHI_DEPARTMENTS.find(d => d.id === editDeptId);
    const targetDeptName = targetDept?.name || editDeptId;
    const catName = getCategoryName(ticket.categoryId);

    recordFeedback(
      {
        ticketId: ticket.id,
        decision: 'EDITED',
        correctedDepartment: targetDeptName,
        correctedPriority: editUrgency,
        reviewerName: 'Admin Desk Officer',
        reviewerRole: 'Senior Municipal Engineer',
        comment: editComment || 'Department or urgency adjusted to match ground operational capacity.',
        timestamp: new Date().toISOString(),
      },
      catName,
      ticket.departmentId,
      ticket.urgency,
      ticket.aiTriage.categoryConfidence
    );

    const updated: GrievanceTicket = {
      ...ticket,
      departmentId: editDeptId,
      urgency: editUrgency,
      status: 'ASSIGNED',
      timeline: [
        ...ticket.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'ASSIGNED',
          actor: 'Municipal AI Triage Desk',
          actorRole: 'Senior Municipal Engineer',
          comment: `AI triage corrected: Reassigned to ${targetDeptName} with ${editUrgency} priority.`,
        },
      ],
    };

    updateTicket(updated);
    onTicketUpdated(updated);
    setEditingTicketId(null);
    setFeedbackCount(prev => prev + 1);

    if (onShowToast) {
      onShowToast('Triage Corrected', `Ticket ${ticket.id} adjusted and routed to ${targetDeptName}.`, 'info');
    }
  };

  const handleReject = (ticket: GrievanceTicket) => {
    const reason = prompt('Please enter the reason for rejecting the AI recommendation:') || 'Classified as out of municipal jurisdiction or invalid';
    const catName = getCategoryName(ticket.categoryId);

    recordFeedback(
      {
        ticketId: ticket.id,
        decision: 'REJECTED',
        reviewerName: 'Admin Desk Officer',
        reviewerRole: 'Municipal Triage Operator',
        comment: reason,
        timestamp: new Date().toISOString(),
      },
      catName,
      ticket.departmentId,
      ticket.urgency,
      ticket.aiTriage.categoryConfidence
    );

    const updated: GrievanceTicket = {
      ...ticket,
      status: 'REJECTED',
      timeline: [
        ...ticket.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'REJECTED',
          actor: 'Municipal AI Triage Desk',
          actorRole: 'Municipal Triage Operator',
          comment: `AI recommendation rejected: ${reason}`,
        },
      ],
    };

    updateTicket(updated);
    onTicketUpdated(updated);
    setFeedbackCount(prev => prev + 1);

    if (onShowToast) {
      onShowToast('Recommendation Rejected', `Ticket ${ticket.id} rejected with logged reasoning.`, 'warning');
    }
  };

  const storedFeedbacks = getFeedbackRecords();

  return (
    <div data-testid="ai-review-queue" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'white',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--slate-200)',
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="#dc2626" /> Human-in-the-Loop AI Review Queue
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: '#fee2e2',
                color: '#991b1b',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
              }}
            >
              {queueTickets.length} ITEMS NEEDING REVIEW
            </span>
          </h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            Review AI classifications before dispatching municipal field officers. Every decision reinforces future model fine-tuning.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFeedbackHistoryOpen(!feedbackHistoryOpen)}
          className="btn btn-secondary"
          style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}
        >
          <History size={14} /> Audit Log ({feedbackCount} Feedback Records)
        </button>
      </div>

      {/* Stored Feedback Drawer if open */}
      {feedbackHistoryOpen && (
        <div
          data-testid="ai-feedback-audit-log"
          className="card animate-fade-in"
          style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: '#f8fafc', border: '1px solid #cbd5e1' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
              📋 Stored AI Human Feedback & Audit Records ({storedFeedbacks.length})
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
              Persisted in localStorage for model calibration
            </span>
          </div>

          {storedFeedbacks.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', margin: 0 }}>
              No feedback records captured yet. Take an action on a ticket below to create an audit record.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {storedFeedbacks.slice(-6).reverse().map((fb, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.78rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--slate-800)' }}>{fb.ticketId}</strong> &middot;{' '}
                    <span
                      style={{
                        color: fb.decision === 'APPROVED' ? '#059669' : fb.decision === 'EDITED' ? '#d97706' : '#dc2626',
                        fontWeight: 700,
                      }}
                    >
                      {fb.decision}
                    </span>{' '}
                    &middot; {fb.comment}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                    {new Date(fb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket List */}
      {queueTickets.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--slate-800)' }}>
            All Active Grievances Successfully Triaged
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
            No tickets currently require urgent manual oversight.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {queueTickets.map(ticket => {
            const isEditing = editingTicketId === ticket.id;
            const dept = POLLACHI_DEPARTMENTS.find(d => d.id === ticket.departmentId);
            const deptName = dept?.name || ticket.departmentId;
            const confPct = Math.round(ticket.aiTriage.categoryConfidence * 100);

            return (
              <div
                key={ticket.id}
                data-testid={`review-item-${ticket.id}`}
                className="card animate-fade-in"
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: ticket.urgency === 'CRITICAL' ? '1.5px solid #fca5a5' : '1px solid var(--slate-200)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        {ticket.id}
                      </span>
                      <StatusBadge status={ticket.status} />
                      <StatusBadge urgency={ticket.urgency} />
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: confPct < 75 ? '#fee2e2' : '#f0fdf4',
                          color: confPct < 75 ? '#b91c1c' : '#15803d',
                          border: `1px solid ${confPct < 75 ? '#fca5a5' : '#86efac'}`,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '12px',
                        }}
                      >
                        AI Confidence: {confPct}%
                      </span>
                    </div>

                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                      {ticket.title}
                    </h4>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Ward {ticket.wardId} &middot; {ticket.landmark}
                  </span>
                </div>

                {/* Citizen statement snippet */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    color: 'var(--slate-700)',
                    marginBottom: '0.85rem',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <strong style={{ color: 'var(--slate-900)' }}>Citizen Description: </strong>
                  {ticket.description}
                </div>

                {/* AI Rationale & Trigger Keywords */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                    AI Routing:
                  </span>
                  <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    {deptName}
                  </span>

                  {ticket.aiTriage.detectedKeywords && ticket.aiTriage.detectedKeywords.length > 0 && (
                    <>
                      <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600, marginLeft: '0.5rem' }}>
                        Triggers:
                      </span>
                      {ticket.aiTriage.detectedKeywords.slice(0, 3).map((kw, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', background: '#f1f5f9', color: 'var(--slate-600)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                          #{kw}
                        </span>
                      ))}
                    </>
                  )}
                </div>

                {/* Inline Editing Mode if active */}
                {isEditing ? (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e' }}>
                      Reassign & Calibrate AI Triage:
                    </span>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                          Target Department:
                        </label>
                        <select
                          value={editDeptId}
                          onChange={e => setEditDeptId(e.target.value)}
                          className="form-control"
                          style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        >
                          {POLLACHI_DEPARTMENTS.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                          Priority / Urgency:
                        </label>
                        <select
                          value={editUrgency}
                          onChange={e => setEditUrgency(e.target.value as UrgencyLevel)}
                          className="form-control"
                          style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        >
                          <option value="CRITICAL">CRITICAL (6h SLA)</option>
                          <option value="HIGH">HIGH (24h SLA)</option>
                          <option value="MEDIUM">MEDIUM (48h SLA)</option>
                          <option value="LOW">LOW (72h SLA)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                        Officer Comment / Feedback Reason:
                      </label>
                      <input
                        type="text"
                        value={editComment}
                        onChange={e => setEditComment(e.target.value)}
                        placeholder="e.g., Reassigned to health due to stagnation risk"
                        className="form-control"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setEditingTicketId(null)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(ticket)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: '#d97706' }}
                      >
                        <Check size={14} /> Save & Ratify
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Actions Row */}
                {!isEditing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => handleApprove(ticket)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', background: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <CheckCircle2 size={14} /> Approve AI Triage
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(ticket)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Edit3 size={14} /> Edit & Reassign
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(ticket)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: '#dc2626', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <XCircle size={14} /> Reject Suggestion
                    </button>

                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Info size={12} /> Decision feeds continuous audit
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
