import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, TabType } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { SkipLink } from '../common/SkipLink';
import { ToastContainer } from '../common/ToastContainer';

const PATH_TO_TAB: Record<string, TabType> = {
  '/': 'dashboard',
  '/agenda': 'scheduling',
  '/consultas': 'lookup',
  '/pacientes': 'patients',
};

const TAB_TO_PATH: Record<TabType, string> = {
  dashboard: '/',
  scheduling: '/agenda',
  lookup: '/consultas',
  patients: '/pacientes',
};

interface AppLayoutProps {
  onOpenNewAppointmentModal: () => void;
  onOpenBlockTimeModal: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  onOpenNewAppointmentModal,
  onOpenBlockTimeModal,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab: TabType = PATH_TO_TAB[location.pathname] ?? 'dashboard';

  const handleSelectTab = (tab: TabType) => {
    navigate(TAB_TO_PATH[tab]);
  };

  return (
    <div className="app-container">
      <SkipLink />

      <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      <div className="app-main">
        <Header
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onOpenNewAppointmentModal={onOpenNewAppointmentModal}
          onOpenBlockTimeModal={onOpenBlockTimeModal}
        />

        <main id="main-content" className="app-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
