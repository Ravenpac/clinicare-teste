import React, { useState, useMemo } from 'react';
import {
  Clock,
  User,
  ArrowRight,
  UserCheck,
  CalendarX,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { getTodayDateString } from '../../utils/dateUtils';
import { formatCurrency, formatCPF } from '../../utils/formatters';
import { StatusBadge, PaymentBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { Appointment, AppointmentStatus, APPOINTMENT_TYPE_LABELS } from '../../types/appointment';

interface TodayScheduleListProps {
  onSelectAppointment: (appointment: Appointment) => void;
  onOpenNewAppointmentModal: () => void;
}

export const TodayScheduleList: React.FC<TodayScheduleListProps> = ({
  onSelectAppointment,
  onOpenNewAppointmentModal,
}) => {
  const { appointments, updateAppointmentStatus, doctors } = useClinic();
  const { showSuccess, showInfo } = useToast();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');

  const today = getTodayDateString();

  const todayAppointments = useMemo(() => {
    return appointments
      .filter((apt) => {
        if (apt.date !== today) return false;
        if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
        if (doctorFilter !== 'all' && apt.doctorId !== doctorFilter) return false;
        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, today, statusFilter, doctorFilter]);

  const handleCheckIn = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    updateAppointmentStatus(apt.id, 'waiting');
    showSuccess(
      `Check-in realizado para ${apt.patientName}. Paciente colocado em espera.`,
      'Paciente Recepcionado'
    );
  };

  const handleStartConsultation = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    updateAppointmentStatus(apt.id, 'in_progress');
    showInfo(
      `${apt.doctorName} iniciou o atendimento de ${apt.patientName}.`,
      'Atendimento Iniciado'
    );
  };

  const handleComplete = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    updateAppointmentStatus(apt.id, 'completed');
    showSuccess(`Atendimento de ${apt.patientName} finalizado com sucesso.`, 'Consulta Concluída');
  };

  return (
    <div className="card h-100 shadow-sm" role="region" aria-label="Agenda do Dia">
      <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <Clock size={20} className="text-primary-600" aria-hidden="true" />
          <h2 className="fs-6 fw-bold mb-0 text-dark">Agenda do Dia</h2>
          <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill">
            {todayAppointments.length} {todayAppointments.length === 1 ? 'consulta' : 'consultas'}
          </span>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: '150px' }}
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            aria-label="Filtrar agenda de hoje por médico"
          >
            <option value="all">Todos os Médicos</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>

          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: '140px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
            aria-label="Filtrar por status"
          >
            <option value="all">Todos os Status</option>
            <option value="scheduled">Agendados</option>
            <option value="confirmed">Confirmados</option>
            <option value="waiting">Em Espera</option>
            <option value="in_progress">Em Atendimento</option>
            <option value="completed">Atendidos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      <div className="card-body p-0">
        {todayAppointments.length === 0 ? (
          <EmptyState
            title="Nenhum agendamento para hoje"
            description="Não há consultas agendadas para o filtro selecionado na data de hoje."
            actionText="Agendar Nova Consulta"
            onAction={onOpenNewAppointmentModal}
          />
        ) : (
          <div className="list-group list-group-flush">
            {todayAppointments.map((apt) => {
              const doc = doctors.find((d) => d.id === apt.doctorId);
              const doctorColor = doc?.color || 'var(--primary-600)';

              return (
                <div
                  key={apt.id}
                  className="list-group-item list-group-item-action p-3 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3"
                  onClick={() => onSelectAppointment(apt)}
                  style={{ cursor: 'pointer', borderLeft: `4px solid ${doctorColor}` }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectAppointment(apt);
                    }
                  }}
                  aria-label={`Consulta de ${apt.patientName} às ${apt.startTime} com ${apt.doctorName}. Status: ${apt.status}. Clique para ver detalhes.`}
                >
                  <div className="d-flex align-items-start gap-3 grow">
                    <div
                      className="text-center px-2 py-1 rounded bg-light border shrink-0"
                      style={{ minWidth: '70px' }}
                    >
                      <span className="fw-bold fs-6 text-dark d-block">{apt.startTime}</span>
                      <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {apt.endTime}
                      </span>
                    </div>

                    <div>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <span className="fw-bold text-dark fs-6">{apt.patientName}</span>
                        <StatusBadge status={apt.status} />
                        <PaymentBadge status={apt.payment.status} />
                      </div>

                      <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
                        <span className="d-flex align-items-center gap-1">
                          <User size={13} aria-hidden="true" />
                          <span>CPF: {formatCPF(apt.patientCpf)}</span>
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <Stethoscope
                            size={13}
                            style={{ color: doctorColor }}
                            aria-hidden="true"
                          />
                          <span className="fw-medium text-dark">{apt.doctorName}</span>
                          <span className="text-muted">({apt.doctorSpecialty})</span>
                        </span>
                        <span className="badge bg-light text-secondary border">
                          {APPOINTMENT_TYPE_LABELS[apt.type] || apt.type}
                        </span>
                        <span className="fw-semibold text-dark">
                          {formatCurrency(apt.payment.amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 ms-auto shrink-0">
                    {apt.status === 'scheduled' || apt.status === 'confirmed' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => handleCheckIn(apt, e)}
                        leftIcon={<UserCheck size={14} />}
                        title="Registrar chegada do paciente"
                      >
                        Check-in
                      </Button>
                    ) : null}

                    {apt.status === 'waiting' ? (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => handleStartConsultation(apt, e)}
                        leftIcon={<ArrowRight size={14} />}
                        title="Encaminhar para a sala do médico"
                      >
                        Atender
                      </Button>
                    ) : null}

                    {apt.status === 'in_progress' ? (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => handleComplete(apt, e)}
                        leftIcon={<UserCheck size={14} />}
                        title="Finalizar atendimento"
                      >
                        Concluir
                      </Button>
                    ) : null}

                    {apt.status === 'completed' ? (
                      <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle px-2 py-1">
                        Atendimento Finalizado
                      </span>
                    ) : null}

                    {apt.status === 'cancelled' ? (
                      <span className="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle px-2 py-1">
                        <CalendarX size={12} className="me-1" aria-hidden="true" />
                        Cancelado
                      </span>
                    ) : null}

                    <button
                      type="button"
                      className="btn btn-light btn-sm p-1 rounded-circle ms-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppointment(apt);
                      }}
                      aria-label={`Ver detalhes da consulta de ${apt.patientName}`}
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
