import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { AppointmentFilterState } from '../../types/clinic';
import { Doctor } from '../../types/doctor';
import { AppointmentStatus } from '../../types/appointment';
import { PaymentStatus } from '../../types/payment';

interface AppointmentFiltersProps {
  filters: AppointmentFilterState;
  onFilterChange: (filters: AppointmentFilterState) => void;
  doctors: Doctor[];
  onResetFilters: () => void;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  filters,
  onFilterChange,
  doctors,
  onResetFilters,
}) => {
  const handleChange = (
    field: keyof AppointmentFilterState,
    value: AppointmentFilterState[keyof AppointmentFilterState]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div
      className="card shadow-sm border p-3 mb-4"
      role="search"
      aria-label="Filtros de busca de agendamentos"
    >
      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <label htmlFor="search-query" className="form-label small fw-bold text-dark">
            Buscar por Paciente, CPF, Telefone ou Médico
          </label>
          <div className="input-group">
            <span className="input-group-text bg-white text-muted">
              <Search size={16} aria-hidden="true" />
            </span>
            <input
              id="search-query"
              type="text"
              className="form-control"
              placeholder="Digite o nome, CPF (ex: 529.982), telefone..."
              value={filters.searchQuery}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
            />
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-2">
          <label htmlFor="filter-period" className="form-label small fw-bold text-dark">
            Período
          </label>
          <select
            id="filter-period"
            className="form-select"
            value={filters.dateRange}
            onChange={(e) => handleChange('dateRange', e.target.value)}
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <label htmlFor="filter-doctor" className="form-label small fw-bold text-dark">
            Médico Responsável
          </label>
          <select
            id="filter-doctor"
            className="form-select"
            value={filters.doctorId}
            onChange={(e) => handleChange('doctorId', e.target.value)}
          >
            <option value="all">Todos os Médicos</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialty})
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <label htmlFor="filter-status" className="form-label small fw-bold text-dark">
            Status da Consulta
          </label>
          <select
            id="filter-status"
            className="form-select"
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value as AppointmentStatus | 'all')}
          >
            <option value="all">Todos os Status</option>
            <option value="scheduled">Agendado</option>
            <option value="confirmed">Confirmado</option>
            <option value="waiting">Em Espera</option>
            <option value="in_progress">Em Atendimento</option>
            <option value="completed">Atendido / Concluído</option>
            <option value="cancelled">Cancelado</option>
            <option value="no_show">Não Compareceu</option>
          </select>
        </div>

        {filters.dateRange === 'custom' && (
          <>
            <div className="col-12 col-sm-6 col-lg-3">
              <label htmlFor="filter-start-date" className="form-label small fw-bold text-dark">
                Data Inicial
              </label>
              <input
                id="filter-start-date"
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <label htmlFor="filter-end-date" className="form-label small fw-bold text-dark">
                Data Final
              </label>
              <input
                id="filter-end-date"
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </>
        )}

        <div className="col-12 col-sm-6 col-lg-3">
          <label htmlFor="filter-payment-status" className="form-label small fw-bold text-dark">
            Status do Pagamento
          </label>
          <select
            id="filter-payment-status"
            className="form-select"
            value={filters.paymentStatus}
            onChange={(e) => handleChange('paymentStatus', e.target.value as PaymentStatus | 'all')}
          >
            <option value="all">Todos os Pagamentos</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="billed">Faturado (Convênio)</option>
            <option value="refunded">Estornado</option>
          </select>
        </div>

        <div className="col-12 col-sm-6 col-lg-3 d-flex align-items-end">
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={onResetFilters}
            aria-label="Limpar todos os filtros de busca"
          >
            <RotateCcw size={15} className="me-2" aria-hidden="true" />
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
