export type DataCategory = 'sales' | 'purchase' | 'inventory';

export type ModuleView =
  | 'executive'
  | 'sales'
  | 'purchase'
  | 'inventory'
  | 'brand'
  | 'vendor'
  | 'product'
  | 'risk'
  | 'ai-insights'
  | 'alerts'
  | 'upload';

export interface SalesRecord {
  id: string;
  date: string;
  month: string;
  code: string;
  description: string;
  brand: string;
  class: string;
  qty: number;
  unitCost: number;
  total: number;
  vendorId: string;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  poNumber: string;
  code: string;
  description: string;
  brand: string;
  class: string;
  qty: number;
  unitCost: number;
  total: number;
  vendorId: string;
  credit: number;
  dueDate: string;
}

export interface InventoryRecord {
  id: string;
  code: string;
  description: string;
  brand: string;
  class: string;
  vendorId: string;
  qty: number;
  unitCost: number;
  totalValue: number;
  wioBenchmark: number;
  wioActual: number;
  salesVelocity: number;
  inventoryStatus: 'overstock' | 'healthy' | 'low' | 'critical';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  abcClass: 'A' | 'B' | 'C';
  productVelocity: 'fast' | 'medium' | 'slow';
}

export interface KPI {
  label: string;
  value: number;
  format: 'currency' | 'number' | 'percent' | 'days';
  change?: number;
  trend?: 'up' | 'down' | 'flat';
}

export interface WIORiskMatrix {
  brand: string;
  class: string;
  totalItems: number;
  overstock: number;
  healthy: number;
  low: number;
  critical: number;
  avgWIO: number;
  avgBenchmark: number;
}

export interface AIInsight {
  id: string;
  category: 'risk' | 'opportunity' | 'trend' | 'action';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  affectedItems: number;
  potentialImpact: number;
}

export interface AlertItem {
  id: string;
  type: 'overstock' | 'critical' | 'trend' | 'anomaly';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  dismissed: boolean;
}

export interface ValidationIssue {
  row: number;
  column: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  summary: {
    totalRows: number;
    errors: number;
    warnings: number;
    blocked: boolean;
    blockReason?: string;
  };
}

export interface ColumnMapping {
  source: string;
  target: string;
}

export interface UploadState {
  category: DataCategory;
  file: File | null;
  fileName: string;
  sheets: string[];
  selectedSheet: string;
  preview: Record<string, unknown>[];
  headers: string[];
  mapping: ColumnMapping[];
  validation: ValidationResult | null;
  processing: boolean;
  complete: boolean;
  error: string | null;
}

export interface GlobalFilters {
  dateFrom: string;
  dateTo: string;
  brand: string;
  class: string;
  vendorId: string;
  code: string;
  description: string;
  wioMin: number;
  wioMax: number;
  inventoryStatus: string;
  productVelocity: string;
}
