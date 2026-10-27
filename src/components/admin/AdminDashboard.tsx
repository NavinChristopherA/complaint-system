import React, { useState } from 'react';
import { GrievanceTicket, OfficerAssignment } from '../../types/grievance';
import { UserPersona } from '../../types/user';
import { Language, TRANSLATIONS } from '../../utils/translations';
import { POLLACHI_WARDS } from '../../data/pollachiWards';
import { TicketTable } from './TicketTable';
import { WardHeatmap } from './WardHeatmap';
import { AnalyticsInsights } from './AnalyticsInsights';
import { TicketDetailModal } from './TicketDetailModal';
import { AssignOfficerModal } from './AssignOfficerModal';
import { ResolveTicketModal } from './ResolveTicketModal';
import { updateTicketStatus, assignOfficerToTicket, saveTickets } from '../../services/storageService';
import { PollachiCityMap } from '../common/PollachiCityMap';
import { AITriageOverview } from './AITriageOverview';
import { AIReviewQueue } from './AIReviewQueue';
import { 
  ShieldAlert, 
  Sparkles, 
  ListFilter, 
  Map, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users,
  Building,
  Download,
  Zap,
  Layers
} from 'lucide-react';

interface AdminDashboardProps {
  tickets: GrievanceTicket[];
  onTicketsUpdated: (tickets: GrievanceTicket[]) => void;
  activePersona: UserPersona;
  language: Language;
  onShowToast?: (title: string, msg: string, type?: 'success' | 'warning' | 'info' | 'critical') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tickets,
  onTicketsUpdated,
  activePersona,
  language,
  onShowToast
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'queue' | 'heatmap' | 'analytics' | 'map' | 'ai-triage'>('queue');

  // Modal States
  const [detailTicket, setDetailTicket] = useState<GrievanceTicket | null>(null);
  const [assignTicket, setAssignTicket] = useState<GrievanceTicket | null>(null);
  const [resolveTicket, setResolveTicket] = useState<GrievanceTicket | null>(null);

  // Critical alerts
  const criticalUnassigned = tickets.filter(t => t.urgency === 'CRITICAL' && !t.assignedOfficer && t.status !== 'RESOLVED');
  const breachedTickets = tickets.filter(t => t.isSlaBreached && t.status !== 'RESOLVED');
  const unassignedTickets = tickets.filter(t => !t.assignedOfficer && t.status !== 'RESOLVED');

  const handleUpdateTicketInList = (updated: GrievanceTicket) => {
    const nextList = tickets.map(t => t.id === updated.id ? updated : t);
    onTicketsUpdated(nextList);
    if (detailTicket && detailTicket.id === updated.id) {
      setDetailTicket(updated);
    }
  };

  const handleQuickStatusChange = (ticketId: string, newStatus: GrievanceTicket['status']) => {
    const updated = updateTicketStatus(
      ticketId, 
      newStatus, 
      activePersona.name, 
      activePersona.designation, 
      `Status changed to ${newStatus} by ${activePersona.name}`
    );
    if (updated) {
      handleUpdateTicketInList(updated);
      if (onShowToast) onShowToast('Status Updated', `Ticket #${ticketId} changed to ${newStatus}`, 'info');
    }
  };

