export type Role = 'employee' | 'representative' | 'manager';

export const ROLE_LABELS: Record<Role, string> = {
  employee: 'Сотрудник заказчика',
  representative: 'Представитель заказчика',
  manager: 'Менеджер GoldLink',
};

export interface ModuleConfig {
  key: string;
  path: string;
  label: string;
  description: string;
  roles: Role[];
}
