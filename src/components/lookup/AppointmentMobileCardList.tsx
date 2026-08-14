import React from 'react';
import {
  Appointment,
  APPOINTMENT_TYPE_LABELS,
  isCancellableAppointment,
  isTransferableAppointment,
} from '../../types/appointment';
import { StatusBadge, PaymentBadge } from '../common/Badge';
import { formatDateBR, formatCurrency, formatCPF } from '../../utils/formatters';
import {
  Eye,
  CreditCard,
  ArrowRightLeft,
  XCircle,
  Calendar,
  Stethoscope,
  User,
} from 'lucide-react';
import { Button } from '../common/Button';

interface AppointmentMobileCardListProps {
  appointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
  onEditBilling: (appointment: Appointment) => void;
  onTransfer: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

export const AppointmentMobileCardList: React.FC<AppointmentMobileCardListProps> = ({
  appointments,
  onViewDetails,
  onEditBilling,
  onTransfer,
  onCancel,
}) => {
  return (
    <div
      className="d-flex flex-column gap-3"
      role="region"
      aria-label="Lista de agendamentos para celular"
    >
      {appointments.map((apt) => (
        <div key={apt.id} className="card shadow-sm border p-3">
          <div className="d-flex align-items-start justify-content-between gap-2 mb-2 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <Calendar size={16} className="text-primary-600" aria-hidden="true" />
              <span className="fw-bold text-dark fs-6">
                {formatDateBR(apt.date)} • {apt.startTime} - {apt.endTime}
              </span>
            </div>
            <StatusBadge status={apt.status} />
          </div>

          <div className="mb-3">
            <h4 className="fs-6 fw-bold text-dark mb-1">{apt.patientName}</h4>
            <div className="d-flex flex-column gap-1 text-secondary small">
              <span className="d-flex align-items-center gap-1">
                <User size={13} aria-hidden="true" />
                CPF: {formatCPF(apt.patientCpf)}
              </span>
              <span className="d-flex align-items-center gap-1">
                <Stethoscope size={13} className="text-primary-600" aria-hidden="true" />
                {apt.doctorName} ({apt.doctorSpecialty})
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded mb-3 small">
            <div>
              <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                Tipo:
              </span>
              <span className="fw-semibold text-dark">
                {APPOINTMENT_TYPE_LABELS[apt.type] || apt.type}
              </span>
            </div>
            <div className="text-end">
              <span className="fw-bold text-dark d-block">
                {formatCurrency(apt.payment.amount)}
              </span>
              <PaymentBadge status={apt.payment.status} />
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              className="grow btn-icon-on-mobile"
              onClick={() => onViewDetails(apt)}
              leftIcon={<Eye size={14} />}
              aria-label={`Ver detalhes da consulta de ${apt.patientName}`}
            >
              Detalhes
            </Button>

            <Button
              variant="light"
              size="sm"
              className="btn-icon-on-mobile"
              onClick={() => onEditBilling(apt)}
              leftIcon={<CreditCard size={14} />}
              title="Gerenciar Faturamento"
              aria-label={`Gerenciar faturamento da consulta de ${apt.patientName}`}
            >
              Faturamento
            </Button>

            {isTransferableAppointment(apt.status) && (
              <Button
                variant="light"
                size="sm"
                className="btn-icon-on-mobile"
                onClick={() => onTransfer(apt)}
                leftIcon={<ArrowRightLeft size={14} />}
                title="Transferir Consulta"
                aria-label={`Transferir consulta de ${apt.patientName}`}
              >
                Transferir
              </Button>
            )}

            {isCancellableAppointment(apt.status) && (
              <Button
                variant="danger"
                size="sm"
                className="btn-icon-on-mobile"
                onClick={() => onCancel(apt)}
                leftIcon={<XCircle size={14} />}
                title="Cancelar Consulta"
                aria-label={`Cancelar consulta de ${apt.patientName}`}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
