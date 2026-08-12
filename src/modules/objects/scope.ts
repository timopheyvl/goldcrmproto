import type { Role } from '../../types';
import type { Site } from '../../data/org';
import { CURRENT_REPRESENTATIVE_ID, getRepresentativeScope } from '../../data/org';

export function getScopedSites(role: Role, sites: Site[]): Site[] {
  if (role === 'manager') return sites;
  if (role === 'representative') {
    const scope = getRepresentativeScope(CURRENT_REPRESENTATIVE_ID);
    if (!scope) return [];
    return sites.filter((site) => site.id === scope.siteId);
  }
  return [];
}
