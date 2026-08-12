import { useContext } from 'react';
import { AdminContext } from './AdminContext';
import type { AdminContextValue } from './AdminContext';

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
}
