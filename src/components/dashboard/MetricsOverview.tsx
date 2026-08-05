import React from 'react';
import { Calendar, UserCheck, DollarSign, Users } from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { useClinic } from '../../context/ClinicContext';
import { formatCurrency } from '../../utils/formatters';

export const MetricsOverview: React.FC = () => {
  const { metrics } = useClinic();

  const completionRate =
    metrics.todayAppointmentsCount > 0
      ? Math.round((metrics.todayCompletedCount / metrics.todayAppointmentsCount) * 100)
      : 0;

  return (
    <section aria-label="Indicadores do Dia" className="mb-4">
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Agendamentos do Dia"
            value={metrics.todayAppointmentsCount}
            subtitle={`${metrics.todayWaitingCount} pacientes na recepção/espera`}
            icon={<Calendar size={24} />}
            iconBgColor="var(--primary-50)"
            iconColor="var(--primary-600)"
            badgeText={`${metrics.todayAppointmentsCount} consultas agendadas`}
            badgeVariant="primary"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pacientes Atendidos"
            value={`${metrics.todayCompletedCount} / ${metrics.todayAppointmentsCount}`}
            subtitle={`${completionRate}% de conclusão hoje`}
            icon={<UserCheck size={24} />}
            iconBgColor="var(--success-50)"
            iconColor="var(--success-600)"
            badgeText={completionRate === 100 ? '100% Finalizado' : `${completionRate}% Concluído`}
            badgeVariant="success"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Faturamento do Dia"
            value={formatCurrency(metrics.todayRevenue)}
            subtitle={`Pendente: ${formatCurrency(metrics.todayPendingRevenue)}`}
            icon={<DollarSign size={24} />}
            iconBgColor="#fef3c7"
            iconColor="#d97706"
            badgeText={`+ ${formatCurrency(metrics.todayRevenue + metrics.todayPendingRevenue)} previsto`}
            badgeVariant="warning"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Profissionais Ativos"
            value={`${metrics.activeDoctorsCount} Médicos`}
            subtitle={`Taxa de ocupação: ${metrics.occupancyRate}%`}
            icon={<Users size={24} />}
            iconBgColor="#ede9fe"
            iconColor="#7c3aed"
            badgeText={`${metrics.occupancyRate}% da agenda ocupada`}
            badgeVariant="primary"
          />
        </div>
      </div>
    </section>
  );
};
