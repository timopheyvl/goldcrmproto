import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './AppShell.css';
import { Sidebar } from './Sidebar';
import { RoleSwitcher } from './RoleSwitcher';
import { useRole } from '../context/useRole';
import { useAuth } from '../context/useAuth';
import { MODULES, DEFAULT_MODULE_PATH } from '../modules';
import { ROLE_LABELS } from '../types';

export function AppShell() {
  const { role } = useRole();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const matchesModule = (module: (typeof MODULES)[number]) =>
    location.pathname === module.path || location.pathname.startsWith(`${module.path}/`);

  useEffect(() => {
    const currentModule = MODULES.find(matchesModule);
    if (currentModule && !currentModule.roles.includes(role)) {
      navigate(DEFAULT_MODULE_PATH, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, location.pathname, navigate]);

  const activeModule = MODULES.find(matchesModule);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <header className="app-shell__topbar">
          <div className="app-shell__breadcrumb">{activeModule?.label ?? ''}</div>
          <div className="app-shell__topbar-right">
            <span className="app-shell__role-badge">{ROLE_LABELS[role]}</span>
            <RoleSwitcher />
            <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </header>
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
