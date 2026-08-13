import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useVendors } from './useVendors';
import { CATEGORIES, PRODUCTS } from './data';
import './catalog.css';

interface BarRowData {
  id: string;
  label: string;
  count: number;
}

function BarList({ rows, emptyText }: { rows: BarRowData[]; emptyText: string }) {
  if (rows.length === 0) {
    return <p className="stats-list__empty">{emptyText}</p>;
  }
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <div className="stats-list">
      {rows.map((row) => (
        <div className="stats-list__row" key={row.id}>
          <span className="stats-list__label">{row.label}</span>
          <span className="stats-bar">
            <span className="stats-bar__fill" style={{ width: `${(row.count / max) * 100}%` }} />
          </span>
          <span className="stats-list__count">{row.count}</span>
        </div>
      ))}
    </div>
  );
}

export function StatsPage() {
  const { role } = useRole();
  const { vendors } = useVendors();

  const vendorRows = useMemo<BarRowData[]>(
    () =>
      vendors
        .map((vendor) => ({
          id: vendor.id,
          label: vendor.name,
          count: PRODUCTS.filter((product) => product.vendorId === vendor.id).length,
        }))
        .sort((a, b) => b.count - a.count),
    [vendors],
  );

  const categoryRows = useMemo<BarRowData[]>(
    () =>
      CATEGORIES.map((category) => ({
        id: category.id,
        label: category.name,
        count: PRODUCTS.filter((product) => product.categoryId === category.id).length,
      }))
        .filter((row) => row.count > 0)
        .sort((a, b) => b.count - a.count),
    [],
  );

  if (role !== 'manager') {
    return <Navigate to="/catalog" replace />;
  }

  return (
    <div className="stats-page">
      <div className="import-page__breadcrumb">
        <Link to="/catalog">Каталог</Link> / Техническая статистика
      </div>
      <h1 className="import-page__title">Техническая статистика</h1>

      <div className="stats-page__totals">
        <div className="summary-card summary-card--lg">
          <div className="summary-card__value">{vendors.length}</div>
          <div className="summary-card__label">Вендоров</div>
        </div>
        <div className="summary-card summary-card--lg">
          <div className="summary-card__value">{PRODUCTS.length}</div>
          <div className="summary-card__label">Товаров</div>
        </div>
        <div className="summary-card summary-card--lg">
          <div className="summary-card__value">{CATEGORIES.length}</div>
          <div className="summary-card__label">Категорий</div>
        </div>
      </div>

      <section className="stats-section">
        <h2 className="stats-section__title">Товары по вендорам</h2>
        <BarList rows={vendorRows} emptyText="Вендоры пока не добавлены." />
      </section>

      <section className="stats-section">
        <h2 className="stats-section__title">Товары по категориям</h2>
        <BarList rows={categoryRows} emptyText="Товары пока не загружены." />
      </section>
    </div>
  );
}
