import { PRODUCTS } from '../catalog/data';
import type { EquipmentRequest, RequestItem } from './types';

function item(productId: string, quantity: number): RequestItem {
  const product = PRODUCTS.find((candidate) => candidate.id === productId);
  if (!product) {
    throw new Error(`Unknown seed product id: ${productId}`);
  }
  return {
    productId: product.id,
    name: product.name,
    sku: product.sku,
    vendorId: product.vendorId,
    quantity,
  };
}

export const SEED_REQUESTS: EquipmentRequest[] = [
  {
    id: 'req-seed-1',
    number: 'GL-2026-0001',
    status: 'formed',
    createdAt: '2026-08-01T09:15:00.000Z',
    customerId: 'cu-1',
    siteId: 's-1',
    departmentId: 'd-1',
    representativeId: 'rep-1',
    items: [item('p-1', 500), item('p-6', 20)],
    documents: [],
    // Одна версия — состав не менялся с момента создания заявки.
    versions: [
      {
        version: 1,
        createdAt: '2026-08-01T09:15:00.000Z',
        author: 'Терехов Игорь Валерьевич',
        items: [item('p-1', 500), item('p-6', 20)],
      },
    ],
  },
  {
    id: 'req-seed-2',
    number: 'GL-2026-0002',
    status: 'in_progress',
    createdAt: '2026-08-04T13:40:00.000Z',
    customerId: 'cu-1',
    siteId: 's-1',
    departmentId: 'd-1',
    representativeId: 'rep-1',
    items: [item('p-4', 1), item('p-16', 6), item('p-12', 40)],
    documents: [{ id: 'doc-1', name: 'Техническое_задание.pdf', uploadedAt: '2026-08-05T10:00:00.000Z' }],
    // Три версии: исходный состав → менеджер поправил количество датчиков →
    // представитель добавил ленту и снова поправил количество.
    versions: [
      {
        version: 1,
        createdAt: '2026-08-04T13:40:00.000Z',
        author: 'Терехов Игорь Валерьевич',
        items: [item('p-4', 1), item('p-16', 4)],
      },
      {
        version: 2,
        createdAt: '2026-08-04T16:05:00.000Z',
        author: 'Соколова Елена Викторовна',
        items: [item('p-4', 1), item('p-16', 8)],
      },
      {
        version: 3,
        createdAt: '2026-08-05T09:20:00.000Z',
        author: 'Терехов Игорь Валерьевич',
        items: [item('p-4', 1), item('p-16', 6), item('p-12', 40)],
      },
    ],
  },
  {
    id: 'req-seed-3',
    number: 'GL-2026-0003',
    status: 'done',
    createdAt: '2026-08-06T08:05:00.000Z',
    customerId: 'cu-1',
    siteId: 's-1',
    departmentId: 'd-1',
    representativeId: 'rep-1',
    items: [item('p-8', 4)],
    documents: [
      { id: 'doc-2', name: 'Спецификация_GL-2026-0003.xlsx', uploadedAt: '2026-08-07T09:30:00.000Z' },
      { id: 'doc-3', name: 'Накладная_45231.pdf', uploadedAt: '2026-08-10T15:12:00.000Z' },
    ],
    // Заявка уже исполнена, но история версий (в т.ч. правки до исполнения)
    // остаётся доступна для просмотра — редактирование и откат заблокированы.
    versions: [
      {
        version: 1,
        createdAt: '2026-08-06T08:05:00.000Z',
        author: 'Терехов Игорь Валерьевич',
        items: [item('p-8', 2)],
      },
      {
        version: 2,
        createdAt: '2026-08-06T14:30:00.000Z',
        author: 'Терехов Игорь Валерьевич',
        items: [item('p-8', 4)],
      },
    ],
  },
  {
    id: 'req-seed-4',
    number: 'GL-2026-0004',
    status: 'in_progress',
    createdAt: '2026-08-07T11:20:00.000Z',
    customerId: 'cu-2',
    siteId: 's-3',
    departmentId: 'd-4',
    representativeId: 'rep-2',
    items: [item('p-3', 200), item('p-4', 1)],
    documents: [{ id: 'doc-4', name: 'Заявка_согласование.pdf', uploadedAt: '2026-08-08T10:00:00.000Z' }],
    versions: [
      {
        version: 1,
        createdAt: '2026-08-07T11:20:00.000Z',
        author: 'Симонова Анна Дмитриевна',
        items: [item('p-3', 200), item('p-4', 1)],
      },
    ],
  },
  {
    id: 'req-seed-5',
    number: 'GL-2026-0005',
    status: 'formed',
    createdAt: '2026-08-09T09:50:00.000Z',
    customerId: 'cu-3',
    siteId: 's-5',
    departmentId: 'd-6',
    representativeId: 'rep-3',
    items: [item('p-12', 60), item('p-14', 30)],
    documents: [],
    versions: [
      {
        version: 1,
        createdAt: '2026-08-09T09:50:00.000Z',
        author: 'Костров Павел Николаевич',
        items: [item('p-12', 60), item('p-14', 30)],
      },
    ],
  },
  {
    id: 'req-seed-6',
    number: 'GL-2026-0006',
    status: 'done',
    createdAt: '2026-08-10T14:00:00.000Z',
    customerId: 'cu-2',
    siteId: 's-4',
    departmentId: 'd-5',
    representativeId: 'rep-4',
    items: [item('p-17', 10)],
    documents: [{ id: 'doc-5', name: 'Акт_приёмки.pdf', uploadedAt: '2026-08-11T09:00:00.000Z' }],
    versions: [
      {
        version: 1,
        createdAt: '2026-08-10T14:00:00.000Z',
        author: 'Уварова Мария Сергеевна',
        items: [item('p-17', 10)],
      },
    ],
  },
];
