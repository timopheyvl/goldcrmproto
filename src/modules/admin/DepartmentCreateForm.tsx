import { useState } from 'react';
import { useObjects } from '../objects/useObjects';
import { useAdmin } from './useAdmin';
import '../catalog/catalog.css';
import './admin.css';

interface DepartmentCreateFormProps {
  siteId: string;
  onCreated: (departmentId: string) => void;
}

/** Служба создаётся уже привязанной к объекту из контекста — привязка в форме не выбирается. */
export function DepartmentCreateForm({ siteId, onCreated }: DepartmentCreateFormProps) {
  const { sites, addDepartment } = useObjects();
  const { customers } = useAdmin();
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  const site = sites.find((item) => item.id === siteId);
  const customerName = site ? customers.find((customer) => customer.id === site.customerId)?.name ?? '—' : '—';
  const nameValid = Boolean(name.trim());

  const handleSave = () => {
    setTouched(true);
    if (!nameValid) return;
    const id = addDepartment(siteId, name.trim());
    onCreated(id);
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">Новая служба</h2>
      <p className="admin-panel__subtitle">
        Объект: {site?.name ?? '—'} · Заказчик: {customerName}
      </p>

      <div className="import-form">
        <label className="import-form__field">
          <span>Название</span>
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Служба главного механика" />
          {touched && !nameValid && <p className="stage-form__error">Название обязательно.</p>}
        </label>

        <button type="button" className="btn btn--primary" onClick={handleSave}>
          Добавить службу
        </button>
      </div>
    </div>
  );
}
