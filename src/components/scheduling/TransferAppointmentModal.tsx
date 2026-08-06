import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField } from '../form/FormField';
import { calculateEndTime } from '../../utils/dateUtils';
import { Appointment } from '../../types/appointment';
import { ArrowRightLeft, AlertTriangle } from 'lucide-react';

interface TransferAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const TransferAppointmentModal: React.FC<TransferAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const { doctors, transferAppointment, checkConflict } = useClinic();
  const { showSuccess, showError } = useToast();

  const [newDoctorId, setNewDoctorId] = useState(appointment?.doctorId || '');
  const [newDate, setNewDate] = useState(appointment?.date || '');
  const [newStartTime, setNewStartTime] = useState(appointment?.startTime || '09:00');
  const [newEndTime, setNewEndTime] = useState(appointment?.endTime || '09:30');
  const [conflictError, setConflictError] = useState<string | null>(null);

  React.useEffect(() => {
    if (appointment) {
      setNewDoctorId(appointment.doctorId);
      setNewDate(appointment.date);
      setNewStartTime(appointment.startTime);
      setNewEndTime(appointment.endTime);
      setConflictError(null);
    }
  }, [appointment, isOpen]);

  if (!appointment) return null;

  const handleStartTimeChange = (time: string) => {
    setNewStartTime(time);
    const doc = doctors.find((d) => d.id === newDoctorId);
    setNewEndTime(calculateEndTime(time, doc?.workingHours.slotDurationMinutes || 30));
  };

  const handleTransfer = () => {
    const conflict = checkConflict(newDoctorId, newDate, newStartTime, newEndTime, appointment.id);
    if (conflict.hasConflict) {
      setConflictError(
        conflict.message || 'Conflito de horário detectado para o médico selecionado.'
      );
      return;
    }

    const result = transferAppointment(
      appointment.id,
      newDoctorId,
      newDate,
      newStartTime,
      newEndTime
    );
    if (!result.success) {
      showError(
        result.conflict?.message || 'Erro ao transferir agendamento.',
        'Conflito de Horário'
      );
      return;
    }

    const targetDoc = doctors.find((d) => d.id === newDoctorId);
    showSuccess(
      `Consulta de ${appointment.patientName} transferida para ${targetDoc?.name || 'o médico'} em ${newDate} às ${newStartTime}.`,
      'Consulta Transferida'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transferir / Reatribuir Agendamento"
      subtitle={`Paciente: ${appointment.patientName} (Atual: ${appointment.doctorName}, ${appointment.date} às ${appointment.startTime})`}
      size="md"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="light" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleTransfer}
            leftIcon={<ArrowRightLeft size={16} />}
          >
            Confirmar Transferência
          </Button>
        </div>
      }
    >
      <div>
        {conflictError && (
          <div
            className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3"
            role="alert"
          >
            <AlertTriangle size={18} className="shrink-0" />
            <div>{conflictError}</div>
          </div>
        )}

        <FormField id="transfer-doctor" label="Novo Médico Responsável" required>
          <select
            className="form-select"
            value={newDoctorId}
            onChange={(e) => setNewDoctorId(e.target.value)}
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.specialty} (CRM {doc.crm}/{doc.crmState})
              </option>
            ))}
          </select>
        </FormField>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormField id="transfer-date" label="Nova Data" required>
              <input
                type="date"
                className="form-control"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </FormField>
          </div>

          <div className="col-12 col-md-3">
            <FormField id="transfer-start-time" label="Início" required>
              <input
                type="time"
                className="form-control"
                value={newStartTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
              />
            </FormField>
          </div>

          <div className="col-12 col-md-3">
            <FormField id="transfer-end-time" label="Término" required>
              <input
                type="time"
                className="form-control"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </FormField>
          </div>
        </div>
      </div>
    </Modal>
  );
};
