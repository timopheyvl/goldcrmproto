import { NavLink } from 'react-router-dom';
import { MODULES } from '../modules';
import { useRole } from '../context/useRole';

export function Sidebar() {
  const { role } = useRole();
  const visibleModules = MODULES.filter((module) => module.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">GoldLink</div>
      <nav className="sidebar__nav">
        {visibleModules.map((module) => (
          <NavLink
            key={module.key}
            to={module.path}
            className={({ isActive }) =>
              isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
            }
          >
            {module.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