  // AI Batch Auto-Assign Facility
  const handleBatchAutoAssign = () => {
    if (unassignedTickets.length === 0) {
      if (onShowToast) onShowToast('All Assigned', 'There are no pending unassigned tickets.', 'info');
      return;
    }

    const updatedList = [...tickets];
    let assignCount = 0;

    unassignedTickets.forEach(ticket => {
      const ward = POLLACHI_WARDS.find(w => w.id === ticket.wardId) || POLLACHI_WARDS[0];
      const isEngineering = ticket.departmentId === 'dept-water' || ticket.departmentId === 'dept-roads' || ticket.departmentId === 'dept-electrical';
      const staff = isEngineering ? ward.juniorEngineer : ward.sanitaryInspector;

      const assignment: OfficerAssignment = {
        officerId: staff.id,
        name: staff.name,
        role: staff.role,
        phone: staff.phone,
        department: ticket.departmentId,
        assignedAt: new Date().toISOString()
      };

      const ticketIdx = updatedList.findIndex(t => t.id === ticket.id);
      if (ticketIdx !== -1) {
        const item = { ...updatedList[ticketIdx] };
        item.assignedOfficer = assignment;
        item.status = 'ASSIGNED';
        item.updatedAt = new Date().toISOString();
        item.timeline.push({
          id: `tl-${Date.now()}-${assignCount}`,
          timestamp: new Date().toISOString(),
          status: 'ASSIGNED',
          actor: 'CivicOps AI Batch Dispatcher',
          actorRole: 'Automated System',
          comment: `AI auto-routed to ${staff.name} (${staff.role}) based on Ward ${ward.wardNumber} territorial jurisdiction and load balancing.`,
          isAiAction: true
        });
        updatedList[ticketIdx] = item;
        assignCount++;
      }
    });

    saveTickets(updatedList);
    onTicketsUpdated(updatedList);
    if (onShowToast) {
      onShowToast('AI Batch Dispatch Completed', `Automatically assigned ${assignCount} tickets to ward officers.`, 'success');
    }
  };

