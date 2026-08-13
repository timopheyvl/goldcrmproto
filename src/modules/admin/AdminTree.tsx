import type { Customer, Department, Employee, Manager, Representative, Site } from '../../data/org';
import type { AdminSelection } from './selection';
import './admin.css';

interface AdminTreeProps {
  activeTab: 'customers' | 'managers';
  managers: Manager[];
  customers: Customer[];
  sites: Site[];
  departments: Department[];
  representatives: Representative[];
  employees: Employee[];
  selection: AdminSelection | null;
  expanded: Set<string>;
  onToggle: (key: string) => void;
  /** Гарантированно раскрывает узел (без сворачивания) — используется при клике по узлу, а не по стрелке. */
  onExpand: (key: string) => void;
  onSelect: (selection: AdminSelection) => void;
  /** null — фильтр не активен, показываем всё. Иначе — множество id, прошедших фильтр (с учётом каскада). */
  visibleCustomerIds: Set<string> | null;
  visibleSiteIds: Set<string> | null;
  visibleDepartmentIds: Set<string> | null;
  visibleRepresentativeIds: Set<string> | null;
  /** Пока активен поиск/фильтр — все узлы дерева принудительно развёрнуты. */
  filtersActive: boolean;
}

function isActive(selection: AdminSelection | null, candidate: AdminSelection): boolean {
  if (!selection) return false;
  if (selection.kind !== candidate.kind) return false;
  if ('id' in selection && 'id' in candidate) return selection.id === candidate.id;
  if ('siteId' in selection && 'siteId' in candidate) return selection.siteId === candidate.siteId;
  if ('departmentId' in selection && 'departmentId' in candidate) return selection.departmentId === candidate.departmentId;
  if ('customerId' in selection && 'customerId' in candidate) return selection.customerId === candidate.customerId;
  return true;
}

function itemClass(active: boolean, entityActive: boolean): string {
  const classes = ['admin-tree__item'];
  if (active) classes.push('admin-tree__item--active');
  if (!entityActive) classes.push('admin-tree__item--inactive');
  return classes.join(' ');
}

