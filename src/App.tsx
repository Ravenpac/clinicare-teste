import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClinicProvider } from './context/ClinicContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './views/DashboardView';
import { SchedulingView } from './views/SchedulingView';
import { LookupView } from './views/LookupView';
import { PatientsView } from './views/PatientsView';
import { AppointmentModal } from './components/scheduling/AppointmentModal';
import { BlockTimeModal } from './components/scheduling/BlockTimeModal';

const ClinicApp: React.FC = () => {
  const navigate = useNavigate();
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false);

  const openNewAppointment = () => setIsNewAppointmentModalOpen(true);
  const openBlockTime = () => setIsBlockTimeModalOpen(true);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout
              onOpenNewAppointmentModal={openNewAppointment}
              onOpenBlockTimeModal={openBlockTime}
            />
          }
        >
          <Route
            index
            element={
              <DashboardView
                onOpenNewAppointmentModal={openNewAppointment}
                onNavigateToScheduling={() => navigate('/agenda')}
              />
            }
          />
          <Route
            path="agenda"
            element={
              <SchedulingView
                onOpenNewAppointmentModal={openNewAppointment}
                onOpenBlockTimeModal={openBlockTime}
              />
            }
          />
          <Route
            path="consultas"
            element={<LookupView onOpenNewAppointmentModal={openNewAppointment} />}
          />
          <Route path="pacientes" element={<PatientsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      <AppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={() => setIsNewAppointmentModalOpen(false)}
      />

      <BlockTimeModal
        isOpen={isBlockTimeModalOpen}
        onClose={() => setIsBlockTimeModalOpen(false)}
      />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ClinicProvider>
          <BrowserRouter>
            <ClinicApp />
          </BrowserRouter>
        </ClinicProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
