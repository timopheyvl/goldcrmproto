import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../components/Modal';
import { useObjects } from './useObjects';
import { useRequests } from '../requests/useRequests';
import { STAGE_STATUSES, STAGE_STATUS_LABELS } from './types';
import type { StageStatus } from './types';
import './objects.css';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface FormState {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: StageStatus;
  assignee: string;
  progress: number;
  dependsOn: string | null;
  requestIds: string[];
}

function emptyForm(): FormState {
  return {
    name: '',
    description: '',
    startDate: todayISO(),
    endDate: todayISO(),
    status: 'planned',
    assignee: '',
    progress: 0,
    dependsOn: null,
    requestIds: [],
  };
}

interface StageFormModalProps {
  open: boolean;
  onClose: () => void;
  siteId: string;
}

/**
 * Модалка нужна только для СОЗДАНИЯ нового этапа (менеджер) — все поля сразу,
 * с кнопкой «Добавить». Редактирование существующего этапа теперь идёт через
 * единую панель StagePanel с автосохранением по полю, отдельной модалки для
 * этого больше нет.
 */
export function StageFormModal({ open, onClose, siteId }: StageFormModalProps) {
  const { getStagesBySite, addStage } = useObjects();
  const { requests } = useRequests();

  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (open) setForm(emptyForm());
  }, [open]);

  const otherStages = useMemo(() => getStagesBySite(siteId), [getStagesBySite, siteId]);
  const siteRequests = useMemo(() => requests.filter((request) => request.siteId === siteId), [requests, siteId]);

  const toggleRequest = (requestId: string) => {
    setForm((prev) => ({
      ...prev,
      requestIds: prev.requestIds.includes(requestId)
        ? prev.requestIds.filter((id) => id !== requestId)
        : [...prev.requestIds, requestId],
    }));
  };

  const datesValid = form.startDate <= form.endDate;
  const canSave = Boolean(form.name.trim()) && datesValid;

  const handleSave = () => {
    if (!canSave) return;
    addStage(siteId, {
      name: form.name.trim(),
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      assignee: form.assignee,
      progress: form.progress,
      dependsOn: form.dependsOn,
      requestIds: form.requestIds,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Новый этап" width={520}>
      <div className="import-form">
        <label className="import-form__field">
          <span>Название</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>

        <label className="import-form__field">
          <span>Описание</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>

        <div className="stage-form__dates-row">
          <label className="import-form__field">
            <span>Дата начала</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
            />
          </label>
          <label className="import-form__field">
            <span>Дата окончания</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
            />
          </label>
        </div>
        {!datesValid && <p className="stage-form__error">Дата окончания не может быть раньше даты начала.</p>}

        <label className="import-form__field">
          <span>Статус</span>
          <select
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as StageStatus }))}
          >
            {STAGE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STAGE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="import-form__field">
          <span>Процент выполнения</span>
          <div className="stage-form__progress-row">
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(event) => setForm((prev) => ({ ...prev, progress: Number(event.target.value) }))}
            />
            <span className="stage-form__progress-value">{form.progress}%</span>
          </div>
        </label>

        <label className="import-form__field">
          <span>Ответственный</span>
          <input
            type="text"
            value={form.assignee}
            onChange={(event) => setForm((prev) => ({ ...prev, assignee: event.target.value }))}
            placeholder="ФИО ответственного"
          />
        </label>

        <label className="import-form__field">
          <span>Зависит от этапа</span>
          <select
            value={form.dependsOn ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, dependsOn: event.target.value || null }))}
          >
            <option value="">Нет зависимости</option>
            {otherStages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        {siteRequests.length > 0 && (
          <div className="import-form__field">
            <span>Привязанные заявки</span>
            <div className="stage-form__request-list">
              {siteRequests.map((request) => (
                <label key={request.id} className="stage-form__request-item">
                  <input
                    type="checkbox"
                    checked={form.requestIds.includes(request.id)}
                    onChange={() => toggleRequest(request.id)}
                  />
                  {request.number}
                </label>
              ))}
            </div>
          </div>
        )}

        <button type="button" className="btn btn--primary" disabled={!canSave} onClick={handleSave}>
          Добавить
        </button>
      </div>
    </Modal>
  );
}
