import React, { useState } from 'react';
import { AlertTriangle, Trash2, XCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  requireReason?: boolean;
  reasonPlaceholder?: string;
  reasonLabel?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  requireReason = false,
  reasonPlaceholder = 'Informe o motivo...',
  reasonLabel = 'Motivo / Justificativa:',
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('Por favor, informe a justificativa antes de prosseguir.');
      return;
    }
    setError('');
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  const getIcon = () => {
    if (variant === 'danger') {
      return <Trash2 size={24} className="text-danger" aria-hidden="true" />;
    }
    if (variant === 'warning') {
      return <AlertTriangle size={24} className="text-warning" aria-hidden="true" />;
    }
    return <XCircle size={24} className="text-primary" aria-hidden="true" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <Button variant="light" onClick={handleClose}>
            {cancelText}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="d-flex gap-3 align-items-start">
        <div className="p-3 bg-light rounded-circle shrink-0">{getIcon()}</div>
        <div className="grow">
          <p className="mb-3 text-secondary">{message}</p>

          {requireReason && (
            <div className="mt-3">
              <label htmlFor="confirm-reason" className="form-label fw-semibold">
                {reasonLabel} <span className="text-danger">*</span>
              </label>
              <textarea
                id="confirm-reason"
                className={`form-control ${error ? 'is-invalid' : ''}`}
                rows={3}
                placeholder={reasonPlaceholder}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? 'confirm-reason-error' : undefined}
              />
              {error && (
                <div id="confirm-reason-error" className="invalid-feedback">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
