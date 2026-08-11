import { useContext } from 'react';
import { RequestsContext } from './RequestsContext';
import type { RequestsContextValue } from './RequestsContext';

export function useRequests(): RequestsContextValue {
  const ctx = useContext(RequestsContext);
  if (!ctx) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return ctx;
}
