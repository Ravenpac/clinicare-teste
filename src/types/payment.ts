export type PaymentMethod =
  'pix' | 'credit_card' | 'debit_card' | 'cash' | 'insurance' | 'bank_transfer' | 'pending';

export type PaymentStatus = 'paid' | 'pending' | 'billed' | 'refunded' | 'cancelled';

export interface PaymentDetails {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  installments?: number;
  paidAt?: string;
  dueDate?: string;
  receiptNumber?: string;
  notes?: string;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
  insurance: 'Convênio (Faturar)',
  bank_transfer: 'Transferência Bancária',
  pending: 'A Definir',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  billed: 'Faturado (Convênio)',
  refunded: 'Estornado',
  cancelled: 'Cancelado',
};