export function AdminTree({
  activeTab,
  managers,
  customers,
  sites,
  departments,
  representatives,
  employees,
  selection,
  expanded,
  onToggle,
  onExpand,
  onSelect,
  visibleCustomerIds,
  visibleSiteIds,
  visibleDepartmentIds,
  visibleRepresentativeIds,
  filtersActive,
}: AdminTreeProps) {
  const isOpen = (key: string) => (filtersActive ? true : expanded.has(key));

  if (activeTab === 'managers') {
    return (
      <nav className="admin-tree" aria-label="Сотрудники GoldLink">
        <button
          type="button"
          className={
            isActive(selection, { kind: 'managers-root' })
              ? 'admin-tree__item admin-tree__item--root admin-tree__item--active'
              : 'admin-tree__item admin-tree__item--root'
          }
          onClick={() => onSelect({ kind: 'managers-root' })}
        >
          Сотрудники GoldLink
          <span className="admin-tree__count">{managers.length}</span>
        </button>
        <ul className="admin-tree__list">
          {managers.length === 0 && <li className="admin-tree__empty-hint">Менеджеров пока нет</li>}
          {managers.map((manager) => (
            <li key={manager.id}>
              <button
                type="button"
                className={itemClass(isActive(selection, { kind: 'manager', id: manager.id }), manager.active)}
                onClick={() => onSelect({ kind: 'manager', id: manager.id })}
              >
                <span>{manager.fullName}</span>
                {!manager.active && <span className="admin-tree__badge--inactive">неактивен</span>}
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="admin-tree__add-row" onClick={() => onSelect({ kind: 'manager-create' })}>
              + Добавить менеджера
            </button>
          </li>
        </ul>
      </nav>
    );
  }

  const visibleCustomers = customers.filter((customer) => !visibleCustomerIds || visibleCustomerIds.has(customer.id));

  return (
    <nav className="admin-tree" aria-label="Заказчики">
      <button
        type="button"
        className={
          isActive(selection, { kind: 'customers-root' })
            ? 'admin-tree__item admin-tree__item--root admin-tree__item--active'
            : 'admin-tree__item admin-tree__item--root'
        }
        onClick={() => onSelect({ kind: 'customers-root' })}
      >
        Заказчики
        <span className="admin-tree__count">{visibleCustomers.length}</span>
      </button>
      <ul className="admin-tree__list">
        {visibleCustomers.length === 0 && <li className="admin-tree__empty-hint">Ничего не найдено</li>}
        {visibleCustomers.map((customer) => {
          const customerKey = `customer:${customer.id}`;
          const customerOpen = isOpen(customerKey);
          const customerSites = sites.filter(
            (site) => site.customerId === customer.id && (!visibleSiteIds || visibleSiteIds.has(site.id)),
          );
          const employeesKey = `employees:${customer.id}`;
          const employeesOpen = isOpen(employeesKey);
          const customerEmployees = employees.filter((employee) => employee.customerId === customer.id);
          return (
            <li key={customer.id}>
              <div className="admin-tree__row">
                <button
                  type="button"
                  className="admin-tree__toggle"
                  onClick={() => onToggle(customerKey)}
                  aria-label={customerOpen ? 'Свернуть' : 'Развернуть'}
                  aria-expanded={customerOpen}
                >
                  {customerOpen ? '▾' : '▸'}
                </button>
                <button
                  type="button"
                  className={itemClass(isActive(selection, { kind: 'customer', id: customer.id }), customer.active)}
                  onClick={() => {
                    onExpand(customerKey);
                    onSelect({ kind: 'customer', id: customer.id });
                  }}
                >
                  <span>{customer.name}</span>
                  {!customer.active && <span className="admin-tree__badge--inactive">неактивен</span>}
                  <span className="admin-tree__count">{customerSites.length}</span>
                </button>
              </div>
              {customerOpen && (
                <ul className="admin-tree__list admin-tree__list--nested">
                  {customerSites.length === 0 && <li className="admin-tree__empty-hint">Объектов пока нет</li>}
                  {customerSites.map((site) => {
                    const siteKey = `site:${site.id}`;
                    const siteOpen = isOpen(siteKey);
                    const siteDepartments = departments.filter(
                      (department) =>
                        department.siteId === site.id && (!visibleDepartmentIds || visibleDepartmentIds.has(department.id)),
                    );
                    return (
                      <li key={site.id}>
                        <div className="admin-tree__row">
                          <button
                            type="button"
                            className="admin-tree__toggle"
                            onClick={() => onToggle(siteKey)}
                            aria-label={siteOpen ? 'Свернуть' : 'Развернуть'}
                            aria-expanded={siteOpen}
                          >
                            {siteOpen ? '▾' : '▸'}
                          </button>
                          <button
                            type="button"
                            className={itemClass(isActive(selection, { kind: 'site', id: site.id }), true)}
                            onClick={() => {
                              onExpand(siteKey);
                              onSelect({ kind: 'site', id: site.id });
                            }}
                          >
                            <span>{site.name}</span>
                          </button>
                        </div>
                        {siteOpen && (
                          <ul className="admin-tree__list admin-tree__list--nested">
                            {siteDepartments.length === 0 && <li className="admin-tree__empty-hint">Служб пока нет</li>}
                            {siteDepartments.map((department) => {
                              const departmentKey = `department:${department.id}`;
                              const departmentOpen = isOpen(departmentKey);
                              const departmentReps = representatives.filter(
                                (representative) =>
                                  representative.departmentId === department.id &&
                                  (!visibleRepresentativeIds || visibleRepresentativeIds.has(representative.id)),
                              );
                              return (
                                <li key={department.id}>
                                  <div className="admin-tree__row">
                                    <button
                                      type="button"
                                      className="admin-tree__toggle"
                                      onClick={() => onToggle(departmentKey)}
                                      aria-label={departmentOpen ? 'Свернуть' : 'Развернуть'}
                                      aria-expanded={departmentOpen}
                                    >
                                      {departmentOpen ? '▾' : '▸'}
                                    </button>
                                    <button
                                      type="button"
                                      className={itemClass(
                                        isActive(selection, { kind: 'department', id: department.id }),
                                        true,
                                      )}
                                      onClick={() => {
                                        onExpand(departmentKey);
                                        onSelect({ kind: 'department', id: department.id });
                                      }}
                                    >
                                      <span>{department.name}</span>
                                      <span className="admin-tree__count">{departmentReps.length}</span>
                                    </button>
                                  </div>
                                  {departmentOpen && (
                                    <ul className="admin-tree__list admin-tree__list--nested">
                                      {departmentReps.length === 0 && (
                                        <li className="admin-tree__empty-hint">Представителей пока нет</li>
                                      )}
                                      {departmentReps.map((representative) => (
                                        <li key={representative.id}>
                                          <button
                                            type="button"
                                            className={itemClass(
                                              isActive(selection, { kind: 'representative', id: representative.id }),
                                              representative.active,
                                            )}
                                            onClick={() => onSelect({ kind: 'representative', id: representative.id })}
                                          >
                                            <span>{representative.fullName}</span>
                                            {!representative.active && (
                                              <span className="admin-tree__badge--inactive">неактивен</span>
                                            )}
                                          </button>
                                        </li>
                                      ))}
                                      <li>
                                        <button
                                          type="button"
                                          className="admin-tree__add-row"
                                          onClick={() =>
                                            onSelect({ kind: 'representative-create', departmentId: department.id })
                                          }
                                        >
                                          + Добавить представителя
                                        </button>
                                      </li>
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                            <li>
                              <button
                                type="button"
                                className="admin-tree__add-row"
                                onClick={() => onSelect({ kind: 'department-create', siteId: site.id })}
                              >
                                + Добавить службу
                              </button>
                            </li>
                          </ul>
                        )}
                      </li>
                    );
                  })}
                  <li>
                    <button
                      type="button"
                      className="admin-tree__add-row"
                      onClick={() => onSelect({ kind: 'site-create', customerId: customer.id })}
                    >
                      + Добавить объект
                    </button>
                  </li>

                  {/* Сотрудники заказчика — отдельный подузел, вне каскада объект/служба */}
                  <li>
                    <div className="admin-tree__row">
                      <button
                        type="button"
                        className="admin-tree__toggle"
                        onClick={() => onToggle(employeesKey)}
                        aria-label={employeesOpen ? 'Свернуть' : 'Развернуть'}
                        aria-expanded={employeesOpen}
                      >
                        {employeesOpen ? '▾' : '▸'}
                      </button>
                      <button
                        type="button"
                        className={itemClass(
                          isActive(selection, { kind: 'customer-employees-root', customerId: customer.id }),
                          true,
                        )}
                        onClick={() => {
                          onExpand(employeesKey);
                          onSelect({ kind: 'customer-employees-root', customerId: customer.id });
                        }}
                      >
                        <span>Сотрудники заказчика</span>
                        <span className="admin-tree__count">{customerEmployees.length}</span>
                      </button>
                    </div>
                    {employeesOpen && (
                      <ul className="admin-tree__list admin-tree__list--nested">
                        {customerEmployees.length === 0 && <li className="admin-tree__empty-hint">Сотрудников пока нет</li>}
                        {customerEmployees.map((employee) => (
                          <li key={employee.id}>
                            <button
                              type="button"
                              className={itemClass(isActive(selection, { kind: 'employee', id: employee.id }), employee.active)}
                              onClick={() => onSelect({ kind: 'employee', id: employee.id })}
                            >
                              <span>{employee.fullName}</span>
                              {!employee.active && <span className="admin-tree__badge--inactive">неактивен</span>}
                            </button>
                          </li>
                        ))}
                        <li>
                          <button
                            type="button"
                            className="admin-tree__add-row"
                            onClick={() => onSelect({ kind: 'employee-create', customerId: customer.id })}
                          >
                            + Добавить сотрудника
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>
                </ul>
              )}
            </li>
          );
        })}
        <li>
          <button type="button" className="admin-tree__add-row" onClick={() => onSelect({ kind: 'customer-create' })}>
            + Добавить заказчика
          </button>
        </li>
      </ul>
    </nav>
  );
}
