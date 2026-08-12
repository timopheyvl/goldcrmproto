import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { diffItems } from './diff';
import type { EquipmentRequest } from './types';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  request: EquipmentRequest;
  /** Совпадает с правом на редактирование состава (роль + статус ≠ «Исполнена»). */
  canRestore: boolean;
  onRestore: (versionNumber: number) => void;
  showVendor: boolean;
  getVendorName: (vendorId: string) => string;
}

export function VersionHistoryModal({
  open,
  onClose,
  request,
  canRestore,
  onRestore,
  showVendor,
  getVendorName,
}: VersionHistoryModalProps) {
  const versions = request.versions;
  const latestVersion = versions[versions.length - 1];
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<number | null>(null);

  // При каждом открытии модалки (и при переключении на другую заявку) —
  // по умолчанию показываем самую свежую версию.
  useEffect(() => {
    if (open) {
      setSelectedVersionNumber(latestVersion?.version ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, request.id]);

  const onlyOneVersion = versions.length <= 1;

  const selectedIndex = versions.findIndex((version) => version.version === selectedVersionNumber);
  const selectedVersionData = selectedIndex >= 0 ? versions[selectedIndex] : null;
  const previousVersionData = selectedIndex > 0 ? versions[selectedIndex - 1] : null;
  const isLatestSelected = selectedVersionData?.version === latestVersion?.version;

  const deltas =
    selectedVersionData && previousVersionData
      ? diffItems(previousVersionData.items, selectedVersionData.items)
      : [];

  return (
    <Modal open={open} onClose={onClose} title={`История заявки ${request.number}`} width={820}>
      {onlyOneVersion ? (
        <div className="empty-state">
          <div className="empty-state__title">Изменений не было, только исходная версия</div>
          <p>
            Состав заявки не менялся с момента создания
            {latestVersion && ` — версия 1 от ${formatDateTime(latestVersion.createdAt)}, автор ${latestVersion.author}`}.
          </p>
        </div>
      ) : (
        <div className="version-history">
          <div className="version-history__list">
            {versions
              .slice()
              .reverse()
              .map((version) => (
                <button
                  key={version.version}
                  type="button"
                  className={
                    version.version === selectedVersionNumber
                      ? 'version-history__item version-history__item--active'
                      : 'version-history__item'
                  }
                  onClick={() => setSelectedVersionNumber(version.version)}
                >
                  <div className="version-history__item-top">
                    <span className="version-history__item-title">Версия {version.version}</span>
                    {version.version === latestVersion.version && (
                      <span className="status-badge status-badge--neutral">Текущая</span>
                    )}
                  </div>
                  <div className="version-history__item-meta">
                    {formatDateTime(version.createdAt)} · {version.author}
                  </div>
                  {version.note && <div className="version-history__item-note">{version.note}</div>}
                </button>
              ))}
          </div>

          <div className="version-history__detail">
            {selectedVersionData && (
              <>
                <div className="version-history__detail-header">
                  <h3>
                    Версия {selectedVersionData.version}
                    {!previousVersionData && ' · исходный состав'}
                  </h3>
                  <div className="version-history__detail-meta">
                    {formatDateTime(selectedVersionData.createdAt)} · {selectedVersionData.author}
                    {selectedVersionData.note && ` · ${selectedVersionData.note}`}
                  </div>
                </div>

                {previousVersionData ? (
                  <table className="composition-table">
                    <thead>
                      <tr>
                        <th>Наименование</th>
                        <th>Артикул</th>
                        {showVendor && <th>Вендор</th>}
                        <th>Количество</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deltas.map((delta) => (
                        <tr key={delta.productId} className={`version-diff-row version-diff-row--${delta.type}`}>
                          <td>{delta.name}</td>
                          <td>{delta.sku}</td>
                          {showVendor && <td>{getVendorName(delta.vendorId)}</td>}
                          <td>
                            {delta.type === 'changed'
                              ? `было ${delta.previousQuantity} → стало ${delta.quantity}`
                              : delta.type === 'removed'
                                ? `было ${delta.previousQuantity}`
                                : delta.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="composition-table">
                    <thead>
                      <tr>
                        <th>Наименование</th>
                        <th>Артикул</th>
                        {showVendor && <th>Вендор</th>}
                        <th>Количество</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVersionData.items.map((item) => (
                        <tr key={item.productId}>
                          <td>{item.name}</td>
                          <td>{item.sku}</td>
                          {showVendor && <td>{getVendorName(item.vendorId)}</td>}
                          <td>{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {!isLatestSelected && canRestore && (
                  <div className="version-history__restore">
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => onRestore(selectedVersionData.version)}
                    >
                      Восстановить эту версию
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
