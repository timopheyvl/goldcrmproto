import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { useObjects } from '../objects/useObjects';
import { useAdmin } from './useAdmin';
import { isValidEmail } from './validation';
import type { Representative } from '../../data/org';
import '../objects/objects.css';
import './admin.css';

interface RepresentativePanelProps {
  representative: Representative;
  onDeleted: () => void;
}

/**
 * Карточка существующего представителя — автосохранение по blur. Привязка к
 * службе показана только как контекст (read-only) и после создания не меняется.
 */
export function RepresentativePanel({ representative, onDeleted }: RepresentativePanelProps) {
  const { departments, sites, updateRepresentative, canDeleteRepresentative, deleteRepresentative } = useObjects();
  const { customers, isEmailTaken } = useAdmin();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setFullName(representative.fullName);
    setEmail(representative.email);
    setPhone(representative.phone);
    setPosition(representative.position);
    setEmailError(null);
    setNameError(false);
  }, [representative.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const department = departments.find((item) => item.id === representative.departmentId);
  const site = department ? sites.find((item) => item.id === department.siteId) : undefined;
  const customerName = site ? customers.find((customer) => customer.id === site.customerId)?.name ?? '—' : '—';
  const guard = canDeleteRepresentative(representative.id);

  const commitName = () => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      setFullName(representative.fullName);
      setNameError(true);
      window.setTimeout(() => setNameError(false), 1500);
      return;
    }
    if (trimmed !== representative.fullName) updateRepresentative(representative.id, { fullName: trimmed });
  };

  const commitEmail = () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError('Некорректный формат email');
      return;
    }
    if (isEmailTaken(trimmed, representative.id)) {
      setEmailError('Такой email уже используется другим пользователем');
      return;
    }
    setEmailError(null);
    if (trimmed !== representative.email) updateRepresentative(representative.id, { email: trimmed });
  };

  const commitPhone = () => {
    if (phone !== representative.phone) updateRepresentative(representative.id, { phone });
  };

  const commitPosition = () => {
    if (position !== representative.position) updateRepresentative(representative.id, { position });
  };

  const handleDelete = () => {
    deleteRepresentative(representative.id);
    setDeleteOpen(false);
    onDeleted();
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">{representative.fullName}</h2>
      <p className="admin-panel__subtitle">
        Представитель заказчика · Служба: {department?.name ?? '—'} · Объект: {site?.name ?? '—'} · Заказчик:{' '}
        {customerName}
      </p>

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
        <button
          type="button"
          className="btn btn--danger"
          disabled={!guard.allowed}
          title={guard.allowed ? undefined : guard.reason}
          onClick={() => setDeleteOpen(true)}
        >
          Удалить представителя
        </button>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Удалить представителя?" width={420}>
        <p>Представитель «{representative.fullName}» будет удалён без возможности восстановления.</p>
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