  // CSV Audit Export Facility
  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Ward Number', 'Ward Name', 'Landmark', 'Department', 'Urgency', 'AI Urgency Score', 'Status', 'SLA Target (Hours)', 'SLA Breached', 'Assigned Officer', 'Reported Date'];
    const rows = tickets.map(t => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      t.wardId,
      `"${t.wardName}"`,
      `"${t.landmark}"`,
      `"${t.departmentId}"`,
      `"${t.urgency}"`,
      t.aiTriage.urgencyScore,
      `"${t.status}"`,
      t.slaHoursTotal,
      t.isSlaBreached ? 'YES' : 'NO',
      `"${t.assignedOfficer?.name || 'Unassigned'}"`,
      `"${new Date(t.createdAt).toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pollachi_civic_grievance_audit_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('CSV Downloaded', 'Exported full grievance audit log for municipal review.', 'success');
  };

  return (
    <div className="container" style={{ margin: '2rem auto' }}>
      {/* Top Banner & Persona Status */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          padding: '1.75rem 2rem',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '1.5rem',
          border: '1px solid #334155',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-ai">
                <Sparkles size={12} /> CivicOps Command
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Municipal Corporation of Pollachi (Coimbatore District)
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 800, color: 'white' }}>
              {language === 'ta' ? 'மாநகராட்சி தலைமை கட்டுப்பாட்டு மையம்' : 'Civic Grievance Command & Redressal Center'}
            </h2>
          </div>

          {/* Quick Action Tools: AI Batch Assign & CSV Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleBatchAutoAssign}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                fontSize: '0.82rem',
                padding: '0.5rem 0.9rem'
              }}
              title="One-click AI workload-balanced dispatch for all unassigned tickets"
            >
              <Zap size={15} />
              AI Batch Auto-Dispatch ({unassignedTickets.length})
            </button>

            <button
              onClick={handleExportCSV}
              className="btn btn-secondary"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontSize: '0.82rem',
                padding: '0.5rem 0.9rem'
              }}
              title="Export complete grievance register to CSV for Commissioner review"
            >
              <Download size={15} />
              Export Audit CSV
            </button>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{activePersona.avatar}</span>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Active Authority
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                  {activePersona.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Attention Bar (Critical / SLA Breaches) */}
      {(criticalUnassigned.length > 0 || breachedTickets.length > 0) && (
        <div 
          style={{
            background: '#fee2e2',
            border: '1.5px solid #fca5a5',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            animation: 'pulseGlow 3s infinite ease-in-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#dc2626', color: 'white', padding: '0.45rem', borderRadius: '8px', display: 'flex' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#991b1b', display: 'block' }}>
                Municipal Priority Warning: {breachedTickets.length} SLA Escalation(s) & {criticalUnassigned.length} Unassigned Critical Grievance(s)
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#b91c1c' }}>
                Immediate field assignment required to maintain Pollachi citizen charter compliance.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {criticalUnassigned[0] && (
              <button
                onClick={() => setAssignTicket(criticalUnassigned[0])}
                className="btn btn-danger"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                Dispatch Critical (#{criticalUnassigned[0].id})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div 
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--slate-200)',
          marginBottom: '1.5rem',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveTab('queue')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'queue' ? '3px solid var(--primary-700)' : '3px solid transparent',
            color: activeTab === 'queue' ? 'var(--primary-800)' : 'var(--slate-600)',
            fontWeight: activeTab === 'queue' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ListFilter size={18} />
          {t.navTriageQueue} ({tickets.length})
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'heatmap' ? '3px solid var(--primary-700)' : '3px solid transparent',
            color: activeTab === 'heatmap' ? 'var(--primary-800)' : 'var(--slate-600)',
            fontWeight: activeTab === 'heatmap' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Map size={18} />
          {t.navWardHeatmap}
        </button>

        <button
          onClick={() => setActiveTab('map')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'map' ? '3px solid var(--primary-700)' : '3px solid transparent',
            color: activeTab === 'map' ? 'var(--primary-800)' : 'var(--slate-600)',
            fontWeight: activeTab === 'map' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={18} />
          Corridor Map
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid var(--primary-700)' : '3px solid transparent',
            color: activeTab === 'analytics' ? 'var(--primary-800)' : 'var(--slate-600)',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BarChart3 size={18} />
          {t.navAnalytics}
        </button>

        <button
          data-testid="admin-ai-triage-tab-btn"
          onClick={() => setActiveTab('ai-triage')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'ai-triage' ? 'rgba(37, 99, 235, 0.05)' : 'none',
            border: 'none',
            borderBottom: activeTab === 'ai-triage' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'ai-triage' ? '#1d4ed8' : 'var(--slate-600)',
            fontWeight: activeTab === 'ai-triage' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Sparkles size={18} color={activeTab === 'ai-triage' ? '#2563eb' : undefined} />
          AI Triage & Review ({tickets.filter(t => t.status === 'PENDING_TRIAGE' || t.aiTriage.categoryConfidence < 0.85).length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'queue' && (
        <TicketTable
          tickets={tickets}
          onViewTicket={(t) => setDetailTicket(t)}
          onAssignOfficer={(t) => setAssignTicket(t)}
          onResolveTicket={(t) => setResolveTicket(t)}
        />
      )}

      {activeTab === 'heatmap' && (
        <WardHeatmap
          tickets={tickets}
          onSelectTicket={(t) => setDetailTicket(t)}
        />
      )}

      {activeTab === 'map' && (
        <PollachiCityMap
          tickets={tickets}
          interactive={true}
          onSelectWard={(wardId) => {
            const match = tickets.find(t => t.wardId === wardId);
            if (match) setDetailTicket(match);
          }}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsInsights tickets={tickets} />
      )}

      {activeTab === 'ai-triage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <AITriageOverview tickets={tickets} />
          <AIReviewQueue
            tickets={tickets}
            onTicketUpdated={handleUpdateTicketInList}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* Modals */}
      {detailTicket && (
        <TicketDetailModal
          ticket={detailTicket}
          isOpen={!!detailTicket}
          onClose={() => setDetailTicket(null)}
          onOpenAssign={(t) => setAssignTicket(t)}
          onOpenResolve={(t) => setResolveTicket(t)}
          onUpdateStatus={(newStatus) => handleQuickStatusChange(detailTicket.id, newStatus)}
          activePersona={activePersona}
        />
      )}

      {assignTicket && (
        <AssignOfficerModal
          ticket={assignTicket}
          isOpen={!!assignTicket}
          onClose={() => setAssignTicket(null)}
          onAssigned={(updated) => handleUpdateTicketInList(updated)}
          activePersona={activePersona}
        />
      )}

      {resolveTicket && (
        <ResolveTicketModal
          ticket={resolveTicket}
          isOpen={!!resolveTicket}
          onClose={() => setResolveTicket(null)}
          onResolved={(updated) => handleUpdateTicketInList(updated)}
          activePersona={activePersona}
        />
      )}
    </div>
  );
};
