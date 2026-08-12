import type { MaterialRecord } from './types';

// Материалы заведены только для части объектов — остальные демонстрируют
// пустое состояние вкладки «Материалы».
export const SEED_MATERIALS: MaterialRecord[] = [
  {
    id: 'mat-1',
    siteId: 's-1',
    name: 'Проектная документация',
    description: 'Технический паспорт объекта и схема электроснабжения участка.',
    createdAt: '2026-07-15T10:00:00.000Z',
    files: [
      { id: 'matfile-1', name: 'Тех_паспорт.pdf', uploadedAt: '2026-07-15T10:00:00.000Z' },
      { id: 'matfile-2', name: 'Схема_электроснабжения.dwg', uploadedAt: '2026-07-15T10:05:00.000Z' },
    ],
  },
  {
    id: 'mat-2',
    siteId: 's-1',
    name: 'Акты обследования',
    description: 'Акты обследования конвейерной линии участка №2.',
    createdAt: '2026-07-20T09:30:00.000Z',
    files: [{ id: 'matfile-3', name: 'Акт_обследования_УК2.pdf', uploadedAt: '2026-07-20T09:30:00.000Z' }],
  },
  {
    id: 'mat-3',
    siteId: 's-3',
    name: 'Геологическая карта участка',
    description: 'Карта с разметкой зон разработки на 2026 год.',
    createdAt: '2026-08-01T12:00:00.000Z',
    files: [{ id: 'matfile-4', name: 'Геокарта_2026.pdf', uploadedAt: '2026-08-01T12:00:00.000Z' }],
  },
];
