import type { Role } from '../../types';
import { CURRENT_REPRESENTATIVE_ID } from '../../data/org';
import type { EquipmentRequest } from './types';

export function getScopedRequests(role: Role, requests: EquipmentRequest[]): EquipmentRequest[] {
  if (role === 'manager') return requests;
  if (role === 'representative') {
    return requests.filter((request) => request.representativeId === CURRENT_REPRESENTATIVE_ID);
  }
  return [];
}
