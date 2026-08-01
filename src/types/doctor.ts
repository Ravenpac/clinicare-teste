export interface WorkingHours {
  start: string;
  end: string;
  intervalStart?: string;
  intervalEnd?: string;
  slotDurationMinutes: number;
  daysOfWeek: number[];
}

export interface Doctor {
  id: string;
  name: string;
  crm: string;
  crmState: string;
  specialty: string;
  color: string;
  avatarUrl?: string;
  consultationFee: number;
  phone: string;
  email: string;
  roomNumber: string;
  workingHours: WorkingHours;
  active: boolean;
}
