import React from 'react';
import { CheckCircle, Clock, UserCheck, AlertCircle, XCircle, Calendar } from 'lucide-react';
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS } from '../../types/appointment';
import { PaymentStatus, PAYMENT_STATUS_LABELS } from '../../types/payment';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={13} aria-hidden="true" />;
      case 'in_progress':
        return <UserCheck size={13} aria-hidden="true" />;
      case 'waiting':
        return <Clock size={13} aria-hidden="true" />;
      case 'confirmed':
        return <CheckCircle size={13} aria-hidden="true" />;
      case 'cancelled':
        return <XCircle size={13} aria-hidden="true" />;
      case 'no_show':
        return <AlertCircle size={13} aria-hidden="true" />;
      case 'scheduled':
      default:
        return <Calendar size={13} aria-hidden="true" />;
    }
  };

  return (
    <span className={`badge badge-${status} ${className}`} role="status">
      {getIcon()}
      <span>{APPOINTMENT_STATUS_LABELS[status] || status}</span>
    </span>
  );
};

interface PaymentBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({ status, className = '' }) => {
  const getStyleClass = () => {
    switch (status) {
      case 'paid':
        return 'badge-paid';
      case 'pending':
        return 'badge-pending';
      case 'billed':
        return 'badge-confirmed';
      case 'refunded':
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-scheduled';
    }
  };

  return (
    <span className={`badge ${getStyleClass()} ${className}`} role="status">
      <span>{PAYMENT_STATUS_LABELS[status] || status}</span>
    </span>
  );
};
