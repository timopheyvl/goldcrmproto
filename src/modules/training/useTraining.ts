import { useContext } from 'react';
import { TrainingContext } from './TrainingContext';
import type { TrainingContextValue } from './TrainingContext';

export function useTraining(): TrainingContextValue {
  const ctx = useContext(TrainingContext);
  if (!ctx) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return ctx;
}
