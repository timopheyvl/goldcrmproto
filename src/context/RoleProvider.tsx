import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { RoleContext } from './RoleContext';
import type { Role } from '../types';

const ROLE_STORAGE_KEY = 'goldlink.mockRole';
const DEFAULT_ROLE: Role = 'manager';

function readStoredRole(): Role {
  const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
  if (stored === 'employee' || stored === 'representative' || stored === 'manager') {
    return stored;
  }
  return DEFAULT_ROLE;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(readStoredRole);

  const setRole = (next: Role) => {
    setRoleState(next);
    window.localStorage.setItem(ROLE_STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ role, setRole }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
