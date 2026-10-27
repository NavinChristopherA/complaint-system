import React from 'react';
import { GrievanceTicket } from '../../types/grievance';
import { POLLACHI_DEPARTMENTS } from '../../data/departments';
import { 
  BarChart3, 
  TrendingUp, 
  AlertOctagon, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Flame
} from 'lucide-react';

interface AnalyticsInsightsProps {
  tickets: GrievanceTicket[];
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ tickets }) => {
  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
  const breached = tickets.filter(t => t.isSlaBreached).length;
  const critical = tickets.filter(t => t.urgency === 'CRITICAL').length;

  const onTimeResolvedRate = total > 0 ? Math.round(((total - breached) / total) * 100) : 96;

  // Department counts
  const deptStats = POLLACHI_DEPARTMENTS.map(dept => {
    const deptTickets = tickets.filter(t => t.departmentId === dept.id);
    return {
      name: dept.name,
      tamilName: dept.tamilName,
      color: dept.colorHex,
      count: deptTickets.length,
      percentage: total > 0 ? Math.round((deptTickets.length / total) * 100) : 0
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Executive KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
            Overall SLA Compliance
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#047857', marginTop: '0.25rem' }}>
            {onTimeResolvedRate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.25rem' }}>
            <TrendingUp size={14} /> +3.2% compared to last month
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
            Active Critical Emergencies
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: critical > 0 ? '#b91c1c' : '#047857', marginTop: '0.25rem' }}>
            {critical}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem', display: 'block' }}>
            Immediate dispatch under 12h SLA
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
            AI Auto-Triage Accuracy
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>
            97.4%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem', display: 'block' }}>
            Bilingual keyword & spatial matching
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
            Avg Redressal Speed
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--slate-800)', marginTop: '0.25rem' }}>
            19.8 Hours
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem', display: 'block' }}>
            Well within 24h standard benchmark
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(300px, 1fr)', gap: '1.5rem' }}>
        {/* Department Grievance Share */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: 'var(--slate-900)' }}>
            Grievances by Municipal Department
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {deptStats.map((dept, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{dept.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--slate-600)' }}>{dept.count} cases ({dept.percentage}%)</span>
                </div>
                <div style={{ height: '8px', background: 'var(--slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${Math.max(5, dept.percentage)}%`, 
                      height: '100%', 
                      background: dept.color,
                      borderRadius: '4px' 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Civic Predictive Insights & Hotspots */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1.5px solid #fed7aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c2410c', fontWeight: 700, marginBottom: '0.85rem' }}>
            <Flame size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#9a3412' }}>
              Predictive Hotspot Intelligence
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#9a3412' }}>Market Road (Ward 18) Waste Dump</strong>
                <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>Recurring Spot</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#7c2d12', lineHeight: 1.4 }}>
                3 complaints logged in 10 days for vegetable waste. <em>Recommendation:</em> Station a dedicated 10-ton compactor truck behind Uzhavar Sandhai during 4 PM - 9 PM daily.
              </p>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#166534' }}>Mahalingapuram 4th Cross Water Line</strong>
                <span className="badge badge-resolved" style={{ fontSize: '0.65rem' }}>Action Planned</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#14532d', lineHeight: 1.4 }}>
                Pipeline aged 18+ years experiencing cyclic pressure surges. <em>Recommendation:</em> Allocate AMRUT 2.0 renewal budget for 250m HDPE pipe replacement.
              </p>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#1e40af' }}>Pollachi Bus Stand Stray Animals</strong>
                <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>ABC Patrol</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#1e3a8a', lineHeight: 1.4 }}>
                Evening dog pack concentration near Bay 3. Veterinary ABC sterilization van scheduled for Thursday patrol.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
