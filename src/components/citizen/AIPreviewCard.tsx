import React from 'react';
import { AiTriageResult } from '../../services/aiTriageService';
import { StatusBadge } from '../common/StatusBadge';
import { Sparkles, Activity, Tag, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { POLLACHI_WARDS } from '../../data/pollachiWards';

interface AIPreviewCardProps {
  triage: AiTriageResult;
  loading?: boolean;
}

export const AIPreviewCard: React.FC<AIPreviewCardProps> = ({ triage, loading }) => {
  const suggestedWard = triage.suggestedWardId 
    ? POLLACHI_WARDS.find(w => w.id === triage.suggestedWardId) 
    : undefined;

  return (
    <div 
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
        border: '1.5px solid #a7f3d0',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        marginTop: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="animate-fade-in"
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 
              color: 'white', 
              padding: '0.35rem', 
              borderRadius: '8px', 
              display: 'flex' 
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-950)' }}>
              AI Smart Triage & Priority Analysis
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary-700)', fontWeight: 500 }}>
              Live NLP Heuristic Model (Tamil & English)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatusBadge urgency={triage.urgency} />
          <span 
            style={{ 
              fontSize: '0.78rem', 
              fontWeight: 700, 
              color: triage.urgencyScore > 80 ? '#b91c1c' : '#047857',
              background: triage.urgencyScore > 80 ? '#fee2e2' : '#d1fae5',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px'
            }}
          >
            Score: {triage.urgencyScore}/100
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <div style={{ background: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
            Detected Department
          </span>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--slate-800)' }}>
            {triage.departmentName}
          </span>
        </div>

        <div style={{ background: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
            Classification Match
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${Math.round(triage.confidenceScore * 100)}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #10b981, #047857)' 
                }} 
              />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-800)' }}>
              {Math.round(triage.confidenceScore * 100)}%
            </span>
          </div>
        </div>

        {suggestedWard && (
          <div style={{ background: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', fontWeight: 600 }}>
              <MapPin size={12} style={{ color: '#ea580c' }} /> Auto-Detected Ward
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ea580c' }}>
              Ward {suggestedWard.wardNumber} ({suggestedWard.name.split('-')[0].trim()})
            </span>
          </div>
        )}
      </div>

      {/* Keywords Tagging */}
      {triage.detectedKeywords.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Tag size={11} /> Key Tokens:
          </span>
          {triage.detectedKeywords.map((kw, i) => (
            <span 
              key={i} 
              style={{ 
                background: '#e0f2fe', 
                color: '#0369a1', 
                fontSize: '0.72rem', 
                padding: '0.15rem 0.45rem', 
                borderRadius: '4px', 
                fontWeight: 600 
              }}
            >
              #{kw}
            </span>
          ))}
        </div>
      )}

      {/* Explainable Rationale */}
      <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid #10b981', fontSize: '0.8rem', color: 'var(--slate-700)', lineHeight: 1.5 }}>
        <strong>Explainable Analysis: </strong>{triage.rationale}
      </div>
    </div>
  );
};
