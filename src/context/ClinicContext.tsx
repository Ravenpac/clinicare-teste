import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Doctor } from '../types/doctor';
import { Patient } from '../types/patient';
import {
  Appointment,
  AppointmentStatus,
  BlockedTime,
  AppointmentType,
  isCancellableAppointment,
  isTransferableAppointment,
} from '../types/appointment';
import { PaymentDetails, PaymentMethod, PaymentStatus } from '../types/payment';
import { Notice, NoticePriority } from '../types/notice';
import { ClinicInfo, DashboardMetrics } from '../types/clinic';
import { storageService } from '../services/storageService';
import { MOCK_CLINIC_INFO } from '../services/mockData';
import {
  getTodayDateString,
  calculateEndTime,
  checkDoctorScheduleConflict,
  ConflictCheckResult,
} from '../utils/dateUtils';
import { generateUniqueId } from '../utils/a11yUtils';

export interface CreateAppointmentInput {
  patientId?: string;
  patientData?: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
  doctorId: string;
  date: string;
  startTime: string;
  endTime?: string;
  type: AppointmentType;
  notes?: string;
  payment: {
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    installments?: number;
    notes?: string;
  };
}

export interface ClinicContextType {
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  notices: Notice[];
  clinicInfo: ClinicInfo;
  metrics: DashboardMetrics;

  addAppointment: (input: CreateAppointmentInput) => {
    success: boolean;
    appointment?: Appointment;
    conflict?: ConflictCheckResult;
  };
  updateAppointment: (
    id: string,
    updates: Partial<Appointment>
  ) => { success: boolean; conflict?: ConflictCheckResult };
  transferAppointment: (
    id: string,
    newDoctorId: string,
    newDate: string,
    newStartTime: string,
    newEndTime?: string
  ) => { success: boolean; conflict?: ConflictCheckResult };
  cancelAppointment: (id: string, reason: string) => boolean;
  deleteAppointment: (id: string) => boolean;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => boolean;
  updatePayment: (appointmentId: string, paymentUpdates: Partial<PaymentDetails>) => boolean;

  addBlockedTime: (data: Omit<BlockedTime, 'id'>) => {
    success: boolean;
    conflict?: ConflictCheckResult;
  };
  removeBlockedTime: (id: string) => boolean;

  addPatient: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient;
  updatePatient: (id: string, data: Partial<Patient>) => boolean;
  findPatientByCpf: (cpf: string) => Patient | undefined;

  addNotice: (data: {
    title: string;
    message: string;
    priority: NoticePriority;
    author: string;
  }) => Notice;
  deleteNotice: (id: string) => boolean;

  checkConflict: (
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string,
    ignoreAppointmentId?: string
  ) => ConflictCheckResult;
  resetDatabase: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [clinicInfo] = useState<ClinicInfo>(MOCK_CLINIC_INFO);

  useEffect(() => {
    storageService.initialize();
    setDoctors(storageService.getDoctors());
    setPatients(storageService.getPatients());
    setAppointments(storageService.getAppointments());
    setBlockedTimes(storageService.getBlockedTimes());
    setNotices(storageService.getNotices());
  }, []);

  const persistAppointments = useCallback((newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    storageService.saveAppointments(newAppointments);
  }, []);

  const persistPatients = useCallback((newPatients: Patient[]) => {
    setPatients(newPatients);
    storageService.savePatients(newPatients);
  }, []);

  const persistBlockedTimes = useCallback((newBlockedTimes: BlockedTime[]) => {
    setBlockedTimes(newBlockedTimes);
    storageService.saveBlockedTimes(newBlockedTimes);
  }, []);

  const persistNotices = useCallback((newNotices: Notice[]) => {
    setNotices(newNotices);
    storageService.saveNotices(newNotices);
  }, []);

  const checkConflict = useCallback(
    (
      doctorId: string,
      date: string,
      startTime: string,
      endTime: string,
      ignoreAppointmentId?: string
    ): ConflictCheckResult => {
      return checkDoctorScheduleConflict(
        doctorId,
        date,
        startTime,
        endTime,
        appointments,
        blockedTimes,
        ignoreAppointmentId
      );
    },
    [appointments, blockedTimes]
  );

