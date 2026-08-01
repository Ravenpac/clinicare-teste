import { PaymentDetails } from './payment';

export type AppointmentType =
  'first_consultation' | 'follow_up' | 'routine_checkup' | 'emergency' | 'procedure';

export type AppointmentStatus =
  'scheduled' | 'confirmed' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export const ACTIVE_APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  'scheduled',
  'confirmed',
  'waiting',
];

export function isCancellableAppointment(status: AppointmentStatus): boolean {
  return ACTIVE_APPOINTMENT_STATUSES.includes(status);
}

export function isTransferableAppointment(status: AppointmentStatus): boolean {
  return ACTIVE_APPOINTMENT_STATUSES.includes(status);
}

export interface BlockedTime {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  allDay?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  patientPhone: string;
  patientBirthDate?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  checkInTime?: string;
  completedAt?: string;
  payment: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  first_consultation: 'Primeira Consulta',
  follow_up: 'Retorno',
  routine_checkup: 'Exame de Rotina',
  emergency: 'Encaixe / Urgência',
  procedure: 'Procedimento',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  waiting: 'Em Espera',
  in_progress: 'Em Atendimento',
  completed: 'Atendido',
  cancelled: 'Cancelado',
  no_show: 'Não Compareceu',
};
