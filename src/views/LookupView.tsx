import React, { useState, useMemo } from 'react';
import { useClinic } from '../context/ClinicContext';
import { useToast } from '../context/ToastContext';
import { useResponsiveBreakpoints } from '../hooks/useMediaQuery';
import { AppointmentFilters } from '../components/lookup/AppointmentFilters';
import { AppointmentTable } from '../components/lookup/AppointmentTable';
import { AppointmentMobileCardList } from '../components/lookup/AppointmentMobileCardList';
import { AppointmentDetailsModal } from '../components/lookup/AppointmentDetailsModal';
import { EditBillingModal } from '../components/lookup/EditBillingModal';
import { TransferAppointmentModal } from '../components/scheduling/TransferAppointmentModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { EmptyState } from '../components/common/EmptyState';
import { AppointmentFilterState } from '../types/clinic';
import { Appointment } from '../types/appointment';
import { getTodayDateString, addDays } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatters';
import { FileSpreadsheet, Plus } from 'lucide-react';
import { Button } from '../components/common/Button';

interface LookupViewProps {
  onOpenNewAppointmentModal: () => void;
}

const initialFilters: AppointmentFilterState = {
  searchQuery: '',
  doctorId: 'all',
  status: 'all',
  paymentStatus: 'all',
  dateRange: 'month',
  startDate: addDays(getTodayDateString(), -30),
  endDate: addDays(getTodayDateString(), 30),
};

export const LookupView: React.FC<LookupViewProps> = ({ onOpenNewAppointmentModal }) => {
  const { appointments, doctors, cancelAppointment } = useClinic();
  const { showSuccess, showInfo } = useToast();
  const { isMobile } = useResponsiveBreakpoints();

  const [filters, setFilters] = useState<AppointmentFilterState>(initialFilters);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditBillingModalOpen, setIsEditBillingModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const filteredAppointments = useMemo(() => {
    const today = getTodayDateString();

    return appointments.filter((apt) => {
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().replace(/[.\-()\s]/g, '');
        const patientNameClean = apt.patientName.toLowerCase();
        const patientCpfClean = apt.patientCpf.replace(/\D/g, '');
        const patientPhoneClean = apt.patientPhone.replace(/\D/g, '');
        const doctorNameClean = apt.doctorName.toLowerCase();

        const match =
          patientNameClean.includes(filters.searchQuery.toLowerCase()) ||
          patientCpfClean.includes(query) ||
          patientPhoneClean.includes(query) ||
          doctorNameClean.includes(filters.searchQuery.toLowerCase());

        if (!match) return false;
      }

      if (filters.doctorId !== 'all' && apt.doctorId !== filters.doctorId) {
        return false;
      }

      if (filters.status !== 'all' && apt.status !== filters.status) {
        return false;
      }

      if (filters.paymentStatus !== 'all' && apt.payment.status !== filters.paymentStatus) {
        return false;
      }

      if (filters.dateRange === 'today') {
        if (apt.date !== today) return false;
      } else if (filters.dateRange === 'week') {
        const startWeek = addDays(today, -3);
        const endWeek = addDays(today, 4);
        if (apt.date < startWeek || apt.date > endWeek) return false;
      } else if (filters.dateRange === 'custom') {
        if (filters.startDate && apt.date < filters.startDate) return false;
        if (filters.endDate && apt.date > filters.endDate) return false;
      }

      return true;
    });
  }, [appointments, filters]);

  const summary = useMemo(() => {
    let totalRevenue = 0;
    let pendingRevenue = 0;

    filteredAppointments.forEach((apt) => {
      if (apt.status !== 'cancelled') {
        if (apt.payment.status === 'paid' || apt.payment.status === 'billed') {
          totalRevenue += apt.payment.amount;
        } else if (apt.payment.status === 'pending') {
          pendingRevenue += apt.payment.amount;
        }
      }
    });

    return { totalRevenue, pendingRevenue };
  }, [filteredAppointments]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleExportSimulated = () => {
    showInfo('Relatório exportado em formato CSV/Excel com sucesso!', 'Exportação Concluída');
  };

  const handleViewDetails = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsDetailsModalOpen(true);
  };

  const handleEditBilling = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsEditBillingModalOpen(true);
  };

  const handleTransfer = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsTransferModalOpen(true);
  };

  const handleCancel = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = (reason?: string) => {
    if (selectedAppointment) {
      const cancelled = cancelAppointment(
        selectedAppointment.id,
        reason || 'Cancelado na consulta de agendamentos'
      );
      if (cancelled) {
        showSuccess(
          `Consulta de ${selectedAppointment.patientName} cancelada com sucesso.`,
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
          <h1 className="fs-4 fw-bold text-dark mb-1">Consulta & Histórico de Agendamentos</h1>
          <p className="text-secondary small mb-0">
            Pesquise, filtre e gerencie consultas passadas e futuras, recibos e faturamento.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="light"
            size="sm"
            onClick={handleExportSimulated}
            leftIcon={<FileSpreadsheet size={16} />}
          >
            Exportar Relatório
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewAppointmentModal}
            leftIcon={<Plus size={16} />}
          >
            Novo Agendamento
          </Button>
        </div>
      </div>

      <AppointmentFilters
        filters={filters}
        onFilterChange={setFilters}
        doctors={doctors}
        onResetFilters={handleResetFilters}
      />

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded border shadow-xs d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted small text-uppercase fw-semibold">
                Consultas Encontradas
              </span>
              <h2 className="fs-4 fw-bold text-dark mb-0">{filteredAppointments.length}</h2>
            </div>
            <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill">
              Filtro Ativo
            </span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded border shadow-xs d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted small text-uppercase fw-semibold">
                Recebido / Faturado
              </span>
              <h2 className="fs-4 fw-bold text-success mb-0">
                {formatCurrency(summary.totalRevenue)}
              </h2>
            </div>
            <span className="badge bg-success-subtle text-success-emphasis rounded-pill">
              Liquidado
            </span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded border shadow-xs d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted small text-uppercase fw-semibold">Valor Pendente</span>
              <h2 className="fs-4 fw-bold text-warning-emphasis mb-0">
                {formatCurrency(summary.pendingRevenue)}
              </h2>
            </div>
            <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill">
              A Cobrar
            </span>
          </div>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="card shadow-sm border p-4">
          <EmptyState
            title="Nenhum agendamento encontrado"
            description="Não encontramos registros que correspondam aos filtros selecionados. Tente ajustar os termos de busca ou o período."
            actionText="Limpar Filtros"
            onAction={handleResetFilters}
          />
        </div>
      ) : isMobile ? (
        <AppointmentMobileCardList
          appointments={filteredAppointments}
          onViewDetails={handleViewDetails}
          onEditBilling={handleEditBilling}
          onTransfer={handleTransfer}
          onCancel={handleCancel}
        />
      ) : (
        <AppointmentTable
          appointments={filteredAppointments}
          onViewDetails={handleViewDetails}
          onEditBilling={handleEditBilling}
          onTransfer={handleTransfer}
          onCancel={handleCancel}
        />
      )}

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
        message={`Deseja realmente cancelar a consulta de ${selectedAppointment?.patientName}? Esta ação atualizará o status financeiro e liberará o horário.`}
        confirmText="Confirmar Cancelamento"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Informe o motivo do cancelamento..."
      />
    </div>
  );
};
