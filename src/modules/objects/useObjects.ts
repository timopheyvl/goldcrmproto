import { useContext } from 'react';
import { ObjectsContext } from './ObjectsContext';
import type { ObjectsContextValue } from './ObjectsContext';

export function useObjects(): ObjectsContextValue {
  const ctx = useContext(ObjectsContext);
  if (!ctx) {
    throw new Error('useObjects must be used within an ObjectsProvider');
  }
  return ctx;
}
