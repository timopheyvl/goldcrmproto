import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CartContext } from './CartContext';
import type { CartContextValue } from './CartContext';
import type { CartItem } from './types';

const CART_STORAGE_KEY = 'goldlink.cart';

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const getQuantity = (productId: string) =>
      items.find((item) => item.productId === productId)?.quantity ?? 0;

    const addItem = (productId: string) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (existing) {
          return prev.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }
        return [...prev, { productId, quantity: 1 }];
      });
    };

    const setQuantity = (productId: string, quantity: number) => {
      setItems((prev) => {
        if (quantity <= 0) {
          return prev.filter((item) => item.productId !== productId);
        }
        const existing = prev.find((item) => item.productId === productId);
        if (existing) {
          return prev.map((item) => (item.productId === productId ? { ...item, quantity } : item));
        }
        return [...prev, { productId, quantity }];
      });
    };

    const removeItem = (productId: string) => {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const clear = () => setItems([]);

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, totalQuantity, getQuantity, addItem, setQuantity, removeItem, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
