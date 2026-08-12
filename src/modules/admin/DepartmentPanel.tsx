import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { useObjects } from '../objects/useObjects';
import { useAdmin } from './useAdmin';
import type { Department } from '../../data/org';
import '../objects/objects.css';
import './admin.css';

interface DepartmentPanelProps {
  department: Department;
  onDeleted: () => void;
}

/** Карточка существующей службы — автосохранение по blur, без кнопки «Сохранить». */
export function DepartmentPanel({ department, onDeleted }: DepartmentPanelProps) {
  const { sites, updateDepartment, canDeleteDepartment, deleteDepartment } = useObjects();
  const { customers } = useAdmin();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setName(department.name);
    setNameError(false);
  }, [department.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const site = sites.find((item) => item.id === department.siteId);
  const customerName = site ? customers.find((customer) => customer.id === site.customerId)?.name ?? '—' : '—';
  const guard = canDeleteDepartment(department.id);

  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(department.name);
      setNameError(true);
      window.setTimeout(() => setNameError(false), 1500);
      return;
    }
    if (trimmed !== department.name) updateDepartment(department.id, trimmed);
  };

  const handleDelete = () => {
    deleteDepartment(department.id);
    setDeleteOpen(false);
    onDeleted();
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">{department.name}</h2>
      <p className="admin-panel__subtitle">
        Служба · Объект: {site?.name ?? '—'} · Заказчик: {customerName}
      </p>

      <label className="stage-field">
        <span className="stage-field__label">Название</span>
        <input
          type="text"
          className={nameError ? 'stage-field__input stage-field__input--error' : 'stage-field__input'}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={commitName}
        />
        {nameError && <p className="stage-form__error">Название не может быть пустым — не применено.</p>}
      </label>

      <div className="stage-detail__actions">
        <button
          type="button"
          className="btn btn--danger"
          disabled={!guard.allowed}
          title={guard.allowed ? undefined : guard.reason}
          onClick={() => setDeleteOpen(true)}
        >
          Удалить службу
        </button>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Удалить службу?" width={420}>
        <p>Служба «{department.name}» будет удалена без возможности восстановления.</p>
        <div className="object-detail__delete-actions">
          <button type="button" className="btn btn--secondary" onClick={() => setDeleteOpen(false)}>
            Отмена
          </button>
          <button type="button" className="btn btn--danger" onClick={handleDelete}>
            Удалить
          </button>
        </div>
      </Modal>
    </div>
  );
}
