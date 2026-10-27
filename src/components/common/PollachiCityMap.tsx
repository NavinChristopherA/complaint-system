import React, { useState } from 'react';
import { POLLACHI_WARDS } from '../../data/pollachiWards';
import { GrievanceTicket } from '../../types/grievance';
import { MapPin, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PollachiCityMapProps {
  tickets?: GrievanceTicket[];
  selectedWardId?: number;
  onSelectWard?: (wardId: number, landmark?: string) => void;
  interactive?: boolean;
}

interface MapHotspot {
  id: string;
  name: string;
  tamilName: string;
  wardId: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'transit' | 'commercial' | 'residential' | 'landmark';
}

const POLLACHI_HOTSPOTS: MapHotspot[] = [
  { id: 'hs-1', name: 'Suleeswaranpatti Bypass', tamilName: 'சூலேஸ்வரன்பட்டி', wardId: 1, x: 38, y: 15, type: 'residential' },
  { id: 'hs-2', name: 'Aachi Patti Checkpost', tamilName: 'ஆச்சிபட்டி', wardId: 3, x: 62, y: 18, type: 'residential' },
  { id: 'hs-3', name: 'Vadakkipalayam Road', tamilName: 'வடக்கிப்பாளையம் சாலை', wardId: 4, x: 75, y: 26, type: 'residential' },
  { id: 'hs-4', name: 'Mahalingapuram Arch', tamilName: 'மகாலிங்கபுரம் வளைவு', wardId: 14, x: 26, y: 40, type: 'landmark' },
  { id: 'hs-5', name: 'Central Bus Stand & Junction', tamilName: 'மத்திய பேருந்து நிலையம்', wardId: 12, x: 50, y: 44, type: 'transit' },
  { id: 'hs-6', name: 'Gandhi Statue Circle & Bazaar', tamilName: 'காந்தி சிலை சந்திப்பு', wardId: 13, x: 44, y: 52, type: 'commercial' },
  { id: 'hs-7', name: 'Venkatesa Colony Club', tamilName: 'வெங்கடேசா காலனி', wardId: 9, x: 65, y: 45, type: 'residential' },
  { id: 'hs-8', name: 'Palakkad Road Overbridge', tamilName: 'பாலக்காடு ரோடு', wardId: 16, x: 18, y: 55, type: 'transit' },
  { id: 'hs-9', name: 'Govt. HQ Hospital (GH)', tamilName: 'அரசு தலைமை மருத்துவமனை', wardId: 17, x: 24, y: 64, type: 'landmark' },
  { id: 'hs-10', name: 'Market Road & Uzhavar Sandhai', tamilName: 'உழவர் சந்தை & மார்க்கெட்', wardId: 18, x: 48, y: 68, type: 'commercial' },
  { id: 'hs-11', name: 'CTC Depot & Meenkarai Road', tamilName: 'சிடிசி டெப்போ', wardId: 7, x: 78, y: 56, type: 'transit' },
  { id: 'hs-12', name: 'Kottur Road Junction', tamilName: 'கோட்டூர் ரோடு', wardId: 19, x: 40, y: 82, type: 'residential' },
  { id: 'hs-13', name: 'Valparai Road Starting Point', tamilName: 'வால்பாறை ரோடு சந்திப்பு', wardId: 20, x: 60, y: 88, type: 'transit' },
];

export const PollachiCityMap: React.FC<PollachiCityMapProps> = ({
  tickets = [],
  selectedWardId,
  onSelectWard,
  interactive = true
}) => {
  const [hoveredHotspot, setHoveredHotspot] = useState<MapHotspot | null>(null);

  // Compute active tickets per ward for pulse effects
  const getActiveCountForWard = (wardId: number) => {
    return tickets.filter(t => t.wardId === wardId && t.status !== 'RESOLVED' && t.status !== 'REJECTED').length;
  };

  return (
    <div 
      style={{
        background: 'linear-gradient(145deg, #0f172a 0%, #064e3b 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        color: 'white',
        border: '1px solid #1e293b',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Map Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📍</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: 800 }}>
              Interactive Pollachi Municipal Map
            </h3>
            <span className="badge badge-ai" style={{ fontSize: '0.65rem' }}>
              Live Civic Corridors
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {interactive ? 'Click any landmark or zone to pin location / inspect grievances' : 'Municipal jurisdiction boundaries'}
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: '#cbd5e1' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> Active Grievance
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Redressed
          </span>
        </div>
      </div>

      {/* SVG Map Canvas Container */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          background: '#0a0f1d',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #334155',
          overflow: 'hidden'
        }}
      >
        {/* SVG Roads & Municipal Sectors */}
        <svg 
          viewBox="0 0 1000 600" 
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        >
          {/* Subtle Sector Shading */}
          <rect x="50" y="50" width="400" height="240" rx="20" fill="#064e3b" fillOpacity="0.1" />
          <rect x="470" y="50" width="480" height="240" rx="20" fill="#0284c7" fillOpacity="0.08" />
          <rect x="50" y="310" width="400" height="240" rx="20" fill="#ea580c" fillOpacity="0.08" />
          <rect x="470" y="310" width="480" height="240" rx="20" fill="#10b981" fillOpacity="0.08" />

          {/* Major Highway Artery 1: Coimbatore - Pollachi - Dindigul Highway (NH 83) */}
          <path d="M 500,20 L 500,280 L 480,360 L 520,580" stroke="#334155" strokeWidth="14" strokeLinecap="round" />
          <path d="M 500,20 L 500,280 L 480,360 L 520,580" stroke="#64748b" strokeWidth="4" strokeDasharray="10 8" />

          {/* Major Highway Artery 2: Palakkad - Pollachi - Meenkarai Road (SH 19) */}
          <path d="M 40,320 L 260,250 L 500,280 L 780,340 L 960,370" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
          <path d="M 40,320 L 260,250 L 500,280 L 780,340 L 960,370" stroke="#fbbf24" strokeWidth="3" strokeDasharray="8 6" />

          {/* Major Road 3: Valparai Ghat Road (Scenic Corridor) */}
          <path d="M 500,280 L 580,480 L 640,580" stroke="#334155" strokeWidth="8" />
          <path d="M 500,280 L 580,480 L 640,580" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />

          {/* Railway Line passing Pollachi Junction */}
          <path d="M 30,180 L 490,260 L 970,220" stroke="#475569" strokeWidth="3" strokeDasharray="12 4 4 4" />

          {/* Sector Labels */}
          <text x="80" y="90" fill="#34d399" fontSize="16" fontWeight="bold" opacity="0.6">NORTH-WEST ZONE (Mahalingapuram / Suleeswaranpatti)</text>
          <text x="560" y="90" fill="#38bdf8" fontSize="16" fontWeight="bold" opacity="0.6">NORTH-EAST ZONE (Aachi Patti / Makkinampatti)</text>
          <text x="80" y="550" fill="#fb923c" fontSize="16" fontWeight="bold" opacity="0.6">SOUTH-WEST ZONE (Palakkad Road / GH Area)</text>
          <text x="560" y="550" fill="#4ade80" fontSize="16" fontWeight="bold" opacity="0.6">SOUTH-EAST ZONE (Market / CTC / Valparai Link)</text>
        </svg>

        {/* Interactive Hotspot Pins */}
        {POLLACHI_HOTSPOTS.map((hs) => {
          const activeCount = getActiveCountForWard(hs.wardId);
          const isSelected = selectedWardId === hs.wardId;
          const hasEmergency = activeCount > 0;

          return (
            <div
              key={hs.id}
              onClick={() => {
                if (interactive && onSelectWard) {
                  onSelectWard(hs.wardId, hs.name);
                }
              }}
              onMouseEnter={() => setHoveredHotspot(hs)}
              onMouseLeave={() => setHoveredHotspot(null)}
              style={{
                position: 'absolute',
                left: `${hs.x}%`,
                top: `${hs.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: interactive ? 'pointer' : 'default',
                zIndex: isSelected ? 20 : 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* Pin Pulsing Glow */}
              <div 
                style={{
                  width: isSelected ? '26px' : '20px',
                  height: isSelected ? '26px' : '20px',
                  borderRadius: '50%',
                  background: hasEmergency ? '#ef4444' : '#10b981',
                  border: '2px solid white',
                  boxShadow: hasEmergency ? '0 0 15px #ef4444' : '0 0 10px #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 800,
                  transition: 'all 0.2s ease',
                  animation: hasEmergency ? 'pulseGlow 2s infinite ease-in-out' : 'none'
                }}
              >
                {activeCount > 0 ? activeCount : '✓'}
              </div>

              {/* Label */}
              <div 
                style={{
                  background: isSelected ? '#047857' : 'rgba(15, 23, 42, 0.85)',
                  color: isSelected ? '#ffffff' : '#e2e8f0',
                  border: isSelected ? '1px solid #34d399' : '1px solid #334155',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  marginTop: '3px',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                }}
              >
                {hs.name}
              </div>
            </div>
          );
        })}

        {/* Live Hover Tooltip Drawer inside Map */}
        {hoveredHotspot && (
          <div 
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1.5px solid #10b981',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              backdropFilter: 'blur(8px)',
              maxWidth: '320px',
              zIndex: 30,
              fontSize: '0.78rem',
              boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
            }}
            className="animate-fade-in"
          >
            <div style={{ fontWeight: 800, color: '#34d399', marginBottom: '2px' }}>
              {hoveredHotspot.name} (Ward {hoveredHotspot.wardId})
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '4px' }}>
              {hoveredHotspot.tamilName}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>Active Issues: <strong style={{ color: getActiveCountForWard(hoveredHotspot.wardId) > 0 ? '#f87171' : '#4ade80' }}>{getActiveCountForWard(hoveredHotspot.wardId)}</strong></span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>Click to Select</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Ward Info Banner */}
      {selectedWardId && (
        <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.06)', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.12)', fontSize: '0.8rem' }}>
          <div>
            📍 Currently Focused on: <strong style={{ color: '#6ee7b7' }}>Ward {selectedWardId}</strong> ({POLLACHI_WARDS.find(w => w.id === selectedWardId)?.name})
          </div>
          <span style={{ color: '#a7f3d0', fontSize: '0.75rem' }}>
            Officer: {POLLACHI_WARDS.find(w => w.id === selectedWardId)?.sanitaryInspector.name} ({POLLACHI_WARDS.find(w => w.id === selectedWardId)?.sanitaryInspector.phone})
          </span>
        </div>
      )}
    </div>
  );
};