  const metrics: DashboardMetrics = useMemo(() => {
    const today = getTodayDateString();
    const todayAppointments = appointments.filter(
      (apt) => apt.date === today && apt.status !== 'cancelled'
    );
    const todayCompleted = todayAppointments.filter((apt) => apt.status === 'completed');
    const todayWaiting = todayAppointments.filter(
      (apt) => apt.status === 'waiting' || apt.status === 'in_progress'
    );

    let todayRevenue = 0;
    let todayPendingRevenue = 0;

    todayAppointments.forEach((apt) => {
      if (apt.payment.status === 'paid' || apt.payment.status === 'billed') {
        todayRevenue += apt.payment.amount;
      } else if (apt.payment.status === 'pending') {
        todayPendingRevenue += apt.payment.amount;
      }
    });

    const activeDocs = new Set(todayAppointments.map((a) => a.doctorId)).size;
    const totalPossibleSlotsToday = (doctors.length || 1) * 16;
    const occupancyRate = Math.min(
      100,
      Math.round((todayAppointments.length / totalPossibleSlotsToday) * 100)
    );

    return {
      todayAppointmentsCount: todayAppointments.length,
      todayCompletedCount: todayCompleted.length,
      todayWaitingCount: todayWaiting.length,
      todayRevenue,
      todayPendingRevenue,
      activeDoctorsCount: activeDocs || doctors.length,
      occupancyRate,
    };
  }, [appointments, doctors]);

  const findPatientByCpf = useCallback(
    (cpf: string): Patient | undefined => {
      const cleanTarget = cpf.replace(/\D/g, '');
      return patients.find((p) => p.cpf.replace(/\D/g, '') === cleanTarget);
    },
    [patients]
  );

