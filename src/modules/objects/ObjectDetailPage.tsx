import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useObjects } from './useObjects';
import { getScopedSites } from './scope';
import { useEntities } from '../../data/useEntities';
import { MaterialsTab } from './MaterialsTab';
import { DepartmentsTab } from './DepartmentsTab';
import { PlanTab } from './PlanTab';
import { buildYandexMapsUrl } from './geo';
import './objects.css';

type Tab = 'materials' | 'departments' | 'plan';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

/**
 * Только просмотр структуры объекта — поля объекта и службы редактируются
 * исключительно в модуле «Управление». Здесь редактируется только контент:
 * материалы (MaterialsTab) и план работ / Гант (PlanTab).
 */
export function ObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const { sites, departments, representatives } = useObjects();
  const { getCustomerById } = useEntities();

  const scopedSites = getScopedSites(role, sites, departments, representatives);
  const site = scopedSites.find((item) => item.id === id);

  const [tab, setTab] = useState<Tab>('materials');

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
  const mapUrl = site.geo ? buildYandexMapsUrl(site.geo) : null;

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
        <button
          type="button"
          className={tab === 'departments' ? 'tabs__btn tabs__btn--active' : 'tabs__btn'}
          onClick={() => setTab('departments')}
        >
          Службы
        </button>
        <button
          type="button"
          className={tab === 'plan' ? 'tabs__btn tabs__btn--active' : 'tabs__btn'}
          onClick={() => setTab('plan')}
        >
          План работ
        </button>
      </div>

      {tab === 'materials' && <MaterialsTab siteId={site.id} />}
      {tab === 'departments' && <DepartmentsTab siteId={site.id} />}
      {tab === 'plan' && <PlanTab siteId={site.id} />}
    </div>
  );
}
