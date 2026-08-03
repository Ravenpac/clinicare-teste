import React from 'react';
import { LayoutDashboard, CalendarCheck2, Search, Users, RotateCcw, Activity } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';

export type TabType = 'dashboard' | 'scheduling' | 'lookup' | 'patients';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { clinicInfo, resetDatabase } = useClinic();
  const { showInfo } = useToast();

  const handleResetData = () => {
    if (window.confirm('Deseja realmente restaurar os dados de demonstração da clínica?')) {
      resetDatabase();
      showInfo('Dados de demonstração restaurados com sucesso!', 'Banco Restaurado');
    }
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Área de Trabalho',
      icon: <LayoutDashboard size={20} className="nav-icon" />,
    },
    {
      id: 'scheduling',
      label: 'Agendamento',
      icon: <CalendarCheck2 size={20} className="nav-icon" />,
    },
    {
      id: 'lookup',
      label: 'Consultas & Histórico',
      icon: <Search size={20} className="nav-icon" />,
    },
    {
      id: 'patients',
      label: 'Pacientes',
      icon: <Users size={20} className="nav-icon" />,
    },
  ];

  return (
    <aside className="app-sidebar" aria-label="Navegação Principal">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Activity size={22} aria-hidden="true" />
        </div>
        <div>
          <h1 className="fs-6 fw-bold mb-0 text-dark">CliniCare Pro</h1>
          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
            Recepção Médica
          </span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Menu do Sistema">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              <span className="grow">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-muted small fw-semibold">Demonstração</span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm p-1 px-2 text-dark"
            style={{ fontSize: '0.75rem' }}
            onClick={handleResetData}
            title="Restaurar dados originais"
            aria-label="Restaurar dados originais de demonstração"
          >
            <RotateCcw size={12} className="me-1" />
            Restaurar
          </button>
        </div>
        <p className="text-muted small mb-0" style={{ fontSize: '0.725rem', lineHeight: '1.3' }}>
          {clinicInfo.name}
        </p>
      </div>
    </aside>
  );
};
