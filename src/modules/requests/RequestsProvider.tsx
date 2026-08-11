import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { RequestsContext } from './RequestsContext';
import type { RequestsContextValue } from './RequestsContext';
import type { EquipmentRequest, RequestItem } from './types';

const REQUESTS_STORAGE_KEY = 'goldlink.requests';
const REQUEST_SEQ_KEY = 'goldlink.requestSeq';

function readStoredRequests(): EquipmentRequest[] {
  try {
    const raw = window.localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function nextRequestNumber(): string {
  const year = new Date().getFullYear();
  const raw = window.localStorage.getItem(REQUEST_SEQ_KEY);
  const seq = raw ? Number(raw) + 1 : 1;
  window.localStorage.setItem(REQUEST_SEQ_KEY, String(seq));
  return `GL-${year}-${String(seq).padStart(4, '0')}`;
}

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<EquipmentRequest[]>(readStoredRequests);

  useEffect(() => {
    window.localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  const value = useMemo<RequestsContextValue>(() => {
    const createRequest = (items: RequestItem[]): EquipmentRequest => {
      const request: EquipmentRequest = {
        id: `req-${Date.now()}`,
        number: nextRequestNumber(),
        status: 'formed',
        createdAt: new Date().toISOString(),
        items,
      };
      setRequests((prev) => [request, ...prev]);
      return request;
    };

    return { requests, createRequest };
  }, [requests]);

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}
