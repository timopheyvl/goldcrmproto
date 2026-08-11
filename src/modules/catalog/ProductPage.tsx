import { Link, useParams } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useCart } from './useCart';
import { useVendors } from './useVendors';
import { CATEGORIES, PRODUCTS } from './data';
import { ProductThumb } from './ProductThumb';
import './catalog.css';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const { getQuantity, addItem, setQuantity } = useCart();
  const { getVendorName } = useVendors();

  const product = PRODUCTS.find((item) => item.id === id);

  if (!product) {
    return (
      <div className="product-page">
        <div className="import-page__breadcrumb">
          <Link to="/catalog">Каталог</Link> / Товар не найден
        </div>
        <div className="empty-state">
          <div className="empty-state__title">Товар не найден</div>
          <p>Возможно, товар был удалён из выгрузки вендора или ссылка устарела.</p>
          <Link to="/catalog" className="btn btn--secondary">
            Вернуться в каталог
          </Link>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((item) => item.id === product.categoryId);
  const canOrder = role === 'representative';
  const showVendor = role === 'manager';
  const quantity = getQuantity(product.id);

  return (
    <div className="product-page">
      <div className="import-page__breadcrumb">
        <Link to="/catalog">Каталог</Link> / {product.name}
      </div>

      <div className="product-detail">
        <div className="product-detail__media">
          <ProductThumb name={product.name} size="lg" />
        </div>
        <div className="product-detail__info">
          <h1 className="product-detail__name">{product.name}</h1>
          <div className="product-detail__sku">Артикул: {product.sku}</div>
          {category && <div className="product-detail__category">Категория: {category.name}</div>}
          {showVendor && <div className="product-detail__vendor">Вендор: {getVendorName(product.vendorId)}</div>}

          <table className="product-detail__params">
            <tbody>
              {product.techParams.map((param) => (
                <tr key={param.label}>
                  <th>{param.label}</th>
                  <td>{param.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <section className="product-detail__description-block">
            <h2>Описание</h2>
            <p>{product.description}</p>
          </section>

          {canOrder && (
            <div className="product-detail__actions">
              {quantity > 0 ? (
                <div className="qty-stepper qty-stepper--lg">
                  <button type="button" onClick={() => setQuantity(product.id, quantity - 1)} aria-label="Уменьшить количество">
                    −
                  </button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity(product.id, quantity + 1)} aria-label="Увеличить количество">
                    +
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn--primary" onClick={() => addItem(product.id)}>
                  Добавить в корзину
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
