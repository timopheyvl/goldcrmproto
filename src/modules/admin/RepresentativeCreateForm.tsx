import { useState } from 'react';
import { useObjects } from '../objects/useObjects';
import { useAdmin } from './useAdmin';
import { isValidEmail } from './validation';
import type { RepresentativeInput } from '../objects/types';
import '../catalog/catalog.css';
import './admin.css';

function emptyForm(): RepresentativeInput {
  return { fullName: '', email: '', phone: '', position: '' };
}

interface RepresentativeCreateFormProps {
  departmentId: string;
  onCreated: (representativeId: string) => void;
}

/** Представитель создаётся уже привязанным к службе из контекста — привязка в форме не выбирается и после создания не меняется. */
export function RepresentativeCreateForm({ departmentId, onCreated }: RepresentativeCreateFormProps) {
  const { departments, sites, addRepresentative } = useObjects();
  const { customers, isEmailTaken } = useAdmin();
  const [form, setForm] = useState<RepresentativeInput>(emptyForm);
  const [touched, setTouched] = useState(false);

  const department = departments.find((item) => item.id === departmentId);
  const site = department ? sites.find((item) => item.id === department.siteId) : undefined;
  const customerName = site ? customers.find((customer) => customer.id === site.customerId)?.name ?? '—' : '—';

  const nameValid = Boolean(form.fullName.trim());
  const emailFormatValid = isValidEmail(form.email);
  const emailTaken = emailFormatValid && isEmailTaken(form.email.trim());
  const canSave = nameValid && emailFormatValid && !emailTaken;

  const handleSave = () => {
    setTouched(true);
    if (!canSave) return;
    const id = addRepresentative(departmentId, {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      position: form.position.trim(),
    });
    onCreated(id);
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">Новый представитель</h2>
      <p className="admin-panel__subtitle">
        Служба: {department?.name ?? '—'} · Объект: {site?.name ?? '—'} · Заказчик: {customerName}
      </p>

      <div className="import-form">
        <label className="import-form__field">
          <span>ФИО</span>
          <input
            type="text"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
          />
          {touched && !nameValid && <p className="stage-form__error">ФИО обязательно.</p>}
        </label>

        <label className="import-form__field">
          <span>Email (логин)</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          {touched && !emailFormatValid && <p className="stage-form__error">Некорректный формат email.</p>}
          {touched && emailFormatValid && emailTaken && (
            <p className="stage-form__error">Такой email уже используется другим пользователем.</p>
          )}
        </label>

        <label className="import-form__field">
          <span>Телефон</span>
          <input
            type="text"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
        </label>

        <label className="import-form__field">
          <span>Должность</span>
          <input
            type="text"
            value={form.position}
            onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
          />
        </label>

        <button type="button" className="btn btn--primary" onClick={handleSave}>
          Добавить представителя
        </button>
      </div>
    </div>
  );
}
