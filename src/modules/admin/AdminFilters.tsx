import './admin.css';

export type RepStatusFilter = 'all' | 'active' | 'inactive';

interface AdminFiltersProps {
  customerQuery: string;
  onCustomerQueryChange: (value: string) => void;
  repStatus: RepStatusFilter;
  onRepStatusChange: (value: RepStatusFilter) => void;
  filtersActive: boolean;
  onReset: () => void;
}

/**
 * Поиск/фильтры над деревом «Заказчики»: поиск заказчика по названию/ИНН и
 * фильтр представителей по статусу. Каскадные фильтры по заказчику/объекту/
 * службе намеренно не делаем — дерево уже даёт такую навигацию, дублировать
 * её отдельными селектами незачем. Сужает дерево (см. вычисление visible*Ids
 * в AdminPage), не ломая каскад — при совпадении показывается вся цепочка предков.
 */
export function AdminFilters({
  customerQuery,
  onCustomerQueryChange,
  repStatus,
  onRepStatusChange,
  filtersActive,
  onReset,
}: AdminFiltersProps) {
  return (
    <div className="admin-tree__filters">
      <input
        type="text"
        className="admin-tree__search"
        placeholder="Поиск заказчика — название или ИНН"
        value={customerQuery}
        onChange={(event) => onCustomerQueryChange(event.target.value)}
      />

      <div className="admin-tree__filters-row">
        <select
          className="filter-select"
          value={repStatus}
          onChange={(event) => onRepStatusChange(event.target.value as RepStatusFilter)}
        >
          <option value="all">Любой статус</option>
          <option value="active">Активные</option>
          <option value="inactive">Неактивные</option>
        </select>

        {filtersActive && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onReset}>
            Сбросить фильтры
          </button>
        )}
      </div>
    </div>
  );
}
