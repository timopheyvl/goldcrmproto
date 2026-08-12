import { createContext } from 'react';
import type { EquipmentRequest, RequestItem, RequestStatus } from './types';

export interface RequestsContextValue {
  requests: EquipmentRequest[];
  createRequest: (items: RequestItem[]) => EquipmentRequest;
  updateItems: (requestId: string, items: RequestItem[]) => void;
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
  restoreVersion: (requestId: string, versionNumber: number) => void;
}

export const RequestsContext = createContext<RequestsContextValue | null>(null);
