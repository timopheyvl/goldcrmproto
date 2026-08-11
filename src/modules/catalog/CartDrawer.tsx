import { useState } from 'react';
import { Drawer } from '../../components/Drawer';
import { ProductThumb } from './ProductThumb';
import { useCart } from './useCart';
import { CATEGORIES, PRODUCTS } from './data';
import { useRequests } from '../requests/useRequests';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalQuantity, setQuantity, removeItem, clear } = useCart();
  const { createRequest } = useRequests();
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
    const request = createRequest(
      rows.map(({ item, product }) => ({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
      })),
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
          <p>Добавьте товары из каталога, чтобы сформировать заявку.</p>
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

      {rows.length > 0 && !submittedNumber && (
        <div className="cart-footer">
          <div className="cart-footer__summary">
            Позиций: {rows.length} · Всего единиц: {totalQuantity}
          </div>
          <button type="button" className="btn btn--primary" onClick={handleSubmit}>
            Сформировать заявку
          </button>
        </div>
      )}
    </Drawer>
  );
}
