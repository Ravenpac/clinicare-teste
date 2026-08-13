import React from 'react';
import { Menu, Plus, Calendar, Clock, Lock, Sun, Moon } from 'lucide-react';
import { formatDateExtensive } from '../../utils/formatters';
import { getTodayDateString } from '../../utils/dateUtils';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewAppointmentModal: () => void;
  onOpenBlockTimeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewAppointmentModal,
  onOpenBlockTimeModal,
}) => {
  const todayStr = getTodayDateString();
  const formattedToday = formatDateExtensive(todayStr);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="app-header" aria-label="Cabeçalho Principal">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-light btn-sm d-lg-none"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menu de navegação"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <div className="d-flex align-items-center gap-2 text-secondary">
          <Calendar size={16} className="text-primary-600 d-none d-sm-inline" aria-hidden="true" />
          <span className="fw-semibold text-dark text-capitalize small">{formattedToday}</span>
          <span className="text-muted d-none d-md-inline small">
            • <Clock size={13} className="ms-1 me-1 text-muted" aria-hidden="true" /> Recepção Ativa
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-light btn-sm"
          onClick={toggleTheme}
          aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
          title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
        </button>

        <Button
          variant="light"
          size="sm"
          onClick={onOpenBlockTimeModal}
          leftIcon={<Lock size={15} />}
          className="d-none d-sm-inline-flex"
        >
          <span>Bloquear Horário</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewAppointmentModal}
          leftIcon={<Plus size={16} />}
        >
          <span className="d-none d-sm-inline">Novo</span> Agendamento
        </Button>
      </div>
    </header>
  );
};
