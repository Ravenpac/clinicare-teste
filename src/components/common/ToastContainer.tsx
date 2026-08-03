import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ToastMessage } from '../../context/ToastContext';

export const ToastItem: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({
  toast,
  onClose,
}) => {
  const getIcon = () => {
    switch (toast.variant) {
      case 'success':
        return <CheckCircle2 size={20} className="text-success shrink-0" aria-hidden="true" />;
      case 'danger':
        return <AlertCircle size={20} className="text-danger shrink-0" aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning shrink-0" aria-hidden="true" />;
      case 'info':
      default:
        return <Info size={20} className="text-info shrink-0" aria-hidden="true" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.variant) {
      case 'success':
        return 'border-success';
      case 'danger':
        return 'border-danger';
      case 'warning':
        return 'border-warning';
      case 'info':
      default:
        return 'border-primary';
    }
  };

  return (
    <div
      className={`card custom-toast border-start border-4 ${getBorderColor()} bg-white`}
      role={toast.variant === 'danger' ? 'alert' : 'status'}
      aria-live={toast.variant === 'danger' ? 'assertive' : 'polite'}
    >
      <div className="card-body p-3 d-flex align-items-start gap-3">
        {getIcon()}
        <div className="grow">
          {toast.title && <h3 className="fs-6 fw-bold mb-1">{toast.title}</h3>}
          <p className="mb-0 text-secondary small">{toast.message}</p>
        </div>
        <button
          type="button"
          className="btn btn-link text-muted p-0 text-decoration-none"
          onClick={onClose}
          aria-label="Fechar notificação"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-floating-container" aria-label="Notificações do sistema">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};
