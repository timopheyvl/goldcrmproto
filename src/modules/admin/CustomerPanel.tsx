import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { useAdmin } from './useAdmin';
import { useObjects } from '../objects/useObjects';
import { useRequests } from '../requests/useRequests';
import type { Customer } from '../../data/org';
import '../objects/objects.css';
import './admin.css';

interface CustomerPanelProps {
  customer: Customer;
  onDeleted: () => void;
}

/** Карточка существующего заказчика — автосохранение по blur, без кнопки «Сохранить». */
export function CustomerPanel({ customer, onDeleted }: CustomerPanelProps) {
  const { updateCustomer, setCustomerActive, canDeleteCustomer, deleteCustomer, employees } = useAdmin();
  const { sites, departments, representatives } = useObjects();
  const { requests } = useRequests();

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [inn, setInn] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [nameError, setNameError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setName(customer.name);
    setContactPerson(customer.contactPerson);
    setEmail(customer.email);
    setInn(customer.inn);
    setPhone(customer.phone);
    setAddress(customer.address);
    setComment(customer.comment);
    setNameError(false);
  }, [customer.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const guard = canDeleteCustomer(customer.id);

  const customerSiteIds = new Set(sites.filter((site) => site.customerId === customer.id).map((site) => site.id));
  const siteCount = customerSiteIds.size;
  const customerDepartmentIds = new Set(
    departments.filter((department) => customerSiteIds.has(department.siteId)).map((department) => department.id),
  );
  const representativeCount = representatives.filter((representative) =>
    customerDepartmentIds.has(representative.departmentId),
  ).length;
  const employeeCount = employees.filter((employee) => employee.customerId === customer.id).length;
  const activeRequestCount = requests.filter(
    (request) => request.customerId === customer.id && request.status !== 'done',
  ).length;

  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(customer.name);
      setNameError(true);
      window.setTimeout(() => setNameError(false), 1500);
      return;
    }
    if (trimmed !== customer.name) updateCustomer(customer.id, { name: trimmed });
  };

  const commitField = (field: 'contactPerson' | 'email' | 'inn' | 'phone' | 'address' | 'comment', value: string) => {
    if (value !== customer[field]) updateCustomer(customer.id, { [field]: value });
  };

  const handleDelete = () => {
    deleteCustomer(customer.id);
    setDeleteOpen(false);
    onDeleted();
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">{customer.name}</h2>
      <p className="admin-panel__subtitle">Заказчик</p>
      <span className={customer.active ? 'admin-status-badge admin-status-badge--active' : 'admin-status-badge admin-status-badge--inactive'}>
        {customer.active ? 'Активен' : 'Неактивен'}
      </span>

      <div className="admin-summary">
        <div className="admin-summary__item">
          <span className="admin-summary__value">{siteCount}</span>
          <span className="admin-summary__label">Объектов</span>
        </div>
        <div className="admin-summary__item">
          <span className="admin-summary__value">{representativeCount}</span>
          <span className="admin-summary__label">Представителей</span>
        </div>
        <div className="admin-summary__item">
          <span className="admin-summary__value">{employeeCount}</span>
          <span className="admin-summary__label">Сотрудников</span>
        </div>
        <div className="admin-summary__item">
          <span className="admin-summary__value">{activeRequestCount}</span>
          <span className="admin-summary__label">Активных заявок</span>
        </div>
      </div>

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

      <label className="stage-field">
        <span className="stage-field__label">Контактное лицо</span>
        <input
          type="text"
          className="stage-field__input"
          value={contactPerson}
          onChange={(event) => setContactPerson(event.target.value)}
          onBlur={() => commitField('contactPerson', contactPerson)}
        />
      </label>

      <label className="stage-field">
        <span className="stage-field__label">Email</span>
        <input
          type="email"
          className="stage-field__input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => commitField('email', email)}
        />
      </label>

      <label className="stage-field">
        <span className="stage-field__label">ИНН</span>
        <input
          type="text"
          className="stage-field__input"
          value={inn}
          onChange={(event) => setInn(event.target.value)}
          onBlur={() => commitField('inn', inn)}
        />
      </label>

      <label className="stage-field">
        <span className="stage-field__label">Телефон</span>
        <input
          type="text"
          className="stage-field__input"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          onBlur={() => commitField('phone', phone)}
        />
      </label>

      <label className="stage-field">
        <span className="stage-field__label">Адрес</span>
        <textarea
          rows={2}
          className="stage-field__input"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          onBlur={() => commitField('address', address)}
        />
      </label>

      <label className="stage-field">
        <span className="stage-field__label">Комментарий</span>
        <textarea
          rows={2}
          className="stage-field__input"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          onBlur={() => commitField('comment', comment)}
        />
      </label>

      <div className="stage-detail__actions">
        <button type="button" className="btn btn--secondary" onClick={() => setCustomerActive(customer.id, !customer.active)}>
          {customer.active ? 'Деактивировать' : 'Активировать'}
        </button>
        <button
          type="button"
          className="btn btn--danger"
          disabled={!guard.allowed}
          title={guard.allowed ? undefined : guard.reason}
          onClick={() => setDeleteOpen(true)}
        >
          Удалить заказчика
        </button>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Удалить заказчика?" width={420}>
        <p>Заказчик «{customer.name}» будет удалён без возможности восстановления.</p>
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
