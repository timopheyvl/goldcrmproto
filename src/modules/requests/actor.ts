import type { Role } from '../../types';
import { ROLE_LABELS } from '../../types';

/**
 * Имя «текущего пользователя» для версионирования и истории изменений.
 * Прототип не реализует аутентификацию — роль переключается мок-селектором,
 * поэтому представителя идентифицируем по живому ФИО текущего представителя
 * (см. CURRENT_REPRESENTATIVE_ID и useEntities().currentRepresentative — так
 * правки в «Управлении» сразу попадают в новые версии), а для менеджера
 * используем ярлык роли — отдельного мок-профиля менеджера в прототипе нет.
 */
export function getCurrentActorName(role: Role, currentRepresentativeFullName?: string): string {
  if (role === 'representative') {
    return currentRepresentativeFullName ?? ROLE_LABELS.representative;
  }
  return ROLE_LABELS[role];
}
