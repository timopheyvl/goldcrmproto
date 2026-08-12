export interface Customer {
  id: string;
  name: string;
  inn: string;
}

export interface Site {
  id: string;
  customerId: string;
  name: string;
}

export interface Department {
  id: string;
  siteId: string;
  name: string;
}

export interface Representative {
  id: string;
  departmentId: string;
  fullName: string;
}

export const CUSTOMERS: Customer[] = [
  { id: 'cu-1', name: 'АО «Кузбассуголь»', inn: '4205123456' },
  { id: 'cu-2', name: 'ООО «Сибруда»', inn: '5406987654' },
  { id: 'cu-3', name: 'ПАО «Дальресурс»', inn: '8401112233' },
];

export const SITES: Site[] = [
  { id: 's-1', customerId: 'cu-1', name: 'Шахта «Распадская-2»' },
  { id: 's-2', customerId: 'cu-1', name: 'Обогатительная фабрика «Кузбасская»' },
  { id: 's-3', customerId: 'cu-2', name: 'ГОК «Сибирский»' },
  { id: 's-4', customerId: 'cu-2', name: 'Рудник «Восточный»' },
  { id: 's-5', customerId: 'cu-3', name: 'Шахта «Северная»' },
];

export const DEPARTMENTS: Department[] = [
  { id: 'd-1', siteId: 's-1', name: 'Служба главного механика' },
  { id: 'd-2', siteId: 's-1', name: 'Служба главного энергетика' },
  { id: 'd-3', siteId: 's-2', name: 'Служба снабжения' },
  { id: 'd-4', siteId: 's-3', name: 'Служба главного механика' },
  { id: 'd-5', siteId: 's-4', name: 'Служба энергетика' },
  { id: 'd-6', siteId: 's-5', name: 'Служба снабжения' },
];

export const REPRESENTATIVES: Representative[] = [
  { id: 'rep-1', departmentId: 'd-1', fullName: 'Терехов Игорь Валерьевич' },
  { id: 'rep-2', departmentId: 'd-4', fullName: 'Симонова Анна Дмитриевна' },
  { id: 'rep-3', departmentId: 'd-6', fullName: 'Костров Павел Николаевич' },
  { id: 'rep-4', departmentId: 'd-5', fullName: 'Уварова Мария Сергеевна' },
];

/**
 * Прототип не реализует аутентификацию — роль переключается мок-селектором.
 * Для сценариев, завязанных на профиль конкретного представителя (скоуп
 * заявок, авто-атрибуция при создании), считаем «текущим» этого представителя.
 */
export const CURRENT_REPRESENTATIVE_ID = 'rep-1';

export function getCustomerById(id: string): Customer | undefined {
  return CUSTOMERS.find((customer) => customer.id === id);
}

export function getSiteById(id: string): Site | undefined {
  return SITES.find((site) => site.id === id);
}

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((department) => department.id === id);
}

export function getRepresentativeById(id: string): Representative | undefined {
  return REPRESENTATIVES.find((representative) => representative.id === id);
}

export function getSitesByCustomer(customerId: string): Site[] {
  return SITES.filter((site) => site.customerId === customerId);
}

export function getDepartmentsBySite(siteId: string): Department[] {
  return DEPARTMENTS.filter((department) => department.siteId === siteId);
}

export interface RepresentativeScope {
  customerId: string;
  siteId: string;
  departmentId: string;
}

export function getRepresentativeScope(representativeId: string): RepresentativeScope | null {
  const representative = getRepresentativeById(representativeId);
  if (!representative) return null;
  const department = getDepartmentById(representative.departmentId);
  if (!department) return null;
  const site = getSiteById(department.siteId);
  if (!site) return null;
  return { customerId: site.customerId, siteId: site.id, departmentId: department.id };
}
