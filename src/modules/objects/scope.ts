import type { Role } from '../../types';
import type { Department, Representative, Site } from '../../data/org';
import { CURRENT_REPRESENTATIVE_ID } from '../../data/org';

export function getScopedSites(
  role: Role,
  sites: Site[],
  departments: Department[],
  representatives: Representative[],
): Site[] {
  if (role === 'manager') return sites;
  if (role === 'representative') {
    const representative = representatives.find((item) => item.id === CURRENT_REPRESENTATIVE_ID);
    if (!representative) return [];
    const department = departments.find((item) => item.id === representative.departmentId);
    if (!department) return [];
    return sites.filter((site) => site.id === department.siteId);
  }
  return [];
}
