export type RequestStatus = 'formed' | 'in_progress' | 'done';

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  formed: 'Сформирована',
  in_progress: 'В работе',
  done: 'Исполнена',
};

export interface RequestItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
}

export interface EquipmentRequest {
  id: string;
  number: string;
  status: RequestStatus;
  createdAt: string;
  items: RequestItem[];
}
