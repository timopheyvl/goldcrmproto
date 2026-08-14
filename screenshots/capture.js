// Полный визуальный прогон прототипа GoldLink через реальный браузер (Playwright).
// Запуск: node screenshots/capture.js
// Поднимает dev-сервер (vite), логинится, переключает роль через мок-селектор
// в шапке (без перезагрузки страницы — иначе слетает мок-авторизация) и
// кликами проходит по всем модулям/экранам/состояниям, доступным каждой роли.
// В конце генерирует screenshots/index.html — визуальную галерею с подписями.
//
// Пересобрать всё после правок в UI: тот же `node screenshots/capture.js`.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = __dirname;
const VIEWPORT = { width: 1440, height: 900 };

function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // сервер ещё не поднялся — подождать и повторить
    }
    await sleep(300);
  }
  throw new Error(`Dev-сервер не поднялся за ${timeoutMs}мс: ${url}`);
}

// ---------------------------------------------------------------------------
// Манифест галереи: каждая запись — один скриншот с метаданными для index.html
// ---------------------------------------------------------------------------
const manifest = [];
let shotCounter = 0;

async function shot(page, { roleKey, roleLabel, moduleKey, moduleLabel, screen, state, caption, note }) {
  shotCounter += 1;
  const filename = `${roleKey}_${moduleKey}_${screen}_${state}.png`;
  const dir = path.join(OUT_DIR, roleKey);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await page.screenshot({ path: filePath });
  manifest.push({
    roleKey,
    roleLabel,
    moduleKey,
    moduleLabel,
    screen,
    state,
    file: `${roleKey}/${filename}`,
    caption,
    note: note ?? null,
    ok: true,
  });
  console.log(`  [${shotCounter}] ${roleKey}/${filename}`);
}

function recordSkipped({ roleKey, roleLabel, moduleKey, moduleLabel, screen, state, caption, reason }) {
  manifest.push({
    roleKey,
    roleLabel,
    moduleKey,
    moduleLabel,
    screen,
    state,
    file: null,
    caption,
    note: `Не снято: ${reason}`,
    ok: false,
  });
  console.log(`  [skip] ${roleKey}/${moduleKey}/${screen}/${state} — ${reason}`);
}

/** Оборачивает сцену: при ошибке не роняет весь прогон, а фиксирует пропуск в галерее. */
async function scene(meta, fn) {
  try {
    await fn();
  } catch (error) {
    recordSkipped({ ...meta, reason: error && error.message ? error.message.split('\n')[0] : String(error) });
  }
}

// ---------------------------------------------------------------------------
// Навигационные хелперы
// ---------------------------------------------------------------------------

async function closeAnyOverlay(page) {
  const overlay = page.locator('.overlay');
  if (await overlay.count()) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
  }
}

async function switchRole(page, role) {
  await closeAnyOverlay(page);
  await page.selectOption('#role-select', role);
  await page.waitForTimeout(150);
  // После смены роли AppShell мог увести на /catalog, если текущий модуль недоступен новой роли.
  await page.getByRole('link', { name: 'Каталог' }).click();
  await page.waitForTimeout(200);
}

