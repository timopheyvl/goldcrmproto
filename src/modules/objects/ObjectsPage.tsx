import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useObjects } from './useObjects';
import { getScopedSites } from './scope';
import { CUSTOMERS, getCustomerById } from '../../data/org';
import { ProductThumb } from '../catalog/ProductThumb';
import '../catalog/catalog.css';
import './objects.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

export function ObjectsPage() {
  const { role } = useRole();
  const navigate = useNavigate();
  const { sites } = useObjects();
  const isManager = role === 'manager';

  const scopedSites = useMemo(() => getScopedSites(role, sites), [role, sites]);

  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, [role]);

  const customerOptions = useMemo(() => {
    const ids = new Set(scopedSites.map((site) => site.customerId));
    return CUSTOMERS.filter((customer) => ids.has(customer.id));
  }, [scopedSites]);

  const filteredSites = useMemo(() => {
    return scopedSites
      .filter((site) => !customerId || site.customerId === customerId)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [scopedSites, customerId]);

  return (
    <div className="objects-page">
      {isManager && customerOptions.length > 1 && (
        <div className="objects-page__filters">
          <select className="filter-select" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">Все заказчики</option>
            {customerOptions.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {customerId && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCustomerId('')}>
              Сбросить фильтр
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="objects-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="product-card-skeleton" key={index} />
          ))}
        </div>
      ) : scopedSites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Объектов пока нет</div>
          <p>Объекты появляются здесь после того как менеджер добавит их в модуле управления пользователями.</p>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Ничего не найдено</div>
          <p>По выбранному заказчику объектов не найдено.</p>
          <button type="button" className="btn btn--secondary" onClick={() => setCustomerId('')}>
            Сбросить фильтр
          </button>
        </div>
      ) : (
        <div className="objects-grid">
          {filteredSites.map((site) => (
            <article
              key={site.id}
              className="product-card"
              onClick={() => navigate(`/objects/${site.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter') navigate(`/objects/${site.id}`);
              }}
            >
              <ProductThumb name={site.name} size="lg" />
              <div className="product-card__body">
                <div className="object-card__customer">{getCustomerById(site.customerId)?.name ?? '—'}</div>
                <h3 className="product-card__name">{site.name}</h3>
                <div className="product-card__sku">{site.location}</div>
                <div className="object-card__date">Начало проекта: {formatDate(site.projectStartDate)}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
