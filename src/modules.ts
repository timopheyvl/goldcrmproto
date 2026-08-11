import type { ModuleConfig } from './types';

export const MODULES: ModuleConfig[] = [
  {
    key: 'catalog',
    path: '/catalog',
    label: 'Каталог',
    description: 'Товары из выгрузок вендоров: поиск, категории, карточка товара.',
    roles: ['employee', 'representative', 'manager'],
  },
  {
    key: 'requests',
    path: '/requests',
    label: 'Заявки',
    description: 'Заявки на оборудование: состав, статусы, версии, экспорт в .xlsx.',
    roles: ['representative', 'manager'],
  },
  {
    key: 'objects',
    path: '/objects',
    label: 'Объекты',
    description: 'Объекты заказчика: материалы, диаграмма Ганта, службы.',
    roles: ['representative', 'manager'],
  },
  {
    key: 'training',
    path: '/training',
    label: 'Обучающие материалы',
    description: 'Справочные статьи с текстом, изображениями и видео.',
    roles: ['employee', 'representative', 'manager'],
  },
  {
    key: 'admin',
    path: '/admin',
    label: 'Управление пользователями',
    description: 'Заказчики, представители, сотрудники, объекты — администрирование.',
    roles: ['manager'],
  },
];

export const DEFAULT_MODULE_PATH = MODULES[0].path;
