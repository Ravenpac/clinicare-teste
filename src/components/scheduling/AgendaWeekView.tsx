import React from 'react';
import { Doctor } from '../../types/doctor';
import { Appointment, BlockedTime } from '../../types/appointment';
import { getWeekDays } from '../../utils/dateUtils';
import { formatDateBR } from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';
import { Calendar, Plus } from 'lucide-react';

interface AgendaWeekViewProps {
  currentDate: string;
  doctors: Doctor[];
  selectedDoctorId: string;
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  onSelectDate: (date: string) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  onSelectSlot: (doctorId: string, time: string, date: string) => void;
}

export const AgendaWeekView: React.FC<AgendaWeekViewProps> = ({
  currentDate,
  doctors,
  selectedDoctorId,
  appointments,
  onSelectDate,
  onSelectAppointment,
  onSelectSlot,
}) => {
  const weekDays = getWeekDays(currentDate);

  const filterDoctor =
    selectedDoctorId !== 'all' ? doctors.find((d) => d.id === selectedDoctorId) : null;

  return (
    <div
      className="card shadow-sm border overflow-hidden"
      role="region"
      aria-label="Visão Semanal da Agenda"
    >
      <div className="card-header bg-light d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <Calendar size={18} className="text-primary-600" aria-hidden="true" />
          <span className="fw-bold text-dark fs-6">
            Semana de {formatDateBR(weekDays[0].date)} a{' '}
            {formatDateBR(weekDays[weekDays.length - 1].date)}
          </span>
        </div>
        {filterDoctor && (
          <span className="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle">
            {filterDoctor.name} ({filterDoctor.specialty})
          </span>
        )}
      </div>

      <div className="row g-0">
        {weekDays.map((day) => {
          const dayAppointments = appointments
            .filter((apt) => {
              if (apt.date !== day.date || apt.status === 'cancelled') return false;
              if (selectedDoctorId !== 'all' && apt.doctorId !== selectedDoctorId) return false;
              return true;
            })
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div
              key={day.date}
              className={`col-12 col-md-4 col-xl-2 border-end border-bottom p-2 ${
                day.isToday ? 'bg-primary-50' : 'bg-white'
              }`}
              style={{ minHeight: '380px' }}
            >
              <div
                className="d-flex align-items-center justify-content-between p-2 rounded mb-2 cursor-pointer"
                style={{ backgroundColor: day.isToday ? 'var(--primary-100)' : 'var(--app-bg)' }}
                onClick={() => onSelectDate(day.date)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDate(day.date);
                  }
                }}
                aria-label={`Ver dia ${day.dayName}, ${day.dayNumber}. Total de ${dayAppointments.length} consultas.`}
              >
                <div>
                  <span className="fw-bold d-block text-dark small text-uppercase">
                    {day.dayName}
                  </span>
                  <span className="fs-5 fw-bold text-primary-700">{day.dayNumber}</span>
                </div>
                <span className="badge bg-white text-secondary border rounded-pill">
                  {dayAppointments.length}
                </span>
              </div>

              <div
                className="d-flex flex-column gap-2"
                style={{ maxHeight: '420px', overflowY: 'auto' }}
              >
                {dayAppointments.length === 0 ? (
                  <div className="text-center py-4 text-muted small">
                    <span>Sem consultas</span>
                  </div>
                ) : (
                  dayAppointments.map((apt) => {
                    const doc = doctors.find((d) => d.id === apt.doctorId);
                    const docColor = doc?.color || 'var(--primary-600)';

                    return (
                      <div
                        key={apt.id}
                        className="p-2 rounded bg-white border shadow-xs"
                        style={{ borderLeft: `3px solid ${docColor}`, cursor: 'pointer' }}
                        onClick={() => onSelectAppointment(apt)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectAppointment(apt);
                          }
                        }}
                        aria-label={`Consulta de ${apt.patientName} às ${apt.startTime}`}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-bold text-dark small">{apt.startTime}</span>
                          <StatusBadge status={apt.status} />
                        </div>
                        <span className="d-block fw-semibold text-dark small text-truncate">
                          {apt.patientName}
                        </span>
                        {selectedDoctorId === 'all' && (
                          <span
                            className="d-block text-muted small text-truncate"
                            style={{ fontSize: '0.7rem' }}
                          >
                            {apt.doctorName}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}

                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm w-100 mt-2"
                  style={{ fontSize: '0.75rem', borderStyle: 'dashed' }}
                  onClick={() => {
                    const docId =
                      selectedDoctorId !== 'all' ? selectedDoctorId : doctors[0]?.id || '';
                    onSelectSlot(docId, '09:00', day.date);
                  }}
                  aria-label={`Adicionar consulta em ${day.dayName}`}
                >
                  <Plus size={13} className="me-1" aria-hidden="true" />
                  Novo no Dia
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
