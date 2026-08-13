import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useCart } from './useCart';
import { useVendors } from './useVendors';
import { CATEGORIES, PRODUCTS, countProductsByCategory, getDescendantCategoryIds } from './data';
import { CategoryTree } from './CategoryTree';
import { ProductCard } from './ProductCard';
import { CartDrawer } from './CartDrawer';
import type { Product } from './types';
import './catalog.css';

function matchesQuery(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (product.name.toLowerCase().includes(q)) return true;
  if (product.sku.toLowerCase().includes(q)) return true;
  if (product.description.toLowerCase().includes(q)) return true;
  return product.techParams.some(
    (param) => param.label.toLowerCase().includes(q) || param.value.toLowerCase().includes(q),
  );
}

interface CatalogPageProps {
  /**
   * 'edit' — встроенный режим для /orders/:id/edit (модуль «Заявки»): корзина
   * правит состав редактируемой заявки, а не создаёт новую. Скрывает
   * admin-ссылки каталога и включает добавление/удаление позиций независимо
   * от роли (менеджер тоже правит состав до статуса «Исполнена»).
   */
  mode?: 'shop' | 'edit';
  /** В режиме 'edit' пробрасывается в CartDrawer — «Сохранить»/«Отмена» прямо в футере корзины. */
  editActions?: {
    onSave: () => void;
    onCancel: () => void;
    saveDisabled?: boolean;
  };
}

export function CatalogPage({ mode = 'shop', editActions }: CatalogPageProps = {}) {
  const { role } = useRole();
  const navigate = useNavigate();
  const { getQuantity, addItem, setQuantity, totalQuantity } = useCart();
  const { getVendorName } = useVendors();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(mode === 'edit');

  const counts = useMemo(() => countProductsByCategory(), []);

  useEffect(() => {
    const timeout = setTimeout(() => setQuery(searchInput), 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timeout);
  }, [query, selectedCategoryId]);

  const scopedCategoryIds = useMemo(
    () => (selectedCategoryId ? new Set(getDescendantCategoryIds(selectedCategoryId)) : null),
    [selectedCategoryId],
  );

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (scopedCategoryIds && !scopedCategoryIds.has(product.categoryId)) return false;
      return matchesQuery(product, query);
    });
  }, [scopedCategoryIds, query]);

  const canOrder = mode === 'edit' ? true : role === 'representative';
  const showVendor = role === 'manager';
  const showManagerTools = mode === 'shop' && role === 'manager';

  const selectedCategory = selectedCategoryId ? CATEGORIES.find((c) => c.id === selectedCategoryId) : null;

  const emptyReason = query.trim()
    ? {
        title: 'Ничего не найдено',
        text: `По запросу «${query.trim()}» товаров не найдено. Попробуйте изменить условия поиска.`,
      }
    : {
        title: 'В этой категории пока нет товаров',
        text: 'Товары появятся здесь после загрузки прайса вендора.',
      };

  return (
    <div className="catalog-page">
      <aside className="catalog-page__sidebar">
        <CategoryTree
          categories={CATEGORIES}
          counts={counts}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          totalCount={PRODUCTS.length}
        />
      </aside>
      <div className="catalog-page__main">
        <div className="catalog-page__toolbar">
          <input
            type="search"
            className="catalog-page__search"
            placeholder="Поиск по наименованию, артикулу, характеристикам…"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <div className="catalog-page__toolbar-actions">
            <div className="view-toggle">
              <button
                type="button"
                className={layout === 'grid' ? 'view-toggle__btn view-toggle__btn--active' : 'view-toggle__btn'}
                onClick={() => setLayout('grid')}
                aria-label="Сетка"
              >
                ▦
              </button>
              <button
                type="button"
                className={layout === 'list' ? 'view-toggle__btn view-toggle__btn--active' : 'view-toggle__btn'}
                onClick={() => setLayout('list')}
                aria-label="Список"
              >
                ☰
              </button>
            </div>
            {showManagerTools && (
              <>
                <Link to="/catalog/vendors" className="btn btn--secondary">
                  Вендоры
                </Link>
                <Link to="/catalog/stats" className="btn btn--secondary">
                  Статистика
                </Link>
                <Link to="/catalog/import" className="btn btn--secondary">
                  Импорт
                </Link>
              </>
            )}
            {canOrder && (
              <button type="button" className="btn btn--primary cart-button" onClick={() => setCartOpen(true)}>
                Корзина
                {totalQuantity > 0 && <span className="cart-button__badge">{totalQuantity}</span>}
              </button>
            )}
          </div>
        </div>

        {selectedCategory && <div className="catalog-page__active-category">{selectedCategory.name}</div>}

        {loading ? (
          <div className={`product-grid product-grid--${layout}`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="product-card-skeleton" key={index} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">{emptyReason.title}</div>
            <p>{emptyReason.text}</p>
          </div>
        ) : (
          <div className={`product-grid product-grid--${layout}`}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                layout={layout}
                categoryName={CATEGORIES.find((category) => category.id === product.categoryId)?.name ?? ''}
                vendorName={showVendor ? getVendorName(product.vendorId) : undefined}
                quantity={getQuantity(product.id)}
                canOrder={canOrder}
                onOpen={() => navigate(`/catalog/${product.id}`)}
                onAdd={() => addItem(product.id)}
                onSetQuantity={(quantity) => setQuantity(product.id, quantity)}
              />
            ))}
          </div>
        )}
      </div>

      {canOrder && (
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          showCheckout={mode !== 'edit'}
          editActions={mode === 'edit' ? editActions : undefined}
        />
      )}
    </div>
  );
}
