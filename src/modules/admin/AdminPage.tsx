import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAdmin } from './useAdmin';
import { useObjects } from '../objects/useObjects';
import { AdminTree } from './AdminTree';
import { ManagerPanel } from './ManagerPanel';
import { ManagerCreateForm } from './ManagerCreateForm';
import { CustomerPanel } from './CustomerPanel';
import { CustomerCreateForm } from './CustomerCreateForm';
import { SitePanel } from './SitePanel';
import { SiteCreateForm } from './SiteCreateForm';
import { DepartmentPanel } from './DepartmentPanel';
import { DepartmentCreateForm } from './DepartmentCreateForm';
import { RepresentativePanel } from './RepresentativePanel';
import { RepresentativeCreateForm } from './RepresentativeCreateForm';
import { EmployeePanel } from './EmployeePanel';
import { EmployeeCreateForm } from './EmployeeCreateForm';
import type { AdminSelection } from './selection';
import './admin.css';

function notFound(title: string): ReactNode {
  return (
    <div className="empty-state">
      <div className="empty-state__title">{title}</div>
      <p>Элемент, возможно, был удалён. Выберите другой в дереве слева.</p>
    </div>
  );
}

export function AdminPage() {
  const { managers, customers, employees } = useAdmin();
  const { sites, departments, representatives } = useObjects();
  const [selection, setSelection] = useState<AdminSelection | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['managers-root', 'customers-root']));

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const expand = (key: string) => {
    setExpanded((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  };

  const renderPanel = (): ReactNode => {
    if (!selection) {
      return (
        <div className="empty-state">
          <div className="empty-state__title">Выберите элемент дерева</div>
          <p>
            Слева — сотрудники GoldLink и заказчики с их объектами. Выберите элемент, чтобы посмотреть или
            отредактировать его, либо создайте новый.
          </p>
        </div>
      );
    }

    switch (selection.kind) {
      case 'managers-root':
        return (
          <div className="admin-panel">
            <h2 className="admin-panel__title">Сотрудники GoldLink</h2>
            <p className="admin-panel__subtitle">
              Внутренние менеджеры GoldLink — их логин (email) должен быть уникален среди всех пользователей системы.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                expand('managers-root');
                setSelection({ kind: 'manager-create' });
              }}
            >
              + Добавить менеджера
            </button>
          </div>
        );
      case 'customers-root':
        return (
          <div className="admin-panel">
            <h2 className="admin-panel__title">Заказчики</h2>
            <p className="admin-panel__subtitle">Юрлица заказчиков и их объекты. Службы и пользователи — уровнем ниже.</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                expand('customers-root');
                setSelection({ kind: 'customer-create' });
              }}
            >
              + Добавить заказчика
            </button>
          </div>
        );
      case 'manager': {
        const manager = managers.find((item) => item.id === selection.id);
        if (!manager) return notFound('Менеджер не найден');
        return <ManagerPanel manager={manager} onDeleted={() => setSelection({ kind: 'managers-root' })} />;
      }
      case 'manager-create':
        return (
          <ManagerCreateForm
            onCreated={(id) => {
              expand('managers-root');
              setSelection({ kind: 'manager', id });
            }}
          />
        );
      case 'customer': {
        const customer = customers.find((item) => item.id === selection.id);
        if (!customer) return notFound('Заказчик не найден');
        return <CustomerPanel customer={customer} onDeleted={() => setSelection({ kind: 'customers-root' })} />;
      }
      case 'customer-create':
        return (
          <CustomerCreateForm
            onCreated={(id) => {
              expand('customers-root');
              setSelection({ kind: 'customer', id });
            }}
          />
        );
      case 'site': {
        const site = sites.find((item) => item.id === selection.id);
        if (!site) return notFound('Объект не найден');
        return (
          <SitePanel
            site={site}
            onDeleted={() => setSelection({ kind: 'customer', id: site.customerId })}
          />
        );
      }
      case 'site-create':
        return (
          <SiteCreateForm
            customerId={selection.customerId}
            onCreated={(id) => {
              expand('customers-root');
              expand(`customer:${selection.customerId}`);
              setSelection({ kind: 'site', id });
            }}
          />
        );
      case 'department': {
        const department = departments.find((item) => item.id === selection.id);
        if (!department) return notFound('Служба не найдена');
        return (
          <DepartmentPanel
            department={department}
            onDeleted={() => setSelection({ kind: 'site', id: department.siteId })}
          />
        );
      }
      case 'department-create':
        return (
          <DepartmentCreateForm
            siteId={selection.siteId}
            onCreated={(id) => {
              expand(`site:${selection.siteId}`);
              setSelection({ kind: 'department', id });
            }}
          />
        );
      case 'representative': {
        const representative = representatives.find((item) => item.id === selection.id);
        if (!representative) return notFound('Представитель не найден');
        return (
          <RepresentativePanel
            representative={representative}
            onDeleted={() => setSelection({ kind: 'department', id: representative.departmentId })}
          />
        );
      }
      case 'representative-create':
        return (
          <RepresentativeCreateForm
            departmentId={selection.departmentId}
            onCreated={(id) => {
              expand(`department:${selection.departmentId}`);
              setSelection({ kind: 'representative', id });
            }}
          />
        );
      case 'customer-employees-root': {
        const customer = customers.find((item) => item.id === selection.customerId);
        return (
          <div className="admin-panel">
            <h2 className="admin-panel__title">Сотрудники заказчика</h2>
            <p className="admin-panel__subtitle">
              Заказчик: {customer?.name ?? '—'} · без привязки к объекту или службе, не создают заявки.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                expand(`employees:${selection.customerId}`);
                setSelection({ kind: 'employee-create', customerId: selection.customerId });
              }}
            >
              + Добавить сотрудника
            </button>
          </div>
        );
      }
      case 'employee': {
        const employee = employees.find((item) => item.id === selection.id);
        if (!employee) return notFound('Сотрудник не найден');
        return (
          <EmployeePanel
            employee={employee}
            onDeleted={() => setSelection({ kind: 'customer-employees-root', customerId: employee.customerId })}
          />
        );
      }
      case 'employee-create':
        return (
          <EmployeeCreateForm
            customerId={selection.customerId}
            onCreated={(id) => {
              expand(`employees:${selection.customerId}`);
              setSelection({ kind: 'employee', id });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__tree">
        <AdminTree
          managers={managers}
          customers={customers}
          sites={sites}
          departments={departments}
          representatives={representatives}
          employees={employees}
          selection={selection}
          expanded={expanded}
          onToggle={toggle}
          onExpand={expand}
          onSelect={setSelection}
        />
      </div>
      <div className="admin-page__panel">{renderPanel()}</div>
    </div>
  );
}
