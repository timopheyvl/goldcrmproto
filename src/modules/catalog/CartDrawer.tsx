import { useState } from 'react';
import { Drawer } from '../../components/Drawer';
import { ProductThumb } from './ProductThumb';
import { useCart } from './useCart';
import { CATEGORIES, PRODUCTS } from './data';
import { useRequests } from '../requests/useRequests';
import { useRole } from '../../context/useRole';
import { useEntities } from '../../data/useEntities';
import { getCurrentActorName } from '../requests/actor';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Скрывает кнопку «Сформировать заявку» — используется в режиме редактирования состава существующей заявки (/orders/:id/edit), где сохранение выполняется через шапку страницы, а не через корзину. */
  showCheckout?: boolean;
  /**
   * Режим редактирования (/orders/:id/edit): дублируют «Сохранить»/«Отмена»
   * из баннера страницы прямо в футере корзины, чтобы не приходилось
   * закрывать корзину, чтобы их найти.
   */
  editActions?: {
    onSave: () => void;
    onCancel: () => void;
    saveDisabled?: boolean;
  };
}

export function CartDrawer({ open, onClose, showCheckout = true, editActions }: CartDrawerProps) {
  const { items, totalQuantity, setQuantity, removeItem, clear } = useCart();
  const { createRequest } = useRequests();
  const { role } = useRole();
  const { getRepresentativeScope, currentRepresentativeId, currentRepresentative } = useEntities();
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  const rows = items
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) return null;
      const categoryName = CATEGORIES.find((c) => c.id === product.categoryId)?.name ?? '';
      return { item, product, categoryName };
    })
    .filter((row): row is { item: (typeof items)[number]; product: (typeof PRODUCTS)[number]; categoryName: string } => row !== null);

  // "Готово" and the panel's close (×) share this handler: they only dismiss
  // the drawer/reset the local success view — the request was already
  // created and the cart already cleared when "Сформировать заявку" ran.
  const handleClose = () => {
    setSubmittedNumber(null);
    setDownloaded(false);
    onClose();
  };

  const handleSubmit = () => {
    // Атрибуция заявки — заказчик/объект/служба живого профиля текущего
    // представителя (см. src/data/useEntities.ts), не хардкод.
    const scope = getRepresentativeScope(currentRepresentativeId);
    if (!scope) return;
    const authorName = getCurrentActorName(role, currentRepresentative?.fullName);
    const request = createRequest(
      rows.map(({ item, product }) => ({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        vendorId: product.vendorId,
        quantity: item.quantity,
      })),
      { ...scope, representativeId: currentRepresentativeId },
      authorName,
    );
    clear();
    setSubmittedNumber(request.number);
  };

  return (
    <Drawer open={open} onClose={handleClose} title="Корзина">
      {submittedNumber ? (
        <div className="cart-success">
          <div className="cart-success__icon">✓</div>
          <div className="empty-state__title">Заявка {submittedNumber} сформирована</div>
          <p>Менеджер GoldLink получит заявку и подтвердит состав. Статус заявки можно отслеживать в разделе «Заявки».</p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setDownloaded(true)}
          >
            {downloaded ? 'Файл сформирован ✓' : 'Скачать первичную спецификацию .xlsx'}
          </button>
          <button type="button" className="btn btn--primary" onClick={handleClose}>
            Готово
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Корзина пуста</div>
          <p>
            {showCheckout
              ? 'Добавьте товары из каталога, чтобы сформировать заявку.'
              : 'Добавьте товары из каталога, чтобы они попали в состав заявки.'}
          </p>
        </div>
      ) : (
        <div className="cart-list">
          {rows.map(({ item, product, categoryName }) => (
            <div className="cart-row" key={item.productId}>
              <ProductThumb name={product.name} size="md" />
              <div className="cart-row__info">
                <div className="cart-row__category">{categoryName}</div>
                <div className="cart-row__name">{product.name}</div>
                <div className="cart-row__sku">Артикул: {product.sku}</div>
              </div>
              <div className="cart-row__actions">
                <div className="qty-stepper">
                  <button type="button" onClick={() => setQuantity(product.id, item.quantity - 1)} aria-label="Уменьшить количество">
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => setQuantity(product.id, item.quantity + 1)} aria-label="Увеличить количество">
                    +
                  </button>
                </div>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => removeItem(product.id)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!submittedNumber && (rows.length > 0 || editActions) && (
        <div className="cart-footer">
          {rows.length > 0 && (
            <div className="cart-footer__summary">
              Позиций: {rows.length} · Всего единиц: {totalQuantity}
            </div>
          )}
          {showCheckout && rows.length > 0 && (
            <button type="button" className="btn btn--primary" onClick={handleSubmit}>
              Сформировать заявку
            </button>
          )}
          {editActions && (
            <div className="cart-footer__edit-actions">
              <button type="button" className="btn btn--ghost" onClick={editActions.onCancel}>
                Отмена
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={editActions.saveDisabled}
                onClick={editActions.onSave}
              >
                Сохранить
              </button>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
