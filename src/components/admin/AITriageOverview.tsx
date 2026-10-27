import React from 'react';
import { GrievanceTicket } from '../../types/grievance';
import { computeAITriageStats } from '../../services/aiAssistantService';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Copy,
  BrainCircuit,
  CheckCircle2,
  Users,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { POLLACHI_DEPARTMENTS } from '../../data/departments';

interface AITriageOverviewProps {
  tickets: GrievanceTicket[];
}

export const AITriageOverview: React.FC<AITriageOverviewProps> = ({ tickets }) => {
  const stats = computeAITriageStats(tickets);

  return (
    <div data-testid="ai-triage-overview" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner: Prototype & Evaluation Transparency */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#2563eb',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              AI Civic Auto-Triage & Governance Engine
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                }}
              >
                PROTOTYPE EVALUATION
              </span>
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#1e40af' }}>
              Real-time telemetry, confidence metrics, duplicate suppression, and human-in-the-loop oversight for Pollachi Municipality.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#1d4ed8',
              background: 'white',
              border: '1px solid #93c5fd',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <ShieldCheck size={14} color="#2563eb" /> Model Confidence: {Math.round(stats.averageConfidence * 100)}%
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Total Analyzed */}
        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
              AI Analyzed Intake
            </span>
            <Sparkles size={18} color="#2563eb" />
          </div>
          <div data-testid="stat-total-analyzed" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {stats.totalAnalyzed}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '0.25rem', display: 'block' }}>
            100% automated classification
          </span>
        </div>

        {/* High & Critical Alerts */}
        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
              High / Critical Escaped
            </span>
            <AlertTriangle size={18} color="#dc2626" />
          </div>
          <div data-testid="stat-high-critical" style={{ fontSize: '1.8rem', fontWeight: 800, color: stats.criticalCount + stats.highPriorityCount > 0 ? '#b91c1c' : '#047857', marginTop: '0.25rem' }}>
            {stats.criticalCount + stats.highPriorityCount}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '0.25rem', display: 'block' }}>
            {stats.criticalCount} Critical (6h SLA), {stats.highPriorityCount} High (24h SLA)
          </span>
        </div>

        {/* Possible Duplicates Suppressed */}
        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
              Duplicate Candidates
            </span>
            <Copy size={18} color="#d97706" />
          </div>
          <div data-testid="stat-duplicates" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>
            {stats.possibleDuplicates}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#b45309', marginTop: '0.25rem', display: 'block' }}>
            Cluster mitigation prevented duplicate dispatch
          </span>
        </div>

        {/* Human-in-the-Loop Review Needed */}
        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
              Needs Human Oversight
            </span>
            <Users size={18} color="#7c3aed" />
          </div>
          <div data-testid="stat-human-review" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6d28d9', marginTop: '0.25rem' }}>
            {stats.needsHumanReview}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '0.25rem', display: 'block' }}>
            Confidence &lt; 75% or pending verification
          </span>
        </div>
      </div>

      {/* Two-Column Layout: Department Breakdown & Evaluation Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Department Routing Breakdown */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#2563eb" /> AI Department Routing Distribution
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Live ticket telemetry</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {stats.departmentBreakdown.map(dept => {
              const pct = stats.totalAnalyzed > 0 ? Math.round((dept.count / stats.totalAnalyzed) * 100) : 0;
              const meta = POLLACHI_DEPARTMENTS.find(d => d.name === dept.departmentName);
              const color = meta?.colorHex || '#3b82f6';

              return (
                <div key={dept.departmentName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                      {dept.departmentName}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--slate-700)' }}>
                      {dept.count} complaints ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(pct, 4)}%`,
                        background: color,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: AI Architecture & Evaluation Alignment */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: '#fafafa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Cpu size={18} color="#059669" />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              AI Architecture & Evaluation Guide
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem', color: 'var(--slate-700)', lineHeight: 1.5 }}>
            <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>
                1. Multi-Lingual & Tanglish Intent Recognition
              </span>
              NLP tokenization parses English, Tamil, and colloquial Tanglish (e.g., &quot;kudi thanni&quot;, &quot;street light eriyala&quot;, &quot;kuppai&quot;) mapped directly into Pollachi municipal service categories.
            </div>

            <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>
                2. Explainable Rationale & SLA Auto-Assignment
              </span>
              Every triage output includes detected keyword triggers, urgency justification, and automated SLA clock assignment (6h, 12h, 24h, 72h) aligned with Tamil Nadu municipal charter guidelines.
            </div>

            <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>
                3. Human-in-the-Loop Feedback Loop
              </span>
              Municipal officers can Approve, Edit, or Reject suggestions in the Review Queue. Adjustments are logged to localStorage for continuous prompt & model alignment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
