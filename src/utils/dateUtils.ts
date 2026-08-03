import { Appointment, BlockedTime } from '../types/appointment';

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekDays(
  dateString: string
): { date: string; dayName: string; dayNumber: number; isToday: boolean }[] {
  const [year, month, day] = dateString.split('-').map(Number);
  const current = new Date(year, month - 1, day);

  const dayOfWeek = current.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const todayStr = getTodayDateString();
  const weekDays = [];
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const dateFormatted = `${y}-${m}-${dayNum}`;

    weekDays.push({
      date: dateFormatted,
      dayName: dayNames[i],
      dayNumber: d.getDate(),
      isToday: dateFormatted === todayStr,
    });
  }

  return weekDays;
}

export function generateTimeSlots(startHour = 8, endHour = 19, stepMinutes = 30): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      if (h === endHour - 1 && m > 30) continue;
      const hourStr = String(h).padStart(2, '0');
      const minStr = String(m).padStart(2, '0');
      slots.push(`${hourStr}:${minStr}`);
    }
  }
  return slots;
}

export function calculateEndTime(startTime: string, durationMinutes = 30): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function doTimesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  type?: 'appointment' | 'blocked';
  message?: string;
  conflictingItem?: Appointment | BlockedTime;
}

export function checkDoctorScheduleConflict(
  doctorId: string,
  date: string,
  startTime: string,
  endTime: string,
  appointments: Appointment[],
  blockedTimes: BlockedTime[],
  ignoreAppointmentId?: string
): ConflictCheckResult {
  const conflictingAppointment = appointments.find((apt) => {
    if (apt.id === ignoreAppointmentId) return false;
    if (apt.doctorId !== doctorId) return false;
    if (apt.date !== date) return false;
    if (apt.status === 'cancelled') return false;

    return doTimesOverlap(startTime, endTime, apt.startTime, apt.endTime);
  });

  if (conflictingAppointment) {
    return {
      hasConflict: true,
      type: 'appointment',
      message: `Conflito de horário com o paciente ${conflictingAppointment.patientName} (${conflictingAppointment.startTime} - ${conflictingAppointment.endTime}).`,
      conflictingItem: conflictingAppointment,
    };
  }

  const conflictingBlock = blockedTimes.find((block) => {
    if (block.doctorId !== doctorId) return false;
    if (block.date !== date) return false;
    if (block.allDay) return true;

    return doTimesOverlap(startTime, endTime, block.startTime, block.endTime);
  });

  if (conflictingBlock) {
    return {
      hasConflict: true,
      type: 'blocked',
      message: `Horário indisponível: Bloqueio "${conflictingBlock.reason}" (${conflictingBlock.startTime} - ${conflictingBlock.endTime}).`,
      conflictingItem: conflictingBlock,
    };
  }

  return { hasConflict: false };
}
