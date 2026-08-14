import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { useToast } from '../context/ToastContext';
import { useResponsiveBreakpoints } from '../hooks/useMediaQuery';
import { DoctorSelector } from '../components/scheduling/DoctorSelector';
import { DateNavigator } from '../components/scheduling/DateNavigator';
import { ViewModeToggle, ViewMode } from '../components/scheduling/ViewModeToggle';
import { AgendaDayView } from '../components/scheduling/AgendaDayView';
import { AgendaWeekView } from '../components/scheduling/AgendaWeekView';
import { AgendaMobileList } from '../components/scheduling/AgendaMobileList';
import { AppointmentModal } from '../components/scheduling/AppointmentModal';
import { TransferAppointmentModal } from '../components/scheduling/TransferAppointmentModal';
import { AppointmentDetailsModal } from '../components/lookup/AppointmentDetailsModal';
import { EditBillingModal } from '../components/lookup/EditBillingModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Appointment } from '../types/appointment';
import { getTodayDateString } from '../utils/dateUtils';
import { Plus, Lock } from 'lucide-react';
import { Button } from '../components/common/Button';

interface SchedulingViewProps {
  onOpenNewAppointmentModal: () => void;
  onOpenBlockTimeModal: () => void;
}

export const SchedulingView: React.FC<SchedulingViewProps> = ({
  onOpenNewAppointmentModal,
  onOpenBlockTimeModal,
}) => {
  const { doctors, appointments, blockedTimes, cancelAppointment } = useClinic();
  const { showSuccess } = useToast();
  const { isMobile } = useResponsiveBreakpoints();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  const [isSlotAppointmentModalOpen, setIsSlotAppointmentModalOpen] = useState(false);
  const [slotPrefill, setSlotPrefill] = useState<{ doctorId: string; time: string; date?: string }>(
    {
      doctorId: '',
      time: '',
    }
  );

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditBillingModalOpen, setIsEditBillingModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleSelectSlot = (doctorId: string, time: string, date?: string) => {
    setSlotPrefill({
      doctorId,
      time,
      date: date || selectedDate,
    });
    setIsSlotAppointmentModalOpen(true);
  };

  const handleSelectAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmCancel = (reason?: string) => {
    if (selectedAppointment) {
      const cancelled = cancelAppointment(
        selectedAppointment.id,
        reason || 'Cancelado pela recepção'
      );
      if (cancelled) {
        showSuccess(
          `Consulta de ${selectedAppointment.patientName} foi cancelada.`,
          'Consulta Cancelada'
        );
      }
      setIsCancelModalOpen(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="card shadow-sm border p-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <DoctorSelector
            doctors={doctors}
            selectedDoctorId={selectedDoctorId}
            onSelectDoctor={setSelectedDoctorId}
          />

          <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

          <div className="d-flex align-items-center gap-2">
            {!isMobile && <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />}

            <Button
              variant="outline-primary"
              size="sm"
              className="btn-icon-on-mobile"
              onClick={onOpenBlockTimeModal}
              leftIcon={<Lock size={14} />}
              title="Bloquear período de médico"
              aria-label="Bloquear Horário"
            >
              Bloquear Horário
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="btn-icon-on-mobile"
              onClick={onOpenNewAppointmentModal}
              leftIcon={<Plus size={16} />}
              aria-label="Novo Agendamento"
            >
              Novo Agendamento
            </Button>
          </div>
        </div>
      </div>

      {isMobile || viewMode === 'list' ? (
        <AgendaMobileList
          date={selectedDate}
          doctors={doctors}
          selectedDoctorId={selectedDoctorId}
          appointments={appointments}
          blockedTimes={blockedTimes}
          onSelectAppointment={handleSelectAppointment}
          onOpenNewAppointmentModal={onOpenNewAppointmentModal}
        />
      ) : viewMode === 'week' ? (
        <AgendaWeekView
          currentDate={selectedDate}
          doctors={doctors}
          selectedDoctorId={selectedDoctorId}
          appointments={appointments}
          blockedTimes={blockedTimes}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setViewMode('day');
          }}
          onSelectAppointment={handleSelectAppointment}
          onSelectSlot={handleSelectSlot}
        />
      ) : (
        <AgendaDayView
          date={selectedDate}
          doctors={doctors}
          selectedDoctorId={selectedDoctorId}
          appointments={appointments}
          blockedTimes={blockedTimes}
          onSelectSlot={handleSelectSlot}
          onSelectAppointment={handleSelectAppointment}
        />
      )}

      <AppointmentModal
        isOpen={isSlotAppointmentModalOpen}
        onClose={() => setIsSlotAppointmentModalOpen(false)}
        initialDoctorId={slotPrefill.doctorId}
        initialDate={slotPrefill.date || selectedDate}
        initialTime={slotPrefill.time}
      />

      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        appointment={selectedAppointment}
        onOpenTransferModal={() => setIsTransferModalOpen(true)}
        onOpenCancelModal={() => setIsCancelModalOpen(true)}
        onOpenEditBillingModal={() => setIsEditBillingModalOpen(true)}
      />

      <EditBillingModal
        isOpen={isEditBillingModalOpen}
        onClose={() => setIsEditBillingModalOpen(false)}
        appointment={selectedAppointment}
      />

      <TransferAppointmentModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        appointment={selectedAppointment}
      />

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Consulta"
        message={`Deseja realmente cancelar a consulta de ${selectedAppointment?.patientName}? Esta ação é irreversível.`}
        confirmText="Confirmar Cancelamento"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Informe o motivo do cancelamento..."
      />
    </div>
  );
};
