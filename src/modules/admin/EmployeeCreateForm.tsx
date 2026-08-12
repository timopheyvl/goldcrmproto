import { useState } from 'react';
import { useAdmin } from './useAdmin';
import { isValidEmail } from './validation';
import type { EmployeeInput } from './types';
import '../catalog/catalog.css';
import './admin.css';

function emptyForm(): EmployeeInput {
  return { fullName: '', email: '', phone: '', position: '' };
}

interface EmployeeCreateFormProps {
  customerId: string;
  onCreated: (employeeId: string) => void;
}

/** Сотрудник создаётся уже привязанным к заказчику из контекста, без объекта/службы. */
export function EmployeeCreateForm({ customerId, onCreated }: EmployeeCreateFormProps) {
  const { customers, addEmployee, isEmailTaken } = useAdmin();
  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [touched, setTouched] = useState(false);

  const customerName = customers.find((customer) => customer.id === customerId)?.name ?? '—';
  const nameValid = Boolean(form.fullName.trim());
  const emailFormatValid = isValidEmail(form.email);
  const emailTaken = emailFormatValid && isEmailTaken(form.email.trim());
  const canSave = nameValid && emailFormatValid && !emailTaken;

  const handleSave = () => {
    setTouched(true);
    if (!canSave) return;
    const id = addEmployee(customerId, {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      position: form.position.trim(),
    });
    onCreated(id);
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">Новый сотрудник заказчика</h2>
      <p className="admin-panel__subtitle">Заказчик: {customerName}</p>

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
          Добавить сотрудника
        </button>
      </div>
    </div>
  );
}
