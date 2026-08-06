import React from 'react';
import { Doctor } from '../../types/doctor';
import { Appointment, BlockedTime, APPOINTMENT_TYPE_LABELS } from '../../types/appointment';
import { generateTimeSlots, calculateEndTime, doTimesOverlap } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { StatusBadge, PaymentBadge } from '../common/Badge';
import { Plus, Lock, Clock } from 'lucide-react';

interface AgendaDayViewProps {
  date: string;
  doctors: Doctor[];
  selectedDoctorId: string;
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  onSelectSlot: (doctorId: string, time: string) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  onRemoveBlock?: (blockId: string) => void;
}

export const AgendaDayView: React.FC<AgendaDayViewProps> = ({
  date,
  doctors,
  selectedDoctorId,
  appointments,
  blockedTimes,
  onSelectSlot,
  onSelectAppointment,
}) => {
  const timeSlots = generateTimeSlots(8, 19, 30);

  const activeDoctors =
    selectedDoctorId === 'all' ? doctors : doctors.filter((d) => d.id === selectedDoctorId);

  return (
    <div
      className="card shadow-sm border overflow-hidden"
      role="region"
      aria-label={`Agenda do dia ${date}`}
    >
      <div className="d-flex border-bottom bg-light">
        <div
          className="agenda-time-column py-3 border-end bg-light text-center"
          style={{ width: '80px' }}
        >
          <Clock size={16} className="text-muted" aria-hidden="true" />
          <span className="visually-hidden">Horário</span>
        </div>

        <div className="d-flex grow overflow-x-auto">
          {activeDoctors.map((doc) => (
            <div
              key={doc.id}
              className="p-3 border-end grow text-center bg-white"
              style={{
                minWidth: activeDoctors.length > 2 ? '220px' : 'auto',
                borderTop: `4px solid ${doc.color}`,
              }}
            >
              <h3 className="fs-6 fw-bold text-dark mb-0">{doc.name}</h3>
              <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                {doc.specialty} • {doc.roomNumber}
              </p>
              <span
                className="badge bg-light text-secondary border mt-1"
                style={{ fontSize: '0.7rem' }}
              >
                CRM {doc.crm}/{doc.crmState} • {formatCurrency(doc.consultationFee)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto" style={{ maxHeight: '720px', overflowY: 'auto' }}>
        {timeSlots.map((slot) => {
          const slotEnd = calculateEndTime(slot, 30);

          return (
            <div key={slot} className="agenda-slot-row d-flex">
              <div
                className="agenda-time-column py-2 border-end d-flex align-items-center justify-content-center bg-light-subtle"
                style={{ width: '80px' }}
              >
                <span className="fw-bold text-dark small">{slot}</span>
              </div>

              <div className="d-flex grow">
                {activeDoctors.map((doc) => {
                  const slotAppointment = appointments.find((apt) => {
                    if (apt.doctorId !== doc.id || apt.date !== date || apt.status === 'cancelled')
                      return false;
                    return doTimesOverlap(slot, slotEnd, apt.startTime, apt.endTime);
                  });

                  const slotBlock = blockedTimes.find((blk) => {
                    if (blk.doctorId !== doc.id || blk.date !== date) return false;
                    if (blk.allDay) return true;
                    return doTimesOverlap(slot, slotEnd, blk.startTime, blk.endTime);
                  });

                  return (
                    <div
                      key={`${doc.id}-${slot}`}
                      className="agenda-slot-cell"
                      style={{ minWidth: activeDoctors.length > 2 ? '220px' : 'auto' }}
                    >
                      {slotAppointment ? (
                        <div
                          className="appointment-badge-card"
                          style={{
                            borderLeftColor: doc.color,
                            backgroundColor:
                              slotAppointment.status === 'completed'
                                ? 'var(--success-50)'
                                : slotAppointment.status === 'waiting'
                                  ? 'var(--warning-50)'
                                  : 'var(--surface)',
                          }}
                          onClick={() => onSelectAppointment(slotAppointment)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectAppointment(slotAppointment);
                            }
                          }}
                          aria-label={`Consulta com ${slotAppointment.patientName}, ${slotAppointment.startTime} às ${slotAppointment.endTime}. Status: ${slotAppointment.status}. Clique para gerenciar.`}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span
                              className="fw-bold text-dark small text-truncate"
                              style={{ maxWidth: '140px' }}
                            >
                              {slotAppointment.patientName}
                            </span>
                            <StatusBadge status={slotAppointment.status} />
                          </div>

                          <div
                            className="d-flex flex-wrap align-items-center gap-1 text-muted"
                            style={{ fontSize: '0.725rem' }}
                          >
                            <span>{APPOINTMENT_TYPE_LABELS[slotAppointment.type]}</span>
                            <span>•</span>
                            <PaymentBadge status={slotAppointment.payment.status} />
                          </div>
                        </div>
                      ) : slotBlock ? (
                        <div
                          className="blocked-time-card d-flex align-items-center justify-content-between gap-1"
                          role="note"
                          aria-label={`Horário bloqueado para ${doc.name}: ${slotBlock.reason}`}
                        >
                          <div className="d-flex align-items-center gap-1 text-truncate">
                            <Lock
                              size={12}
                              className="text-secondary shrink-0"
                              aria-hidden="true"
                            />
                            <span className="text-truncate fw-medium">{slotBlock.reason}</span>
                          </div>
                          <span className="small text-muted" style={{ fontSize: '0.7rem' }}>
                            {slotBlock.startTime}-{slotBlock.endTime}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-light btn-sm w-100 h-100 d-flex align-items-center justify-content-center text-muted border-0 bg-transparent opacity-0 opacity-hover"
                          onClick={() => onSelectSlot(doc.id, slot)}
                          title={`Agendar com ${doc.name} às ${slot}`}
                          aria-label={`Horário livre às ${slot} com ${doc.name}. Clique para agendar consulta.`}
                          style={{ minHeight: '36px' }}
                        >
                          <Plus size={14} className="me-1" aria-hidden="true" />
                          <span className="small">Agendar</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
