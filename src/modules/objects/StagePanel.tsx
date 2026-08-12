import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Drawer } from '../../components/Drawer';
import { Modal } from '../../components/Modal';
import { useRole } from '../../context/useRole';
import { useObjects } from './useObjects';
import { useRequests } from '../requests/useRequests';
import { useIsMobile } from './useIsMobile';
import { StatusBadge as RequestStatusBadge } from '../requests/StatusBadge';
import { getRepresentativesByCustomer, getSiteById } from '../../data/org';
import { STAGE_STATUSES, STAGE_STATUS_BADGE, STAGE_STATUS_LABELS } from './types';
import type { Stage, StageFileMeta, StageInput, StageStatus } from './types';
import './objects.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

interface StagePanelProps {
  stage: Stage | null;
  onClose: () => void;
}

/**
 * Единая панель просмотра/редактирования этапа (аналог демо svar.dev):
 * клик по этапу сразу открывает редактируемую панель, без отдельной модалки
 * и кнопок «Сохранить»/«Отмена» — каждое поле автосохраняется само по себе.
 * Закрытие панели ничего не откатывает: всё уже применено к этому моменту.
 */
export function StagePanel({ stage, onClose }: StagePanelProps) {
  const { role } = useRole();
  const isManager = role === 'manager';
  const isMobile = useIsMobile();
  const {
    stages,
    updateStage,
    updateStageLimited,
    updateStageProgress,
    canDeleteStage,
    deleteStage,
    addFilesToStage,
    removeStageFile,
    getStageFile,
  } = useObjects();
  const { requests } = useRequests();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Локальный буфер нужен только текстовым полям (автосохранение по blur) —
  // иначе поле «прыгало» бы при каждом чужом изменении. Селекты/ползунок
  // работают напрямую со stage и применяются сразу же.
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeText, setAssigneeText] = useState('');
  const [errorField, setErrorField] = useState<string | null>(null);

  useEffect(() => {
    if (!stage) return;
    setName(stage.name);
    setDescription(stage.description);
    setAssigneeText(stage.assignee);
    setErrorField(null);
    // Синхронизируем буфер только при смене этапа, а не на каждое обновление
    // stage (иначе ввод перебивало бы собственным же автосохранением).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.id]);

  if (!stage) return null;

  const customerId = getSiteById(stage.siteId)?.customerId ?? '';
  const assignableUsers = getRepresentativesByCustomer(customerId);
  const dependsOnStage = stage.dependsOn ? stages.find((item) => item.id === stage.dependsOn) : null;
  const otherStages = stages.filter((item) => item.id !== stage.id);
  const linkedRequests = requests.filter((request) => stage.requestIds.includes(request.id));
  const guard = canDeleteStage(stage.id);

  // «Исполнена» в терминах этапа = статус «Выполнен» (done) — по аналогии с
  // блокировкой состава заявки в статусе «Исполнена» в модуле «Заявки».
  const isDone = stage.status === 'done';
  const locked = isDone || isMobile;
  const canEditManagerFields = isManager && !locked;
  const canEditSharedFields = !locked;

  const flashError = (field: string) => {
    setErrorField(field);
    window.setTimeout(() => setErrorField((current) => (current === field ? null : current)), 1500);
  };

  const patchShared = (input: Partial<StageInput>) => {
    if (isManager) {
      updateStage(stage.id, input);
    } else {
      updateStageLimited(stage.id, input);
    }
  };

  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(stage.name);
      flashError('name');
      return;
    }
    if (trimmed !== stage.name) updateStage(stage.id, { name: trimmed });
  };

  const commitDescription = () => {
    if (description !== stage.description) patchShared({ description });
  };

  const commitAssigneeText = () => {
    if (assigneeText !== stage.assignee) patchShared({ assignee: assigneeText });
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    patchShared({ status: event.target.value as StageStatus });
  };

  const handleAssigneeSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    patchShared({ assignee: event.target.value });
  };

  const handleDependsOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateStage(stage.id, { dependsOn: event.target.value || null });
  };

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value || value > stage.endDate) {
      flashError('startDate');
      return;
    }
    updateStage(stage.id, { startDate: value });
  };

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value || value < stage.startDate) {
      flashError('endDate');
      return;
    }
    updateStage(stage.id, { endDate: value });
  };

  const handleProgressChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateStageProgress(stage.id, Number(event.target.value));
  };

  const handleDownload = (file: StageFileMeta) => {
    const blob = getStageFile(file.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleAddFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) addFilesToStage(stage.id, files);
    event.target.value = '';
  };

  const handleDelete = () => {
    deleteStage(stage.id);
    setDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <Drawer open={Boolean(stage)} onClose={onClose} title={stage.name} width={440}>
        <div className="stage-detail">
          {locked && (
            <p className="stage-detail__locked-note">
              {isDone
                ? 'Этап выполнен — поля доступны только для просмотра.'
                : 'На мобильном план работ доступен только для просмотра.'}
            </p>
          )}

          <label className="stage-field">
            <span className="stage-field__label">Название</span>
            {canEditManagerFields ? (
              <input
                type="text"
                className={
                  errorField === 'name' ? 'stage-field__input stage-field__input--error' : 'stage-field__input'
                }
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={commitName}
              />
            ) : (
              <div className="stage-field__value">{stage.name}</div>
            )}
          </label>

          <label className="stage-field">
            <span className="stage-field__label">Статус</span>
            {canEditSharedFields ? (
              <select className="filter-select" value={stage.status} onChange={handleStatusChange}>
                {STAGE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STAGE_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`status-badge status-badge--${STAGE_STATUS_BADGE[stage.status]}`}>
                {STAGE_STATUS_LABELS[stage.status]}
              </span>
            )}
          </label>

          <div className="stage-form__dates-row">
            <label className="stage-field">
              <span className="stage-field__label">Дата начала</span>
              {canEditManagerFields ? (
                <input
                  type="date"
                  className={
                    errorField === 'startDate'
                      ? 'stage-field__input stage-field__input--error'
                      : 'stage-field__input'
                  }
                  value={stage.startDate}
                  onChange={handleStartDateChange}
                />
              ) : (
                <div className="stage-field__value">{formatDate(stage.startDate)}</div>
              )}
            </label>
            <label className="stage-field">
              <span className="stage-field__label">Дата окончания</span>
              {canEditManagerFields ? (
                <input
                  type="date"
                  className={
                    errorField === 'endDate' ? 'stage-field__input stage-field__input--error' : 'stage-field__input'
                  }
                  value={stage.endDate}
                  onChange={handleEndDateChange}
                />
              ) : (
                <div className="stage-field__value">{formatDate(stage.endDate)}</div>
              )}
            </label>
          </div>
          {(errorField === 'startDate' || errorField === 'endDate') && (
            <p className="stage-form__error">Дата окончания не может быть раньше даты начала — не применено.</p>
          )}

          <label className="stage-field">
            <span className="stage-field__label">Процент выполнения</span>
            <div className="stage-form__progress-row">
              <input
                type="range"
                min={0}
                max={100}
                value={stage.progress}
                disabled={!canEditSharedFields}
                onChange={handleProgressChange}
              />
              <span className="stage-form__progress-value">{stage.progress}%</span>
            </div>
          </label>

          <label className="stage-field">
            <span className="stage-field__label">Описание</span>
            {canEditSharedFields ? (
              <textarea
                rows={3}
                className="stage-field__input"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onBlur={commitDescription}
              />
            ) : (
              <div className="stage-field__value">{stage.description || '—'}</div>
            )}
          </label>

          <label className="stage-field">
            <span className="stage-field__label">Ответственный</span>
            {!canEditSharedFields ? (
              <div className="stage-field__value">{stage.assignee || '—'}</div>
            ) : isManager ? (
              <input
                type="text"
                className="stage-field__input"
                value={assigneeText}
                onChange={(event) => setAssigneeText(event.target.value)}
                onBlur={commitAssigneeText}
                placeholder="ФИО ответственного"
              />
            ) : (
              <select className="filter-select" value={stage.assignee} onChange={handleAssigneeSelect}>
                <option value="">Не назначен</option>
                {assignableUsers.map((user) => (
                  <option key={user.id} value={user.fullName}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="stage-field">
            <span className="stage-field__label">Зависит от этапа</span>
            {canEditManagerFields ? (
              <select className="filter-select" value={stage.dependsOn ?? ''} onChange={handleDependsOnChange}>
                <option value="">Нет зависимости</option>
                {otherStages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="stage-field__value">{dependsOnStage ? dependsOnStage.name : '—'}</div>
            )}
          </label>

          <div className="stage-detail__section">
            <h3>Привязанные заявки</h3>
            {linkedRequests.length === 0 ? (
              <p className="stage-detail__empty-hint">Нет привязанных заявок</p>
            ) : (
              <div className="stage-detail__requests">
                {linkedRequests.map((request) => (
                  <Link key={request.id} to={`/requests/${request.id}`} className="stage-detail__request-link">
                    <span>{request.number}</span>
                    <RequestStatusBadge status={request.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="stage-detail__section">
            <div className="request-detail__section-title">
              <h3>Файлы</h3>
              {isManager && !isMobile && (
                <>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Загрузить файлы
                  </button>
                  <input ref={fileInputRef} type="file" multiple hidden onChange={handleAddFiles} />
                </>
              )}
            </div>
            {stage.files.length === 0 ? (
              <p className="stage-detail__empty-hint">Файлов нет</p>
            ) : (
              <div className="documents-list">
                {stage.files.map((file) => {
                  const hasFile = Boolean(getStageFile(file.id));
                  return (
                    <div className="document-row" key={file.id}>
                      <span className="document-row__name">{file.name}</span>
                      <span className="document-row__date">{formatDate(file.uploadedAt)}</span>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        disabled={!hasFile}
                        onClick={() => handleDownload(file)}
                        title={
                          hasFile
                            ? undefined
                            : 'Файл доступен только в течение текущей сессии — после перезагрузки страницы недоступен'
                        }
                      >
                        Скачать
                      </button>
                      {isManager && !isMobile && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => removeStageFile(stage.id, file.id)}
                        >
                          Удалить файл
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {isManager && !isMobile && (
            <div className="stage-detail__actions">
              <button
                type="button"
                className="btn btn--danger"
                disabled={!guard.allowed}
                title={guard.allowed ? undefined : guard.reason}
                onClick={() => setDeleteOpen(true)}
              >
                Удалить этап
              </button>
            </div>
          )}
        </div>
      </Drawer>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Удалить этап?" width={420}>
        <p>Этап «{stage.name}» будет удалён без возможности восстановления.</p>
        <div className="object-detail__delete-actions">
          <button type="button" className="btn btn--secondary" onClick={() => setDeleteOpen(false)}>
            Отмена
          </button>
          <button type="button" className="btn btn--danger" onClick={handleDelete}>
            Удалить
          </button>
        </div>
      </Modal>
    </>
  );
}
