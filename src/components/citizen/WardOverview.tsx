import React, { useState } from 'react';
import { POLLACHI_WARDS } from '../../data/pollachiWards';
import { getTickets } from '../../services/storageService';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { MapPin, Phone, CheckCircle, Clock, Search, ShieldCheck } from 'lucide-react';

interface WardOverviewProps {
  language: Language;
}

export const WardOverview: React.FC<WardOverviewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  const allTickets = getTickets();

  // Dynamically calculate active and resolved tickets by ward
  const wardStats = POLLACHI_WARDS.map(ward => {
    const wardTickets = allTickets.filter(t => t.wardId === ward.id);
    const active = wardTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'REJECTED').length;
    const resolved = wardTickets.filter(t => t.status === 'RESOLVED').length;
    const baseResolved = ward.resolvedGrievances;
    const totalResolved = baseResolved + resolved;
    const total = active + totalResolved;
    const resolveRate = total > 0 ? Math.round((totalResolved / total) * 100) : 98;

    return {
      ...ward,
      computedActive: active,
      computedResolved: totalResolved,
      resolveRate
    };
  });

  const filteredWards = wardStats.filter(ward => {
    const matchesZone = selectedZone === 'ALL' || ward.zone === selectedZone;
    const matchesQuery = 
      ward.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ward.tamilName.includes(searchFilter) ||
      ward.landmarks.some(l => l.toLowerCase().includes(searchFilter.toLowerCase())) ||
      String(ward.wardNumber) === searchFilter.trim();
    return matchesZone && matchesQuery;
  });

  const zones = ['ALL', 'Central', 'North', 'South', 'East', 'West'];

  return (
    <div className="container" style={{ margin: '2rem auto' }}>
      {/* Header & Title */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <span className="badge badge-resolved" style={{ marginBottom: '0.5rem' }}>
          Pollachi Municipality • 36 Municipal Wards
        </span>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
          {language === 'ta' ? 'வார்டு வாரியாக மக்கள் குறைதீர்ப்பு நிலவரம்' : 'Ward Civic Scorecards & Public Transparency'}
        </h2>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', maxWidth: '700px', margin: '0 auto' }}>
          Real-time grievance statistics, dedicated Sanitary Inspectors, and civic performance metrics for all 36 wards of Pollachi.
        </p>
      </div>

      {/* Filters Bar */}
      <div 
        className="card"
        style={{
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Zone Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {zones.map(z => (
            <button
              key={z}
              type="button"
              onClick={() => setSelectedZone(z)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--slate-300)',
                background: selectedZone === z ? 'var(--primary-800)' : 'white',
                color: selectedZone === z ? 'white' : 'var(--slate-700)',
                fontWeight: selectedZone === z ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {z === 'ALL' ? 'All Wards' : `${z} Zone`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search ward or landmark..."
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-300)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Wards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredWards.map(ward => (
          <div 
            key={ward.id}
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: ward.computedActive > 4 ? '1.5px solid #fed7aa' : '1px solid var(--slate-200)'
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span 
                  style={{
                    background: 'var(--primary-100)',
                    color: 'var(--primary-800)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  Ward {ward.wardNumber} • {ward.zone} Zone
                </span>

                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>
                  {ward.resolveRate}% Resolved
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem 0', color: 'var(--slate-900)' }}>
                {ward.name}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', margin: '0 0 0.75rem 0' }}>
                {ward.tamilName}
              </p>

              {/* Landmarks */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--slate-600)', marginBottom: '0.85rem' }}>
                <MapPin size={13} style={{ color: '#ea580c', flexShrink: 0, marginTop: '2px' }} />
                <span>{ward.landmarks.join(', ')}</span>
              </div>
            </div>

            {/* Officer & Metrics Footer */}
            <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--slate-500)' }}>Sanitary Inspector:</span>
                <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{ward.sanitaryInspector.name}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#047857', fontWeight: 600 }}>
                  <CheckCircle size={13} /> {ward.computedResolved} Resolved
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: ward.computedActive > 3 ? '#c2410c' : 'var(--slate-600)', fontWeight: 600 }}>
                  <Clock size={13} /> {ward.computedActive} Active
                </div>
                <a 
                  href={`tel:${ward.sanitaryInspector.phone}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-700)', textDecoration: 'none', fontWeight: 600 }}
                >
                  <Phone size={12} /> {ward.sanitaryInspector.phone}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
