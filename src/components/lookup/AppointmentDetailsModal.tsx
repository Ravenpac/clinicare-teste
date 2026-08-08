import React from 'react';
import {
  Appointment,
  AppointmentStatus,
  APPOINTMENT_TYPE_LABELS,
  isCancellableAppointment,
  isTransferableAppointment,
} from '../../types/appointment';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge, PaymentBadge } from '../common/Badge';
import {
  formatDateBR,
  formatCurrency,
  formatCPF,
  formatPhone,
  calculateAge,
} from '../../utils/formatters';
import { PAYMENT_METHOD_LABELS } from '../../types/payment';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { User, Calendar, CreditCard, UserCheck, ArrowRightLeft, XCircle } from 'lucide-react';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onOpenTransferModal: () => void;
  onOpenCancelModal: () => void;
  onOpenEditBillingModal: () => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onOpenTransferModal,
  onOpenCancelModal,
  onOpenEditBillingModal,
}) => {
  const { updateAppointmentStatus, patients } = useClinic();
  const { showSuccess } = useToast();

  if (!appointment) return null;

  const patient = patients.find((p) => p.id === appointment.patientId);
  const patientAge = patient?.birthDate ? calculateAge(patient.birthDate) : null;

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    updateAppointmentStatus(appointment.id, newStatus);
    showSuccess(`Status da consulta atualizado para "${newStatus}".`, 'Status Alterado');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha do Agendamento"
      subtitle={`Protocolo ID #${appointment.id}`}
      size="lg"
      footer={
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 w-100">
          <div className="d-flex align-items-center gap-2">
            {isCancellableAppointment(appointment.status) && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenCancelModal();
                }}
                leftIcon={<XCircle size={15} />}
              >
                Cancelar Consulta
              </Button>
            )}

            {isTransferableAppointment(appointment.status) && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenTransferModal();
                }}
                leftIcon={<ArrowRightLeft size={15} />}
              >
                Transferir
              </Button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              variant="light"
              size="sm"
              onClick={() => {
                onClose();
                onOpenEditBillingModal();
              }}
              leftIcon={<CreditCard size={15} />}
            >
              Faturamento
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      }
    >
      <div className="d-flex flex-column gap-4">
        <div className="p-3 rounded bg-light border d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div>
              <span className="text-muted small d-block">Status do Atendimento:</span>
              <StatusBadge status={appointment.status} className="fs-6" />
            </div>
            <div className="border-start ps-3">
              <span className="text-muted small d-block">Faturamento:</span>
              <PaymentBadge status={appointment.payment.status} className="fs-6" />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange('waiting')}
                leftIcon={<UserCheck size={14} />}
              >
                Registrar Check-in
              </Button>
            ) : null}

            {appointment.status === 'waiting' ? (
              <Button
                variant="success"
                size="sm"
                onClick={() => handleStatusChange('in_progress')}
                leftIcon={<UserCheck size={14} />}
              >
                Iniciar Atendimento
              </Button>
            ) : null}

            {appointment.status === 'in_progress' ? (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleStatusChange('completed')}
                leftIcon={<UserCheck size={14} />}
              >
                Concluir Consulta
              </Button>
            ) : null}
          </div>
        </div>

        <div className="card border p-3">
          <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
            <User size={18} className="text-primary-600" aria-hidden="true" />
            <h3 className="fs-6 fw-bold text-dark mb-0">Dados do Paciente</h3>
          </div>

          <div className="row g-3 small text-secondary">
            <div className="col-12 col-sm-6">
              <strong>Nome Completo:</strong>{' '}
              <span className="text-dark fw-semibold">{appointment.patientName}</span>
            </div>
            <div className="col-12 col-sm-6">
              <strong>CPF:</strong>{' '}
              <span className="text-dark">{formatCPF(appointment.patientCpf)}</span>
            </div>
            <div className="col-12 col-sm-6">
              <strong>Telefone / WhatsApp:</strong>{' '}
              <a
                href={`https://wa.me/55${appointment.patientPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none text-success fw-semibold"
              >
                {formatPhone(appointment.patientPhone)} (WhatsApp)
              </a>
            </div>
            <div className="col-12 col-sm-6">
              <strong>Idade / Nascimento:</strong>{' '}
              {patient?.birthDate
                ? `${formatDateBR(patient.birthDate)} (${patientAge} anos)`
                : 'Não informado'}
            </div>
            {patient?.email && (
              <div className="col-12 col-sm-6">
                <strong>E-mail:</strong> {patient.email}
              </div>
            )}
            {patient?.address && (
              <div className="col-12">
                <strong>Endereço:</strong> {patient.address.street}, {patient.address.number}{' '}
                {patient.address.complement || ''} — {patient.address.neighborhood},{' '}
                {patient.address.city}/{patient.address.state} (CEP {patient.address.cep})
              </div>
            )}
          </div>
        </div>

        <div className="card border p-3">
          <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
            <Calendar size={18} className="text-primary-600" aria-hidden="true" />
            <h3 className="fs-6 fw-bold text-dark mb-0">Detalhes do Agendamento</h3>
          </div>

          <div className="row g-3 small text-secondary">
            <div className="col-12 col-sm-6">
              <strong>Médico Responsável:</strong>{' '}
              <span className="text-dark fw-semibold">{appointment.doctorName}</span>
            </div>
            <div className="col-12 col-sm-6">
              <strong>Especialidade:</strong> {appointment.doctorSpecialty}
            </div>
            <div className="col-12 col-sm-6">
              <strong>Data & Horário:</strong>{' '}
              <span className="text-dark fw-semibold">
                {formatDateBR(appointment.date)} às {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            <div className="col-12 col-sm-6">
              <strong>Tipo de Consulta:</strong>{' '}
              {APPOINTMENT_TYPE_LABELS[appointment.type] || appointment.type}
            </div>
            {appointment.notes && (
              <div className="col-12">
                <strong>Observações / Queixa:</strong>
                <p className="p-2 bg-light rounded mt-1 mb-0">{appointment.notes}</p>
              </div>
            )}
            {appointment.cancellationReason && (
              <div className="col-12">
                <strong className="text-danger">Motivo do Cancelamento:</strong>
                <p className="p-2 bg-danger-subtle text-danger-emphasis rounded mt-1 mb-0">
                  {appointment.cancellationReason}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card border p-3">
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <CreditCard size={18} className="text-primary-600" aria-hidden="true" />
              <h3 className="fs-6 fw-bold text-dark mb-0">Faturamento & Pagamento</h3>
            </div>
            <span className="fs-5 fw-bold text-dark">
              {formatCurrency(appointment.payment.amount)}
            </span>
          </div>

          <div className="row g-3 small text-secondary">
            <div className="col-12 col-sm-4">
              <strong>Forma de Pagamento:</strong>{' '}
              {PAYMENT_METHOD_LABELS[appointment.payment.method] || appointment.payment.method}
            </div>
            <div className="col-12 col-sm-4">
              <strong>Status:</strong> <PaymentBadge status={appointment.payment.status} />
            </div>
            <div className="col-12 col-sm-4">
              <strong>Recibo Nº:</strong> {appointment.payment.receiptNumber || 'Pendente'}
            </div>
            {appointment.payment.notes && (
              <div className="col-12">
                <strong>Observações Financeiras:</strong> {appointment.payment.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
