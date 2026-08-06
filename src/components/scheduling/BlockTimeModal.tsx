import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField } from '../form/FormField';
import { getTodayDateString } from '../../utils/dateUtils';
import { Lock } from 'lucide-react';

interface BlockTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoctorId?: string;
  initialDate?: string;
}

export const BlockTimeModal: React.FC<BlockTimeModalProps> = ({
  isOpen,
  onClose,
  initialDoctorId,
  initialDate,
}) => {
  const { doctors, addBlockedTime } = useClinic();
  const { showSuccess, showError } = useToast();

  const [doctorId, setDoctorId] = useState(initialDoctorId || doctors[0]?.id || '');
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('13:00');
  const [reason, setReason] = useState('Intervalo de Almoço');
  const [customReason, setCustomReason] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctorId) {
      setError('Selecione o médico.');
      return;
    }

    const finalReason = reason === 'outro' ? customReason.trim() : reason;
    if (!finalReason) {
      setError('Informe o motivo do bloqueio.');
      return;
    }

    const result = addBlockedTime({
      doctorId,
      date,
      startTime: allDay ? '08:00' : startTime,
      endTime: allDay ? '19:00' : endTime,
      reason: finalReason,
      allDay,
    });

    if (!result.success) {
      showError(
        result.conflict?.message ||
          'Não foi possível bloquear este horário pois já existe uma consulta agendada.',
        'Conflito com Consulta'
      );
      return;
    }

    const doc = doctors.find((d) => d.id === doctorId);
    showSuccess(
      `Horário bloqueado com sucesso na agenda de ${doc?.name || 'médico'}.`,
      'Horário Bloqueado'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bloquear Horário da Agenda"
      subtitle="Bloqueie intervalos para almoço, compromissos médicos, cirurgias ou férias"
      size="md"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="light" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleSubmit} leftIcon={<Lock size={16} />}>
            Confirmar Bloqueio
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger py-2 small mb-3" role="alert">
            {error}
          </div>
        )}

        <FormField id="block-doctor" label="Médico" required>
          <select
            className="form-select"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialty})
              </option>
            ))}
          </select>
        </FormField>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormField id="block-date" label="Data" required>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </FormField>
          </div>

          <div className="col-12 col-md-6 d-flex align-items-end pb-3">
            <div className="form-check">
              <input
                type="checkbox"
                id="block-all-day"
                className="form-check-input"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              <label htmlFor="block-all-day" className="form-check-label fw-semibold text-dark">
                Bloquear o Dia Inteiro
              </label>
            </div>
          </div>

          {!allDay && (
            <>
              <div className="col-12 col-md-6">
                <FormField id="block-start-time" label="Início do Bloqueio" required>
                  <input
                    type="time"
                    className="form-control"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </FormField>
              </div>

              <div className="col-12 col-md-6">
                <FormField id="block-end-time" label="Término do Bloqueio" required>
                  <input
                    type="time"
                    className="form-control"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </FormField>
              </div>
            </>
          )}

          <div className="col-12">
            <FormField id="block-reason" label="Motivo do Bloqueio" required>
              <select
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="Intervalo de Almoço">Intervalo de Almoço</option>
                <option value="Reunião Clínica / Administrativa">
                  Reunião Clínica / Administrativa
                </option>
                <option value="Cirurgia Externa / Hospital">Cirurgia Externa / Hospital</option>
                <option value="Congresso / Palestra">Congresso / Palestra</option>
                <option value="Ausência / Compromisso Particular">
                  Ausência / Compromisso Particular
                </option>
                <option value="outro">Outro Motivo (Especificar)</option>
              </select>
            </FormField>
          </div>

          {reason === 'outro' && (
            <div className="col-12">
              <FormField id="block-custom-reason" label="Especificar Motivo" required>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Treinamento de novo software"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  required
                />
              </FormField>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
