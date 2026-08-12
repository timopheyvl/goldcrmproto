import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AdminContext } from './AdminContext';
import type { AdminContextValue, DeleteGuardResult } from './AdminContext';
import { CUSTOMERS, EMPLOYEES, MANAGERS } from '../../data/org';
import type { Customer, Employee, Manager } from '../../data/org';
import { useObjects } from '../objects/useObjects';
import { useRequests } from '../requests/useRequests';

const CUSTOMERS_STORAGE_KEY = 'goldlink.admin.customers';
const MANAGERS_STORAGE_KEY = 'goldlink.admin.managers';
const EMPLOYEES_STORAGE_KEY = 'goldlink.admin.employees';

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { sites, departments, stages, representatives } = useObjects();
  const { requests } = useRequests();

  const [customers, setCustomers] = useState<Customer[]>(() => readStored(CUSTOMERS_STORAGE_KEY, CUSTOMERS));
  const [managers, setManagers] = useState<Manager[]>(() => readStored(MANAGERS_STORAGE_KEY, MANAGERS));
  const [employees, setEmployees] = useState<Employee[]>(() => readStored(EMPLOYEES_STORAGE_KEY, EMPLOYEES));

  useEffect(() => {
    window.localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    window.localStorage.setItem(MANAGERS_STORAGE_KEY, JSON.stringify(managers));
  }, [managers]);

  useEffect(() => {
    window.localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  const value = useMemo<AdminContextValue>(() => {
    const isEmailTaken: AdminContextValue['isEmailTaken'] = (email, excludeId) => {
      const normalized = email.trim().toLowerCase();
      const matches = (candidateEmail: string, candidateId: string) =>
        candidateId !== excludeId && candidateEmail.trim().toLowerCase() === normalized;
      if (managers.some((manager) => matches(manager.email, manager.id))) return true;
      if (representatives.some((representative) => matches(representative.email, representative.id))) return true;
      return employees.some((employee) => matches(employee.email, employee.id));
    };

    const addManager: AdminContextValue['addManager'] = (input) => {
      const id = `mgr-${Date.now()}`;
      const manager: Manager = { id, ...input };
      setManagers((prev) => [...prev, manager]);
      return id;
    };

    const updateManager: AdminContextValue['updateManager'] = (managerId, patch) => {
      setManagers((prev) => prev.map((manager) => (manager.id === managerId ? { ...manager, ...patch } : manager)));
    };

    const canDeleteManager: AdminContextValue['canDeleteManager'] = (managerId): DeleteGuardResult => {
      const manager = managers.find((item) => item.id === managerId);
      if (!manager) return { allowed: true };
      const reasons: string[] = [];
      const stageCount = stages.filter((stage) => stage.assignee === manager.fullName).length;
      if (stageCount > 0) reasons.push(`ответственный в этапах (${stageCount})`);
      const requestCount = requests.filter((request) =>
        request.versions.some((version) => version.author === manager.fullName),
      ).length;
      if (requestCount > 0) reasons.push(`автор версий в заявках (${requestCount})`);
      if (reasons.length === 0) return { allowed: true };
      return { allowed: false, reason: `Нельзя удалить: ${reasons.join(', ')}` };
    };

    const deleteManager: AdminContextValue['deleteManager'] = (managerId) => {
      if (!canDeleteManager(managerId).allowed) return;
      setManagers((prev) => prev.filter((manager) => manager.id !== managerId));
    };

    const addCustomer: AdminContextValue['addCustomer'] = (input) => {
      const id = `cu-${Date.now()}`;
      const customer: Customer = { id, ...input };
      setCustomers((prev) => [...prev, customer]);
      return id;
    };

    const updateCustomer: AdminContextValue['updateCustomer'] = (customerId, patch) => {
      setCustomers((prev) =>
        prev.map((customer) => (customer.id === customerId ? { ...customer, ...patch } : customer)),
      );
    };

    const canDeleteCustomer: AdminContextValue['canDeleteCustomer'] = (customerId): DeleteGuardResult => {
      const customerSiteIds = new Set(sites.filter((site) => site.customerId === customerId).map((site) => site.id));
      if (customerSiteIds.size > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть объекты (${customerSiteIds.size})` };
      }
      const departmentIds = new Set(
        departments.filter((department) => customerSiteIds.has(department.siteId)).map((department) => department.id),
      );
      const representativeCount = representatives.filter((representative) =>
        departmentIds.has(representative.departmentId),
      ).length;
      if (representativeCount > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть представители (${representativeCount})` };
      }
      const employeeCount = employees.filter((employee) => employee.customerId === customerId).length;
      if (employeeCount > 0) {
        return { allowed: false, reason: `Нельзя удалить: есть сотрудники заказчика (${employeeCount})` };
      }
      return { allowed: true };
    };

    const deleteCustomer: AdminContextValue['deleteCustomer'] = (customerId) => {
      if (!canDeleteCustomer(customerId).allowed) return;
      setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
    };

    const getEmployeesByCustomer: AdminContextValue['getEmployeesByCustomer'] = (customerId) =>
      employees.filter((employee) => employee.customerId === customerId);

    const addEmployee: AdminContextValue['addEmployee'] = (customerId, input) => {
      const id = `emp-${Date.now()}`;
      const employee: Employee = { id, customerId, ...input };
      setEmployees((prev) => [...prev, employee]);
      return id;
    };

    const updateEmployee: AdminContextValue['updateEmployee'] = (employeeId, patch) => {
      setEmployees((prev) => prev.map((employee) => (employee.id === employeeId ? { ...employee, ...patch } : employee)));
    };

    // Сотрудник заказчика не привязан к объекту/службе и не создаёт заявки —
    // в текущей доменной модели ни одна сущность на него не ссылается,
    // поэтому удаление ничем не блокируется.
    const canDeleteEmployee: AdminContextValue['canDeleteEmployee'] = () => ({ allowed: true });

    const deleteEmployee: AdminContextValue['deleteEmployee'] = (employeeId) => {
      setEmployees((prev) => prev.filter((employee) => employee.id !== employeeId));
    };

    return {
      managers,
      addManager,
      updateManager,
      canDeleteManager,
      deleteManager,
      isEmailTaken,
      customers,
      addCustomer,
      updateCustomer,
      canDeleteCustomer,
      deleteCustomer,
      employees,
      getEmployeesByCustomer,
      addEmployee,
      updateEmployee,
      canDeleteEmployee,
      deleteEmployee,
    };
  }, [customers, managers, employees, sites, departments, representatives, stages, requests]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
