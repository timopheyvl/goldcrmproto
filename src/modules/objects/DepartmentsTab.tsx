import { useState } from 'react';
import { useObjects } from './useObjects';
import { Modal } from '../../components/Modal';
import { getCustomerById } from '../../data/org';
import type { Department } from '../../data/org';
import './objects.css';

export function DepartmentsTab({ siteId }: { siteId: string }) {
  const { sites, getDepartmentsBySite, addDepartment, updateDepartment, canDeleteDepartment, deleteDepartment } =
    useObjects();
  const departments = getDepartmentsBySite(siteId);
  const site = sites.find((item) => item.id === siteId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setModalOpen(true);
  };

  const openEdit = (department: Department) => {
    setEditingId(department.id);
    setName(department.name);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      updateDepartment(editingId, name);
    } else {
      addDepartment(siteId, name);
    }
    setModalOpen(false);
  };

  return (
    <div className="departments-tab">
      <div className="materials-tab__toolbar materials-tab__toolbar--end">
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          Добавить службу
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Служб пока нет</div>
          <p>Добавьте первую службу для этого объекта.</p>
        </div>
      ) : (
        <table className="import-table">
          <thead>
            <tr>
              <th>Название</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => {
              const guard = canDeleteDepartment(department.id);
              return (
                <tr key={department.id}>
                  <td>{department.name}</td>
                  <td className="departments-tab__row-actions">
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => openEdit(department)}>
                      Редактировать
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      disabled={!guard.allowed}
                      title={guard.allowed ? undefined : guard.reason}
                      onClick={() => setDeleteTarget(department)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Редактировать службу' : 'Новая служба'} width={420}>
        <div className="import-form">
          {site && (
            <p className="departments-tab__context">
              Объект: {site.name} · Заказчик: {getCustomerById(site.customerId)?.name ?? '—'}
            </p>
          )}
          <label className="import-form__field">
            <span>Название</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Служба главного механика"
            />
          </label>
          <button type="button" className="btn btn--primary" disabled={!name.trim()} onClick={handleSave}>
            {editingId ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </Modal>

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Удалить службу?" width={420}>
        {deleteTarget && (
          <>
            <p>Служба «{deleteTarget.name}» будет удалена без возможности восстановления.</p>
            <div className="object-detail__delete-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setDeleteTarget(null)}>
                Отмена
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  deleteDepartment(deleteTarget.id);
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
