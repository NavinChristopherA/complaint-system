import React from 'react';
import { Sparkles, Info, ShieldCheck } from 'lucide-react';
import { GrievanceTicket } from '../../types/grievance';
import { POLLACHI_DEPARTMENTS } from '../../data/departments';

interface AIStatusSummaryProps {
  ticket: GrievanceTicket;
}

export const AIStatusSummary: React.FC<AIStatusSummaryProps> = ({ ticket }) => {
  const dept = POLLACHI_DEPARTMENTS.find(d => d.id === ticket.departmentId);
  const deptName = dept?.name || ticket.departmentId;

  // Generate context-aware natural language summary based on ticket state
  const getNaturalSummary = (): string => {
    switch (ticket.status) {
      case 'PENDING_TRIAGE':
        return `Your grievance regarding "${ticket.title}" has been registered and analyzed by the civic AI system. It is currently queued for human verification by the Pollachi Municipal Corporation triage desk.`;
      case 'ASSIGNED':
        return `AI classification verified and routed to ${deptName} with ${ticket.urgency} priority. Assigned to field officer ${ticket.assignedOfficer?.name || 'designated engineer'} for inspection.`;
      case 'IN_PROGRESS':
        return `Active remediation in progress by the ${deptName} field crew at Ward ${ticket.wardId}. The team is working toward resolution within the allocated SLA timeframe.`;
      case 'RESOLVED':
        return `Resolution verified on-site. Field remarks and completion verification have been logged. You may now submit your citizen satisfaction rating.`;
      case 'REJECTED':
        return `Grievance reviewed by municipal administrators. Please inspect the administrative notes for clarification or resubmit with additional documentation.`;
      default:
        return `Your grievance is being tracked in the Pollachi Municipal Grievance Redressal System.`;
    }
  };

  const confidencePercent = Math.round((ticket.aiTriage.categoryConfidence || 0.85) * 100);

  return (
    <div
      data-testid="ai-status-summary"
      style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
        border: '1.5px solid #a7f3d0',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.75rem',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(5, 150, 105, 0.06)',
      }}
    >
      {/* Header with AI indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              AI Status Briefing
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  background: '#d1fae5',
                  color: '#047857',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  border: '1px solid #6ee7b7',
                }}
              >
                PROTOTYPE EVALUATION MODE
              </span>
            </h4>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontWeight: 600,
          }}
        >
          <ShieldCheck size={14} /> AI confidence: {confidencePercent}%
        </span>
      </div>

      {/* Natural language summary */}
      <p
        data-testid="ai-natural-summary-text"
        style={{
          fontSize: '0.9rem',
          lineHeight: 1.55,
          color: '#064e3b',
          margin: '0 0 0.85rem 0',
        }}
      >
        {getNaturalSummary()}
      </p>

      {/* Rationale & Keyword pill grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.65rem',
          background: 'rgba(255, 255, 255, 0.75)',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #d1fae5',
        }}
      >
        <div>
          <span style={{ fontSize: '0.7rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
            Routing Rationale
          </span>
          <span style={{ fontSize: '0.8rem', color: '#1f2937', fontWeight: 600 }}>
            Routed to {deptName} (Ward {ticket.wardId})
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
            Key Triggers
          </span>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
            {ticket.aiTriage.detectedKeywords && ticket.aiTriage.detectedKeywords.length > 0 ? (
              ticket.aiTriage.detectedKeywords.slice(0, 3).map((kw, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.7rem',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    fontWeight: 500,
                  }}
                >
                  #{kw}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Standard civic intake criteria</span>
            )}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
            Verification Notice
          </span>
          <span style={{ fontSize: '0.75rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Info size={12} color="#059669" /> Non-authoritative — official status shown above
          </span>
        </div>
      </div>
    </div>
  );
};
