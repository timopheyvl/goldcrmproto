import { useMemo } from 'react';
import { useObjects } from '../modules/objects/useObjects';
import { useAdmin } from '../modules/admin/useAdmin';
import { CURRENT_EMPLOYEE_ID, CURRENT_REPRESENTATIVE_ID } from './org';
import type { RepresentativeScope } from './org';

/**
 * Единая точка чтения справочных сущностей (заказчики/объекты/службы/
 * представители/сотрудники/менеджеры) для всех модулей — данные всегда
 * читаются из живого стора («Управление» + «Объекты»), а не из моков
 * src/data/org.ts. Правка сущности в «Управлении» сразу видна всюду, где
 * используется этот хук.
 */
export function useEntities() {
  const { customers, managers, employees } = useAdmin();
  const { sites, departments, representatives } = useObjects();

  return useMemo(() => {
    const getCustomerById = (id: string) => customers.find((customer) => customer.id === id);
    const getSiteById = (id: string) => sites.find((site) => site.id === id);
    const getDepartmentById = (id: string) => departments.find((department) => department.id === id);
    const getRepresentativeById = (id: string) => representatives.find((representative) => representative.id === id);
    const getEmployeeById = (id: string) => employees.find((employee) => employee.id === id);
    const getManagerById = (id: string) => managers.find((manager) => manager.id === id);

    const getSitesByCustomer = (customerId: string) => sites.filter((site) => site.customerId === customerId);
    const getDepartmentsBySite = (siteId: string) => departments.filter((department) => department.siteId === siteId);
    const getEmployeesByCustomer = (customerId: string) =>
      employees.filter((employee) => employee.customerId === customerId);

    /** Представители всех объектов/служб данного заказчика — для полей вида
     * «ответственный из пользователей своего заказчика». */
    const getRepresentativesByCustomer = (customerId: string) => {
      const departmentIds = new Set(
        getSitesByCustomer(customerId).flatMap((site) => getDepartmentsBySite(site.id).map((department) => department.id)),
      );
      return representatives.filter((representative) => departmentIds.has(representative.departmentId));
    };

    const getRepresentativeScope = (representativeId: string): RepresentativeScope | null => {
      const representative = getRepresentativeById(representativeId);
      if (!representative) return null;
      const department = getDepartmentById(representative.departmentId);
      if (!department) return null;
      const site = getSiteById(department.siteId);
      if (!site) return null;
      return { customerId: site.customerId, siteId: site.id, departmentId: department.id };
    };

    return {
      customers,
      managers,
      employees,
      sites,
      departments,
      representatives,
      getCustomerById,
      getSiteById,
      getDepartmentById,
      getRepresentativeById,
      getEmployeeById,
      getManagerById,
      getSitesByCustomer,
      getDepartmentsBySite,
      getEmployeesByCustomer,
      getRepresentativesByCustomer,
      getRepresentativeScope,
      currentRepresentativeId: CURRENT_REPRESENTATIVE_ID,
      currentEmployeeId: CURRENT_EMPLOYEE_ID,
      currentRepresentative: getRepresentativeById(CURRENT_REPRESENTATIVE_ID),
      currentEmployee: getEmployeeById(CURRENT_EMPLOYEE_ID),
    };
  }, [customers, managers, employees, sites, departments, representatives]);
}
