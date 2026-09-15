import React, { useState } from 'react';
import { GrievanceTicket, OfficerAssignment } from '../../types/grievance';
import { POLLACHI_WARDS } from '../../data/pollachiWards';
import { assignOfficerToTicket } from '../../services/storageService';
import { UserPersona } from '../../types/user';
import { Sparkles, UserCheck, Phone, AlertCircle, X, ShieldAlert } from 'lucide-react';

interface AssignOfficerModalProps {
  ticket: GrievanceTicket;
  isOpen: boolean;
  onClose: () => void;
  onAssigned: (updated: GrievanceTicket) => void;
  activePersona: UserPersona;
}

export const AssignOfficerModal: React.FC<AssignOfficerModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onAssigned,
  activePersona
}) => {
  if (!isOpen) return null;

  const ward = POLLACHI_WARDS.find(w => w.id === ticket.wardId) || POLLACHI_WARDS[0];

  // Candidates for this department / ward
  const primaryInspector = ward.sanitaryInspector;
  const primaryEngineer = ward.juniorEngineer;

  // Decide AI recommended officer based on ticket department
  const isEngineeringDept = ticket.departmentId === 'dept-water' || ticket.departmentId === 'dept-roads' || ticket.departmentId === 'dept-electrical';
  const recommendedStaff = isEngineeringDept ? primaryEngineer : primaryInspector;

  const [selectedStaffId, setSelectedStaffId] = useState(recommendedStaff.id);
  const [dispatchRemarks, setDispatchRemarks] = useState(
    `Deploy maintenance crew to ${ticket.landmark} (${ticket.wardName}) for immediate inspection and redressal.`
  );

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = selectedStaffId === primaryEngineer.id ? primaryEngineer : primaryInspector;

    const assignment: OfficerAssignment = {
      officerId: staff.id,
      name: staff.name,
      role: staff.role,
      phone: staff.phone,
      department: ticket.departmentId,
      assignedAt: new Date().toISOString()
    };

    const updated = assignOfficerToTicket(ticket.id, assignment, activePersona.name, dispatchRemarks);
    if (updated) {
      onAssigned(updated);
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      className="animate-fade-in"
    >
      <div 
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge badge-pending" style={{ marginBottom: '0.25rem' }}>
              Field Dispatch
            </span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--slate-900)' }}>
              Assign Field Officer to #{ticket.id}
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* AI Recommendation Box */}
        <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.82rem', color: '#065f46' }}>
            <strong>AI Dispatch Recommendation: </strong>
            Assigned to <strong>{recommendedStaff.name}</strong> ({recommendedStaff.role}) based on Ward {ward.wardNumber} territorial jurisdiction and current active workload ({recommendedStaff.activeTicketCount} tickets).
          </div>
        </div>

        <form onSubmit={handleAssignSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--slate-800)' }}>
              Select Municipal Officer:
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.75rem', 
                  border: selectedStaffId === primaryEngineer.id ? '2px solid #059669' : '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  background: selectedStaffId === primaryEngineer.id ? '#ecfdf5' : 'white',
                  cursor: 'pointer' 
                }}
              >
                <input 
                  type="radio" 
                  name="staff" 
                  value={primaryEngineer.id} 
                  checked={selectedStaffId === primaryEngineer.id} 
                  onChange={() => setSelectedStaffId(primaryEngineer.id)} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-800)' }}>
                    {primaryEngineer.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {primaryEngineer.role} • 📞 {primaryEngineer.phone} • {primaryEngineer.activeTicketCount} active cases
                  </div>
                </div>
              </label>

              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.75rem', 
                  border: selectedStaffId === primaryInspector.id ? '2px solid #059669' : '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  background: selectedStaffId === primaryInspector.id ? '#ecfdf5' : 'white',
                  cursor: 'pointer' 
                }}
              >
                <input 
                  type="radio" 
                  name="staff" 
                  value={primaryInspector.id} 
                  checked={selectedStaffId === primaryInspector.id} 
                  onChange={() => setSelectedStaffId(primaryInspector.id)} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-800)' }}>
                    {primaryInspector.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {primaryInspector.role} • 📞 {primaryInspector.phone} • {primaryInspector.activeTicketCount} active cases
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--slate-800)' }}>
              Dispatch Instructions & Special Equipment Remarks:
            </label>
            <textarea
              rows={3}
              value={dispatchRemarks}
              onChange={(e) => setDispatchRemarks(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-300)',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <UserCheck size={16} />
              Confirm Assignment & Notify Officer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
