import React from 'react';
import { Doctor } from '../../types/doctor';
import { Stethoscope } from 'lucide-react';

interface DoctorSelectorProps {
  doctors: Doctor[];
  selectedDoctorId: string;
  onSelectDoctor: (doctorId: string) => void;
}

export const DoctorSelector: React.FC<DoctorSelectorProps> = ({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
}) => {
  return (
    <div className="d-flex align-items-center gap-2" role="group" aria-label="Filtro por Médico">
      <label htmlFor="doctor-agenda-select" className="visually-hidden">
        Selecionar Médico da Agenda
      </label>
      <div className="input-group input-group-sm">
        <span className="input-group-text bg-white text-muted">
          <Stethoscope size={15} aria-hidden="true" />
        </span>
        <select
          id="doctor-agenda-select"
          className="form-select form-select-sm fw-medium"
          value={selectedDoctorId}
          onChange={(e) => onSelectDoctor(e.target.value)}
          style={{ minWidth: '220px' }}
        >
          <option value="all">Todos os Médicos (Visão Geral)</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name} — {doc.specialty} (CRM {doc.crm}/{doc.crmState})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
