import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { RequestsContext } from './RequestsContext';
import type { RequestsContextValue } from './RequestsContext';
import type { EquipmentRequest, RequestDocument, RequestItem, RequestStatus, RequestVersion } from './types';
import { SEED_REQUESTS } from './data';
import { CURRENT_REPRESENTATIVE_ID, getRepresentativeScope } from '../../data/org';
import { useRole } from '../../context/useRole';
import { getCurrentActorName } from './actor';

const REQUESTS_STORAGE_KEY = 'goldlink.requests';
const REQUEST_SEQ_KEY = 'goldlink.requestSeq';

function readStoredRequests(): EquipmentRequest[] {
  try {
    const raw = window.localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!raw) return SEED_REQUESTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_REQUESTS;
  } catch {
    return SEED_REQUESTS;
  }
}

function nextRequestNumber(): string {
  const year = new Date().getFullYear();
  const raw = window.localStorage.getItem(REQUEST_SEQ_KEY);
  const seq = raw ? Number(raw) + 1 : SEED_REQUESTS.length + 1;
  window.localStorage.setItem(REQUEST_SEQ_KEY, String(seq));
  return `GL-${year}-${String(seq).padStart(4, '0')}`;
}

export function RequestsProvider({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const [requests, setRequests] = useState<EquipmentRequest[]>(readStoredRequests);

  // Содержимое прикреплённых файлов живёт только в памяти текущей вкладки —
  // File не сериализуется в JSON, поэтому в localStorage (см. эффект ниже)
  // уходят только метаданные документа (id/name/uploadedAt), а сам файл
  // достаётся из этой карты по id. После перезагрузки страницы карта пуста.
  const fileStoreRef = useRef<Map<string, File>>(new Map());

  useEffect(() => {
    window.localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  const value = useMemo<RequestsContextValue>(() => {
    const authorName = getCurrentActorName(role);

    // Общая точка входа для любого изменения состава: пишет новую версию в
    // историю и одновременно обновляет актуальный items заявки. Версии не
    // создаются (и состав не меняется) для заявок в статусе «Исполнена» —
    // это же условие используется в UI, чтобы скрыть «Редактировать» и
    // «Восстановить эту версию», здесь — как страховка на уровне данных.
    const appendVersion = (request: EquipmentRequest, items: RequestItem[], note?: string): EquipmentRequest => {
      if (request.status === 'done') return request;
      const lastVersion = request.versions[request.versions.length - 1];
      const version: RequestVersion = {
        version: (lastVersion?.version ?? 0) + 1,
        createdAt: new Date().toISOString(),
        author: authorName,
        items,
        ...(note ? { note } : {}),
      };
      return { ...request, items, versions: [...request.versions, version] };
    };

    const createRequest = (items: RequestItem[]): EquipmentRequest => {
      const scope = getRepresentativeScope(CURRENT_REPRESENTATIVE_ID);
      if (!scope) {
        throw new Error('Unknown representative scope');
      }
      const createdAt = new Date().toISOString();
      const request: EquipmentRequest = {
        id: `req-${Date.now()}`,
        number: nextRequestNumber(),
        status: 'formed',
        createdAt,
        customerId: scope.customerId,
        siteId: scope.siteId,
        departmentId: scope.departmentId,
        representativeId: CURRENT_REPRESENTATIVE_ID,
        items,
        documents: [],
        versions: [{ version: 1, createdAt, author: authorName, items }],
      };
      setRequests((prev) => [request, ...prev]);
      return request;
    };

    const updateItems = (requestId: string, items: RequestItem[]) => {
      setRequests((prev) => prev.map((request) => (request.id === requestId ? appendVersion(request, items) : request)));
    };

    const updateStatus = (requestId: string, status: RequestStatus) => {
      setRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status } : request)));
    };

    const addDocument = (requestId: string, file: File) => {
      const documentId = `doc-${Date.now()}`;
      fileStoreRef.current.set(documentId, file);
      const document: RequestDocument = {
        id: documentId,
        name: file.name,
        uploadedAt: new Date().toISOString(),
      };
      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, documents: [...request.documents, document] } : request,
        ),
      );
    };

    const getDocumentFile = (documentId: string) => fileStoreRef.current.get(documentId);

    const restoreVersion = (requestId: string, versionNumber: number) => {
      setRequests((prev) =>
        prev.map((request) => {
          if (request.id !== requestId) return request;
          const target = request.versions.find((version) => version.version === versionNumber);
          if (!target) return request;
          return appendVersion(request, target.items, `Восстановлено из версии ${versionNumber}`);
        }),
      );
    };

    return { requests, createRequest, updateItems, updateStatus, addDocument, getDocumentFile, restoreVersion };
  }, [requests, role]);

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}
