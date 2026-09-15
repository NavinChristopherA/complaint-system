import React, { useState } from 'react';
import { POLLACHI_WARDS } from '../../data/pollachiWards';
import { GrievanceTicket } from '../../types/grievance';
import { StatusBadge } from '../common/StatusBadge';
import { MapPin, Phone, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface WardHeatmapProps {
  tickets: GrievanceTicket[];
  onSelectTicket: (ticket: GrievanceTicket) => void;
}

export const WardHeatmap: React.FC<WardHeatmapProps> = ({ tickets, onSelectTicket }) => {
  const [selectedWardId, setSelectedWardId] = useState<number>(18); // Default to Market Road ward

  const wardTicketCounts = POLLACHI_WARDS.map(ward => {
    const wardTickets = tickets.filter(t => t.wardId === ward.id);
    const active = wardTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'REJECTED');
    const critical = wardTickets.filter(t => t.urgency === 'CRITICAL' && t.status !== 'RESOLVED');
    const breached = wardTickets.filter(t => t.isSlaBreached);

    return {
      ward,
      activeCount: active.length,
      criticalCount: critical.length,
      breachedCount: breached.length,
      activeTickets: active
    };
  });

  const selectedData = wardTicketCounts.find(w => w.ward.id === selectedWardId) || wardTicketCounts[0];

  const getHeatColor = (count: number) => {
    if (count === 0) return { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', label: 'Optimal' };
    if (count <= 2) return { bg: '#f0fdf4', border: '#86efac', text: '#15803d', label: 'Low Load' };
    if (count <= 4) return { bg: '#fefce8', border: '#fde047', text: '#a16207', label: 'Moderate' };
    if (count <= 6) return { bg: '#fff7ed', border: '#fdba74', text: '#c2410c', label: 'High Attention' };
    return { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', label: 'Critical Hotspot' };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.8fr) minmax(280px, 1.2fr)', gap: '1.5rem', alignItems: 'start' }}>
      {/* 36-Ward Interactive Spatial Heatmap Grid */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--slate-900)' }}>
              Pollachi 36-Ward Grievance Density Matrix
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
              Spatial distribution of live civic issues across all zones
            </span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#15803d' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} /> 0-2 Low
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#a16207' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} /> 3-4 Med
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#b91c1c' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> 5+ High
            </span>
          </div>
        </div>

        {/* 36 Ward Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '0.6rem' }}>
          {wardTicketCounts.map(({ ward, activeCount, criticalCount, breachedCount }) => {
            const heat = getHeatColor(activeCount);
            const isSelected = ward.id === selectedWardId;

            return (
              <button
                key={ward.id}
                type="button"
                onClick={() => setSelectedWardId(ward.id)}
                style={{
                  background: heat.bg,
                  border: isSelected ? '2.5px solid #064e3b' : `1px solid ${heat.border}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.05)' : 'none',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {breachedCount > 0 && (
                  <span 
                    title={`${breachedCount} SLA Breached Tickets`}
                    style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', borderRadius: '50%', background: '#dc2626', color: 'white', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    !
                  </span>
                )}

                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--slate-800)' }}>
                  W{ward.wardNumber}
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: heat.text }}>
                  {activeCount}
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--slate-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '75px' }}>
                  {ward.name.split('-')[0].replace('Ward', '').trim()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Ward Deep Dive Drawer */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <span className="badge badge-resolved" style={{ marginBottom: '0.35rem' }}>
            Ward {selectedData.ward.wardNumber} • {selectedData.ward.zone} Zone
          </span>
          <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0', color: 'var(--slate-900)' }}>
            {selectedData.ward.name}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            {selectedData.ward.tamilName}
          </span>
        </div>

        {/* Staff & Metrics */}
        <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--slate-500)' }}>Sanitary Inspector:</span>
            <span style={{ fontWeight: 700 }}>{selectedData.ward.sanitaryInspector.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--slate-500)' }}>Junior Engineer:</span>
            <span style={{ fontWeight: 700 }}>{selectedData.ward.juniorEngineer.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--slate-500)' }}>Population:</span>
            <span style={{ fontWeight: 700 }}>{selectedData.ward.populationApprox.toLocaleString()}</span>
          </div>
        </div>

        {/* Active Grievances in this Ward */}
        <h4 style={{ fontSize: '0.9rem', color: 'var(--slate-800)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Active Grievances in Ward {selectedData.ward.wardNumber} ({selectedData.activeTickets.length})
        </h4>

        {selectedData.activeTickets.length === 0 ? (
          <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '8px', color: '#065f46', fontSize: '0.85rem', textAlign: 'center' }}>
            ✓ No pending grievances in this ward! All complaints resolved.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto' }}>
            {selectedData.activeTickets.map(t => (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t)}
                style={{
                  background: 'white',
                  border: t.isSlaBreached ? '1.5px solid #fca5a5' : '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                    {t.id}
                  </span>
                  <StatusBadge urgency={t.urgency} slaBreached={t.isSlaBreached} />
                </div>
                <h5 style={{ fontSize: '0.85rem', margin: '0 0 0.35rem 0', color: 'var(--slate-800)' }}>
                  {t.title}
                </h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  <MapPin size={12} style={{ color: '#ea580c' }} />
                  <span>{t.landmark}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