  const addPatient = useCallback(
    (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient => {
      const newPatient: Patient = {
        ...data,
        id: generateUniqueId('pat'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedList = [newPatient, ...patients];
      persistPatients(updatedList);
      return newPatient;
    },
    [patients, persistPatients]
  );

  const updatePatient = useCallback(
    (id: string, data: Partial<Patient>): boolean => {
      const index = patients.findIndex((p) => p.id === id);
      if (index === -1) return false;
      const updatedList = [...patients];
      updatedList[index] = {
        ...updatedList[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      persistPatients(updatedList);
      return true;
    },
    [patients, persistPatients]
  );

  const addAppointment = useCallback(
    (
      input: CreateAppointmentInput
    ): { success: boolean; appointment?: Appointment; conflict?: ConflictCheckResult } => {
      const doctor = doctors.find((d) => d.id === input.doctorId);
      if (!doctor) {
        return { success: false };
      }

      const calculatedEnd =
        input.endTime ||
        calculateEndTime(input.startTime, doctor.workingHours.slotDurationMinutes || 30);

      const conflict = checkConflict(input.doctorId, input.date, input.startTime, calculatedEnd);
      if (conflict.hasConflict) {
        return { success: false, conflict };
      }

      let patientId = input.patientId;
      let patientName = '';
      let patientCpf = '';
      let patientPhone = '';
      let patientBirthDate = '';

      if (patientId) {
        const found = patients.find((p) => p.id === patientId);
        if (found) {
          patientName = found.fullName;
          patientCpf = found.cpf;
          patientPhone = found.phone;
          patientBirthDate = found.birthDate;
        }
      } else if (input.patientData) {
        const existing = findPatientByCpf(input.patientData.cpf);
        if (existing) {
          patientId = existing.id;
          patientName = existing.fullName;
          patientCpf = existing.cpf;
          patientPhone = existing.phone;
          patientBirthDate = existing.birthDate;
        } else {
          const created = addPatient(input.patientData);
          patientId = created.id;
          patientName = created.fullName;
          patientCpf = created.cpf;
          patientPhone = created.phone;
          patientBirthDate = created.birthDate;
        }
      }

      const appointmentId = generateUniqueId('apt');
      const now = new Date().toISOString();

      const newAppointment: Appointment = {
        id: appointmentId,
        patientId: patientId || 'pat-anon',
        patientName: patientName || 'Paciente Não Identificado',
        patientCpf: patientCpf || '',
        patientPhone: patientPhone || '',
        patientBirthDate,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        date: input.date,
        startTime: input.startTime,
        endTime: calculatedEnd,
        type: input.type,
        status: 'scheduled',
        notes: input.notes,
        payment: {
          id: generateUniqueId('pay'),
          appointmentId,
          patientId: patientId || 'pat-anon',
          amount: input.payment.amount,
          method: input.payment.method,
          status: input.payment.status,
          installments: input.payment.installments,
          notes: input.payment.notes,
          paidAt: input.payment.status === 'paid' ? now : undefined,
          receiptNumber:
            input.payment.status === 'paid'
              ? `REC-${input.date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
              : undefined,
        },
        createdAt: now,
        updatedAt: now,
      };

      persistAppointments([newAppointment, ...appointments]);
      return { success: true, appointment: newAppointment };
    },
    [
      doctors,
      checkConflict,
      patients,
      findPatientByCpf,
      addPatient,
      appointments,
      persistAppointments,
    ]
  );

  const updateAppointment = useCallback(
    (
      id: string,
      updates: Partial<Appointment>
    ): { success: boolean; conflict?: ConflictCheckResult } => {
      const current = appointments.find((a) => a.id === id);
      if (!current) return { success: false };

      const targetDoctorId = updates.doctorId || current.doctorId;
      const targetDate = updates.date || current.date;
      const targetStart = updates.startTime || current.startTime;
      const targetEnd = updates.endTime || current.endTime;

      if (
        updates.doctorId !== undefined ||
        updates.date !== undefined ||
        updates.startTime !== undefined ||
        updates.endTime !== undefined
      ) {
        const conflict = checkConflict(targetDoctorId, targetDate, targetStart, targetEnd, id);
        if (conflict.hasConflict) {
          return { success: false, conflict };
        }
      }

      let extraDoctorInfo = {};
      if (updates.doctorId && updates.doctorId !== current.doctorId) {
        const doc = doctors.find((d) => d.id === updates.doctorId);
        if (doc) {
          extraDoctorInfo = {
            doctorName: doc.name,
            doctorSpecialty: doc.specialty,
          };
        }
      }

      const updated = appointments.map((apt) => {
        if (apt.id === id) {
          return {
            ...apt,
            ...updates,
            ...extraDoctorInfo,
            updatedAt: new Date().toISOString(),
          };
        }
        return apt;
      });

      persistAppointments(updated);
      return { success: true };
    },
    [appointments, checkConflict, doctors, persistAppointments]
  );

  const transferAppointment = useCallback(
    (
      id: string,
      newDoctorId: string,
      newDate: string,
      newStartTime: string,
      newEndTime?: string
    ) => {
      const current = appointments.find((a) => a.id === id);
      if (!current || !isTransferableAppointment(current.status)) {
        return { success: false };
      }

      const doc = doctors.find((d) => d.id === newDoctorId);
      const calculatedEnd =
        newEndTime || calculateEndTime(newStartTime, doc?.workingHours.slotDurationMinutes || 30);

      return updateAppointment(id, {
        doctorId: newDoctorId,
        date: newDate,
        startTime: newStartTime,
        endTime: calculatedEnd,
        notes: `Transferido em ${new Date().toLocaleDateString('pt-BR')}`,
      });
    },
    [appointments, doctors, updateAppointment]
  );

  const cancelAppointment = useCallback(
    (id: string, reason: string): boolean => {
      const current = appointments.find((a) => a.id === id);
      if (!current || !isCancellableAppointment(current.status)) return false;

      const updated = appointments.map((apt) => {
        if (apt.id === id) {
          return {
            ...apt,
            status: 'cancelled' as AppointmentStatus,
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            payment: {
              ...apt.payment,
              status:
                apt.payment.status === 'paid'
                  ? ('refunded' as PaymentStatus)
                  : ('cancelled' as PaymentStatus),
            },
          };
        }
        return apt;
      });

      persistAppointments(updated);
      return true;
    },
    [appointments, persistAppointments]
  );

  const deleteAppointment = useCallback(
    (id: string): boolean => {
      const updated = appointments.filter((a) => a.id !== id);
      persistAppointments(updated);
      return true;
    },
    [appointments, persistAppointments]
  );

  const updateAppointmentStatus = useCallback(
    (id: string, status: AppointmentStatus): boolean => {
      const now = new Date().toISOString();
      const updated = appointments.map((apt) => {
        if (apt.id === id) {
          return {
            ...apt,
            status,
            checkInTime: status === 'waiting' && !apt.checkInTime ? now : apt.checkInTime,
            completedAt: status === 'completed' && !apt.completedAt ? now : apt.completedAt,
            updatedAt: now,
          };
        }
        return apt;
      });
      persistAppointments(updated);
      return true;
    },
    [appointments, persistAppointments]
  );

  const updatePayment = useCallback(
    (appointmentId: string, paymentUpdates: Partial<PaymentDetails>): boolean => {
      const current = appointments.find((apt) => apt.id === appointmentId);
      if (!current) return false;

      const { payment } = current;
      if (payment.status === 'paid') {
        const amountChanged =
          paymentUpdates.amount !== undefined && paymentUpdates.amount !== payment.amount;
        const methodChanged =
          paymentUpdates.method !== undefined && paymentUpdates.method !== payment.method;
        const installmentsChanged =
          paymentUpdates.installments !== undefined &&
          paymentUpdates.installments !== payment.installments;
        if (amountChanged || methodChanged || installmentsChanged) return false;
      }

      const updated = appointments.map((apt) => {
        if (apt.id === appointmentId) {
          const isNowPaid = paymentUpdates.status === 'paid' && apt.payment.status !== 'paid';
          const receipt =
            isNowPaid && !apt.payment.receiptNumber
              ? `REC-${apt.date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
              : apt.payment.receiptNumber;

          return {
            ...apt,
            payment: {
              ...apt.payment,
              ...paymentUpdates,
              receiptNumber: receipt,
              paidAt: isNowPaid ? new Date().toISOString() : apt.payment.paidAt,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return apt;
      });
      persistAppointments(updated);
      return true;
    },
    [appointments, persistAppointments]
  );

  const addBlockedTime = useCallback(
    (data: Omit<BlockedTime, 'id'>): { success: boolean; conflict?: ConflictCheckResult } => {
      const conflict = checkConflict(data.doctorId, data.date, data.startTime, data.endTime);
      if (conflict.hasConflict && conflict.type === 'appointment') {
        return { success: false, conflict };
      }

      const newBlock: BlockedTime = {
        ...data,
        id: generateUniqueId('blk'),
      };

      persistBlockedTimes([...blockedTimes, newBlock]);
      return { success: true };
    },
    [checkConflict, blockedTimes, persistBlockedTimes]
  );

  const removeBlockedTime = useCallback(
    (id: string): boolean => {
      persistBlockedTimes(blockedTimes.filter((b) => b.id !== id));
      return true;
    },
    [blockedTimes, persistBlockedTimes]
  );

  const addNotice = useCallback(
    (data: {
      title: string;
      message: string;
      priority: NoticePriority;
      author: string;
    }): Notice => {
      const newNotice: Notice = {
        id: generateUniqueId('not'),
        title: data.title,
        message: data.message,
        priority: data.priority,
        author: data.author,
        createdAt: new Date().toISOString(),
        active: true,
      };
      persistNotices([newNotice, ...notices]);
      return newNotice;
    },
    [notices, persistNotices]
  );

  const deleteNotice = useCallback(
    (id: string): boolean => {
      persistNotices(notices.filter((n) => n.id !== id));
      return true;
    },
    [notices, persistNotices]
  );

  const resetDatabase = useCallback(() => {
    storageService.resetToDefaults();
    setDoctors(storageService.getDoctors());
    setPatients(storageService.getPatients());
    setAppointments(storageService.getAppointments());
    setBlockedTimes(storageService.getBlockedTimes());
    setNotices(storageService.getNotices());
  }, []);

  return (
    <ClinicContext.Provider
      value={{
        doctors,
        patients,
        appointments,
        blockedTimes,
        notices,
        clinicInfo,
        metrics,
        addAppointment,
        updateAppointment,
        transferAppointment,
        cancelAppointment,
        deleteAppointment,
        updateAppointmentStatus,
        updatePayment,
        addBlockedTime,
        removeBlockedTime,
        addPatient,
        updatePatient,
        findPatientByCpf,
        addNotice,
        deleteNotice,
        checkConflict,
        resetDatabase,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export function useClinic(): ClinicContextType {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic deve ser utilizado dentro de um ClinicProvider');
  }
  return context;
}
