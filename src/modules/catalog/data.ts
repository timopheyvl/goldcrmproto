import type { Category, ImportPreviewRow, ImportRun, Product, Vendor } from './types';

export const CATEGORIES: Category[] = [
  { id: 'c-electro', name: 'Электрооборудование', parentId: null },
  { id: 'c-cable', name: 'Кабельная продукция', parentId: 'c-electro' },
  { id: 'c-transformers', name: 'Трансформаторы и КТП', parentId: 'c-electro' },
  { id: 'c-light', name: 'Рудничное освещение', parentId: 'c-electro' },

  { id: 'c-pump', name: 'Насосное оборудование', parentId: null },
  { id: 'c-pump-submersible', name: 'Погружные насосы', parentId: 'c-pump' },
  { id: 'c-pump-drainage', name: 'Дренажные насосы', parentId: 'c-pump' },

  { id: 'c-conveyor', name: 'Конвейерное оборудование', parentId: null },
  { id: 'c-conveyor-belt', name: 'Конвейерные ленты', parentId: 'c-conveyor' },
  { id: 'c-conveyor-roller', name: 'Ролики и опоры', parentId: 'c-conveyor' },

  { id: 'c-instruments', name: 'КИПиА', parentId: null },
  { id: 'c-instruments-sensors', name: 'Датчики и извещатели', parentId: 'c-instruments' },
  { id: 'c-instruments-control', name: 'Приборы контроля', parentId: 'c-instruments' },

  { id: 'c-ppe', name: 'СИЗ и спецодежда', parentId: null },
];

