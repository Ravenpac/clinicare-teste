import React from 'react';

export interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  trailing?: React.ReactNode;
  children: React.ReactElement;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  hint,
  trailing,
  children,
  className = 'mb-3',
}) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  const clonedChild = React.cloneElement(children, {
    id,
    'aria-required': required ? 'true' : undefined,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy || undefined,
    className: `${children.props.className || ''} ${error ? 'is-invalid' : ''} ${
      trailing ? 'pe-5' : ''
    }`.trim(),
  });

  return (
    <div className={className}>
      <label htmlFor={id} className="form-label d-flex justify-content-between align-items-center">
        <span>
          {label}
          {required && (
            <span className="text-danger ms-1" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {required && <span className="visually-hidden">(campo obrigatório)</span>}
      </label>

      <div className="position-relative">
        {clonedChild}
        {trailing && (
          <div
            className="position-absolute top-50 end-0 translate-middle-y d-flex align-items-center"
            style={{ insetInlineEnd: '0.875rem' }}
          >
            {trailing}
          </div>
        )}
      </div>

      {hint && !error && (
        <div id={hintId} className="form-text text-muted small mt-1">
          {hint}
        </div>
      )}

      {error && (
        <div id={errorId} className="invalid-feedback" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
