import { createContext } from 'react';
import type { EquipmentRequest, RequestItem, RequestScope, RequestStatus } from './types';

export interface RequestsContextValue {
  requests: EquipmentRequest[];
  /** scope/authorName вычисляются вызывающей стороной из живого профиля
   * текущего представителя (см. src/data/useEntities.ts) — RequestsProvider
   * стоит выше ObjectsProvider/AdminProvider и не видит их живые данные. */
  createRequest: (items: RequestItem[], scope: RequestScope, authorName: string) => EquipmentRequest;
  updateItems: (requestId: string, items: RequestItem[], authorName: string) => void;
  updateStatus: (requestId: string, status: RequestStatus) => void;
  /** Прикрепляет файл к заявке. Содержимое файла хранится только в памяти
   * текущей сессии (не в localStorage) — после перезагрузки страницы
   * метаданные документа останутся, а содержимое будет недоступно для
   * скачивания. Бэкенда/объектного хранилища в прототипе нет. */
  addDocument: (requestId: string, file: File) => void;
  /** Возвращает File по id документа, если он был загружен в текущей сессии. */
  getDocumentFile: (documentId: string) => File | undefined;
  /**
   * Откатывает состав к снапшоту старой версии — создаёт НОВУЮ версию с этим
   * составом (не перезаписывает историю). Ставится подпись «Восстановлено из
   * версии N». Как и updateItems, не действует на заявки в статусе «Исполнена».
   */
  restoreVersion: (requestId: string, versionNumber: number, authorName: string) => void;
}

export const RequestsContext = createContext<RequestsContextValue | null>(null);
