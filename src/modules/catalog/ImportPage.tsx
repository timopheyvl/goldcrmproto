import { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { IMPORT_HISTORY, IMPORT_PREVIEW_ROWS } from './data';
import { useVendors } from './useVendors';
import type { ImportRun, ImportRunStatus } from './types';
import './catalog.css';

type Step = 'idle' | 'uploading' | 'report';

const STATUS_LABEL: Record<ImportRunStatus, string> = {
  success: 'Успешно',
  partial: 'Завершён с ошибками',
  cancelled: 'Отменён',
};

export function ImportPage() {
  const { role } = useRole();
  const { vendors } = useVendors();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [vendorId, setVendorId] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [history, setHistory] = useState<ImportRun[]>(IMPORT_HISTORY);
  const [applied, setApplied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (role !== 'manager') {
    return <Navigate to="/catalog" replace />;
  }

  const okCount = IMPORT_PREVIEW_ROWS.filter((row) => row.status === 'ok').length;
  const warningCount = IMPORT_PREVIEW_ROWS.filter((row) => row.status === 'warning').length;
  const errorCount = IMPORT_PREVIEW_ROWS.filter((row) => row.status === 'error').length;
  const importableCount = okCount + warningCount;

  const vendorName = vendors.find((vendor) => vendor.id === vendorId)?.name ?? '';

  const resetForm = () => {
    setFileName(null);
    setVendorId('');
    setStep('idle');
    setApplied(false);
  };

  const handleUpload = () => {
    setStep('uploading');
    setTimeout(() => setStep('report'), 900);
  };

  const handleApply = () => {
    const run: ImportRun = {
      id: `run-${Date.now()}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      fileName: fileName ?? 'файл.xlsx',
      vendorName,
      initiator: 'Текущий менеджер',
      status: errorCount > 0 ? 'partial' : 'success',
      totalRows: IMPORT_PREVIEW_ROWS.length,
      okRows: importableCount,
      errorRows: errorCount,
    };
    setHistory((prev) => [run, ...prev]);
    setApplied(true);
  };

  return (
    <div className="import-page">
      <div className="import-page__breadcrumb">
        <Link to="/catalog">Каталог</Link> / Импорт
      </div>
      <h1 className="import-page__title">Импорт каталога</h1>

      <div className="tabs">
        <button
          type="button"
          className={activeTab === 'new' ? 'tabs__btn tabs__btn--active' : 'tabs__btn'}
          onClick={() => setActiveTab('new')}
        >
          Новый импорт
        </button>
        <button
          type="button"
          className={activeTab === 'history' ? 'tabs__btn tabs__btn--active' : 'tabs__btn'}
          onClick={() => setActiveTab('history')}
        >
          История импортов
        </button>
      </div>

      {activeTab === 'new' && (
        <div className="import-panel">
          {step === 'idle' && (
            <div className="import-form">
              <label className="import-form__field">
                <span>Вендор</span>
                <select value={vendorId} onChange={(event) => setVendorId(event.target.value)}>
                  <option value="">Выберите вендора</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                <Link to="/catalog/vendors" className="import-form__hint-link">
                  Управление вендорами
                </Link>
              </label>

              <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setFileName(file.name);
                  }}
                />
                {fileName ? (
                  <span>Выбран файл: {fileName}</span>
                ) : (
                  <span>Перетащите файл прайса сюда или нажмите, чтобы выбрать (.xlsx, .csv)</span>
                )}
              </div>

              <button
                type="button"
                className="btn btn--primary"
                disabled={!vendorId || !fileName}
                onClick={handleUpload}
              >
                Загрузить и проверить
              </button>
            </div>
          )}

          {step === 'uploading' && (
            <div className="import-loading">
              <div className="spinner" />
              <p>Проверяем файл «{fileName}»…</p>
            </div>
          )}

          {step === 'report' && (
            <div className="import-report">
              <div className="import-report__summary">
                <div className="summary-card">
                  <div className="summary-card__value">{IMPORT_PREVIEW_ROWS.length}</div>
                  <div className="summary-card__label">Всего строк</div>
                </div>
                <div className="summary-card summary-card--ok">
                  <div className="summary-card__value">{okCount}</div>
                  <div className="summary-card__label">Успешно</div>
                </div>
                <div className="summary-card summary-card--warning">
                  <div className="summary-card__value">{warningCount}</div>
                  <div className="summary-card__label">Предупреждения</div>
                </div>
                <div className="summary-card summary-card--error">
                  <div className="summary-card__value">{errorCount}</div>
                  <div className="summary-card__label">Ошибки</div>
                </div>
              </div>

              <table className="import-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Наименование</th>
                    <th>Артикул</th>
                    <th>Категория</th>
                    <th>Статус</th>
                    <th>Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {IMPORT_PREVIEW_ROWS.map((row) => (
                    <tr key={row.line}>
                      <td>{row.line}</td>
                      <td>{row.name}</td>
                      <td>{row.sku || '—'}</td>
                      <td>{row.category}</td>
                      <td>
                        <span className={`status-badge status-badge--${row.status}`}>
                          {row.status === 'ok' ? 'ОК' : row.status === 'warning' ? 'Предупреждение' : 'Ошибка'}
                        </span>
                      </td>
                      <td>{row.comment ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {applied ? (
                <div className="import-report__done">
                  <div className="status-badge status-badge--ok">Импорт применён</div>
                  <p>
                    Добавлено/обновлено позиций: {importableCount}. Строк с ошибками пропущено: {errorCount}.
                  </p>
                  <button type="button" className="btn btn--secondary" onClick={resetForm}>
                    Загрузить ещё один файл
                  </button>
                </div>
              ) : (
                <div className="import-report__actions">
                  <button type="button" className="btn btn--secondary" onClick={resetForm}>
                    Отменить
                  </button>
                  <button type="button" className="btn btn--primary" onClick={handleApply}>
                    Импортировать корректные строки ({importableCount})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <table className="import-table import-table--history">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Файл</th>
              <th>Вендор</th>
              <th>Инициатор</th>
              <th>Статус</th>
              <th>Строк (успешно/ошибок/всего)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((run) => (
              <tr key={run.id}>
                <td>{run.date}</td>
                <td>{run.fileName}</td>
                <td>{run.vendorName}</td>
                <td>{run.initiator}</td>
                <td>
                  <span
                    className={`status-badge status-badge--${
                      run.status === 'success' ? 'ok' : run.status === 'partial' ? 'warning' : 'neutral'
                    }`}
                  >
                    {STATUS_LABEL[run.status]}
                  </span>
                </td>
                <td>
                  {run.okRows} / {run.errorRows} / {run.totalRows}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
