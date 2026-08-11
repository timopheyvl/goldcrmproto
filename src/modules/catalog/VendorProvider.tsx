import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { VendorContext } from './VendorContext';
import type { VendorContextValue } from './VendorContext';
import { SEED_VENDORS, findVendorName } from './data';
import type { UploadFormat, Vendor } from './types';

const VENDOR_STORAGE_KEY = 'goldlink.vendors';

function readStoredVendors(): Vendor[] {
  try {
    const raw = window.localStorage.getItem(VENDOR_STORAGE_KEY);
    if (!raw) return SEED_VENDORS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_VENDORS;
  } catch {
    return SEED_VENDORS;
  }
}

export function VendorProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>(readStoredVendors);

  useEffect(() => {
    window.localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(vendors));
  }, [vendors]);

  const value = useMemo<VendorContextValue>(() => {
    const addVendor = (input: { name: string; uploadFormat: UploadFormat }) => {
      const vendor: Vendor = { id: `v-${Date.now()}`, name: input.name, uploadFormat: input.uploadFormat };
      setVendors((prev) => [...prev, vendor]);
    };

    const updateVendor = (id: string, input: { name: string; uploadFormat: UploadFormat }) => {
      setVendors((prev) =>
        prev.map((vendor) => (vendor.id === id ? { ...vendor, name: input.name, uploadFormat: input.uploadFormat } : vendor)),
      );
    };

    return {
      vendors,
      addVendor,
      updateVendor,
      getVendorName: (vendorId: string) => findVendorName(vendors, vendorId),
    };
  }, [vendors]);

  return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
}
