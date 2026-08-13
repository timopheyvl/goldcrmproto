import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { useAdmin } from './useAdmin';
import { isValidEmail } from './validation';
import type { Employee } from '../../data/org';
import '../objects/objects.css';
import './admin.css';

interface EmployeePanelProps {
  employee: Employee;
  onDeleted: () => void;
}

/** Карточка существующего сотрудника заказчика — автосохранение по blur. */
export function EmployeePanel({ employee, onDeleted }: EmployeePanelProps) {
  const { customers, updateEmployee, setEmployeeActive, canDeleteEmployee, deleteEmployee, isEmailTaken } = useAdmin();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setFullName(employee.fullName);
    setEmail(employee.email);
    setPhone(employee.phone);
    setPosition(employee.position);
    setEmailError(null);
    setNameError(false);
  }, [employee.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const customerName = customers.find((customer) => customer.id === employee.customerId)?.name ?? '—';
  const guard = canDeleteEmployee(employee.id);

  const commitName = () => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      setFullName(employee.fullName);
      setNameError(true);
      window.setTimeout(() => setNameError(false), 1500);
      return;
    }
    if (trimmed !== employee.fullName) updateEmployee(employee.id, { fullName: trimmed });
  };

  const commitEmail = () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError('Некорректный формат email');
      return;
    }
    if (isEmailTaken(trimmed, employee.id)) {
      setEmailError('Такой email уже используется другим пользователем');
      return;
    }
    setEmailError(null);
    if (trimmed !== employee.email) updateEmployee(employee.id, { email: trimmed });
  };

  const commitPhone = () => {
    if (phone !== employee.phone) updateEmployee(employee.id, { phone });
  };

  const commitPosition = () => {
    if (position !== employee.position) updateEmployee(employee.id, { position });
  };

  const handleDelete = () => {
    deleteEmployee(employee.id);
    setDeleteOpen(false);
    onDeleted();
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">{employee.fullName}</h2>
      <p className="admin-panel__subtitle">Сотрудник заказчика · Заказчик: {customerName}</p>
      <span className={employee.active ? 'admin-status-badge admin-status-badge--active' : 'admin-status-badge admin-status-badge--inactive'}>
        {employee.active ? 'Активен' : 'Неактивен'}
      </span>

      <label className="stage-field">
        <span className="stage-field__label">ФИО</span>
        <input
          type="text"
          className={nameError ? 'stage-field__input stage-field__input--error' : 'stage-field__input'}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          onBlur={commitName}
        />
        {nameError && <p className="stage-form__error">ФИО не может быть пустым — не применено.</p>}
      </label>

      <label className="stage-field">
        <span className="stage-field__label">Email (логин)</span>
        <input
          type="email"
          className={emailError ? 'stage-field__input stage-field__input--error' : 'stage-field__input'}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (emailError) setEmailError(null);
          }}
          onBlur={commitEmail}
        />
        {emailError && <p className="stage-form__error">{emailError}</p>}
      </label>

      <label className="stage-field">
        <span className="stage-field__label">Телефон</span>
        <input
          type="text"
          className="stage-field__input"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          onBlur={commitPhone}
        />
      </label>

      <label className="stage-field">
        <span className="stage-field__label">Должность</span>
        <input
          type="text"
          className="stage-field__input"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          onBlur={commitPosition}
        />
      </label>

      <div className="stage-detail__actions">
        <button type="button" className="btn btn--secondary" onClick={() => setEmployeeActive(employee.id, !employee.active)}>
          {employee.active ? 'Деактивировать' : 'Активировать'}
        </button>
        <button
          type="button"
          className="btn btn--danger"
          disabled={!guard.allowed}
          title={guard.allowed ? undefined : guard.reason}
          onClick={() => setDeleteOpen(true)}
        >
          Удалить сотрудника
        </button>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Удалить сотрудника?" width={420}>
        <p>Сотрудник «{employee.fullName}» будет удалён без возможности восстановления.</p>
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
