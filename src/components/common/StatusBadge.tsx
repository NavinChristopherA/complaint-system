import React from 'react';
import { TicketStatus, UrgencyLevel } from '../../types/grievance';
import { AlertTriangle, CheckCircle, Clock, Hourglass, ShieldAlert, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status?: TicketStatus;
  urgency?: UrgencyLevel;
  slaBreached?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, urgency, slaBreached }) => {
  if (slaBreached) {
    return (
      <span className="badge badge-critical" style={{ animation: 'pulseGlow 2s infinite ease' }}>
        <ShieldAlert size={12} />
        SLA Escalated
      </span>
    );
  }

  if (urgency) {
    switch (urgency) {
      case 'CRITICAL':
        return (
          <span className="badge badge-critical">
            <AlertTriangle size={12} />
            Critical
          </span>
        );
      case 'HIGH':
        return (
          <span className="badge badge-high">
            <AlertTriangle size={12} />
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="badge badge-medium">
            <Clock size={12} />
            Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="badge badge-low">
            <Clock size={12} />
            Low
          </span>
        );
    }
  }

  if (status) {
    switch (status) {
      case 'PENDING_TRIAGE':
        return (
          <span className="badge badge-pending">
            <Hourglass size={12} />
            Pending Triage
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="badge badge-progress">
            <Clock size={12} />
            Assigned
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="badge badge-progress" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            <Clock size={12} />
            In Progress
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="badge badge-resolved">
            <CheckCircle size={12} />
            Resolved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="badge badge-low">
            <XCircle size={12} />
            Rejected
          </span>
        );
    }
  }

  return null;
};
