import React from 'react';
import { Calendar, CalendarDays, ListFilter } from 'lucide-react';

export type ViewMode = 'day' | 'week' | 'list';

interface ViewModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ mode, onModeChange }) => {
  return (
    <div
      className="btn-group btn-group-sm"
      role="group"
      aria-label="Modo de visualização da agenda"
    >
      <button
        type="button"
        className={`btn ${mode === 'day' ? 'btn-primary' : 'btn-outline-secondary'}`}
        onClick={() => onModeChange('day')}
        aria-pressed={mode === 'day'}
      >
        <Calendar size={14} className="me-1" aria-hidden="true" />
        Dia
      </button>
      <button
        type="button"
        className={`btn ${mode === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`}
        onClick={() => onModeChange('week')}
        aria-pressed={mode === 'week'}
      >
        <CalendarDays size={14} className="me-1" aria-hidden="true" />
        Semana
      </button>
      <button
        type="button"
        className={`btn ${mode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
        onClick={() => onModeChange('list')}
        aria-pressed={mode === 'list'}
      >
        <ListFilter size={14} className="me-1" aria-hidden="true" />
        Lista
      </button>
    </div>
  );
};