export const SEED_VENDORS: Vendor[] = [
  { id: 'v-gormash', name: 'ООО «ГорМаш»', uploadFormat: 'XLSX' },
  { id: 'v-electroprom', name: 'АО «ЭлектроПром»', uploadFormat: 'XLSX' },
  { id: 'v-pumpdvor', name: 'ООО «Насосный Двор»', uploadFormat: 'CSV' },
  { id: 'v-konveyer', name: 'ЗАО «КонвейерСервис»', uploadFormat: 'XML' },
  { id: 'v-technokabel', name: 'ООО «ТехноКабель»', uploadFormat: 'XLSX' },
  { id: 'v-kipservice', name: 'ООО «КИП-Сервис»', uploadFormat: 'CSV' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Кабель силовой КГЭШ 3х25+1х10',
    sku: 'KGESH-3X25-10',
    categoryId: 'c-cable',
    vendorId: 'v-technokabel',
    description: 'Гибкий экранированный кабель для передвижных электроустановок угольных и рудных шахт.',
    techParams: [
      { label: 'Сечение жил', value: '3×25+1×10 мм²' },
      { label: 'Номинальное напряжение', value: '3.3 кВ' },
      { label: 'Исполнение', value: 'Шахтное, экранированное' },
      { label: 'Диапазон температур', value: '−50…+50 °C' },
      { label: 'Марка оболочки', value: 'Резина маслобензостойкая' },
      { label: 'Минимальный радиус изгиба', value: '10 диаметров кабеля' },
      { label: 'Строительная длина', value: '300 м' },
      { label: 'Масса 1 км', value: '1280 кг' },
    ],
  },
  {
    id: 'p-2',
    name: 'Кабель контрольный КВВГЭ 10х1.5',
    sku: 'KVVGE-10X1.5',
    categoryId: 'c-cable',
    vendorId: 'v-technokabel',
    description: 'Контрольный кабель с экраном для цепей сигнализации и автоматики.',
    techParams: [
      { label: 'Число жил', value: '10' },
      { label: 'Сечение', value: '1.5 мм²' },
      { label: 'Экран', value: 'Да' },
      { label: 'Радиус изгиба', value: '6 диаметров кабеля' },
      { label: 'Материал изоляции', value: 'ПВХ пластикат' },
      { label: 'Строительная длина', value: '500 м' },
    ],
  },
  {
    id: 'p-3',
    name: 'Кабель гибкий КГ 4х6',
    sku: 'KG-4X6',
    categoryId: 'c-cable',
    vendorId: 'v-gormash',
    description: 'Гибкий кабель общего назначения для подключения передвижных механизмов.',
    techParams: [
      { label: 'Сечение жил', value: '4×6 мм²' },
      { label: 'Номинальное напряжение', value: '660 В' },
      { label: 'Число жил', value: '4' },
      { label: 'Материал изоляции', value: 'Резина' },
    ],
  },
  {
    id: 'p-4',
    name: 'Трансформаторная подстанция КТП-ШВ-630',
    sku: 'KTP-SHV-630',
    categoryId: 'c-transformers',
    vendorId: 'v-electroprom',
    description: 'Комплектная трансформаторная подстанция шахтная взрывобезопасная.',
    techParams: [
      { label: 'Мощность', value: '630 кВА' },
      { label: 'Напряжение ВН/НН', value: '6/0.69 кВ' },
      { label: 'Степень защиты', value: 'РВ, IP54' },
      { label: 'Исполнение', value: 'Взрывобезопасное' },
      { label: 'Охлаждение', value: 'Сухое' },
      { label: 'Схема соединения обмоток', value: 'Δ/Y-11' },
      { label: 'Ток термической стойкости', value: '20 кА' },
      { label: 'Масса', value: '2100 кг' },
      { label: 'Габариты (Д×Ш×В)', value: '2200×1400×1900 мм' },
      { label: 'Класс напряжения', value: '6 кВ' },
    ],
  },
  {
    id: 'p-5',
    name: 'Трансформатор сухой ТСЗ-400',
    sku: 'TSZ-400',
    categoryId: 'c-transformers',
    vendorId: 'v-electroprom',
    description: 'Трёхфазный сухой трансформатор общепромышленного исполнения.',
    techParams: [
      { label: 'Мощность', value: '400 кВА' },
      { label: 'Схема соединения', value: 'Δ/Y' },
      { label: 'Класс изоляции', value: 'F' },
      { label: 'Уровень шума', value: '≤65 дБ' },
    ],
  },
  {
    id: 'p-6',
    name: 'Светильник рудничный светодиодный СГВ-20',
    sku: 'SGV-20-LED',
    categoryId: 'c-light',
    vendorId: 'v-electroprom',
    description: 'Взрывозащищённый светодиодный светильник для подземных горных выработок.',
    techParams: [
      { label: 'Световой поток', value: '2400 лм' },
      { label: 'Потребляемая мощность', value: '20 Вт' },
      { label: 'Степень защиты', value: 'IP66, РВ' },
      { label: 'Ресурс', value: '50 000 ч' },
      { label: 'Цветовая температура', value: '5000 К' },
      { label: 'Индекс цветопередачи', value: 'Ra ≥ 80' },
      { label: 'Масса', value: '1.2 кг' },
      { label: 'Диапазон рабочих температур', value: '−40…+45 °C' },
    ],
  },
  {
    id: 'p-7',
    name: 'Прожектор шахтный ПШ-50',
    sku: 'PSH-50',
    categoryId: 'c-light',
    vendorId: 'v-gormash',
    description: 'Прожектор для освещения призабойного пространства и подъездных путей.',
    techParams: [
      { label: 'Мощность', value: '50 Вт' },
      { label: 'Степень защиты', value: 'IP65' },
      { label: 'Световой поток', value: '4500 лм' },
      { label: 'Угол рассеивания', value: '60°' },
    ],
  },
  {
    id: 'p-8',
    name: 'Насос погружной ЭЦВ 8-25-150',
    sku: 'ECV-8-25-150',
    categoryId: 'c-pump-submersible',
    vendorId: 'v-pumpdvor',
    description: 'Скважинный погружной насос для водоснабжения и водопонижения.',
    techParams: [
      { label: 'Подача', value: '25 м³/ч' },
      { label: 'Напор', value: '150 м' },
      { label: 'Диаметр скважины', value: 'от 200 мм' },
      { label: 'Мощность двигателя', value: '15 кВт' },
      { label: 'КПД', value: '68 %' },
      { label: 'Материал корпуса', value: 'Нержавеющая сталь' },
      { label: 'Масса', value: '58 кг' },
      { label: 'Максимальная температура воды', value: '+25 °C' },
    ],
  },
  {
    id: 'p-9',
    name: 'Насос погружной шахтный ГНОМ 40-25',
    sku: 'GNOM-40-25',
    categoryId: 'c-pump-submersible',
    vendorId: 'v-pumpdvor',
    description: 'Погружной насос для откачки шахтных и карьерных вод.',
    techParams: [
      { label: 'Подача', value: '40 м³/ч' },
      { label: 'Напор', value: '25 м' },
      { label: 'Макс. содержание твёрдых частиц', value: '10 г/л' },
      { label: 'Мощность двигателя', value: '4 кВт' },
      { label: 'Диаметр корпуса', value: '245 мм' },
      { label: 'Масса', value: '32 кг' },
    ],
  },
  {
    id: 'p-10',
    name: 'Насос дренажный НД-100',
    sku: 'ND-100',
    categoryId: 'c-pump-drainage',
    vendorId: 'v-pumpdvor',
    description: 'Дренажный насос для откачки загрязнённых вод из зумпфов и котлованов.',
    techParams: [
      { label: 'Подача', value: '100 м³/ч' },
      { label: 'Напор', value: '18 м' },
      { label: 'Материал корпуса', value: 'Чугун' },
      { label: 'Присоединение', value: 'Фланцевое DN100' },
      { label: 'Мощность двигателя', value: '11 кВт' },
      { label: 'КПД', value: '62 %' },
      { label: 'Масса', value: '95 кг' },
      { label: 'Максимальная температура среды', value: '+40 °C' },
    ],
  },
  {
    id: 'p-11',
    name: 'Насос дренажный погружной НД-40',
    sku: 'ND-40',
    categoryId: 'c-pump-drainage',
    vendorId: 'v-gormash',
    description: 'Компактный дренажный насос для точечного водоотлива.',
    techParams: [
      { label: 'Подача', value: '40 м³/ч' },
      { label: 'Напор', value: '12 м' },
      { label: 'Мощность двигателя', value: '2.2 кВт' },
      { label: 'Масса', value: '19 кг' },
    ],
  },
  {
    id: 'p-12',
    name: 'Лента конвейерная резинотканевая ЕР-500',
    sku: 'EP-500-3',
    categoryId: 'c-conveyor-belt',
    vendorId: 'v-konveyer',
    description: 'Резинотканевая конвейерная лента общего назначения, 3 прокладки.',
    techParams: [
      { label: 'Ширина', value: '1000 мм' },
      { label: 'Прочность прокладки', value: '500 Н/мм' },
      { label: 'Число прокладок', value: '3' },
      { label: 'Толщина обкладок', value: '4+2 мм' },
      { label: 'Тип каркаса', value: 'Тканевый EP' },
      { label: 'Максимальная рабочая температура', value: '+60 °C' },
      { label: 'Огнестойкость', value: 'Не нормируется' },
      { label: 'Масса 1 м²', value: '9.8 кг' },
    ],
  },
  {
    id: 'p-13',
    name: 'Лента конвейерная огнестойкая ЕР-800 ХЛ',
    sku: 'EP-800-XL',
    categoryId: 'c-conveyor-belt',
    vendorId: 'v-konveyer',
    description: 'Трудновоспламеняемая конвейерная лента для подземных горных работ.',
    techParams: [
      { label: 'Ширина', value: '1200 мм' },
      { label: 'Прочность прокладки', value: '800 Н/мм' },
      { label: 'Класс', value: 'Трудновоспламеняемая' },
      { label: 'Антистатичность', value: 'Да' },
      { label: 'Диапазон температур', value: '−60…+60 °C' },
      { label: 'Тип каркаса', value: 'Тканевый EP' },
      { label: 'Морозостойкость', value: 'До −60 °C' },
      { label: 'Максимальное натяжение', value: '800 Н/мм' },
      { label: 'Толщина обкладок', value: '6+3 мм' },
      { label: 'Масса 1 м²', value: '13.4 кг' },
    ],
  },
  {
    id: 'p-14',
    name: 'Ролик конвейерный роликоопоры Ø108',
    sku: 'ROL-108-465',
    categoryId: 'c-conveyor-roller',
    vendorId: 'v-konveyer',
    description: 'Прямой поддерживающий ролик для ленточных конвейеров.',
    techParams: [
      { label: 'Диаметр', value: '108 мм' },
      { label: 'Длина', value: '465 мм' },
      { label: 'Тип подшипника', value: '204' },
      { label: 'Материал обечайки', value: 'Сталь' },
      { label: 'Радиальная нагрузка', value: '1200 Н' },
      { label: 'Масса', value: '2.4 кг' },
    ],
  },
  {
    id: 'p-15',
    name: 'Роликоопора желобчатая трёхроликовая',
    sku: 'ROP-3R-1000',
    categoryId: 'c-conveyor-roller',
    vendorId: 'v-gormash',
    description: 'Желобчатая роликоопора для формирования желоба ленты на грузовой ветви.',
    techParams: [
      { label: 'Ширина ленты', value: '1000 мм' },
      { label: 'Угол желобчатости', value: '35°' },
      { label: 'Число роликов', value: '3' },
      { label: 'Материал', value: 'Сталь оцинкованная' },
      { label: 'Диаметр ролика', value: '108 мм' },
      { label: 'Допустимая нагрузка', value: '3600 Н' },
      { label: 'Масса', value: '11.5 кг' },
      { label: 'Шаг установки', value: '1.2 м' },
    ],
  },
  {
    id: 'p-16',
    name: 'Датчик метана ДМТ-4',
    sku: 'DMT-4',
    categoryId: 'c-instruments-sensors',
    vendorId: 'v-kipservice',
    description: 'Стационарный датчик контроля концентрации метана в шахтной атмосфере.',
    techParams: [
      { label: 'Диапазон измерения', value: '0–4 % об.' },
      { label: 'Погрешность', value: '±0.1 % об.' },
      { label: 'Исполнение', value: 'Взрывобезопасное' },
      { label: 'Время срабатывания сигнала', value: '≤10 с' },
      { label: 'Напряжение питания', value: '12–24 В' },
      { label: 'Степень защиты', value: 'IP54, РВ' },
    ],
  },
  {
    id: 'p-17',
    name: 'Датчик скорости воздуха ДСВ-01',
    sku: 'DSV-01',
    categoryId: 'c-instruments-sensors',
    vendorId: 'v-kipservice',
    description: 'Датчик контроля скорости воздушного потока в вентиляционных выработках.',
    techParams: [
      { label: 'Диапазон измерения', value: '0.2–15 м/с' },
      { label: 'Выходной сигнал', value: '4–20 мА' },
      { label: 'Погрешность', value: '±0.2 м/с' },
      { label: 'Степень защиты', value: 'IP65' },
    ],
  },
  {
    id: 'p-18',
    name: 'Извещатель пожарный дымовой ИП-212 РВ',
    sku: 'IP-212-RV',
    categoryId: 'c-instruments-sensors',
    vendorId: 'v-kipservice',
    description: 'Взрывозащищённый дымовой извещатель для подземных выработок.',
    techParams: [
      { label: 'Чувствительность', value: '0.05–0.2 дБ/м' },
      { label: 'Степень защиты', value: 'IP54, РВ' },
      { label: 'Напряжение питания', value: '12–24 В' },
      { label: 'Ресурс', value: '10 лет' },
      { label: 'Угол обзора', value: '360°' },
      { label: 'Материал корпуса', value: 'Поликарбонат' },
      { label: 'Температура эксплуатации', value: '−30…+55 °C' },
      { label: 'Способ монтажа', value: 'Потолочный' },
    ],
  },
];

