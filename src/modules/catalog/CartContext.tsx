import { createContext } from 'react';
import type { CartItem } from './types';

export interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  getQuantity: (productId: string) => number;
  addItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
