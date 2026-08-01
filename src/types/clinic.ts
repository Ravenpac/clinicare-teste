import { AppointmentStatus } from './appointment';
import { PaymentStatus } from './payment';

export interface AppointmentFilterState {
  searchQuery: string;
  doctorId: string;
  status: AppointmentStatus | 'all';
  paymentStatus: PaymentStatus | 'all';
  dateRange: 'today' | 'week' | 'month' | 'custom';
  startDate: string;
  endDate: string;
  specialty?: string;
  healthInsurance?: string;
}

export interface DashboardMetrics {
  todayAppointmentsCount: number;
  todayCompletedCount: number;
  todayWaitingCount: number;
  todayRevenue: number;
  todayPendingRevenue: number;
  activeDoctorsCount: number;
  occupancyRate: number;
}

export interface ClinicInfo {
  name: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  address: string;
  email: string;
  operatingHours: string;
}
