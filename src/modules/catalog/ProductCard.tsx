import type { Product } from './types';
import { ProductThumb } from './ProductThumb';

interface ProductCardProps {
  product: Product;
  layout: 'grid' | 'list';
  categoryName: string;
  vendorName?: string;
  quantity: number;
  canOrder: boolean;
  onOpen: () => void;
  onAdd: () => void;
  onSetQuantity: (quantity: number) => void;
}

export function ProductCard({
  product,
  layout,
  categoryName,
  vendorName,
  quantity,
  canOrder,
  onOpen,
  onAdd,
  onSetQuantity,
}: ProductCardProps) {
  const stop = (event: React.MouseEvent) => event.stopPropagation();

  return (
    <article
      className={`product-card product-card--${layout}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen();
      }}
    >
      <ProductThumb name={product.name} size={layout === 'list' ? 'md' : 'lg'} />
      <div className="product-card__body">
        <div className="product-card__category">{categoryName}</div>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__sku">Артикул: {product.sku}</div>
        {vendorName && <div className="product-card__vendor">{vendorName}</div>}
        <ul className="product-card__params">
          {product.techParams.slice(0, layout === 'list' ? 4 : 2).map((param) => (
            <li key={param.label}>
              <span className="product-card__param-label">{param.label}:</span> {param.value}
            </li>
          ))}
        </ul>
      </div>
      {canOrder && (
        <div className="product-card__actions" onClick={stop}>
          {quantity > 0 ? (
            <div className="qty-stepper">
              <button type="button" onClick={() => onSetQuantity(quantity - 1)} aria-label="Уменьшить количество">
                −
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => onSetQuantity(quantity + 1)} aria-label="Увеличить количество">
                +
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn--secondary btn--sm" onClick={onAdd}>
              В корзину
            </button>
          )}
        </div>
      )}
    </article>
  );
}
