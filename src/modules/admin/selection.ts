export type AdminSelection =
  | { kind: 'managers-root' }
  | { kind: 'manager'; id: string }
  | { kind: 'manager-create' }
  | { kind: 'customers-root' }
  | { kind: 'customer'; id: string }
  | { kind: 'customer-create' }
  | { kind: 'site'; id: string }
  | { kind: 'site-create'; customerId: string }
  | { kind: 'department'; id: string }
  | { kind: 'department-create'; siteId: string }
  | { kind: 'representative'; id: string }
  | { kind: 'representative-create'; departmentId: string }
  | { kind: 'customer-employees-root'; customerId: string }
  | { kind: 'employee'; id: string }
  | { kind: 'employee-create'; customerId: string };
