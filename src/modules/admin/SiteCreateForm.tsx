import { useState } from 'react';
import { useObjects } from '../objects/useObjects';
import { useAdmin } from './useAdmin';
import '../catalog/catalog.css';
import './admin.css';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface SiteFormState {
  name: string;
  description: string;
  location: string;
  geo: string;
  projectStartDate: string;
}

function emptyForm(): SiteFormState {
  return { name: '', description: '', location: '', geo: '', projectStartDate: todayISO() };
}

interface SiteCreateFormProps {
  customerId: string;
  onCreated: (siteId: string) => void;
}

/** Объект создаётся уже привязанным к заказчику из контекста — привязка в форме не выбирается. */
export function SiteCreateForm({ customerId, onCreated }: SiteCreateFormProps) {
  const { addSite } = useObjects();
  const { customers } = useAdmin();
  const [form, setForm] = useState<SiteFormState>(emptyForm);
  const [touched, setTouched] = useState(false);

  const customerName = customers.find((customer) => customer.id === customerId)?.name ?? '—';
  const nameValid = Boolean(form.name.trim());

  const handleSave = () => {
    setTouched(true);
    if (!nameValid) return;
    const id = addSite(customerId, {
      name: form.name.trim(),
      description: form.description,
      location: form.location,
      geo: form.geo,
      projectStartDate: form.projectStartDate,
    });
    onCreated(id);
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">Новый объект</h2>
      <p className="admin-panel__subtitle">Заказчик: {customerName}</p>

      <div className="import-form">
        <label className="import-form__field">
          <span>Название</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          {touched && !nameValid && <p className="stage-form__error">Название обязательно.</p>}
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
          <span>Локация</span>
          <input
            type="text"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
          />
        </label>

        <label className="import-form__field">
          <span>Геопозиция</span>
          <input
            type="text"
            value={form.geo}
            onChange={(event) => setForm((prev) => ({ ...prev, geo: event.target.value }))}
            placeholder="широта, долгота"
          />
        </label>

        <label className="import-form__field">
          <span>Дата начала проекта</span>
          <input
            type="date"
            value={form.projectStartDate}
            onChange={(event) => setForm((prev) => ({ ...prev, projectStartDate: event.target.value }))}
          />
        </label>

        <button type="button" className="btn btn--primary" onClick={handleSave}>
          Добавить объект
        </button>
      </div>
    </div>
  );
}
