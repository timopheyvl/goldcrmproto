import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useRequests } from './useRequests';
import { StatusBadge } from './StatusBadge';
import { getScopedRequests } from './scope';
import { REQUEST_STATUSES, REQUEST_STATUS_LABELS } from './types';
import type { RequestStatus } from './types';
import { CUSTOMERS, getCustomerById, getDepartmentById, getSiteById } from '../../data/org';
import './requests.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

export function RequestsPage() {
  const { role } = useRole();
  const navigate = useNavigate();
  const { requests } = useRequests();
  const isManager = role === 'manager';

  const scopedRequests = useMemo(() => getScopedRequests(role, requests), [role, requests]);

  const [statusFilter, setStatusFilter] = useState<RequestStatus[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, [role]);

  const customerOptions = useMemo(() => {
    const ids = new Set(scopedRequests.map((request) => request.customerId));
    return CUSTOMERS.filter((customer) => ids.has(customer.id));
  }, [scopedRequests]);

  const siteOptions = useMemo(() => {
    const ids = new Set(scopedRequests.map((request) => request.siteId));
    return Array.from(ids)
      .map((siteIdValue) => getSiteById(siteIdValue))
      .filter((site): site is NonNullable<typeof site> => Boolean(site))
      .filter((site) => !customerId || site.customerId === customerId)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [scopedRequests, customerId]);

  const departmentOptions = useMemo(() => {
    const ids = new Set(scopedRequests.map((request) => request.departmentId));
    return Array.from(ids)
      .map((departmentIdValue) => getDepartmentById(departmentIdValue))
      .filter((department): department is NonNullable<typeof department> => Boolean(department))
      .filter((department) => !siteId || department.siteId === siteId)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [scopedRequests, siteId]);

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    setSiteId('');
    setDepartmentId('');
  };

  const handleSiteChange = (value: string) => {
    setSiteId(value);
    setDepartmentId('');
  };

  const toggleStatus = (status: RequestStatus) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]));
  };

  const filteredRequests = useMemo(() => {
    return scopedRequests
      .filter((request) => {
        if (statusFilter.length > 0 && !statusFilter.includes(request.status)) return false;
        if (customerId && request.customerId !== customerId) return false;
        if (siteId && request.siteId !== siteId) return false;
        if (departmentId && request.departmentId !== departmentId) return false;
        if (dateFrom && request.createdAt.slice(0, 10) < dateFrom) return false;
        if (dateTo && request.createdAt.slice(0, 10) > dateTo) return false;
        return true;
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [scopedRequests, statusFilter, customerId, siteId, departmentId, dateFrom, dateTo]);

  const filtersActive =
    statusFilter.length > 0 ||
    Boolean(customerId) ||
    Boolean(siteId) ||
    Boolean(departmentId) ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  const resetFilters = () => {
    setStatusFilter([]);
    setCustomerId('');
    setSiteId('');
    setDepartmentId('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="requests-page">
      <div className="requests-page__filters">
        <div className="status-pills">
          {REQUEST_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={statusFilter.includes(status) ? 'status-pill status-pill--active' : 'status-pill'}
              onClick={() => toggleStatus(status)}
            >
              {REQUEST_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        <div className="requests-page__filters-row">
          {isManager && (
            <>
              <select className="filter-select" value={customerId} onChange={(event) => handleCustomerChange(event.target.value)}>
                <option value="">Все заказчики</option>
                {customerOptions.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>

              <select className="filter-select" value={siteId} onChange={(event) => handleSiteChange(event.target.value)}>
                <option value="">Все объекты</option>
                {siteOptions.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>

              <select className="filter-select" value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
                <option value="">Все службы</option>
                {departmentOptions.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            type="date"
            className="filter-date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            aria-label="Дата с"
          />
          <span className="requests-page__date-separator">—</span>
          <input
            type="date"
            className="filter-date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            aria-label="Дата по"
          />

          {filtersActive && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={resetFilters}>
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <table className="requests-table">
          <tbody>
            {Array.from({ length: 4 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 6 }).map((__, cellIndex) => (
                  <td key={cellIndex}>
                    <div className="skeleton-bar" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : scopedRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Заявок пока нет</div>
          <p>Заявки появятся здесь после того как представитель сформирует их из корзины каталога.</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Ничего не найдено</div>
          <p>По выбранным фильтрам заявок не найдено. Попробуйте изменить условия.</p>
          <button type="button" className="btn btn--secondary" onClick={resetFilters}>
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <table className="requests-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Заказчик</th>
              <th>Объект</th>
              <th>Служба</th>
              <th>Дата</th>
              <th>Позиций</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id} onClick={() => navigate(`/requests/${request.id}`)}>
                <td>{request.number}</td>
                <td>{getCustomerById(request.customerId)?.name ?? '—'}</td>
                <td>{getSiteById(request.siteId)?.name ?? '—'}</td>
                <td>{getDepartmentById(request.departmentId)?.name ?? '—'}</td>
                <td>{formatDate(request.createdAt)}</td>
                <td>{request.items.length}</td>
                <td>
                  <StatusBadge status={request.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