export function getCategoryChildren(parentId: string | null): Category[] {
  return CATEGORIES.filter((category) => category.parentId === parentId);
}

export function getDescendantCategoryIds(categoryId: string): string[] {
  const result: string[] = [categoryId];
  const children = getCategoryChildren(categoryId);
  for (const child of children) {
    result.push(...getDescendantCategoryIds(child.id));
  }
  return result;
}

export function getCategoryPath(categoryId: string): Category[] {
  const path: Category[] = [];
  let current = CATEGORIES.find((category) => category.id === categoryId) ?? null;
  while (current) {
    path.unshift(current);
    current = current.parentId ? CATEGORIES.find((category) => category.id === current!.parentId) ?? null : null;
  }
  return path;
}

export function countProductsByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const category of CATEGORIES) {
    const descendantIds = new Set(getDescendantCategoryIds(category.id));
    counts[category.id] = PRODUCTS.filter((product) => descendantIds.has(product.categoryId)).length;
  }
  return counts;
}

export function findVendorName(vendors: Vendor[], vendorId: string): string {
  return vendors.find((vendor) => vendor.id === vendorId)?.name ?? 'Неизвестный вендор';
}

export const IMPORT_PREVIEW_ROWS: ImportPreviewRow[] = [
  { line: 2, name: 'Кабель силовой КГЭШ 3х35+1х10', sku: 'KGESH-3X35-10', category: 'Кабельная продукция', status: 'ok' },
  { line: 3, name: 'Кабель контрольный КВВГЭ 14х1.5', sku: 'KVVGE-14X1.5', category: 'Кабельная продукция', status: 'ok' },
  { line: 4, name: 'Трансформатор сухой ТСЗ-630', sku: 'TSZ-630', category: 'Трансформаторы и КТП', status: 'ok' },
  {
    line: 5,
    name: 'Кабель гибкий КГ 4х6',
    sku: 'KG-4X6',
    category: 'Кабельная продукция',
    status: 'warning',
    comment: 'Артикул уже есть в каталоге — позиция будет обновлена',
  },
  {
    line: 6,
    name: 'Насос без указания артикула',
    sku: '',
    category: 'Погружные насосы',
    status: 'error',
    comment: 'Не указан артикул',
  },
  {
    line: 7,
    name: 'Светильник рудничный СГВ-30',
    sku: 'SGV-30-LED',
    category: 'Освещение шахтное',
    status: 'error',
    comment: 'Категория «Освещение шахтное» не найдена в справочнике',
  },
  { line: 8, name: 'Прожектор шахтный ПШ-70', sku: 'PSH-70', category: 'Рудничное освещение', status: 'ok' },
  {
    line: 9,
    name: 'Датчик метана ДМТ-5',
    sku: 'DMT-5',
    category: 'Датчики и извещатели',
    status: 'warning',
    comment: 'Не заполнены технические параметры — карточка будет неполной',
  },
];

