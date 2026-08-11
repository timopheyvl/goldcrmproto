import { useRole } from '../context/useRole';
import { ROLE_LABELS } from '../types';
import type { Role } from '../types';

const ROLE_ORDER: Role[] = ['employee', 'representative', 'manager'];

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="role-switcher">
      <label htmlFor="role-select" className="role-switcher__label">
        Роль (мок)
      </label>
      <select
        id="role-select"
        className="role-switcher__select"
        value={role}
        onChange={(event) => setRole(event.target.value as Role)}
      >
        {ROLE_ORDER.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </div>
  );
}
