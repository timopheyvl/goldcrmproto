export type RequestStatus = 'formed' | 'in_progress' | 'done';

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  formed: 'Сформирована',
  in_progress: 'В работе',
  done: 'Исполнена',
};

export const REQUEST_STATUSES: RequestStatus[] = ['formed', 'in_progress', 'done'];

export const REQUEST_STATUS_BADGE: Record<RequestStatus, string> = {
  formed: 'neutral',
  in_progress: 'warning',
  done: 'ok',
};

export interface RequestItem {
  productId: string;
  name: string;
  sku: string;
  vendorId: string;
  quantity: number;
}

export interface RequestDocument {
  id: string;
  name: string;
  uploadedAt: string;
}

export interface RequestVersion {
  /** Порядковый номер версии, начиная с 1 (исходный состав при создании). */
  version: number;
  createdAt: string;
  /** Имя «текущего пользователя» на момент сохранения — см. getCurrentActorName(). */
  author: string;
  /** Полный снапшот состава на момент версии — дельта считается на лету из снапшотов, не хранится. */
  items: RequestItem[];
  /** Заполняется только для версий, созданных откатом: «Восстановлено из версии N». */
  note?: string;
}

export interface EquipmentRequest {
  id: string;
  number: string;
  status: RequestStatus;
  createdAt: string;
  customerId: string;
  siteId: string;
  departmentId: string;
  representativeId: string;
  items: RequestItem[];
  documents: RequestDocument[];
  /** История версий состава, новые в конце. Версия 1 = исходный состав при создании. */
  versions: RequestVersion[];
}
