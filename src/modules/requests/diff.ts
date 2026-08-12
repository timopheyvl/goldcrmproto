import type { RequestItem } from './types';

export type ItemDeltaType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface ItemDelta {
  productId: string;
  name: string;
  sku: string;
  vendorId: string;
  type: ItemDeltaType;
  /** Текущее количество — для added/changed/unchanged. */
  quantity?: number;
  /** Количество в предыдущей версии — для changed/removed. */
  previousQuantity?: number;
}

/**
 * Дельта считается на лету из двух снапшотов состава, нигде отдельно не
 * хранится. `previous === null` означает «нет предыдущей версии» (версия 1) —
 * вызывающий код должен в этом случае показывать состав как есть, без diff.
 */
export function diffItems(previous: RequestItem[] | null, current: RequestItem[]): ItemDelta[] {
  const prevMap = new Map((previous ?? []).map((item) => [item.productId, item]));
  const currentIds = new Set(current.map((item) => item.productId));
  const result: ItemDelta[] = [];

  for (const item of current) {
    const prevItem = prevMap.get(item.productId);
    if (!prevItem) {
      result.push({ productId: item.productId, name: item.name, sku: item.sku, vendorId: item.vendorId, type: 'added', quantity: item.quantity });
    } else if (prevItem.quantity !== item.quantity) {
      result.push({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        vendorId: item.vendorId,
        type: 'changed',
        quantity: item.quantity,
        previousQuantity: prevItem.quantity,
      });
    } else {
      result.push({ productId: item.productId, name: item.name, sku: item.sku, vendorId: item.vendorId, type: 'unchanged', quantity: item.quantity });
    }
  }

  for (const item of previous ?? []) {
    if (!currentIds.has(item.productId)) {
      result.push({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        vendorId: item.vendorId,
        type: 'removed',
        previousQuantity: item.quantity,
      });
    }
  }

  return result;
}
