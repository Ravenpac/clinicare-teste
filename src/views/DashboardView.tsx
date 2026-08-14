import React, { useState } from 'react';
import { MetricsOverview } from '../components/dashboard/MetricsOverview';
import { TodayScheduleList } from '../components/dashboard/TodayScheduleList';
import { NoticeBoard } from '../components/dashboard/NoticeBoard';
import { AppointmentDetailsModal } from '../components/lookup/AppointmentDetailsModal';
import { EditBillingModal } from '../components/lookup/EditBillingModal';
import { TransferAppointmentModal } from '../components/scheduling/TransferAppointmentModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Appointment } from '../types/appointment';
import { useClinic } from '../context/ClinicContext';
import { useToast } from '../context/ToastContext';
import { Plus, CalendarCheck } from 'lucide-react';
import { Button } from '../components/common/Button';

interface DashboardViewProps {
  onOpenNewAppointmentModal: () => void;
  onNavigateToScheduling: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewAppointmentModal,
  onNavigateToScheduling,
}) => {
  const { cancelAppointment } = useClinic();
  const { showSuccess } = useToast();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditBillingModalOpen, setIsEditBillingModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-2 border-bottom">
        <div>
          <h1 className="fs-4 fw-bold text-dark mb-1">Painel da Recepção & Atendimento</h1>
          <p className="text-secondary small mb-0">
            Acompanhe a escala do dia, pacientes na sala de espera e fluxo de caixa da clínica.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            className="btn-icon-on-mobile"
            onClick={onNavigateToScheduling}
            leftIcon={<CalendarCheck size={16} />}
            aria-label="Ver Agenda Completa"
          >
            Ver Agenda Completa
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

      <MetricsOverview />

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <TodayScheduleList
            onSelectAppointment={handleSelectAppointment}
            onOpenNewAppointmentModal={onOpenNewAppointmentModal}
          />
        </div>

        <div className="col-12 col-xl-4">
          <NoticeBoard />
        </div>
      </div>

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
        message={`Deseja realmente cancelar o agendamento de ${selectedAppointment?.patientName}? Esta ação é irreversível.`}
        confirmText="Confirmar Cancelamento"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Informe o motivo do cancelamento (ex: desistência do paciente, imprevisto)..."
      />
    </div>
  );
};
