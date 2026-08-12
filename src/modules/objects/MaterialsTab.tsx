import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRole } from '../../context/useRole';
import { useObjects } from './useObjects';
import { Modal } from '../../components/Modal';
import type { MaterialFileMeta, MaterialRecord } from './types';
import './objects.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

interface MaterialFormState {
  name: string;
  description: string;
}

const EMPTY_FORM: MaterialFormState = { name: '', description: '' };

export function MaterialsTab({ siteId }: { siteId: string }) {
  const { role } = useRole();
  const isManager = role === 'manager';
  const {
    getMaterialsBySite,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addFilesToMaterial,
    removeMaterialFile,
    getMaterialFile,
  } = useObjects();

  const materials = getMaterialsBySite(siteId);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialFormState>(EMPTY_FORM);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<MaterialRecord | null>(null);
  const [addFilesTargetId, setAddFilesTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFilesInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return materials;
    return materials.filter(
      (material) => material.name.toLowerCase().includes(query) || material.description.toLowerCase().includes(query),
    );
  }, [materials, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPendingFiles([]);
    setModalOpen(true);
  };

  const openEdit = (material: MaterialRecord) => {
    setEditingId(material.id);
    setForm({ name: material.name, description: material.description });
    setPendingFiles([]);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateMaterial(editingId, form);
      if (pendingFiles.length > 0) addFilesToMaterial(editingId, pendingFiles);
    } else {
      addMaterial(siteId, form, pendingFiles);
    }
    setModalOpen(false);
  };

  const handleDownload = (file: MaterialFileMeta) => {
    const blob = getMaterialFile(file.id);
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

  const handleAddFilesClick = (materialId: string) => {
    setAddFilesTargetId(materialId);
    addFilesInputRef.current?.click();
  };

  const handleAddFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0 && addFilesTargetId) {
      addFilesToMaterial(addFilesTargetId, files);
    }
    event.target.value = '';
    setAddFilesTargetId(null);
  };

  return (
    <div className="materials-tab">
      <div className="materials-tab__toolbar">
        <input
          type="text"
          className="filter-select materials-tab__search"
          placeholder="Поиск по названию или описанию"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {isManager && (
          <button type="button" className="btn btn--primary" onClick={openCreate}>
            Добавить запись
          </button>
        )}
      </div>

      {materials.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Материалов пока нет</div>
          <p>
            {isManager
              ? 'Добавьте первую запись материала для этого объекта.'
              : 'Материалы появятся здесь после того как менеджер их загрузит.'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Ничего не найдено</div>
          <p>По запросу «{search}» материалов не найдено.</p>
        </div>
      ) : (
        <div className="materials-list">
          {filtered.map((material) => (
            <div className="material-card" key={material.id}>
              <div className="material-card__header">
                <div>
                  <div className="material-card__name">{material.name}</div>
                  <div className="material-card__date">{formatDate(material.createdAt)}</div>
                </div>
                {isManager && (
                  <div className="material-card__actions">
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => openEdit(material)}>
                      Редактировать
                    </button>
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(material)}>
                      Удалить
                    </button>
                  </div>
                )}
              </div>

              {material.description && <p className="material-card__description">{material.description}</p>}

              {material.files.length > 0 && (
                <div className="documents-list">
                  {material.files.map((file) => {
                    const hasFile = Boolean(getMaterialFile(file.id));
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
                        {isManager && (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => removeMaterialFile(material.id, file.id)}
                          >
                            Удалить файл
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {isManager && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm material-card__add-files"
                  onClick={() => handleAddFilesClick(material.id)}
                >
                  Загрузить файлы
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <input ref={addFilesInputRef} type="file" multiple hidden onChange={handleAddFilesChange} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Редактировать материал' : 'Новая запись материала'}
        width={480}
      >
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
          <label className="import-form__field">
            <span>Файлы</span>
            <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(event) => setPendingFiles((prev) => [...prev, ...Array.from(event.target.files ?? [])])}
              />
              {pendingFiles.length > 0 ? (
                <span>Выбрано файлов: {pendingFiles.length}</span>
              ) : (
                <span>Нажмите, чтобы выбрать один или несколько файлов</span>
              )}
            </div>
            {pendingFiles.length > 0 && (
              <ul className="pending-files-list">
                {pendingFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`}>
                    <span>{file.name}</span>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>
          <button type="button" className="btn btn--primary" disabled={!form.name.trim()} onClick={handleSave}>
            {editingId ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </Modal>

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Удалить запись материала?" width={420}>
        {deleteTarget && (
          <>
            <p>Запись «{deleteTarget.name}» и все прикреплённые файлы будут удалены без возможности восстановления.</p>
            <div className="object-detail__delete-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setDeleteTarget(null)}>
                Отмена
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  deleteMaterial(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                Удалить
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
