export interface Customer {
  id: string;
  name: string;
  inn: string;
  contactPerson: string;
  /** Контактный email заказчика — не логин, уникальность не проверяется. */
  email: string;
  phone: string;
  address: string;
  comment: string;
}

export interface Manager {
  id: string;
  fullName: string;
  /** Email = логин; уникален глобально по всем ролям (см. isManagerEmailTaken в модуле «Управление»). */
  email: string;
  phone: string;
  position: string;
}

export interface Site {
  id: string;
  customerId: string;
  name: string;
  description: string;
  location: string;
  /** Строка "широта, долгота" — прототип не интегрирует карту, только текст. */
  geo: string;
  /** Дата начала проекта, YYYY-MM-DD. */
  projectStartDate: string;
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
  /** Email = логин; уникален глобально по всем ролям (менеджеры/представители/сотрудники). */
  email: string;
  phone: string;
  position: string;
}

export interface Employee {
  id: string;
  /** Сотрудник заказчика не привязан к объекту/службе — только к заказчику. */
  customerId: string;
  fullName: string;
  /** Email = логин; уникален глобально по всем ролям. */
  email: string;
  phone: string;
  position: string;
}

export const CUSTOMERS: Customer[] = [
  {
    id: 'cu-1',
    name: 'АО «Кузбассуголь»',
    inn: '4205123456',
    contactPerson: 'Логинов Сергей Петрович',
    email: 's.loginov@kuzbassugol.ru',
    phone: '+7 (3842) 55-10-20',
    address: '652600, Кемеровская область, г. Междуреченск, ул. Кузнецкая, 12',
    comment: '',
  },
  {
    id: 'cu-2',
    name: 'ООО «Сибруда»',
    inn: '5406987654',
    contactPerson: 'Ильина Ольга Андреевна',
    email: 'o.ilina@sibruda.ru',
    phone: '+7 (383) 220-45-67',
    address: '630032, Новосибирская область, г. Искитим, ул. Заводская, 5',
    comment: '',
  },
  {
    id: 'cu-3',
    name: 'ПАО «Дальресурс»',
    inn: '8401112233',
    contactPerson: 'Гончаров Виктор Анатольевич',
    email: 'v.goncharov@dalresurs.ru',
    phone: '+7 (4212) 33-77-01',
    address: '680000, Хабаровский край, п. Чегдомын, ул. Горная, 8',
    comment: 'Ключевой заказчик по угольному направлению',
  },
];

export const MANAGERS: Manager[] = [
  {
    id: 'mgr-1',
    fullName: 'Соколова Елена Викторовна',
    email: 'e.sokolova@goldlink.ru',
    phone: '+7 (495) 700-11-22',
    position: 'Менеджер по проектам',
  },
  {
    id: 'mgr-2',
    fullName: 'Волков Артём Сергеевич',
    email: 'a.volkov@goldlink.ru',
    phone: '+7 (495) 700-11-23',
    position: 'Менеджер по продажам',
  },
  {
    id: 'mgr-3',
    fullName: 'Ковалёва Наталья Игоревна',
    email: 'n.kovaleva@goldlink.ru',
    phone: '+7 (495) 700-11-24',
    position: 'Технический менеджер',
  },
];

export const SITES: Site[] = [
  {
    id: 's-1',
    customerId: 'cu-1',
    name: 'Шахта «Распадская-2»',
    description: 'Подземная добыча коксующегося угля, действующий горный отвод.',
    location: 'Кемеровская область, г. Междуреченск',
    geo: '53.6935, 88.0637',
    projectStartDate: '2025-03-10',
  },
  {
    id: 's-2',
    customerId: 'cu-1',
    name: 'Обогатительная фабрика «Кузбасская»',
    description: 'Обогащение угля, поставляемого с шахт группы.',
    location: 'Кемеровская область, г. Прокопьевск',
    geo: '53.9057, 86.7194',
    projectStartDate: '2025-05-20',
  },
  {
    id: 's-3',
    customerId: 'cu-2',
    name: 'ГОК «Сибирский»',
    description: 'Открытая добыча и первичное обогащение железной руды.',
    location: 'Новосибирская область, г. Искитим',
    geo: '54.6403, 83.3039',
    projectStartDate: '2025-01-15',
  },
  {
    id: 's-4',
    customerId: 'cu-2',
    name: 'Рудник «Восточный»',
    description: 'Подземная добыча полиметаллических руд.',
    location: 'Новосибирская область, п. Линёво',
    geo: '54.5062, 83.4361',
    projectStartDate: '2025-07-01',
  },
  {
    id: 's-5',
    customerId: 'cu-3',
    name: 'Шахта «Северная»',
    description: 'Подземная добыча угля, обособленный участок.',
    location: 'Хабаровский край, п. Чегдомын',
    geo: '51.1319, 132.9522',
    projectStartDate: '2025-09-05',
  },
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
  {
    id: 'rep-1',
    departmentId: 'd-1',
    fullName: 'Терехов Игорь Валерьевич',
    email: 'i.terehov@kuzbassugol.ru',
    phone: '+7 (3842) 55-10-31',
    position: 'Главный механик',
  },
  {
    id: 'rep-2',
    departmentId: 'd-4',
    fullName: 'Симонова Анна Дмитриевна',
    email: 'a.simonova@sibruda.ru',
    phone: '+7 (383) 220-45-71',
    position: 'Главный механик',
  },
  {
    id: 'rep-3',
    departmentId: 'd-6',
    fullName: 'Костров Павел Николаевич',
    email: 'p.kostrov@dalresurs.ru',
    phone: '+7 (4212) 33-77-11',
    position: 'Начальник снабжения',
  },
  {
    id: 'rep-4',
    departmentId: 'd-5',
    fullName: 'Уварова Мария Сергеевна',
    email: 'm.uvarova@sibruda.ru',
    phone: '+7 (383) 220-45-72',
    position: 'Главный энергетик',
  },
];

export const EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    customerId: 'cu-1',
    fullName: 'Дьячков Роман Олегович',
    email: 'r.dyachkov@kuzbassugol.ru',
    phone: '+7 (3842) 55-10-40',
    position: 'Специалист по снабжению',
  },
  {
    id: 'emp-2',
    customerId: 'cu-3',
    fullName: 'Фролова Ксения Андреевна',
    email: 'k.frolova@dalresurs.ru',
    phone: '+7 (4212) 33-77-20',
    position: 'Секретарь',
  },
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

export function getManagerById(id: string): Manager | undefined {
  return MANAGERS.find((manager) => manager.id === id);
}

export function getEmployeeById(id: string): Employee | undefined {
  return EMPLOYEES.find((employee) => employee.id === id);
}

export function getEmployeesByCustomer(customerId: string): Employee[] {
  return EMPLOYEES.filter((employee) => employee.customerId === customerId);
}

export function getSitesByCustomer(customerId: string): Site[] {
  return SITES.filter((site) => site.customerId === customerId);
}

export function getDepartmentsBySite(siteId: string): Department[] {
  return DEPARTMENTS.filter((department) => department.siteId === siteId);
}

/** Представители всех объектов/служб данного заказчика — для полей вида
 * «ответственный из пользователей своего заказчика». */
export function getRepresentativesByCustomer(customerId: string): Representative[] {
  const departmentIds = new Set(
    SITES.filter((site) => site.customerId === customerId).flatMap((site) =>
      getDepartmentsBySite(site.id).map((department) => department.id),
    ),
  );
  return REPRESENTATIVES.filter((representative) => departmentIds.has(representative.departmentId));
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
