import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { useAdmin } from './useAdmin';
import { isValidEmail } from './validation';
import type { Manager } from '../../data/org';
import '../objects/objects.css';
import './admin.css';

interface ManagerPanelProps {
  manager: Manager;
  onDeleted: () => void;
}

/**
 * Карточка существующего менеджера — автосохранение по blur (без кнопок
 * «Сохранить»/«Отмена»), как панель этапа Ганта. Email проверяется на формат
 * и глобальную уникальность логина при потере фокуса.
 */
export function ManagerPanel({ manager, onDeleted }: ManagerPanelProps) {
  const { updateManager, setManagerActive, canDeleteManager, deleteManager, isEmailTaken } = useAdmin();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setFullName(manager.fullName);
    setEmail(manager.email);
    setPhone(manager.phone);
    setPosition(manager.position);
    setEmailError(null);
    setNameError(false);
  }, [manager.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const guard = canDeleteManager(manager.id);

  const commitName = () => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      setFullName(manager.fullName);
      setNameError(true);
      window.setTimeout(() => setNameError(false), 1500);
      return;
    }
    if (trimmed !== manager.fullName) updateManager(manager.id, { fullName: trimmed });
  };

  const commitEmail = () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError('Некорректный формат email');
      return;
    }
    if (isEmailTaken(trimmed, manager.id)) {
      setEmailError('Такой email уже используется другим пользователем');
      return;
    }
    setEmailError(null);
    if (trimmed !== manager.email) updateManager(manager.id, { email: trimmed });
  };

  const commitPhone = () => {
    if (phone !== manager.phone) updateManager(manager.id, { phone });
  };

  const commitPosition = () => {
    if (position !== manager.position) updateManager(manager.id, { position });
  };

  const handleDelete = () => {
    deleteManager(manager.id);
    setDeleteOpen(false);
    onDeleted();
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">{manager.fullName}</h2>
      <p className="admin-panel__subtitle">Менеджер GoldLink</p>
      <span className={manager.active ? 'admin-status-badge admin-status-badge--active' : 'admin-status-badge admin-status-badge--inactive'}>
        {manager.active ? 'Активен' : 'Неактивен'}
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
        <button type="button" className="btn btn--secondary" onClick={() => setManagerActive(manager.id, !manager.active)}>
          {manager.active ? 'Деактивировать' : 'Активировать'}
        </button>
        <button
          type="button"
          className="btn btn--danger"
          disabled={!guard.allowed}
          title={guard.allowed ? undefined : guard.reason}
          onClick={() => setDeleteOpen(true)}
        >
          Удалить менеджера
        </button>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Удалить менеджера?" width={420}>
        <p>Менеджер «{manager.fullName}» будет удалён без возможности восстановления.</p>
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
