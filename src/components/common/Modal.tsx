import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { handleModalFocusTrap, getFocusableElements } from '../../utils/a11yUtils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  titleId?: string;
  descriptionId?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
  titleId = 'modal-title',
  descriptionId = 'modal-desc',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = getFocusableElements(modalRef.current);
        const firstFormField = focusable.find((el) => el.matches('input, select, textarea'));
        const target = firstFormField || focusable[0];
        if (target) {
          target.focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      } else if (e.key === 'Tab') {
        handleModalFocusTrap(e, modalRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass =
    size === 'sm' ? 'modal-sm' : size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : '';

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1055,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitle ? descriptionId : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${sizeClass}`}
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h2 id={titleId} className="modal-title fs-5 fw-bold text-dark mb-0">
                {title}
              </h2>
              {subtitle && (
                <p id={descriptionId} className="text-muted small mb-0 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              className="btn btn-light btn-sm p-1 rounded-circle ms-auto"
              onClick={onClose}
              aria-label="Fechar janela modal"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="modal-body">{children}</div>

          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
};
