import { createContext } from 'react';
import type { EquipmentRequest, RequestItem } from './types';

export interface RequestsContextValue {
  requests: EquipmentRequest[];
  createRequest: (items: RequestItem[]) => EquipmentRequest;
}

export const RequestsContext = createContext<RequestsContextValue | null>(null);