export const IMPORT_HISTORY: ImportRun[] = [
  {
    id: 'run-4',
    date: '2026-08-05 11:20',
    fileName: 'gormash_avgust_2026.xlsx',
    vendorName: 'ООО «ГорМаш»',
    initiator: 'Игнатьева О. С.',
    status: 'success',
    totalRows: 42,
    okRows: 42,
    errorRows: 0,
  },
  {
    id: 'run-3',
    date: '2026-07-28 09:05',
    fileName: 'technokabel_july.xlsx',
    vendorName: 'ООО «ТехноКабель»',
    initiator: 'Игнатьева О. С.',
    status: 'partial',
    totalRows: 30,
    okRows: 26,
    errorRows: 4,
  },
  {
    id: 'run-2',
    date: '2026-07-14 16:42',
    fileName: 'kipservice_price.xlsx',
    vendorName: 'ООО «КИП-Сервис»',
    initiator: 'Дронов А. П.',
    status: 'success',
    totalRows: 18,
    okRows: 18,
    errorRows: 0,
  },
  {
    id: 'run-1',
    date: '2026-06-30 14:10',
    fileName: 'konveyer_2026_q2.xlsx',
    vendorName: 'ЗАО «КонвейерСервис»',
    initiator: 'Игнатьева О. С.',
    status: 'cancelled',
    totalRows: 24,
    okRows: 0,
    errorRows: 0,
  },
];
