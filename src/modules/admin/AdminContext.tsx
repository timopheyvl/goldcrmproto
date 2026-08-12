import { createContext } from 'react';
import type { Customer, Employee, Manager } from '../../data/org';
import type { CustomerInput, EmployeeInput, ManagerInput } from './types';

export interface DeleteGuardResult {
  allowed: boolean;
  reason?: string;
}

export interface AdminContextValue {
  managers: Manager[];
  addManager: (input: ManagerInput) => string;
  updateManager: (managerId: string, patch: Partial<ManagerInput>) => void;
  canDeleteManager: (managerId: string) => DeleteGuardResult;
  deleteManager: (managerId: string) => void;
  /** Email = логин, уникален глобально по менеджерам, представителям (из
   * ObjectsContext) и сотрудникам заказчика. */
  isEmailTaken: (email: string, excludeId?: string) => boolean;

  customers: Customer[];
  addCustomer: (input: CustomerInput) => string;
  updateCustomer: (customerId: string, patch: Partial<CustomerInput>) => void;
  canDeleteCustomer: (customerId: string) => DeleteGuardResult;
  deleteCustomer: (customerId: string) => void;

  employees: Employee[];
  getEmployeesByCustomer: (customerId: string) => Employee[];
  /** Создание сотрудника — привязка к заказчику из контекста, без объекта/службы. */
  addEmployee: (customerId: string, input: EmployeeInput) => string;
  updateEmployee: (employeeId: string, patch: Partial<EmployeeInput>) => void;
  canDeleteEmployee: (employeeId: string) => DeleteGuardResult;
  deleteEmployee: (employeeId: string) => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);
