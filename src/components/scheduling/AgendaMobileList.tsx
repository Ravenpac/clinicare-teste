import React from 'react';
import { Doctor } from '../../types/doctor';
import { Appointment, BlockedTime, APPOINTMENT_TYPE_LABELS } from '../../types/appointment';
import { StatusBadge, PaymentBadge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { formatCurrency, formatCPF } from '../../utils/formatters';
import { Lock, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../common/Button';

interface AgendaMobileListProps {
  date: string;
  doctors: Doctor[];
  selectedDoctorId: string;
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  onSelectAppointment: (appointment: Appointment) => void;
  onOpenNewAppointmentModal: () => void;
}

export const AgendaMobileList: React.FC<AgendaMobileListProps> = ({
  date,
  doctors,
  selectedDoctorId,
  appointments,
  blockedTimes,
  onSelectAppointment,
  onOpenNewAppointmentModal,
}) => {
  const filteredAppointments = appointments
    .filter((apt) => {
      if (apt.date !== date || apt.status === 'cancelled') return false;
      if (selectedDoctorId !== 'all' && apt.doctorId !== selectedDoctorId) return false;
      return true;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const filteredBlocks = blockedTimes.filter((blk) => {
    if (blk.date !== date) return false;
    if (selectedDoctorId !== 'all' && blk.doctorId !== selectedDoctorId) return false;
    return true;
  });

  return (
    <div
      className="d-flex flex-column gap-3"
      role="region"
      aria-label="Lista de Agendamentos Mobile"
    >
      <div className="d-flex align-items-center justify-content-between">
        <span className="fw-bold text-dark fs-6">
          {filteredAppointments.length}{' '}
          {filteredAppointments.length === 1 ? 'consulta agendada' : 'consultas agendadas'}
        </span>
        <Button
          variant="primary"
          size="sm"
          className="btn-icon-on-mobile"
          onClick={onOpenNewAppointmentModal}
          leftIcon={<Plus size={14} />}
          aria-label="Novo Agendamento"
        >
          Novo Agendamento
        </Button>
      </div>

      {filteredAppointments.length === 0 && filteredBlocks.length === 0 ? (
        <div className="card shadow-sm border p-4">
          <EmptyState
            title="Nenhum agendamento nesta data"
            description="Não há consultas ou bloqueios marcados para o médico e data selecionados."
            actionText="Agendar Agora"
            onAction={onOpenNewAppointmentModal}
          />
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {filteredBlocks.map((blk) => {
            const doc = doctors.find((d) => d.id === blk.doctorId);
            return (
              <div
                key={blk.id}
                className="card border-warning-subtle bg-warning-subtle p-3 shadow-xs"
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <Lock size={16} className="text-warning-emphasis" aria-hidden="true" />
                    <span className="fw-bold text-dark small">{blk.reason}</span>
                  </div>
                  <span className="badge bg-white text-dark border">
                    {blk.startTime} - {blk.endTime}
                  </span>
                </div>
                {doc && (
                  <span className="text-muted small mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                    {doc.name} ({doc.specialty})
                  </span>
                )}
              </div>
            );
          })}

          {filteredAppointments.map((apt) => {
            const doc = doctors.find((d) => d.id === apt.doctorId);
            const docColor = doc?.color || 'var(--primary-600)';

            return (
              <div
                key={apt.id}
                className="card shadow-sm p-3 border-start border-4 cursor-pointer"
                style={{ borderLeftColor: docColor }}
                onClick={() => onSelectAppointment(apt)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectAppointment(apt);
                  }
                }}
                aria-label={`Consulta de ${apt.patientName} às ${apt.startTime}. Status: ${apt.status}`}
              >
                <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark fs-6">
                      {apt.startTime} - {apt.endTime}
                    </span>
                    <StatusBadge status={apt.status} />
                  </div>
                  <PaymentBadge status={apt.payment.status} />
                </div>

                <h4 className="fs-6 fw-bold text-dark mb-1">{apt.patientName}</h4>

                <div className="text-muted small d-flex flex-wrap gap-x-3 gap-y-1 mb-2">
                  <span>CPF: {formatCPF(apt.patientCpf)}</span>
                  <span>•</span>
                  <span>{apt.doctorName}</span>
                </div>

                <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                  <span className="badge bg-light text-secondary border">
                    {APPOINTMENT_TYPE_LABELS[apt.type] || apt.type}
                  </span>
                  <div className="d-flex align-items-center gap-1 text-primary-700 fw-bold small">
                    <span>{formatCurrency(apt.payment.amount)}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
