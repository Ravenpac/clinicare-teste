import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateBR, formatDateExtensive } from '../../utils/formatters';
import { addDays, getTodayDateString } from '../../utils/dateUtils';
import { useResponsiveBreakpoints } from '../../hooks/useMediaQuery';

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange }) => {
  const today = getTodayDateString();
  const isToday = selectedDate === today;
  const { isMobile } = useResponsiveBreakpoints();

  const handlePrevDay = () => {
    onDateChange(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(today);
  };

  return (
    <div
      className="d-flex align-items-center gap-2 flex-wrap"
      role="region"
      aria-label="Navegador de Datas da Agenda"
    >
      <div className="btn-group btn-group-sm" role="group" aria-label="Navegação de dias">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handlePrevDay}
          aria-label="Ir para o dia anterior"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`btn ${isToday ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={handleToday}
          aria-label="Ir para a data de hoje"
        >
          Hoje
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleNextDay}
          aria-label="Ir para o próximo dia"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="d-flex align-items-center gap-2">
        <label htmlFor="agenda-date-input" className="visually-hidden">
          Selecionar data no calendário
        </label>
        <input
          id="agenda-date-input"
          type="date"
          className="form-control form-control-sm"
          style={{ width: 'auto' }}
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) onDateChange(e.target.value);
          }}
        />
        <span className="fw-semibold text-dark text-capitalize small">
          {isMobile ? formatDateBR(selectedDate) : formatDateExtensive(selectedDate)}
        </span>
      </div>
    </div>
  );
};
