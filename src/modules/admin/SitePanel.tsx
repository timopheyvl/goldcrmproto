import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { useObjects } from '../objects/useObjects';
import { useAdmin } from './useAdmin';
import type { Site } from '../../data/org';
import '../objects/objects.css';
import './admin.css';

interface SitePanelProps {
  site: Site;
  onDeleted: () => void;
}

/** Карточка существующего объекта — автосохранение по blur, без кнопки «Сохранить». */
export function SitePanel({ site, onDeleted }: SitePanelProps) {
  const { updateSite, canDeleteSite, deleteSite } = useObjects();
  const { customers } = useAdmin();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [geo, setGeo] = useState('');
  const [nameError, setNameError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setName(site.name);
    setDescription(site.description);
    setLocation(site.location);
    setGeo(site.geo);
    setNameError(false);
  }, [site.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const customerName = customers.find((customer) => customer.id === site.customerId)?.name ?? '—';
  const guard = canDeleteSite(site.id);

  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(site.name);
      setNameError(true);
      window.setTimeout(() => setNameError(false), 1500);
      return;
    }
    if (trimmed !== site.name) updateSite(site.id, { name: trimmed });
  };

  const commitDescription = () => {
    if (description !== site.description) updateSite(site.id, { description });
  };

  const commitLocation = () => {
    if (location !== site.location) updateSite(site.id, { location });
  };

  const commitGeo = () => {
    if (geo !== site.geo) updateSite(site.id, { geo });
  };

  const handleStartDateChange = (value: string) => {
    if (!value) return;
    updateSite(site.id, { projectStartDate: value });
  };

  const handleDelete = () => {
    deleteSite(site.id);
    setDeleteOpen(false);
    onDeleted();
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">{site.name}</h2>
      <p className="admin-panel__subtitle">Объект · Заказчик: {customerName}</p>

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
        <span className="stage-field__label">Описание</span>
        <textarea
          rows={3}
          className="stage-field__input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          onBlur={commitDescription}
        />
      </label>

      <label className="stage-field">
        <span className="stage-field__label">Локация</span>
        <input
          type="text"
          className="stage-field__input"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onBlur={commitLocation}
        />
      </label>

      <label className="stage-field">
        <span className="stage-field__label">Геопозиция</span>
        <input
          type="text"
          className="stage-field__input"
          value={geo}
          onChange={(event) => setGeo(event.target.value)}
          onBlur={commitGeo}
          placeholder="широта, долгота"
        />
      </label>

      <label className="stage-field">
        <span className="stage-field__label">Дата начала проекта</span>
        <input
          type="date"
          className="stage-field__input"
          value={site.projectStartDate}
          onChange={(event) => handleStartDateChange(event.target.value)}
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
          Удалить объект
        </button>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Удалить объект?" width={420}>
        <p>Объект «{site.name}» будет удалён без возможности восстановления.</p>
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
