import { REQUEST_STATUS_BADGE, REQUEST_STATUS_LABELS } from './types';
import type { RequestStatus } from './types';

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`status-badge status-badge--${REQUEST_STATUS_BADGE[status]}`}>
      {REQUEST_STATUS_LABELS[status]}
    </span>
  );
}
