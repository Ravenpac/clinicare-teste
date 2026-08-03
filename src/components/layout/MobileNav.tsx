import React, { useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  Search,
  Users,
  X,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { TabType } from './Sidebar';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { handleModalFocusTrap } from '../../utils/a11yUtils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
}) => {
  const { clinicInfo, resetDatabase } = useClinic();
  const { showInfo } = useToast();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        } else if (e.key === 'Tab') {
          handleModalFocusTrap(e, drawerRef.current);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Área de Trabalho', icon: <LayoutDashboard size={20} /> },
    { id: 'scheduling', label: 'Agendamento', icon: <CalendarCheck2 size={20} /> },
    { id: 'lookup', label: 'Consultas & Histórico', icon: <Search size={20} /> },
    { id: 'patients', label: 'Pacientes', icon: <Users size={20} /> },
  ];

  const handleSelect = (tab: TabType) => {
    onSelectTab(tab);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Deseja realmente restaurar os dados de demonstração da clínica?')) {
      resetDatabase();
      showInfo('Dados de demonstração restaurados com sucesso!');
      onClose();
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 1060,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Menu de Navegação Mobile"
    >
      <div
        ref={drawerRef}
        className="bg-white h-100 shadow-lg d-flex flex-column"
        style={{ width: '280px', maxWidth: '85vw', animation: 'slideInLeft 0.25s ease-out' }}
      >
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-icon" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>
              <Activity size={18} />
            </div>
            <span className="fw-bold text-dark fs-6">CliniCare Pro</span>
          </div>
          <button
            type="button"
            className="btn btn-light btn-sm p-1 rounded-circle"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 d-flex flex-column gap-2 grow" aria-label="Links do Menu Mobile">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-top bg-light">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm w-100 mb-2"
            onClick={handleReset}
          >
            <RotateCcw size={14} className="me-2" />
            Restaurar Demonstração
          </button>
          <p className="text-muted small mb-0 text-center" style={{ fontSize: '0.75rem' }}>
            {clinicInfo.name}
          </p>
        </div>
      </div>
    </div>
  );
};
