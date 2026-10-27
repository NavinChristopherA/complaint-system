import React, { useState } from 'react';
import { GrievanceTicket } from '../../types/grievance';
import { POLLACHI_WARDS } from '../../data/pollachiWards';
import { POLLACHI_DEPARTMENTS } from '../../data/departments';
import { computeSlaStatus } from '../../services/slaService';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Eye, 
  UserCheck, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface TicketTableProps {
  tickets: GrievanceTicket[];
  onViewTicket: (ticket: GrievanceTicket) => void;
  onAssignOfficer: (ticket: GrievanceTicket) => void;
  onResolveTicket: (ticket: GrievanceTicket) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  onViewTicket,
  onAssignOfficer,
  onResolveTicket
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wardFilter, setWardFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [slaBreachedOnly, setSlaBreachedOnly] = useState(false);

  // Filter logic
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.landmark.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWard = wardFilter === 'ALL' || String(ticket.wardId) === wardFilter;
    const matchesDept = deptFilter === 'ALL' || ticket.departmentId === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || ticket.urgency === urgencyFilter;
    const matchesBreach = !slaBreachedOnly || ticket.isSlaBreached;

    return matchesSearch && matchesWard && matchesDept && matchesStatus && matchesUrgency && matchesBreach;
  });

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, keyword, citizen, landmark..."
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-300)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Quick Breached Toggle */}
          <button
            type="button"
            onClick={() => setSlaBreachedOnly(!slaBreachedOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: slaBreachedOnly ? '1.5px solid #ef4444' : '1px solid var(--slate-300)',
              background: slaBreachedOnly ? '#fee2e2' : 'white',
              color: slaBreachedOnly ? '#b91c1c' : 'var(--slate-700)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={14} />
            {slaBreachedOnly ? 'Showing SLA Breached Only' : 'Filter SLA Escalated'}
          </button>
        </div>

        {/* Multi-Select Filters Row */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Ward Select */}
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--slate-300)', fontSize: '0.8rem', background: 'white' }}
          >
            <option value="ALL">All Pollachi Wards (1-36)</option>
            {POLLACHI_WARDS.map(w => (
              <option key={w.id} value={String(w.id)}>
                Ward {w.wardNumber} - {w.name.split('-')[0].trim()}
              </option>
            ))}
          </select>

          {/* Department Select */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--slate-300)', fontSize: '0.8rem', background: 'white' }}
          >
            <option value="ALL">All Departments</option>
            {POLLACHI_DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--slate-300)', fontSize: '0.8rem', background: 'white' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_TRIAGE">Pending Triage</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Urgency Select */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--slate-300)', fontSize: '0.8rem', background: 'white' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {(wardFilter !== 'ALL' || deptFilter !== 'ALL' || statusFilter !== 'ALL' || urgencyFilter !== 'ALL' || searchTerm || slaBreachedOnly) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setWardFilter('ALL');
                setDeptFilter('ALL');
                setStatusFilter('ALL');
                setUrgencyFilter('ALL');
                setSlaBreachedOnly(false);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary-700)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Datagrid Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--slate-200)', color: 'var(--slate-600)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Ticket ID</th>
              <th style={{ padding: '0.75rem 1rem' }}>Issue & Department</th>
              <th style={{ padding: '0.75rem 1rem' }}>Ward & Spot</th>
              <th style={{ padding: '0.75rem 1rem' }}>AI Urgency</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>SLA Time</th>
              <th style={{ padding: '0.75rem 1rem' }}>Assigned To</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-400)' }}>
                  No grievances found matching the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredTickets.map(ticket => {
                const sla = computeSlaStatus(ticket);
                const dept = POLLACHI_DEPARTMENTS.find(d => d.id === ticket.departmentId);

                return (
                  <tr 
                    key={ticket.id}
                    style={{ 
                      borderBottom: '1px solid var(--slate-200)',
                      backgroundColor: ticket.isSlaBreached ? '#fff5f5' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {/* ID */}
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      <div>{ticket.id}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', fontWeight: 400 }}>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Title & Dept */}
                    <td style={{ padding: '0.85rem 1rem', maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ticket.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                        {dept?.name || ticket.departmentId}
                      </div>
                    </td>

                    {/* Ward */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                        Ward {ticket.wardId}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                        {ticket.landmark}
                      </div>
                    </td>

                    {/* AI Urgency */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge urgency={ticket.urgency} />
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                        Score: {ticket.aiTriage.urgencyScore}/100
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={ticket.status} slaBreached={ticket.isSlaBreached} />
                    </td>

                    {/* SLA */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: sla.isOverdue ? '#b91c1c' : sla.badgeClass === 'warning' ? '#b45309' : '#047857' 
                        }}
                      >
                        {sla.displayText}
                      </span>
                    </td>

                    {/* Assigned Officer */}
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem' }}>
                      {ticket.assignedOfficer ? (
                        <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
                          {ticket.assignedOfficer.name}
                        </span>
                      ) : (
                        <span style={{ color: '#c2410c', fontWeight: 600 }}>Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          onClick={() => onViewTicket(ticket)}
                          title="View Full Dossier"
                          style={{
                            background: 'var(--slate-100)',
                            border: '1px solid var(--slate-200)',
                            borderRadius: '4px',
                            padding: '0.35rem 0.55rem',
                            cursor: 'pointer',
                            color: 'var(--slate-700)'
                          }}
                        >
                          <Eye size={14} />
                        </button>

                        {ticket.status !== 'RESOLVED' && (
                          <>
                            <button
                              onClick={() => onAssignOfficer(ticket)}
                              title="Assign / Reassign Officer"
                              style={{
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                borderRadius: '4px',
                                padding: '0.35rem 0.55rem',
                                cursor: 'pointer',
                                color: '#047857'
                              }}
                            >
                              <UserCheck size={14} />
                            </button>

                            <button
                              onClick={() => onResolveTicket(ticket)}
                              title="Mark Resolved"
                              style={{
                                background: '#d1fae5',
                                border: '1px solid #6ee7b7',
                                borderRadius: '4px',
                                padding: '0.35rem 0.55rem',
                                cursor: 'pointer',
                                color: '#065f46'
                              }}
                            >
                              <CheckCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
