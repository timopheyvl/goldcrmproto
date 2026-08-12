import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useRequests } from './useRequests';
import { useVendors } from '../catalog/useVendors';
import { StatusBadge } from './StatusBadge';
import { VersionHistoryModal } from './VersionHistoryModal';
import { getScopedRequests } from './scope';
import { CURRENT_REPRESENTATIVE_ID, getCustomerById, getDepartmentById, getSiteById } from '../../data/org';
import { REQUEST_STATUSES, REQUEST_STATUS_LABELS } from './types';
import type { RequestDocument, RequestStatus } from './types';
import './requests.css';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const navigate = useNavigate();
  const { requests, updateStatus, addDocument, getDocumentFile, restoreVersion } = useRequests();
  const { getVendorName } = useVendors();

  const scopedRequests = useMemo(() => getScopedRequests(role, requests), [role, requests]);
  const request = scopedRequests.find((item) => item.id === id);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setExported(false);
  }, [id]);

  if (!request) {
    return (
      <div className="request-detail">
        <div className="import-page__breadcrumb">
          <Link to="/requests">Заявки</Link> / Заявка не найдена
        </div>
        <div className="empty-state">
          <div className="empty-state__title">Заявка не найдена</div>
          <p>Возможно, заявка была удалена из выборки или ссылка устарела.</p>
          <Link to="/requests" className="btn btn--secondary">
            Вернуться к заявкам
          </Link>
        </div>
      </div>
    );
  }

  const isManager = role === 'manager';
  const editable =
    request.status !== 'done' &&
    (isManager || (role === 'representative' && request.representativeId === CURRENT_REPRESENTATIVE_ID));

  const customerName = getCustomerById(request.customerId)?.name ?? '—';
  const siteName = getSiteById(request.siteId)?.name ?? '—';
  const departmentName = getDepartmentById(request.departmentId)?.name ?? '—';

  const handleUploadDocument = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    addDocument(request.id, file);
    event.target.value = '';
  };

  const handleDownloadDocument = (doc: RequestDocument) => {
    const file = getDocumentFile(doc.id);
    if (!file) return;
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleRestoreVersion = (versionNumber: number) => {
    restoreVersion(request.id, versionNumber);
    setHistoryOpen(false);
  };

  return (
    <div className="request-detail">
      <div className="import-page__breadcrumb">
        <Link to="/requests">Заявки</Link> / {request.number}
      </div>

      <div className="request-detail__header">
        <h1 className="request-detail__title">Заявка {request.number}</h1>
        <div className="request-detail__actions">
          <button type="button" className="btn btn--secondary" onClick={() => setHistoryOpen(true)}>
            История изменений
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => setExported(true)}>
            {exported ? 'Файл сформирован ✓' : 'Экспорт .xlsx'}
          </button>
          {editable && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate(`/orders/${request.id}/edit`)}
            >
              Редактировать
            </button>
          )}
        </div>
      </div>

      <div className="request-detail__attrs">
        <div className="attr-card">
          <div className="attr-card__label">Заказчик</div>
          <div className="attr-card__value">{customerName}</div>
        </div>
        <div className="attr-card">
          <div className="attr-card__label">Объект</div>
          <div className="attr-card__value">{siteName}</div>
        </div>
        <div className="attr-card">
          <div className="attr-card__label">Служба</div>
          <div className="attr-card__value">{departmentName}</div>
        </div>
        <div className="attr-card">
          <div className="attr-card__label">Дата создания</div>
          <div className="attr-card__value">{formatDateTime(request.createdAt)}</div>
        </div>
        <div className="attr-card">
          <div className="attr-card__label">Статус</div>
          <div className="attr-card__value">
            <StatusBadge status={request.status} />
          </div>
        </div>
      </div>

      {isManager && (
        <div className="request-detail__section">
          <div className="request-detail__section-title">
            <h2>Управление статусом</h2>
          </div>
          <select
            className="filter-select"
            value={request.status}
            onChange={(event) => updateStatus(request.id, event.target.value as RequestStatus)}
          >
            {REQUEST_STATUSES.map((status) => (
              <option key={status} value={status}>
                {REQUEST_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="request-detail__section">
        <div className="request-detail__section-title">
          <h2>Состав заявки</h2>
        </div>

        {request.items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">Состав пуст</div>
            <p>Добавьте позиции через редактирование заявки.</p>
          </div>
        ) : (
          <table className="composition-table">
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Артикул</th>
                {isManager && <th>Вендор</th>}
                <th>Количество</th>
              </tr>
            </thead>
            <tbody>
              {request.items.map((item) => (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  {isManager && <td>{getVendorName(item.vendorId)}</td>}
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="request-detail__section">
        <div className="request-detail__section-title">
          <h2>Документы</h2>
          {isManager && (
            <>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => fileInputRef.current?.click()}>
                Прикрепить документ
              </button>
              <input ref={fileInputRef} type="file" hidden onChange={handleUploadDocument} />
            </>
          )}
        </div>
        {request.documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">Документов нет</div>
            <p>Менеджер прикрепит документы после обработки заявки.</p>
          </div>
        ) : (
          <div className="documents-list">
            {request.documents.map((doc) => {
              const hasFile = Boolean(getDocumentFile(doc.id));
              return (
                <div className="document-row" key={doc.id}>
                  <span className="document-row__name">{doc.name}</span>
                  <span className="document-row__date">{formatDateTime(doc.uploadedAt)}</span>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    disabled={!hasFile}
                    onClick={() => handleDownloadDocument(doc)}
                    title={hasFile ? undefined : 'Файл доступен только в течение текущей сессии — после перезагрузки страницы недоступен'}
                  >
                    Скачать
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <VersionHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        request={request}
        canRestore={editable}
        onRestore={handleRestoreVersion}
        showVendor={isManager}
        getVendorName={getVendorName}
      />
    </div>
  );
}
