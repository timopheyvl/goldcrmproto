import { useState } from 'react';
import { useAdmin } from './useAdmin';
import { isValidEmail } from './validation';
import type { CustomerInput } from './types';
import '../catalog/catalog.css';
import './admin.css';

function emptyForm(): CustomerInput {
  return { name: '', contactPerson: '', email: '', inn: '', phone: '', address: '', comment: '' };
}

interface CustomerCreateFormProps {
  onCreated: (customerId: string) => void;
}

export function CustomerCreateForm({ onCreated }: CustomerCreateFormProps) {
  const { addCustomer } = useAdmin();
  const [form, setForm] = useState<CustomerInput>(emptyForm);
  const [touched, setTouched] = useState(false);

  const nameValid = Boolean(form.name.trim());
  const emailValid = isValidEmail(form.email);
  const canSave = nameValid && emailValid;

  const handleSave = () => {
    setTouched(true);
    if (!canSave) return;
    const id = addCustomer({
      name: form.name.trim(),
      contactPerson: form.contactPerson.trim(),
      email: form.email.trim(),
      inn: form.inn.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      comment: form.comment.trim(),
    });
    onCreated(id);
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">Новый заказчик</h2>

      <div className="import-form">
        <label className="import-form__field">
          <span>Название</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="ООО «Название»"
          />
          {touched && !nameValid && <p className="stage-form__error">Название обязательно.</p>}
        </label>

        <label className="import-form__field">
          <span>Контактное лицо</span>
          <input
            type="text"
            value={form.contactPerson}
            onChange={(event) => setForm((prev) => ({ ...prev, contactPerson: event.target.value }))}
          />
        </label>

        <label className="import-form__field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          {touched && !emailValid && <p className="stage-form__error">Некорректный формат email.</p>}
        </label>

        <label className="import-form__field">
          <span>ИНН</span>
          <input
            type="text"
            value={form.inn}
            onChange={(event) => setForm((prev) => ({ ...prev, inn: event.target.value }))}
          />
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
          <span>Адрес</span>
          <input
            type="text"
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          />
        </label>

        <label className="import-form__field">
          <span>Комментарий</span>
          <textarea
            rows={2}
            value={form.comment}
            onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
          />
        </label>

        <button type="button" className="btn btn--primary" onClick={handleSave}>
          Добавить заказчика
        </button>
      </div>
    </div>
  );
}
