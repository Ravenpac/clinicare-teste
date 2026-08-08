import React, { useState, useEffect } from 'react';
import { Appointment } from '../../types/appointment';
import { PaymentMethod, PaymentStatus } from '../../types/payment';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField } from '../form/FormField';
import { MaskedInput } from '../form/MaskedInput';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2 } from 'lucide-react';

interface EditBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const EditBillingModal: React.FC<EditBillingModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const { updatePayment } = useClinic();
  const { showSuccess } = useToast();

  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [status, setStatus] = useState<PaymentStatus>('paid');
  const [installments, setInstallments] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (appointment) {
      setAmount(appointment.payment.amount);
      setMethod(appointment.payment.method);
      setStatus(appointment.payment.status);
      setInstallments(appointment.payment.installments || 1);
      setNotes(appointment.payment.notes || '');
    }
  }, [appointment, isOpen]);

  if (!appointment) return null;

  const isPaymentAlreadyPaid = appointment.payment.status === 'paid';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = updatePayment(appointment.id, {
      amount,
      method,
      status,
      installments: method === 'credit_card' ? installments : undefined,
      notes: notes.trim() || undefined,
    });

    if (!updated) return;

    showSuccess(
      `Dados de faturamento da consulta de ${appointment.patientName} atualizados com sucesso!`,
      'Faturamento Atualizado'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Faturamento & Pagamento"
      subtitle={`Paciente: ${appointment.patientName} • Consulta: ${appointment.date} às ${appointment.startTime}`}
      size="md"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="light" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSave} leftIcon={<CheckCircle2 size={16} />}>
            Salvar Faturamento
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSave}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormField
              id="edit-amount"
              label="Valor da Consulta (R$)"
              required
              hint={
                isPaymentAlreadyPaid
                  ? 'Valor bloqueado após a quitação; altere o status para estornar.'
                  : undefined
              }
            >
              <MaskedInput
                mask="currency"
                value={amount}
                disabled={isPaymentAlreadyPaid}
                onChange={(val) => setAmount(parseFloat(val) || 0)}
              />
            </FormField>
          </div>

          <div className="col-12 col-md-6">
            <FormField id="edit-status" label="Status do Pagamento" required>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
              >
                <option value="paid">Pago (Quitar agora)</option>
                <option value="pending">Pendente (Cobrança em aberto)</option>
                <option value="billed">Faturado para Convênio</option>
                <option value="refunded">Estornado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </FormField>
          </div>

          <div className="col-12 col-md-6">
            <FormField
              id="edit-method"
              label="Forma de Pagamento"
              required
              hint={
                isPaymentAlreadyPaid ? 'Forma de pagamento bloqueada após a quitação.' : undefined
              }
            >
              <select
                className="form-select"
                value={method}
                disabled={isPaymentAlreadyPaid}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="cash">Dinheiro em Espécie</option>
                <option value="insurance">Guia do Convênio</option>
                <option value="pending">A Definir</option>
              </select>
            </FormField>
          </div>

          {method === 'credit_card' && (
            <div className="col-12 col-md-6">
              <FormField id="edit-installments" label="Parcelas">
                <select
                  className="form-select"
                  value={installments}
                  disabled={isPaymentAlreadyPaid}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                >
                  <option value={1}>1x à vista</option>
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                  <option value={6}>6x</option>
                </select>
              </FormField>
            </div>
          )}

          <div className="col-12">
            <FormField id="edit-notes" label="Observações de Pagamento / Número de Recibo">
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Pago via Pix com comprovante em anexo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormField>
          </div>
        </div>
      </form>
    </Modal>
  );
};
