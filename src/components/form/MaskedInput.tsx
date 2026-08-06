import React from 'react';
import { formatCPF, formatPhone, formatCEP } from '../../utils/formatters';

export interface MaskedInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  mask: 'cpf' | 'phone' | 'cep' | 'currency';
  value: string | number;
  onChange: (value: string) => void;
}

export const MaskedInput: React.FC<MaskedInputProps> = ({
  mask,
  value,
  onChange,
  className = '',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (mask === 'cpf') {
      const formatted = formatCPF(rawValue);
      onChange(formatted);
    } else if (mask === 'phone') {
      const formatted = formatPhone(rawValue);
      onChange(formatted);
    } else if (mask === 'cep') {
      const formatted = formatCEP(rawValue);
      onChange(formatted);
    } else if (mask === 'currency') {
      const clean = rawValue.replace(/\D/g, '');
      const numberValue = clean ? (parseInt(clean, 10) / 100).toFixed(2) : '0.00';
      onChange(numberValue);
    } else {
      onChange(rawValue);
    }
  };

  const getDisplayValue = () => {
    if (mask === 'currency') {
      const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(num);
    }
    return String(value || '');
  };

  return (
    <input
      type={mask === 'currency' ? 'text' : props.type || 'text'}
      className={`form-control ${className}`}
      value={getDisplayValue()}
      onChange={handleChange}
      {...props}
    />
  );
};
