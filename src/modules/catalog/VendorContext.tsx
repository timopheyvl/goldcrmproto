import { createContext } from 'react';
import type { UploadFormat, Vendor } from './types';

export interface VendorContextValue {
  vendors: Vendor[];
  addVendor: (input: { name: string; uploadFormat: UploadFormat }) => void;
  updateVendor: (id: string, input: { name: string; uploadFormat: UploadFormat }) => void;
  getVendorName: (vendorId: string) => string;
}

export const VendorContext = createContext<VendorContextValue | null>(null);
