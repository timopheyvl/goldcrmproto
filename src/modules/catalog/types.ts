export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export type UploadFormat = 'XLSX' | 'CSV' | 'XML';

export interface Vendor {
  id: string;
  name: string;
  uploadFormat: UploadFormat;
}

export interface TechParam {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  vendorId: string;
  description: string;
  techParams: TechParam[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type ImportRowStatus = 'ok' | 'warning' | 'error';

export interface ImportPreviewRow {
  line: number;
  name: string;
  sku: string;
  category: string;
  status: ImportRowStatus;
  comment?: string;
}

export type ImportRunStatus = 'success' | 'partial' | 'cancelled';

export interface ImportRun {
  id: string;
  date: string;
  fileName: string;
  vendorName: string;
  initiator: string;
  status: ImportRunStatus;
  totalRows: number;
  okRows: number;
  errorRows: number;
}
