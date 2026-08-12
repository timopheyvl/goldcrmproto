import type { Role } from '../../types';
import { ROLE_LABELS } from '../../types';
import { CURRENT_REPRESENTATIVE_ID, getRepresentativeById } from '../../data/org';

/**
 * Имя «текущего пользователя» для версионирования и истории изменений.
 * Прототип не реализует аутентификацию — роль переключается мок-селектором,
 * поэтому представителя всегда идентифицируем как CURRENT_REPRESENTATIVE_ID
 * (см. src/data/org.ts), а для менеджера используем ярлык роли — отдельного
 * мок-профиля менеджера в прототипе нет.
 */
export function getCurrentActorName(role: Role): string {
  if (role === 'representative') {
    return getRepresentativeById(CURRENT_REPRESENTATIVE_ID)?.fullName ?? ROLE_LABELS.representative;
  }
  return ROLE_LABELS[role];
}
