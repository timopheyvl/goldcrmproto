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
  /** Мягкое отключение — не удаление; связи и история сохраняются. */
  setManagerActive: (managerId: string, active: boolean) => void;
  canDeleteManager: (managerId: string) => DeleteGuardResult;
  deleteManager: (managerId: string) => void;
  /** Email = логин, уникален глобально по менеджерам, представителям (из
   * ObjectsContext) и сотрудникам заказчика. */
  isEmailTaken: (email: string, excludeId?: string) => boolean;

  customers: Customer[];
  addCustomer: (input: CustomerInput) => string;
  updateCustomer: (customerId: string, patch: Partial<CustomerInput>) => void;
  /** Мягкое отключение — не удаление, не каскадное (объекты/службы/представители остаются как есть). */
  setCustomerActive: (customerId: string, active: boolean) => void;
  canDeleteCustomer: (customerId: string) => DeleteGuardResult;
  deleteCustomer: (customerId: string) => void;

  employees: Employee[];
  getEmployeesByCustomer: (customerId: string) => Employee[];
  /** Создание сотрудника — привязка к заказчику из контекста, без объекта/службы. */
  addEmployee: (customerId: string, input: EmployeeInput) => string;
  updateEmployee: (employeeId: string, patch: Partial<EmployeeInput>) => void;
  /** Мягкое отключение — не удаление; связи и история сохраняются. */
  setEmployeeActive: (employeeId: string, active: boolean) => void;
  canDeleteEmployee: (employeeId: string) => DeleteGuardResult;
  deleteEmployee: (employeeId: string) => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);