async function goToModule(page, label) {
  await closeAnyOverlay(page);
  await page.locator('.sidebar').getByRole('link', { name: label, exact: true }).click();
  await page.waitForTimeout(200);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const port = await findFreePort();
  const baseUrl = `http://localhost:${port}`;

  console.log(`Стартуем vite dev-сервер на ${baseUrl} ...`);
  const devServer = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    shell: true,
    stdio: 'ignore',
  });

  const killServer = () => {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(devServer.pid), '/f', '/t']);
    } else {
      devServer.kill('SIGTERM');
    }
  };

  process.on('exit', killServer);

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();

    console.log('Логинимся...');
    await page.goto(`${baseUrl}/login`);
    await page.waitForSelector('.auth-form');

    // --- Общие экраны: вход и восстановление пароля (до роли) ---
    await scene(
      { roleKey: 'common', roleLabel: 'Общее', moduleKey: 'auth', moduleLabel: 'Вход', screen: 'login', state: 'default', caption: 'Экран входа в систему' },
      async () => {
        await shot(page, {
          roleKey: 'common', roleLabel: 'Общее', moduleKey: 'auth', moduleLabel: 'Вход',
          screen: 'login', state: 'default', caption: 'Экран входа в систему',
        });
      },
    );

    await scene(
      { roleKey: 'common', roleLabel: 'Общее', moduleKey: 'auth', moduleLabel: 'Вход', screen: 'forgot-password', state: 'form', caption: 'Восстановление пароля — форма' },
      async () => {
        await page.getByText('Забыли пароль?').click();
        await page.waitForSelector('.auth-form');
        await shot(page, {
          roleKey: 'common', roleLabel: 'Общее', moduleKey: 'auth', moduleLabel: 'Вход',
          screen: 'forgot-password', state: 'form', caption: 'Восстановление пароля — форма запроса',
        });
        await page.fill('input[type="email"]', 'demo@goldlink.ru');
        await page.getByRole('button', { name: 'Отправить ссылку' }).click();
        await shot(page, {
          roleKey: 'common', roleLabel: 'Общее', moduleKey: 'auth', moduleLabel: 'Вход',
          screen: 'forgot-password', state: 'sent', caption: 'Восстановление пароля — ссылка отправлена',
        });
        await page.getByText('Вернуться ко входу').click();
        await page.waitForSelector('.auth-form');
      },
    );

    await page.fill('input[type="email"]', 'demo@goldlink.ru');
    await page.fill('input[type="password"]', 'demo12345');
    await page.getByRole('button', { name: 'Войти' }).click();
    await page.waitForSelector('.app-shell');
    await page.waitForTimeout(300);

    // =========================================================================
    // РОЛЬ 1: Сотрудник заказчика
    // =========================================================================
    console.log('\n=== Роль: Сотрудник заказчика ===');
    await switchRole(page, 'employee');
    const employee = { roleKey: 'employee', roleLabel: 'Сотрудник заказчика' };

    await scene({ ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'loading', caption: 'Каталог — список товаров, состояние загрузки (скелетоны)' }, async () => {
      await goToModule(page, 'Каталог');
      // Заново заходим в модуль, чтобы поймать loading=true в первый кадр.
      await page.locator('.sidebar').getByRole('link', { name: 'Обучающие материалы' }).click();
      await page.waitForTimeout(100);
      const catalogLinkClick = page.locator('.sidebar').getByRole('link', { name: 'Каталог', exact: true }).click();
      await page.waitForSelector('.product-card-skeleton', { timeout: 1500 });
      await shot(page, { ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'loading', caption: 'Каталог — список товаров, состояние загрузки (скелетоны)' });
      await catalogLinkClick;
      await page.waitForSelector('.product-card-skeleton', { state: 'detached', timeout: 3000 }).catch(() => {});
    });

    await scene({ ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'default', caption: 'Каталог — список товаров, сетка (сотруднику доступен только просмотр, без корзины и вендора)' }, async () => {
      await goToModule(page, 'Каталог');
      await page.waitForSelector('.product-grid');
      await shot(page, { ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'default', caption: 'Каталог — список товаров, сетка. Сотруднику доступен только просмотр: нет кнопки «Корзина» и колонки «Вендор»' });
    });

    await scene({ ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'list-view' }, async () => {
      await page.locator('.view-toggle__btn').nth(1).click();
      await page.waitForTimeout(150);
      await shot(page, { ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'list-view', caption: 'Каталог — переключение на табличный (списочный) вид' });
      await page.locator('.view-toggle__btn').nth(0).click();
    });

    await scene({ ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'category-filter' }, async () => {
      await page.locator('.category-tree__item--root').first().waitFor();
      // Дерево категорий по умолчанию полностью раскрыто — стрелку кликать не нужно.
      await page.locator('.category-tree__item').filter({ hasText: 'Кабельная продукция' }).click();
      await page.waitForTimeout(400);
      await shot(page, { ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'category-filter', caption: 'Каталог — фильтрация по категории через дерево категорий' });
      await page.locator('.category-tree__item--root').click();
      await page.waitForTimeout(400);
    });

    await scene({ ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'search-empty' }, async () => {
      await page.fill('.catalog-page__search', 'zzzнесуществующий-товар');
      await page.waitForTimeout(500);
      await shot(page, { ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'search-empty', caption: 'Каталог — поиск без результатов (пустое состояние)' });
      await page.fill('.catalog-page__search', '');
      await page.waitForTimeout(500);
    });

    await scene({ ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'product', state: 'detail' }, async () => {
      await page.locator('.product-card').first().click();
      await page.waitForSelector('.product-detail');
      await shot(page, { ...employee, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'product', state: 'detail', caption: 'Карточка товара — сотруднику недоступны кнопка «Добавить в корзину» и поле «Вендор»' });
      await page.getByText('Каталог').first().click();
      await page.waitForSelector('.product-grid');
    });

    await scene({ ...employee, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'list', state: 'default' }, async () => {
      await goToModule(page, 'Обучающие материалы');
      await page.waitForSelector('.objects-grid, .empty-state');
      await shot(page, { ...employee, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'list', state: 'default', caption: 'Обучающие материалы — список статей (без кнопки «Новая статья»)' });
    });

    await scene({ ...employee, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'list', state: 'search' }, async () => {
      await page.fill('.training-page__search', 'Ганта');
      await page.waitForTimeout(300);
      await shot(page, { ...employee, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'list', state: 'search', caption: 'Обучающие материалы — поиск по названию/тексту статьи' });
      await page.fill('.training-page__search', '');
      await page.waitForTimeout(300);
    });

    await scene({ ...employee, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'article', state: 'rich-blocks' }, async () => {
      await page.locator('.product-card', { hasText: 'заявку на оборудование' }).click();
      await page.waitForSelector('.article-detail__content');
      await shot(page, { ...employee, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'article', state: 'rich-blocks', caption: 'Статья — блоки: текст, заголовок, список, изображение, цитата, файл. Внизу автофутер «Другие материалы»' });
      await page.getByText('Обучающие материалы').first().click();
      await page.waitForSelector('.objects-grid');
    });

    await scene({ ...employee, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'article', state: 'video-gallery' }, async () => {
      await page.locator('.product-card', { hasText: 'Диаграмма Ганта' }).click();
      await page.waitForSelector('.article-detail__content');
      await shot(page, { ...employee, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'article', state: 'video-gallery', caption: 'Статья — галерея изображений (карусель) и встроенное видео Rutube' });
    });

    // =========================================================================
    // РОЛЬ 2: Представитель заказчика
    // =========================================================================
    console.log('\n=== Роль: Представитель заказчика ===');
    await switchRole(page, 'representative');
    const rep = { roleKey: 'representative', roleLabel: 'Представитель заказчика' };

    // --- Каталог + корзина ---
    await scene({ ...rep, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'default' }, async () => {
      await goToModule(page, 'Каталог');
      await page.waitForSelector('.product-grid');
      await shot(page, { ...rep, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'default', caption: 'Каталог — представителю доступна кнопка «Корзина» (без колонки «Вендор»)' });
    });

    await scene({ ...rep, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'product', state: 'detail' }, async () => {
      await page.locator('.product-card').first().click();
      await page.waitForSelector('.product-detail');
      await shot(page, { ...rep, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'product', state: 'detail', caption: 'Карточка товара — доступна кнопка «Добавить в корзину», поле «Вендор» скрыто' });
    });

    await scene({ ...rep, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'cart', state: 'empty' }, async () => {
      await page.getByText('Каталог').first().click();
      await page.waitForSelector('.product-grid');
      await page.locator('.cart-button').click();
      await page.waitForSelector('.panel--drawer');
      await shot(page, { ...rep, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'cart', state: 'empty', caption: 'Корзина — пустое состояние' });
    });

    await scene({ ...rep, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'cart', state: 'filled' }, async () => {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      const cards = page.locator('.product-card');
      await cards.nth(0).locator('.btn').getByText('В корзину').click();
      await cards.nth(1).locator('.btn').getByText('В корзину').click();
      await cards.nth(2).locator('.btn').getByText('В корзину').click();
      await page.locator('.cart-button').click();
      await page.waitForSelector('.cart-list');
      await shot(page, { ...rep, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'cart', state: 'filled', caption: 'Корзина с позициями — количество, удаление, переход к «Сформировать заявку»' });
    });

    await scene({ ...rep, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'cart', state: 'success' }, async () => {
      await page.getByRole('button', { name: 'Сформировать заявку' }).click();
      await page.waitForSelector('.cart-success');
      await shot(page, { ...rep, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'cart', state: 'success', caption: 'Заявка сформирована — номер GL-YYYY-NNNN, скачивание первичной спецификации .xlsx' });
      await page.getByRole('button', { name: 'Готово' }).click();
      await page.waitForTimeout(200);
    });

    // --- Заявки ---
    await scene({ ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'list', state: 'default' }, async () => {
      await goToModule(page, 'Заявки');
      await page.waitForSelector('.requests-table, .empty-state');
      await shot(page, { ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'list', state: 'default', caption: 'Заявки — список в рамках своей службы/объекта (без фильтров по заказчику/объекту — доступны только менеджеру)' });
    });

    await scene({ ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'list', state: 'status-filter' }, async () => {
      await page.locator('.status-pill', { hasText: 'В работе' }).click();
      await page.waitForTimeout(200);
      await shot(page, { ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'list', state: 'status-filter', caption: 'Заявки — фильтр по статусу (сегментированные пилюли)' });
      await page.locator('.status-pill', { hasText: 'В работе' }).click();
      await page.waitForTimeout(200);
    });

    await scene({ ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'formed' }, async () => {
      await page.locator('tbody tr', { hasText: 'GL-2026-0001' }).click();
      await page.waitForSelector('.request-detail__header');
      await shot(page, { ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'formed', caption: 'Карточка заявки в статусе «Сформирована» — доступно редактирование состава' });
    });

    await scene({ ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'history-modal' }, async () => {
      await page.getByText('Заявки').first().click();
      await page.waitForSelector('.requests-table');
      await page.locator('tbody tr', { hasText: 'GL-2026-0002' }).click();
      await page.waitForSelector('.request-detail__header');
      await page.getByRole('button', { name: 'История изменений' }).click();
      await page.waitForSelector('.version-history');
      await shot(page, { ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'history-modal', caption: 'История изменений заявки — версии слева, diff состава справа (добавлено/удалено/изменено количество)' });
      await page.keyboard.press('Escape');
    });

    await scene({ ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'in-progress-with-docs' }, async () => {
      await page.waitForSelector('.request-detail__header');
      await shot(page, { ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'in-progress-with-docs', caption: 'Заявка в статусе «В работе» с прикреплённым документом (скачивание доступно, прикрепление — только у менеджера)' });
    });

    await scene({ ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'done-locked' }, async () => {
      await page.getByText('Заявки').first().click();
      await page.waitForSelector('.requests-table');
      await page.locator('tbody tr', { hasText: 'GL-2026-0003' }).click();
      await page.waitForSelector('.request-detail__header');
      await shot(page, { ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'done-locked', caption: 'Заявка в статусе «Исполнена» — редактирование состава заблокировано, кнопки «Редактировать» нет' });
    });

    await scene({ ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'edit', state: 'composition' }, async () => {
      await page.getByText('Заявки').first().click();
      await page.waitForSelector('.requests-table');
      await page.locator('tbody tr', { hasText: 'GL-2026-0001' }).click();
      await page.waitForSelector('.request-detail__header');
      await page.getByRole('button', { name: 'Редактировать' }).click();
      await page.waitForSelector('.order-edit-page');
      // В режиме редактирования корзина открыта сразу (cartOpen = mode==='edit'),
      // поэтому «Сохранить»/«Отмена» в её футере видны уже на этом кадре.
      await page.waitForSelector('.cart-footer__edit-actions');
      await shot(page, { ...rep, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'edit', state: 'composition', caption: 'Редактирование состава заявки — каталог+корзина, предзаполненные текущим составом; «Сохранить»/«Отмена» продублированы в футере корзины' });
      // Кнопка внутри открытой корзины — единственная, не перекрытая своим же оверлеем.
      await page.locator('.cart-footer__edit-actions').getByRole('button', { name: 'Отмена' }).click();
      await page.waitForSelector('.request-detail__header');
    });

    // --- Объекты ---
    await scene({ ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'list', state: 'default' }, async () => {
      await goToModule(page, 'Объекты');
      await page.waitForSelector('.objects-grid, .empty-state');
      await shot(page, { ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'list', state: 'default', caption: 'Объекты — представитель видит только свой объект (скоуп по службе из профиля)' });
    });

    await scene({ ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'materials' }, async () => {
      await page.locator('.product-card').first().click();
      await page.waitForSelector('.object-detail__attrs');
      await shot(page, { ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'materials', caption: 'Карточка объекта, вкладка «Материалы» — просмотр и скачивание, без кнопок добавления/удаления' });
    });

    await scene({ ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'departments' }, async () => {
      await page.getByRole('button', { name: 'Службы' }).click();
      await page.waitForTimeout(150);
      await shot(page, { ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'departments', caption: 'Карточка объекта, вкладка «Службы» — только просмотр (создание/редактирование — в «Управлении»)' });
    });

    await scene({ ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'plan-gantt' }, async () => {
      await page.getByRole('button', { name: 'План работ' }).click();
      await page.waitForSelector('.gantt');
      await shot(page, { ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'plan-gantt', caption: 'План работ — диаграмма Ганта (верстанный мокап), без кнопки «Добавить этап»' });
    });

    await scene({ ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'stage-panel', state: 'editable' }, async () => {
      await page.locator('.gantt__label-row').nth(1).click();
      await page.waitForSelector('.stage-detail');
      await shot(page, { ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'stage-panel', state: 'editable', caption: 'Панель этапа — представитель правит описание/статус/%/ответственного; даты и удаление недоступны' });
      await page.keyboard.press('Escape');
    });

    await scene({ ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'stage-panel', state: 'locked-done' }, async () => {
      await page.locator('.gantt__label-row').nth(0).click();
      await page.waitForSelector('.stage-detail');
      await shot(page, { ...rep, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'stage-panel', state: 'locked-done', caption: 'Панель этапа в статусе «Выполнен» — все поля только для просмотра' });
      await page.keyboard.press('Escape');
    });

    // --- Обучающие материалы ---
    await scene({ ...rep, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'list', state: 'default' }, async () => {
      await goToModule(page, 'Обучающие материалы');
      await page.waitForSelector('.objects-grid');
      await shot(page, { ...rep, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'list', state: 'default', caption: 'Обучающие материалы — список статей (без кнопки «Новая статья»)' });
    });

    await scene({ ...rep, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'article', state: 'roles-overview' }, async () => {
      await page.locator('.product-card', { hasText: 'Роли пользователей' }).click();
      await page.waitForSelector('.article-detail__content');
      await shot(page, { ...rep, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'article', state: 'roles-overview', caption: 'Статья — просмотр без кнопок «Редактировать»/«Удалить»' });
    });

    // =========================================================================
    // РОЛЬ 3: Менеджер GoldLink
    // =========================================================================
    console.log('\n=== Роль: Менеджер GoldLink ===');
    await switchRole(page, 'manager');
    const mgr = { roleKey: 'manager', roleLabel: 'Менеджер GoldLink' };

    // --- Каталог (админ-инструменты) ---
    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'default' }, async () => {
      await goToModule(page, 'Каталог');
      await page.waitForSelector('.product-grid');
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'list', state: 'default', caption: 'Каталог — менеджеру видна колонка «Вендор» и кнопки «Вендоры»/«Статистика»/«Импорт», но нет корзины (заявки формирует только представитель)' });
    });

    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'product', state: 'detail' }, async () => {
      await page.locator('.product-card').first().click();
      await page.waitForSelector('.product-detail');
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'product', state: 'detail', caption: 'Карточка товара — менеджеру видно поле «Вендор», кнопки заказа нет' });
      await page.getByText('Каталог').first().click();
      await page.waitForSelector('.product-grid');
    });

    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'vendors', state: 'list' }, async () => {
      await page.getByRole('link', { name: 'Вендоры' }).click();
      await page.waitForSelector('.vendors-page');
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'vendors', state: 'list', caption: 'Управление вендорами — список (зона Каталога, доступно только менеджеру)' });
    });

    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'vendors', state: 'edit-modal' }, async () => {
      await page.locator('.import-table tbody tr').first().getByRole('button', { name: 'Редактировать' }).click();
      await page.waitForSelector('.panel--modal');
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'vendors', state: 'edit-modal', caption: 'Редактирование вендора — модалка' });
      await page.keyboard.press('Escape');
    });

    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'vendors', state: 'create-modal' }, async () => {
      await page.getByRole('button', { name: 'Добавить вендора' }).click();
      await page.waitForSelector('.panel--modal');
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'vendors', state: 'create-modal', caption: 'Новый вендор — модалка создания' });
      await page.keyboard.press('Escape');
    });

    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'stats', state: 'default' }, async () => {
      await page.getByText('Каталог').first().click();
      await page.waitForSelector('.product-grid');
      await page.getByRole('link', { name: 'Статистика' }).click();
      await page.waitForSelector('.stats-page');
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'stats', state: 'default', caption: 'Техническая статистика каталога — товары по вендорам и категориям (доступно только менеджеру)' });
    });

    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'import', state: 'idle' }, async () => {
      await page.getByText('Каталог').first().click();
      await page.waitForSelector('.product-grid');
      await page.getByRole('link', { name: 'Импорт' }).click();
      await page.waitForSelector('.import-page');
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'import', state: 'idle', caption: 'Импорт каталога — выбор вендора и файла выгрузки' });
    });

    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'import', state: 'uploading' }, async () => {
      await page.locator('.import-page select').selectOption({ index: 1 });
      // Файл выбрать через реальный диалог нельзя — подставляем DataTransfer программно, как это делает браузер при drop.
      const input = page.locator('.dropzone input[type="file"]');
      await input.setInputFiles({ name: 'прайс_ноябрь.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from('demo') });
      await page.getByRole('button', { name: 'Загрузить и проверить' }).click();
      await page.waitForSelector('.import-loading', { timeout: 1500 });
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'import', state: 'uploading', caption: 'Импорт — состояние загрузки/проверки файла' });
      await page.waitForSelector('.import-report', { timeout: 3000 });
    });

    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'import', state: 'report' }, async () => {
      await page.waitForSelector('.import-report');
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'import', state: 'report', caption: 'Импорт — отчёт построчной проверки (ОК/предупреждения/ошибки)' });
    });

    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'import', state: 'applied' }, async () => {
      await page.getByRole('button', { name: /Импортировать корректные строки/ }).click();
      await page.waitForSelector('.import-report__done');
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'import', state: 'applied', caption: 'Импорт — применён, показан итог' });
    });

    await scene({ ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'import', state: 'history' }, async () => {
      await page.getByRole('button', { name: 'История импортов' }).click();
      await page.waitForSelector('.import-table--history');
      await shot(page, { ...mgr, moduleKey: 'catalog', moduleLabel: 'Каталог', screen: 'import', state: 'history', caption: 'Импорт — история прошлых загрузок' });
    });

    // --- Заявки ---
    await scene({ ...mgr, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'list', state: 'loading' }, async () => {
      await page.locator('.sidebar').getByRole('link', { name: 'Объекты' }).click();
      await page.waitForTimeout(100);
      const click = page.locator('.sidebar').getByRole('link', { name: 'Заявки' }).click();
      await page.waitForSelector('.skeleton-bar', { timeout: 1500 });
      await shot(page, { ...mgr, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'list', state: 'loading', caption: 'Заявки — состояние загрузки (скелетоны таблицы)' });
      await click;
      await page.waitForSelector('.requests-table');
    });

    await scene({ ...mgr, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'list', state: 'default' }, async () => {
      await page.waitForSelector('.requests-table');
      await shot(page, { ...mgr, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'list', state: 'default', caption: 'Заявки — менеджер видит все заявки всех заказчиков, с фильтрами по заказчику/объекту/службе' });
    });

    await scene({ ...mgr, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'list', state: 'filtered' }, async () => {
      await page.locator('.status-pill', { hasText: 'Исполнена' }).click();
      await page.locator('.requests-page__filters-row select').first().selectOption({ index: 1 });
      await page.waitForTimeout(200);
      await shot(page, { ...mgr, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'list', state: 'filtered', caption: 'Заявки — комбинация фильтров: статус + заказчик' });
      await page.getByRole('button', { name: 'Сбросить фильтры' }).click();
      await page.waitForTimeout(200);
    });

    await scene({ ...mgr, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'status-select' }, async () => {
      await page.locator('tbody tr', { hasText: 'GL-2026-0001' }).click();
      await page.waitForSelector('.request-detail__header');
      await shot(page, { ...mgr, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'status-select', caption: 'Карточка заявки — менеджеру доступна смена статуса (сегмент «Управление статусом»)' });
    });

    await scene({ ...mgr, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'document-upload' }, async () => {
      await page.getByText('Заявки').first().click();
      await page.waitForSelector('.requests-table');
      await page.locator('tbody tr', { hasText: 'GL-2026-0003' }).click();
      await page.waitForSelector('.request-detail__header');
      await shot(page, { ...mgr, moduleKey: 'requests', moduleLabel: 'Заявки', screen: 'detail', state: 'document-upload', caption: 'Заявка «Исполнена» — менеджер всё ещё может прикреплять документы (кнопка «Прикрепить документ»)' });
    });

    // --- Объекты ---
    await scene({ ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'list', state: 'default' }, async () => {
      await goToModule(page, 'Объекты');
      await page.waitForSelector('.objects-grid');
      await shot(page, { ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'list', state: 'default', caption: 'Объекты — менеджеру видны объекты всех заказчиков, с фильтром по заказчику' });
    });

    await scene({ ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'materials-crud' }, async () => {
      await page.locator('.product-card', { hasText: 'Распадская-2' }).click();
      await page.waitForSelector('.object-detail__attrs');
      await shot(page, { ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'materials-crud', caption: 'Материалы объекта — менеджер: CRUD записей и загрузка файлов' });
    });

    await scene({ ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'materials', state: 'create-modal' }, async () => {
      await page.getByRole('button', { name: 'Добавить запись' }).click();
      await page.waitForSelector('.panel--modal');
      await shot(page, { ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'materials', state: 'create-modal', caption: 'Новая запись материала — модалка с загрузкой файлов' });
      await page.keyboard.press('Escape');
    });

    await scene({ ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'materials', state: 'delete-confirm' }, async () => {
      await page.locator('.material-card').first().getByRole('button', { name: 'Удалить', exact: true }).click();
      await page.waitForSelector('.panel--modal');
      await shot(page, { ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'materials', state: 'delete-confirm', caption: 'Удаление материала — подтверждение (деструктив всегда через модалку)' });
      await page.getByRole('button', { name: 'Отмена' }).click();
    });

    await scene({ ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'departments-view' }, async () => {
      await page.getByRole('button', { name: 'Службы' }).click();
      await page.waitForTimeout(150);
      await shot(page, { ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'departments-view', caption: 'Службы объекта — просмотр (CRUD служб — только в «Управлении»)' });
    });

    await scene({ ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'plan-gantt-full' }, async () => {
      await page.getByRole('button', { name: 'План работ' }).click();
      await page.waitForSelector('.gantt');
      await shot(page, { ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'detail', state: 'plan-gantt-full', caption: 'План работ — диаграмма Ганта, менеджеру доступна кнопка «Добавить этап»' });
    });

    await scene({ ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'plan', state: 'add-stage-modal' }, async () => {
      await page.getByRole('button', { name: 'Добавить этап' }).click();
      await page.waitForSelector('.panel--modal');
      await shot(page, { ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'plan', state: 'add-stage-modal', caption: 'Новый этап плана работ — модалка создания (все поля сразу)' });
      await page.keyboard.press('Escape');
    });

    await scene({ ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'stage-panel', state: 'full-edit' }, async () => {
      // Этап №4 («Обучение персонала…») — без привязанных заявок и файлов,
      // поэтому его (в отличие от остальных этапов сида) реально можно удалить
      // в следующей сцене (canDeleteStage не заблокирует кнопку).
      await page.locator('.gantt__label-row').nth(3).click();
      await page.waitForSelector('.stage-detail');
      await shot(page, { ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'stage-panel', state: 'full-edit', caption: 'Панель этапа — менеджеру доступны все поля: название, даты, зависимость от этапа, удаление' });
    });

    await scene({ ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'stage-panel', state: 'delete-confirm' }, async () => {
      await page.getByRole('button', { name: 'Удалить этап' }).click();
      await page.waitForSelector('.panel--modal');
      await shot(page, { ...mgr, moduleKey: 'objects', moduleLabel: 'Объекты', screen: 'stage-panel', state: 'delete-confirm', caption: 'Удаление этапа — подтверждение' });
      await page.getByRole('button', { name: 'Отмена' }).click();
      await page.keyboard.press('Escape');
    });

    // --- Обучающие материалы (конструктор) ---
    await scene({ ...mgr, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'list', state: 'default' }, async () => {
      await goToModule(page, 'Обучающие материалы');
      await page.waitForSelector('.objects-grid');
      await shot(page, { ...mgr, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'list', state: 'default', caption: 'Обучающие материалы — менеджеру доступна кнопка «Новая статья»' });
    });

    await scene({ ...mgr, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'article', state: 'manager-view' }, async () => {
      await page.locator('.product-card', { hasText: 'заявку на оборудование' }).click();
      await page.waitForSelector('.article-detail__content');
      await shot(page, { ...mgr, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'article', state: 'manager-view', caption: 'Статья — менеджеру доступны кнопки «Редактировать»/«Удалить»' });
    });

    await scene({ ...mgr, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'article', state: 'delete-confirm' }, async () => {
      await page.getByRole('button', { name: 'Удалить' }).click();
      await page.waitForSelector('.panel--modal');
      await shot(page, { ...mgr, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'article', state: 'delete-confirm', caption: 'Удаление статьи — подтверждение' });
      await page.getByRole('button', { name: 'Отмена' }).click();
    });

    await scene({ ...mgr, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'editor', state: 'edit-existing' }, async () => {
      await page.getByRole('button', { name: 'Редактировать' }).click();
      await page.waitForSelector('.article-editor');
      await shot(page, { ...mgr, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'editor', state: 'edit-existing', caption: 'Редактирование статьи — блочный конструктор: каждый блок можно сдвинуть вверх/вниз или удалить' });
      await page.getByText('Обучающие материалы').first().click();
      await page.waitForSelector('.objects-grid');
    });

    await scene({ ...mgr, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'editor', state: 'new-empty' }, async () => {
      await page.getByRole('button', { name: 'Новая статья' }).click();
      await page.waitForSelector('.article-editor');
      await shot(page, { ...mgr, moduleKey: 'training', moduleLabel: 'Обучающие материалы', screen: 'editor', state: 'new-empty', caption: 'Новая статья — пустой конструктор, выбор типа блока перед добавлением' });
      await page.getByText('Обучающие материалы').first().click();
      await page.waitForSelector('.objects-grid');
    });

    // --- Управление (админ-дерево) ---
    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'tree', state: 'empty-selection' }, async () => {
      await goToModule(page, 'Управление');
      await page.waitForSelector('.admin-page');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'tree', state: 'empty-selection', caption: 'Управление — дерево «Заказчики» / «Сотрудники GoldLink», ничего не выбрано' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'customers', state: 'root-panel' }, async () => {
      await page.locator('.admin-tree__item--root', { hasText: 'Заказчики' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'customers', state: 'root-panel', caption: 'Управление — корень «Заказчики», кнопка «+ Добавить заказчика»' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'customer', state: 'create-form' }, async () => {
      await page.locator('.admin-page__panel').getByRole('button', { name: '+ Добавить заказчика' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'customer', state: 'create-form', caption: 'Новый заказчик — форма создания' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'customer', state: 'edit-panel' }, async () => {
      // Клик по названию заказчика также автоматически раскрывает его узел в дереве
      // (см. onExpand в AdminTree) — отдельно раскрывать стрелкой не нужно.
      await page.locator('.admin-tree__item', { hasText: 'Кузбассуголь' }).click();
      await page.waitForSelector('.admin-summary');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'customer', state: 'edit-panel', caption: 'Карточка заказчика — инлайн-редактирование по blur, сводка связанных сущностей' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'customer', state: 'delete-blocked' }, async () => {
      // Кнопка задизейблена (есть связи) — кликать нельзя (Playwright бесконечно
      // ждёт «enabled»), просто фиксируем видимое заблокированное состояние.
      await page.waitForSelector('.stage-detail__actions .btn--danger[disabled]');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'customer', state: 'delete-blocked', caption: 'Удаление заказчика заблокировано — есть связанные объекты/представители/сотрудники (каскадного удаления нет)' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'site', state: 'create-form' }, async () => {
      // Узел заказчика уже раскрыт предыдущим шагом — «+ Добавить объект» уже видна.
      await page.locator('.admin-tree__add-row', { hasText: 'Добавить объект' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'site', state: 'create-form', caption: 'Новый объект — создаётся уже привязанным к заказчику из контекста дерева' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'site', state: 'edit-panel' }, async () => {
      await page.locator('.admin-tree__item', { hasText: 'Распадская-2' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'site', state: 'edit-panel', caption: 'Карточка объекта в «Управлении» — поля объекта (название/локация/геопозиция/дата начала), не сущностный контент' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'department', state: 'create-form' }, async () => {
      // Узел объекта уже раскрыт кликом выше — «+ Добавить службу» уже видна.
      await page.locator('.admin-tree__add-row', { hasText: 'Добавить службу' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'department', state: 'create-form', caption: 'Новая служба — только название, привязка к объекту/заказчику из контекста' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'department', state: 'edit-panel' }, async () => {
      await page.locator('.admin-tree__item', { hasText: 'Служба главного механика' }).first().click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'department', state: 'edit-panel', caption: 'Карточка службы — единственное редактируемое поле «Название»' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'representative', state: 'create-validation' }, async () => {
      // Узел службы уже раскрыт кликом выше — «+ Добавить представителя» уже видна.
      await page.locator('.admin-tree__add-row', { hasText: 'Добавить представителя' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'representative', state: 'create-form', caption: 'Новый представитель — привязка к службе фиксирована из контекста, email = логин' });
      await page.locator('input[type="email"]').fill('i.terehov@kuzbassugol.ru');
      // Скоуп к правой панели: в дереве слева тоже есть «+ Добавить представителя».
      await page.locator('.admin-page__panel').getByRole('button', { name: 'Добавить представителя' }).click();
      await page.waitForTimeout(150);
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'representative', state: 'create-validation', caption: 'Валидация формы — email уже используется другим пользователем (глобальная уникальность логина); ФИО обязательно' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'representative', state: 'edit-panel' }, async () => {
      await page.locator('.admin-tree__item', { hasText: 'Терехов Игорь Валерьевич' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'representative', state: 'edit-panel', caption: 'Карточка представителя — ФИО/email/телефон/должность, привязка к службе не меняется' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'employees', state: 'root-panel' }, async () => {
      await page.locator('.admin-tree__item', { hasText: 'Сотрудники заказчика' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'employees', state: 'root-panel', caption: 'Сотрудники заказчика — отдельный подузел вне каскада объект/служба' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'employee', state: 'create-form' }, async () => {
      await page.locator('.admin-page__panel').getByRole('button', { name: '+ Добавить сотрудника' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'employee', state: 'create-form', caption: 'Новый сотрудник заказчика — привязка только к заказчику, без объекта/службы' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'employee', state: 'edit-panel' }, async () => {
      await page.locator('.admin-tree__item', { hasText: 'Дьячков Роман Олегович' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'employee', state: 'edit-panel', caption: 'Карточка сотрудника заказчика' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'managers', state: 'tree-and-root' }, async () => {
      await page.locator('.admin-tabs__btn', { hasText: 'Сотрудники GoldLink' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'managers', state: 'tree-and-root', caption: 'Вкладка «Сотрудники GoldLink» — плоский список внутренних менеджеров' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'manager', state: 'create-form' }, async () => {
      await page.locator('.admin-tree__add-row', { hasText: 'Добавить менеджера' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'manager', state: 'create-form', caption: 'Новый менеджер GoldLink — ФИО/email(логин)/телефон/должность' });
    });

    await scene({ ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'manager', state: 'edit-panel' }, async () => {
      await page.locator('.admin-tree__item', { hasText: 'Соколова Елена Викторовна' }).click();
      await page.waitForSelector('.admin-panel');
      await shot(page, { ...mgr, moduleKey: 'admin', moduleLabel: 'Управление', screen: 'manager', state: 'edit-panel', caption: 'Карточка менеджера GoldLink' });
    });

    await browser.close();
    console.log(`\nГотово: ${manifest.filter((m) => m.ok).length} скриншотов, ${manifest.filter((m) => !m.ok).length} пропущено.`);
  } finally {
    killServer();
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  buildGallery(manifest);
}

// ---------------------------------------------------------------------------
// Сборка screenshots/index.html из манифеста
// ---------------------------------------------------------------------------
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** JSON.stringify, но безопасно для вставки внутрь инлайнового <script>. */
function safeJsonForScript(value) {
  var json = JSON.stringify(value);
  var LT = String.fromCharCode(60);
  var LS = String.fromCharCode(8232);
  var PS = String.fromCharCode(8233);
  var ESC_LT = "\\u003c";
  var ESC_LS = "\\u2028";
  var ESC_PS = "\\u2029";
  var out = "";
  for (var i = 0; i < json.length; i++) {
    var ch = json[i];
    if (ch === LT) out += ESC_LT;
    else if (ch === LS) out += ESC_LS;
    else if (ch === PS) out += ESC_PS;
    else out += ch;
  }
  return out;
}

function buildGallery(items) {
  const roleOrder = ['common', 'employee', 'representative', 'manager'];
  const roleLabels = {
    common: 'Общее (до входа)',
    employee: 'Сотрудник заказчика',
    representative: 'Представитель заказчика',
    manager: 'Менеджер GoldLink',
  };

  const byRole = new Map();
  for (const item of items) {
    if (!byRole.has(item.roleKey)) byRole.set(item.roleKey, new Map());
    const byModule = byRole.get(item.roleKey);
    if (!byModule.has(item.moduleKey)) byModule.set(item.moduleKey, { label: item.moduleLabel, items: [] });
    byModule.get(item.moduleKey).items.push(item);
  }

  const nav = [];
  const sections = [];
  // Плоский список реально снятых экранов в том же порядке, в котором они
  // отрисованы на странице (роль → модуль → экран) — это и есть порядок
  // сквозной навигации в лайтбоксе (стрелки/счётчик «N / total»).
  const lightboxShots = [];

  for (const roleKey of roleOrder) {
    if (!byRole.has(roleKey)) continue;
    const byModule = byRole.get(roleKey);
    const roleAnchor = `role-${roleKey}`;
    const roleLabel = roleLabels[roleKey] ?? roleKey;
    const moduleNavLinks = [];
    const moduleSections = [];

    for (const [moduleKey, { label, items: moduleItems }] of byModule) {
      const anchor = `${roleKey}-${moduleKey}`;
      moduleNavLinks.push(`<a href="#${anchor}">${escapeHtml(label)}</a>`);

      const cards = moduleItems
        .map((item) => {
          const stateLabel = `${item.screen} / ${item.state}`;
          if (!item.ok) {
            return `
        <figure class="card card--missing">
          <div class="card__placeholder">Не удалось снять автоматически</div>
          <figcaption>
            <div class="card__caption">${escapeHtml(item.caption ?? '')}</div>
            <div class="card__state">${escapeHtml(stateLabel)}</div>
            <div class="card__note">${escapeHtml(item.note ?? '')}</div>
          </figcaption>
        </figure>`;
          }
          const idx = lightboxShots.length;
          lightboxShots.push({
            file: item.file,
            caption: item.caption ?? '',
            stateLabel,
            roleLabel,
            moduleLabel: label,
          });
          return `
        <figure class="card">
          <a href="${item.file}" class="js-thumb" data-idx="${idx}" target="_blank" rel="noopener"><img src="${item.file}" loading="lazy" alt="${escapeHtml(item.caption ?? '')}" /></a>
          <figcaption>
            <div class="card__caption">${escapeHtml(item.caption ?? '')}</div>
            <div class="card__state">${escapeHtml(stateLabel)}</div>
          </figcaption>
        </figure>`;
        })
        .join('\n');

      moduleSections.push(`
    <section class="module" id="${anchor}">
      <h3>${escapeHtml(label)} <span class="count">${moduleItems.length}</span></h3>
      <div class="grid">${cards}</div>
    </section>`);
    }

    nav.push(`
    <div class="toc__role">
      <a href="#${roleAnchor}" class="toc__role-link">${escapeHtml(roleLabel)}</a>
      <div class="toc__modules">${moduleNavLinks.join(' · ')}</div>
    </div>`);

    sections.push(`
  <section class="role" id="${roleAnchor}">
    <h2>${escapeHtml(roleLabel)}</h2>
    ${moduleSections.join('\n')}
  </section>`);
  }

  const total = items.length;
  const ok = items.filter((i) => i.ok).length;
  const missing = total - ok;

  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>GoldLink — визуальная галерея прототипа</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f4f5f7; color: #1b1f26; }
  header { position: sticky; top: 0; z-index: 10; background: #14161c; color: #fff; padding: 20px 32px; }
  header h1 { margin: 0 0 4px; font-size: 20px; }
  header .meta { font-size: 13px; color: #b7bcc7; }
  .toc { background: #1c1f27; padding: 14px 32px 20px; border-bottom: 1px solid #2a2e38; }
  .toc__role { margin-top: 10px; }
  .toc__role-link { color: #ffd166; font-weight: 600; text-decoration: none; font-size: 15px; }
  .toc__role-link:hover { text-decoration: underline; }
  .toc__modules { margin-top: 4px; font-size: 13px; color: #9aa0ad; }
  .toc__modules a { color: #9aa0ad; text-decoration: none; }
  .toc__modules a:hover { color: #fff; text-decoration: underline; }
  main { padding: 8px 32px 64px; max-width: 1600px; margin: 0 auto; }
  section.role { margin-top: 48px; padding-top: 12px; border-top: 3px solid #14161c; }
  section.role > h2 { font-size: 26px; margin: 12px 0 4px; }
  section.module { margin-top: 28px; }
  section.module h3 { font-size: 17px; margin: 0 0 12px; color: #33394a; }
  section.module h3 .count { font-weight: 400; color: #8a8f9c; font-size: 13px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
  .card { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.12); display: flex; flex-direction: column; }
  .card img { width: 100%; display: block; aspect-ratio: 16/10; object-fit: cover; object-position: top; background: #eee; }
  .card figcaption { padding: 10px 12px 12px; }
  .card__caption { font-size: 13.5px; font-weight: 600; line-height: 1.35; }
  .card__state { font-size: 11.5px; color: #8a8f9c; margin-top: 4px; font-family: ui-monospace, Consolas, monospace; }
  .card--missing { background: #fff8f0; border: 1px dashed #e0a340; }
  .card__placeholder { aspect-ratio: 16/10; display: flex; align-items: center; justify-content: center; color: #b5762a; font-size: 13px; text-align: center; padding: 12px; background: repeating-linear-gradient(45deg, #fdf1de, #fdf1de 10px, #fbe8c8 10px, #fbe8c8 20px); }
  .card__note { font-size: 11.5px; color: #b5762a; margin-top: 6px; }
  a { color: inherit; }
  .top-link { position: fixed; right: 24px; bottom: 24px; background: #14161c; color: #fff; padding: 10px 16px; border-radius: 999px; text-decoration: none; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,.25); }
  .card .js-thumb { cursor: zoom-in; }

  /* Лайтбокс */
  .lightbox { position: fixed; inset: 0; z-index: 100; background: rgba(10,11,15,.92); display: flex; align-items: center; justify-content: center; padding: 56px 88px; }
  .lightbox[hidden] { display: none; }
  .lightbox__figure { display: flex; flex-direction: column; align-items: center; max-width: 100%; max-height: 100%; }
  .lightbox__img-wrap { flex: 1 1 auto; min-height: 0; display: flex; align-items: center; justify-content: center; }
  .lightbox__img { max-width: min(1400px, 88vw); max-height: 74vh; object-fit: contain; border-radius: 6px; box-shadow: 0 12px 48px rgba(0,0,0,.5); background: #fff; }
  .lightbox__caption { margin-top: 16px; text-align: center; color: #fff; max-width: 800px; }
  .lightbox__breadcrumb { font-size: 12.5px; color: #ffd166; text-transform: uppercase; letter-spacing: .03em; margin-bottom: 6px; }
  .lightbox__text { font-size: 15px; font-weight: 600; line-height: 1.4; }
  .lightbox__state { margin-top: 6px; font-size: 12px; color: #9aa0ad; font-family: ui-monospace, Consolas, monospace; }
  .lightbox__counter { margin-top: 10px; font-size: 12.5px; color: #6f7684; }
  .lightbox__close { position: absolute; top: 20px; right: 28px; background: transparent; border: none; color: #fff; font-size: 34px; line-height: 1; cursor: pointer; padding: 6px 10px; border-radius: 8px; }
  .lightbox__close:hover { background: rgba(255,255,255,.12); }
  .lightbox__nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,.08); border: none; color: #fff; font-size: 28px; line-height: 1; width: 56px; height: 56px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .lightbox__nav:hover { background: rgba(255,255,255,.2); }
  .lightbox__nav:disabled { opacity: .25; cursor: default; }
  .lightbox__nav--prev { left: 18px; }
  .lightbox__nav--next { right: 18px; }
  @media (max-width: 760px) {
    .lightbox { padding: 90px 12px 24px; }
    .lightbox__nav { width: 44px; height: 44px; font-size: 22px; }
    .lightbox__nav--prev { left: 4px; }
    .lightbox__nav--next { right: 4px; }
  }
</style>
</head>
<body>
<header>
  <h1>GoldLink — визуальная галерея прототипа</h1>
  <div class="meta">Скриншотов: ${ok} · Пропущено (сложно достижимо): ${missing} · Собрано автоматически: screenshots/capture.js</div>
</header>
<nav class="toc" id="top">
  ${nav.join('\n')}
</nav>
<main>
  ${sections.join('\n')}
</main>
<a class="top-link" href="#top">Наверх ↑</a>

<div class="lightbox" id="lightbox" hidden>
  <button type="button" class="lightbox__close" id="lightboxClose" aria-label="Закрыть">×</button>
  <button type="button" class="lightbox__nav lightbox__nav--prev" id="lightboxPrev" aria-label="Предыдущая">‹</button>
  <button type="button" class="lightbox__nav lightbox__nav--next" id="lightboxNext" aria-label="Следующая">›</button>
  <figure class="lightbox__figure">
    <div class="lightbox__img-wrap">
      <img class="lightbox__img" id="lightboxImg" src="" alt="" />
    </div>
    <figcaption class="lightbox__caption">
      <div class="lightbox__breadcrumb" id="lightboxBreadcrumb"></div>
      <div class="lightbox__text" id="lightboxText"></div>
      <div class="lightbox__state" id="lightboxState"></div>
      <div class="lightbox__counter" id="lightboxCounter"></div>
    </figcaption>
  </figure>
</div>

<script>
  var SHOTS = ${safeJsonForScript(lightboxShots)};
  (function () {
    var lightbox = document.getElementById('lightbox');
    var imgEl = document.getElementById('lightboxImg');
    var breadcrumbEl = document.getElementById('lightboxBreadcrumb');
    var textEl = document.getElementById('lightboxText');
    var stateEl = document.getElementById('lightboxState');
    var counterEl = document.getElementById('lightboxCounter');
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');
    var closeBtn = document.getElementById('lightboxClose');
    var currentIndex = -1;

    function render(idx) {
      var shot = SHOTS[idx];
      if (!shot) return;
      currentIndex = idx;
      imgEl.src = shot.file;
      imgEl.alt = shot.caption;
      breadcrumbEl.textContent = shot.roleLabel + ' — ' + shot.moduleLabel;
      textEl.textContent = shot.caption;
      stateEl.textContent = shot.stateLabel;
      counterEl.textContent = (idx + 1) + ' / ' + SHOTS.length;
      // Навигация сквозная по всей галерее: на первом/последнем экране
      // соответствующая стрелка просто отключается, без зацикливания.
      prevBtn.disabled = idx <= 0;
      nextBtn.disabled = idx >= SHOTS.length - 1;
    }

    function open(idx) {
      render(idx);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.hidden = true;
      currentIndex = -1;
      document.body.style.overflow = '';
    }

    function step(delta) {
      if (currentIndex < 0) return;
      var next = currentIndex + delta;
      if (next < 0 || next >= SHOTS.length) return;
      render(next);
    }

    document.querySelectorAll('.js-thumb').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var idx = parseInt(link.getAttribute('data-idx'), 10);
        open(idx);
      });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });

    // Клик вне картинки (по фону-оверлею) закрывает лайтбокс; клик по самой
    // картинке/подписи/кнопкам — нет (событие не всплывает выше figure/кнопок).
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) close();
    });

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowLeft') step(-1);
      else if (event.key === 'ArrowRight') step(1);
    });
  })();
</script>
</body>
</html>`;

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html, 'utf-8');
  console.log(`Галерея собрана: screenshots/index.html (${ok}/${total} скриншотов)`);
}

// `node screenshots/capture.js --gallery-only` — пересобрать только index.html
// из уже существующего manifest.json, без повторного прогона браузером
// (быстрая правка вёрстки/скриптов самой галереи, например лайтбокса).
if (process.argv.includes('--gallery-only')) {
  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  const items = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  buildGallery(items);
} else {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
