import { useContext } from 'react';
import { VendorContext } from './VendorContext';
import type { VendorContextValue } from './VendorContext';

export function useVendors(): VendorContextValue {
  const ctx = useContext(VendorContext);
  if (!ctx) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return ctx;
}
