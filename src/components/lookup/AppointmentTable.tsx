import React, { useState } from 'react';
import {
  Appointment,
  APPOINTMENT_TYPE_LABELS,
  isCancellableAppointment,
  isTransferableAppointment,
} from '../../types/appointment';
import { StatusBadge, PaymentBadge } from '../common/Badge';
import { formatDateBR, formatCurrency, formatCPF } from '../../utils/formatters';
import { PAYMENT_METHOD_LABELS } from '../../types/payment';
import {
  Eye,
  CreditCard,
  ArrowRightLeft,
  XCircle,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';

interface AppointmentTableProps {
  appointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
  onEditBilling: (appointment: Appointment) => void;
  onTransfer: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

type SortField = 'date' | 'patientName' | 'doctorName' | 'amount' | 'status';

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  onViewDetails,
  onEditBilling,
  onTransfer,
  onCancel,
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      const aDate = `${a.date} ${a.startTime}`;
      const bDate = `${b.date} ${b.startTime}`;
      comparison = aDate.localeCompare(bDate);
    } else if (sortField === 'patientName') {
      comparison = a.patientName.localeCompare(b.patientName);
    } else if (sortField === 'doctorName') {
      comparison = a.doctorName.localeCompare(b.doctorName);
    } else if (sortField === 'amount') {
      comparison = a.payment.amount - b.payment.amount;
    } else if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status);
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-muted ms-1" aria-hidden="true" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp size={14} className="text-primary-700 ms-1" aria-hidden="true" />
    ) : (
      <ChevronDown size={14} className="text-primary-700 ms-1" aria-hidden="true" />
    );
  };

  return (
    <div
      className="card shadow-sm border overflow-hidden"
      role="region"
      aria-label="Tabela de Histórico de Consultas"
    >
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col" style={{ width: '170px' }}>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-muted fw-bold small text-uppercase"
                  onClick={() => handleSort('date')}
                  aria-label={`Ordenar por Data e Horário. Atual: ${sortField === 'date' ? sortDirection : 'não ordenado'}`}
                >
                  Data / Horário {renderSortIcon('date')}
                </button>
              </th>
              <th scope="col">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-muted fw-bold small text-uppercase"
                  onClick={() => handleSort('patientName')}
                  aria-label={`Ordenar por Paciente. Atual: ${sortField === 'patientName' ? sortDirection : 'não ordenado'}`}
                >
                  Paciente {renderSortIcon('patientName')}
                </button>
              </th>
              <th scope="col">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-muted fw-bold small text-uppercase"
                  onClick={() => handleSort('doctorName')}
                  aria-label={`Ordenar por Médico. Atual: ${sortField === 'doctorName' ? sortDirection : 'não ordenado'}`}
                >
                  Médico / Especialidade {renderSortIcon('doctorName')}
                </button>
              </th>
              <th scope="col">Tipo de Consulta</th>
              <th scope="col">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-muted fw-bold small text-uppercase"
                  onClick={() => handleSort('status')}
                  aria-label={`Ordenar por Status. Atual: ${sortField === 'status' ? sortDirection : 'não ordenado'}`}
                >
                  Status {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-muted fw-bold small text-uppercase"
                  onClick={() => handleSort('amount')}
                  aria-label={`Ordenar por Valor. Atual: ${sortField === 'amount' ? sortDirection : 'não ordenado'}`}
                >
                  Valor / Pagamento {renderSortIcon('amount')}
                </button>
              </th>
              <th scope="col" className="text-end" style={{ minWidth: '160px' }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedAppointments.map((apt) => (
              <tr key={apt.id}>
                <td>
                  <span className="fw-bold text-dark d-block">{formatDateBR(apt.date)}</span>
                  <span className="text-muted small">
                    {apt.startTime} às {apt.endTime}
                  </span>
                </td>

                <td>
                  <span className="fw-semibold text-dark d-block">{apt.patientName}</span>
                  <span className="text-muted small">CPF: {formatCPF(apt.patientCpf)}</span>
                </td>

                <td>
                  <span className="fw-medium text-dark d-block">{apt.doctorName}</span>
                  <span className="text-muted small">{apt.doctorSpecialty}</span>
                </td>

                <td>
                  <span className="badge bg-light text-secondary border">
                    {APPOINTMENT_TYPE_LABELS[apt.type] || apt.type}
                  </span>
                </td>

                <td>
                  <StatusBadge status={apt.status} />
                </td>

                <td>
                  <div className="d-flex flex-column gap-1">
                    <span className="fw-bold text-dark">{formatCurrency(apt.payment.amount)}</span>
                    <div className="d-flex align-items-center gap-1">
                      <PaymentBadge status={apt.payment.status} />
                      <span className="text-muted small" style={{ fontSize: '0.725rem' }}>
                        ({PAYMENT_METHOD_LABELS[apt.payment.method] || apt.payment.method})
                      </span>
                    </div>
                  </div>
                </td>

                <td className="text-end">
                  <div className="d-inline-flex align-items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm p-1 px-2"
                      onClick={() => onViewDetails(apt)}
                      title="Ver ficha completa do agendamento"
                      aria-label={`Ver detalhes da consulta de ${apt.patientName}`}
                    >
                      <Eye size={15} aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm p-1 px-2"
                      onClick={() => onEditBilling(apt)}
                      title="Gerenciar pagamento e recibo"
                      aria-label={`Editar faturamento de ${apt.patientName}`}
                    >
                      <CreditCard size={15} aria-hidden="true" />
                    </button>

                    {isTransferableAppointment(apt.status) && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm p-1 px-2"
                        onClick={() => onTransfer(apt)}
                        title="Transferir para outro médico/horário"
                        aria-label={`Transferir consulta de ${apt.patientName}`}
                      >
                        <ArrowRightLeft size={15} aria-hidden="true" />
                      </button>
                    )}

                    {isCancellableAppointment(apt.status) && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1 px-2"
                        onClick={() => onCancel(apt)}
                        title="Cancelar consulta"
                        aria-label={`Cancelar consulta de ${apt.patientName}`}
                      >
                        <XCircle size={15} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-footer bg-white d-flex flex-wrap align-items-center justify-content-between gap-2 p-3">
        <span className="text-muted small">
          Mostrando {paginatedAppointments.length} de {appointments.length} registros
        </span>

        <nav aria-label="Navegação de páginas da tabela">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Página anterior"
              >
                Anterior
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => setCurrentPage(num)}
                  aria-label={`Ir para página ${num}`}
                  aria-current={currentPage === num ? 'page' : undefined}
                >
                  {num}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Próxima página"
              >
                Próxima
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
