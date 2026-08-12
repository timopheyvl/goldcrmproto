import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useObjects } from './useObjects';
import { getScopedSites } from './scope';
import { getCustomerById } from '../../data/org';
import { Modal } from '../../components/Modal';
import { MaterialsTab } from './MaterialsTab';
import { DepartmentsTab } from './DepartmentsTab';
import { PlanTab } from './PlanTab';
import { buildYandexMapsUrl } from './geo';
import './objects.css';

type Tab = 'materials' | 'departments' | 'plan';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

interface SiteFormState {
  name: string;
  description: string;
  location: string;
  geo: string;
  projectStartDate: string;
}

export function ObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const navigate = useNavigate();
  const { sites, updateSite, canDeleteSite, deleteSite } = useObjects();
  const isManager = role === 'manager';

  const scopedSites = getScopedSites(role, sites);
  const site = scopedSites.find((item) => item.id === id);

  const [tab, setTab] = useState<Tab>('materials');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<SiteFormState | null>(null);

  useEffect(() => {
    if (tab === 'departments' && !isManager) {
      setTab('materials');
    }
  }, [tab, isManager]);

  if (!site) {
    return (
      <div className="object-detail">
        <div className="import-page__breadcrumb">
          <Link to="/objects">Объекты</Link> / Объект не найден
        </div>
        <div className="empty-state">
          <div className="empty-state__title">Объект не найден</div>
          <p>Возможно, объект был удалён или ссылка устарела.</p>
          <Link to="/objects" className="btn btn--secondary">
            Вернуться к объектам
          </Link>
        </div>
      </div>
    );
  }

  const customerName = getCustomerById(site.customerId)?.name ?? '—';
  const guard = canDeleteSite(site.id);
  const mapUrl = site.geo ? buildYandexMapsUrl(site.geo) : null;

  const openEdit = () => {
    setForm({
      name: site.name,
      description: site.description,
      location: site.location,
      geo: site.geo,
      projectStartDate: site.projectStartDate,
    });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!form || !form.name.trim()) return;
    if (isManager) {
      updateSite(site.id, form);
    } else {
      updateSite(site.id, { name: form.name, description: form.description, location: form.location });
    }
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteSite(site.id);
    setDeleteOpen(false);
    navigate('/objects');
  };

  return (
    <div className="object-detail">
      <div className="import-page__breadcrumb">
        <Link to="/objects">Объекты</Link> / {site.name}
      </div>

      <div className="object-detail__header">
        <div>
          <h1 className="object-detail__title">{site.name}</h1>
          {site.description && <p className="object-detail__description">{site.description}</p>}
        </div>
        <div className="object-detail__actions">
          <button type="button" className="btn btn--secondary" onClick={openEdit}>
            Редактировать
          </button>
          {isManager && (
            <button
              type="button"
              className="btn btn--danger"
              disabled={!guard.allowed}
              title={guard.allowed ? undefined : guard.reason}
              onClick={() => setDeleteOpen(true)}
            >
              Удалить объект
            </button>
          )}
        </div>
      </div>

      <div className="object-detail__attrs">
        <div className="attr-card">
          <div className="attr-card__label">Заказчик</div>
          <div className="attr-card__value">{customerName}</div>
        </div>
        <div className="attr-card">
          <div className="attr-card__label">Локация</div>
          <div className="attr-card__value">{site.location || '—'}</div>
        </div>
        <div className="attr-card">
          <div className="attr-card__label">Геопозиция</div>
          {mapUrl ? (
            <div className="attr-card__geo">
              <a className="btn btn--secondary btn--sm" href={mapUrl} target="_blank" rel="noopener noreferrer">
                Смотреть на карте
              </a>
              <div className="attr-card__geo-coords">{site.geo}</div>
            </div>
          ) : (
            <div className="attr-card__value">{site.geo || '—'}</div>
          )}
        </div>
        <div className="attr-card">
          <div className="attr-card__label">Начало проекта</div>
          <div className="attr-card__value">{formatDate(site.projectStartDate)}</div>
        </div>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={tab === 'materials' ? 'tabs__btn tabs__btn--active' : 'tabs__btn'}
          onClick={() => setTab('materials')}
        >
          Материалы
        </button>
        {isManager && (
          <button
            type="button"
            className={tab === 'departments' ? 'tabs__btn tabs__btn--active' : 'tabs__btn'}
            onClick={() => setTab('departments')}
          >
            Службы
          </button>
        )}
        <button
          type="button"
          className={tab === 'plan' ? 'tabs__btn tabs__btn--active' : 'tabs__btn'}
          onClick={() => setTab('plan')}
        >
          План работ
        </button>
      </div>

      {tab === 'materials' && <MaterialsTab siteId={site.id} />}
      {tab === 'departments' && isManager && <DepartmentsTab siteId={site.id} />}
      {tab === 'plan' && <PlanTab siteId={site.id} />}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Редактирование объекта" width={480}>
        {form && (
          <div className="import-form">
            <label className="import-form__field">
              <span>Название</span>
              <input type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label className="import-form__field">
              <span>Описание</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </label>
            <label className="import-form__field">
              <span>Локация</span>
              <input
                type="text"
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
              />
            </label>
            {isManager && (
              <>
                <label className="import-form__field">
                  <span>Геопозиция</span>
                  <input
                    type="text"
                    value={form.geo}
                    onChange={(event) => setForm({ ...form, geo: event.target.value })}
                    placeholder="широта, долгота"
                  />
                </label>
                <label className="import-form__field">
                  <span>Дата начала проекта</span>
                  <input
                    type="date"
                    value={form.projectStartDate}
                    onChange={(event) => setForm({ ...form, projectStartDate: event.target.value })}
                  />
                </label>
              </>
            )}
            <button type="button" className="btn btn--primary" disabled={!form.name.trim()} onClick={handleSave}>
              Сохранить
            </button>
          </div>
        )}
      </Modal>

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
