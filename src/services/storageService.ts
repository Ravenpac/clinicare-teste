import { Doctor } from '../types/doctor';
import { Patient } from '../types/patient';
import { Appointment, BlockedTime } from '../types/appointment';
import { Notice } from '../types/notice';
import {
  MOCK_DOCTORS,
  MOCK_PATIENTS,
  MOCK_APPOINTMENTS,
  MOCK_BLOCKED_TIMES,
  MOCK_NOTICES,
} from './mockData';

const STORAGE_KEYS = {
  DOCTORS: 'clinicare_doctors_v1',
  PATIENTS: 'clinicare_patients_v1',
  APPOINTMENTS: 'clinicare_appointments_v1',
  BLOCKED_TIMES: 'clinicare_blocked_times_v1',
  NOTICES: 'clinicare_notices_v1',
  VERSION: 'clinicare_db_initialized_v2',
};

export const storageService = {
  initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.VERSION)) {
      this.resetToDefaults();
      localStorage.setItem(STORAGE_KEYS.VERSION, 'true');
    }
  },

  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(MOCK_DOCTORS));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(MOCK_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(MOCK_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.BLOCKED_TIMES, JSON.stringify(MOCK_BLOCKED_TIMES));
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(MOCK_NOTICES));
  },

  getDoctors(): Doctor[] {
    const data = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    return data ? JSON.parse(data) : MOCK_DOCTORS;
  },

  saveDoctors(doctors: Doctor[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  },

  getPatients(): Patient[] {
    const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return data ? JSON.parse(data) : MOCK_PATIENTS;
  },

  savePatients(patients: Patient[]): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  },

  getAppointments(): Appointment[] {
    const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : MOCK_APPOINTMENTS;
  },

  saveAppointments(appointments: Appointment[]): void {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },

  getBlockedTimes(): BlockedTime[] {
    const data = localStorage.getItem(STORAGE_KEYS.BLOCKED_TIMES);
    return data ? JSON.parse(data) : MOCK_BLOCKED_TIMES;
  },

  saveBlockedTimes(blockedTimes: BlockedTime[]): void {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_TIMES, JSON.stringify(blockedTimes));
  },

  getNotices(): Notice[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
    return data ? JSON.parse(data) : MOCK_NOTICES;
  },

  saveNotices(notices: Notice[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
  },
};
