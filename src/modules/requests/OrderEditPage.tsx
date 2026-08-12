import { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useRequests } from './useRequests';
import { useCart } from '../catalog/useCart';
import { CatalogPage } from '../catalog/CatalogPage';
import { PRODUCTS } from '../catalog/data';
import { getScopedRequests } from './scope';
import { useEntities } from '../../data/useEntities';
import { getCurrentActorName } from './actor';
import type { RequestItem } from './types';
import type { CartItem } from '../catalog/types';
import './requests.css';

/**
 * Режим редактирования состава заявки: переиспользует каталог + корзину.
 * Корзина на время редактирования становится «черновиком» состава заявки —
 * на входе предзаполняется текущими позициями, на «Сохранить»/«Отмена»/
 * уходе со страницы исходная (покупательская) корзина восстанавливается,
 * чтобы редактирование заявки не затирало то, что представитель уже
 * успел набрать в каталоге для новой заявки.
 */
export function OrderEditPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const navigate = useNavigate();
  const { requests, updateItems } = useRequests();
  const { items: cartItems, setQuantity, clear } = useCart();
  const { currentRepresentativeId, currentRepresentative } = useEntities();

  const scopedRequests = useMemo(() => getScopedRequests(role, requests), [role, requests]);
  const request = scopedRequests.find((item) => item.id === id);

  const editable =
    !!request &&
    request.status !== 'done' &&
    (role === 'manager' || (role === 'representative' && request.representativeId === currentRepresentativeId));

  const snapshotRef = useRef<CartItem[] | null>(null);
  const settledRef = useRef(false);

  // На вход в редактирование: запомнить текущую (покупательскую) корзину и
  // подставить в неё состав заявки как черновик. Эффект намеренно не
  // защищён флагом «уже инициализировано» — под React StrictMode он
  // вызывается дважды (mount → cleanup → mount), и cleanup ниже сам
  // корректно откатывает корзину к снэпшоту перед повторным вызовом, так
  // что итоговое состояние после двойного вызова остаётся правильным.
  // Страховка на выход без «Сохранить»/«Отмена» (например ссылкой в
  // сайдбаре) реализована тем же cleanup — он возвращает исходную корзину,
  // если решение не было зафиксировано через settledRef.
  useEffect(() => {
    // settledRef guard: после «Сохранить»/«Отмена» updateItems()/navigate()
    // меняют ссылку на request (и location) в том же батче обновлений, из-за
    // чего React успевает перезапустить этот эффект с уже новым `request`
    // ДО фактического размонтирования страницы. Без этой проверки такой
    // «лишний» повторный запуск заново подставлял бы состав заявки в уже
    // восстановленную (settledRef.current === true) корзину.
    if (!request || !editable || settledRef.current) return;
    const snapshot = cartItems.map((item) => ({ ...item }));
    snapshotRef.current = snapshot;
    clear();
    request.items.forEach((item) => setQuantity(item.productId, item.quantity));

    return () => {
      if (!settledRef.current) {
        clear();
        snapshot.forEach((item) => setQuantity(item.productId, item.quantity));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, editable]);

  if (!request) {
    return (
      <div className="request-detail">
        <div className="import-page__breadcrumb">
          <Link to="/requests">Заявки</Link> / Заявка не найдена
        </div>
        <div className="empty-state">
          <div className="empty-state__title">Заявка не найдена</div>
          <p>Возможно, заявка была удалена из выборки или ссылка устарела.</p>
          <Link to="/requests" className="btn btn--secondary">
            Вернуться к заявкам
          </Link>
        </div>
      </div>
    );
  }

  if (!editable) {
    return (
      <div className="request-detail">
        <div className="import-page__breadcrumb">
          <Link to={`/requests/${request.id}`}>{request.number}</Link> / Редактирование недоступно
        </div>
        <div className="empty-state">
          <div className="empty-state__title">Редактирование недоступно</div>
          <p>Заявка в статусе «Исполнена» больше не редактируется.</p>
          <Link to={`/requests/${request.id}`} className="btn btn--secondary">
            Вернуться к заявке
          </Link>
        </div>
      </div>
    );
  }

  const restoreOriginalCart = () => {
    settledRef.current = true;
    clear();
    (snapshotRef.current ?? []).forEach((item) => setQuantity(item.productId, item.quantity));
  };

  const handleSave = () => {
    const nextItems: RequestItem[] = cartItems
      .map((cartItem): RequestItem | null => {
        const product = PRODUCTS.find((candidate) => candidate.id === cartItem.productId);
        if (!product) return null;
        return {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          vendorId: product.vendorId,
          quantity: cartItem.quantity,
        };
      })
      .filter((item): item is RequestItem => item !== null);

    const authorName = getCurrentActorName(role, currentRepresentative?.fullName);
    updateItems(request.id, nextItems, authorName);
    restoreOriginalCart();
    navigate(`/requests/${request.id}`);
  };

  const handleCancel = () => {
    restoreOriginalCart();
    navigate(`/requests/${request.id}`);
  };

  return (
    <div className="order-edit-page">
      <div className="order-edit-page__banner">
        <div>
          <div className="import-page__breadcrumb">
            <Link to={`/requests/${request.id}`}>{request.number}</Link> / Редактирование состава
          </div>
          <h1 className="order-edit-page__title">Редактирование заявки {request.number}</h1>
        </div>
        <div className="order-edit-page__actions">
          <button type="button" className="btn btn--ghost" onClick={handleCancel}>
            Отмена
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={cartItems.length === 0}
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>

      <CatalogPage
        mode="edit"
        editActions={{ onSave: handleSave, onCancel: handleCancel, saveDisabled: cartItems.length === 0 }}
      />
    </div>
  );
}
