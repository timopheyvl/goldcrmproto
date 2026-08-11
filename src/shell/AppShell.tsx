import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './AppShell.css';
import { Sidebar } from './Sidebar';
import { RoleSwitcher } from './RoleSwitcher';
import { useRole } from '../context/useRole';
import { MODULES, DEFAULT_MODULE_PATH } from '../modules';
import { ROLE_LABELS } from '../types';

export function AppShell() {
  const { role } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentModule = MODULES.find((module) => module.path === location.pathname);
    if (currentModule && !currentModule.roles.includes(role)) {
      navigate(DEFAULT_MODULE_PATH, { replace: true });
    }
  }, [role, location.pathname, navigate]);

  const activeModule = MODULES.find((module) => module.path === location.pathname);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <header className="app-shell__topbar">
          <div className="app-shell__breadcrumb">{activeModule?.label ?? ''}</div>
          <div className="app-shell__topbar-right">
            <span className="app-shell__role-badge">{ROLE_LABELS[role]}</span>
            <RoleSwitcher />
          </div>
        </header>
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
