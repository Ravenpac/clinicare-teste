import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline-primary' | 'success' | 'danger' | 'light' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="d-inline-flex" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span className="d-inline-flex" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
};
