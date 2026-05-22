import {
  SalesRecord,
  PurchaseRecord,
  InventoryRecord,
  KPI,
  WIORiskMatrix,
  AIInsight,
  AlertItem,
  GlobalFilters,
} from './types';

export function computeSalesKPIs(records: SalesRecord[]): KPI[] {
  const totalRevenue = records.reduce((s, r) => s + r.total, 0);
  const totalQty = records.reduce((s, r) => s + r.qty, 0);
  const avgUnitCost = records.length > 0 ? totalRevenue / totalQty : 0;
  const uniqueProducts = new Set(records.map(r => r.code)).size;
  const uniqueBrands = new Set(records.map(r => r.brand)).size;

  return [
    { label: 'Total Revenue', value: totalRevenue, format: 'currency', change: 5.2, trend: 'up' },
    { label: 'Units Sold', value: totalQty, format: 'number', change: 3.1, trend: 'up' },
    { label: 'Avg Unit Price', value: avgUnitCost, format: 'currency', change: -1.2, trend: 'down' },
    { label: 'Unique Products', value: uniqueProducts, format: 'number', change: 2, trend: 'up' },
    { label: 'Active Brands', value: uniqueBrands, format: 'number', change: 0, trend: 'flat' },
    { label: 'Transactions', value: records.length, format: 'number', change: 4.5, trend: 'up' },
  ];
}

export function computePurchaseKPIs(records: PurchaseRecord[]): KPI[] {
  const totalSpend = records.reduce((s, r) => s + r.total, 0);
  const totalQty = records.reduce((s, r) => s + r.qty, 0);
  const totalCredit = records.reduce((s, r) => s + r.credit, 0);
  const uniqueVendors = new Set(records.map(r => r.vendorId)).size;

  return [
    { label: 'Total Spend', value: totalSpend, format: 'currency', change: 2.8, trend: 'up' },
    { label: 'Units Ordered', value: totalQty, format: 'number', change: 1.5, trend: 'up' },
    { label: 'Total Credits', value: totalCredit, format: 'currency', change: -3.2, trend: 'down' },
    { label: 'Active Vendors', value: uniqueVendors, format: 'number', change: 0, trend: 'flat' },
    { label: 'PO Count', value: records.length, format: 'number', change: 6.1, trend: 'up' },
    { label: 'Net Spend', value: totalSpend - totalCredit, format: 'currency', change: 3.4, trend: 'up' },
  ];
}

export function computeInventoryKPIs(records: InventoryRecord[]): KPI[] {
  const totalValue = records.reduce((s, r) => s + r.totalValue, 0);
  const totalQty = records.reduce((s, r) => s + r.qty, 0);
  const overstock = records.filter(r => r.inventoryStatus === 'overstock').length;
  const critical = records.filter(r => r.inventoryStatus === 'critical').length;
  const avgWIO = records.length > 0 ? records.reduce((s, r) => s + r.wioActual, 0) / records.length : 0;

  return [
    { label: 'Total Inventory Value', value: totalValue, format: 'currency', change: -2.1, trend: 'down' },
    { label: 'Total Units', value: totalQty, format: 'number', change: -1.5, trend: 'down' },
    { label: 'Overstock Items', value: overstock, format: 'number', change: 8.3, trend: 'up' },
    { label: 'Critical Items', value: critical, format: 'number', change: -12.5, trend: 'down' },
    { label: 'Avg WIO Days', value: avgWIO, format: 'days', change: 2.3, trend: 'up' },
    { label: 'SKU Count', value: records.length, format: 'number', change: 0, trend: 'flat' },
  ];
}

export function computeWIOActual(qty: number, salesVelocity: number): number {
  if (salesVelocity <= 0) return 999;
  return qty / salesVelocity;
}

export function computeInventoryStatus(wioActual: number, wioBenchmark: number): InventoryRecord['inventoryStatus'] {
  const ratio = wioActual / wioBenchmark;
  if (ratio > 2.0) return 'overstock';
  if (ratio >= 0.75) return 'healthy';
  if (ratio >= 0.4) return 'low';
  return 'critical';
}

export function computeRiskLevel(wioActual: number, wioBenchmark: number): InventoryRecord['riskLevel'] {
  const ratio = wioActual / wioBenchmark;
  if (ratio > 2.5 || ratio < 0.2) return 'critical';
  if (ratio > 1.8 || ratio < 0.4) return 'high';
  if (ratio > 1.4 || ratio < 0.6) return 'medium';
  return 'low';
}

export function computeABCClass(totalValue: number, thresholds: { a: number; b: number }): InventoryRecord['abcClass'] {
  if (totalValue >= thresholds.a) return 'A';
  if (totalValue >= thresholds.b) return 'B';
  return 'C';
}

export function computeProductVelocity(salesVelocity: number): InventoryRecord['productVelocity'] {
  if (salesVelocity >= 5) return 'fast';
  if (salesVelocity >= 1) return 'medium';
  return 'slow';
}

export function computeWIORiskMatrix(records: InventoryRecord[]): WIORiskMatrix[] {
  const groups: Record<string, InventoryRecord[]> = {};
  for (const r of records) {
    const key = `${r.brand}|||${r.class}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }

  return Object.entries(groups).map(([key, items]) => {
    const [brand, cls] = key.split('|||');
    return {
      brand,
      class: cls,
      totalItems: items.length,
      overstock: items.filter(i => i.inventoryStatus === 'overstock').length,
      healthy: items.filter(i => i.inventoryStatus === 'healthy').length,
      low: items.filter(i => i.inventoryStatus === 'low').length,
      critical: items.filter(i => i.inventoryStatus === 'critical').length,
      avgWIO: items.reduce((s, i) => s + i.wioActual, 0) / items.length,
      avgBenchmark: items.reduce((s, i) => s + i.wioBenchmark, 0) / items.length,
    };
  }).sort((a, b) => b.critical - a.critical || b.overstock - a.overstock);
}

export function computeSalesByBrand(records: SalesRecord[]): { brand: string; revenue: number; qty: number }[] {
  const map: Record<string, { revenue: number; qty: number }> = {};
  for (const r of records) {
    if (!map[r.brand]) map[r.brand] = { revenue: 0, qty: 0 };
    map[r.brand].revenue += r.total;
    map[r.brand].qty += r.qty;
  }
  return Object.entries(map)
    .map(([brand, data]) => ({ brand, ...data }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeSalesByMonth(records: SalesRecord[]): { month: string; revenue: number; qty: number }[] {
  const map: Record<string, { revenue: number; qty: number }> = {};
  for (const r of records) {
    const m = r.month || r.date?.slice(0, 7) || 'Unknown';
    if (!map[m]) map[m] = { revenue: 0, qty: 0 };
    map[m].revenue += r.total;
    map[m].qty += r.qty;
  }
  return Object.entries(map)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function computePurchaseByVendor(records: PurchaseRecord[]): { vendorId: string; total: number; count: number }[] {
  const map: Record<string, { total: number; count: number }> = {};
  for (const r of records) {
    if (!map[r.vendorId]) map[r.vendorId] = { total: 0, count: 0 };
    map[r.vendorId].total += r.total;
    map[r.vendorId].count += 1;
  }
  return Object.entries(map)
    .map(([vendorId, data]) => ({ vendorId, ...data }))
    .sort((a, b) => b.total - a.total);
}

export function generateAIInsights(
  sales: SalesRecord[],
  purchases: PurchaseRecord[],
  inventory: InventoryRecord[]
): AIInsight[] {
  const insights: AIInsight[] = [];
  let id = 1;

  const criticalItems = inventory.filter(i => i.inventoryStatus === 'critical');
  if (criticalItems.length > 0) {
    insights.push({
      id: `ai-${id++}`,
      category: 'risk',
      severity: 'critical',
      title: 'Critical Stock Alert',
      description: `${criticalItems.length} products are at critical stock levels with WIO significantly below benchmark.`,
      recommendation: 'Expedite purchase orders for critical items. Consider alternative suppliers to reduce lead time.',
      affectedItems: criticalItems.length,
      potentialImpact: criticalItems.reduce((s, i) => s + i.totalValue, 0),
    });
  }

  const overstockItems = inventory.filter(i => i.inventoryStatus === 'overstock');
  if (overstockItems.length > 0) {
    insights.push({
      id: `ai-${id++}`,
      category: 'risk',
      severity: 'warning',
      title: 'Overstock Risk Detected',
      description: `${overstockItems.length} products have WIO exceeding 2x benchmark, indicating excess inventory.`,
      recommendation: 'Implement markdown strategy or bundle promotions to reduce excess stock. Review future purchase orders.',
      affectedItems: overstockItems.length,
      potentialImpact: overstockItems.reduce((s, i) => s + i.totalValue, 0),
    });
  }

  const brandRevenue = computeSalesByBrand(sales);
  if (brandRevenue.length > 0) {
    const topBrand = brandRevenue[0];
    insights.push({
      id: `ai-${id++}`,
      category: 'trend',
      severity: 'info',
      title: 'Top Brand Performance',
      description: `${topBrand.brand} leads with $${(topBrand.revenue / 1000).toFixed(0)}K in revenue across ${topBrand.qty} units sold.`,
      recommendation: 'Ensure adequate stock levels for top-performing brand. Negotiate volume discounts with vendor.',
      affectedItems: sales.filter(s => s.brand === topBrand.brand).length,
      potentialImpact: topBrand.revenue * 0.15,
    });
  }

  const slowMovers = inventory.filter(i => i.productVelocity === 'slow' && i.qty > 0);
  if (slowMovers.length > 0) {
    insights.push({
      id: `ai-${id++}`,
      category: 'opportunity',
      severity: 'warning',
      title: 'Slow-Moving Inventory',
      description: `${slowMovers.length} products have low sales velocity with remaining stock, tying up capital.`,
      recommendation: 'Consider clearance pricing or vendor return programs for slow-moving items.',
      affectedItems: slowMovers.length,
      potentialImpact: slowMovers.reduce((s, i) => s + i.totalValue, 0) * 0.3,
    });
  }

  return insights;
}

export function generateAlerts(inventory: InventoryRecord[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  let id = 1;

  for (const item of inventory) {
    if (item.inventoryStatus === 'critical') {
      alerts.push({
        id: `alert-${id++}`,
        type: 'critical',
        severity: 'critical',
        title: `Critical Stock: ${item.code}`,
        message: `${item.description || item.code} - WIO ${item.wioActual.toFixed(1)} vs benchmark ${item.wioBenchmark.toFixed(1)}`,
        timestamp: new Date().toISOString(),
        dismissed: false,
      });
    }
  }

  for (const item of inventory) {
    if (item.inventoryStatus === 'overstock') {
      alerts.push({
        id: `alert-${id++}`,
        type: 'overstock',
        severity: 'warning',
        title: `Overstock: ${item.code}`,
        message: `${item.description || item.code} - WIO ${item.wioActual.toFixed(1)} vs benchmark ${item.wioBenchmark.toFixed(1)}`,
        timestamp: new Date().toISOString(),
        dismissed: false,
      });
    }
  }

  return alerts.slice(0, 50);
}

export function applyFilters<T extends { brand?: string; class?: string; vendorId?: string; code?: string; description?: string; date?: string; wioActual?: number; inventoryStatus?: string; productVelocity?: string }>(
  records: T[],
  filters: GlobalFilters
): T[] {
  return records.filter(r => {
    if (filters.brand && r.brand && r.brand !== filters.brand) return false;
    if (filters.class && r.class && r.class !== filters.class) return false;
    if (filters.vendorId && r.vendorId && r.vendorId !== filters.vendorId) return false;
    if (filters.code && r.code && !r.code.toLowerCase().includes(filters.code.toLowerCase())) return false;
    if (filters.description && r.description && !r.description.toLowerCase().includes(filters.description.toLowerCase())) return false;
    if (filters.dateFrom && r.date && r.date < filters.dateFrom) return false;
    if (filters.dateTo && r.date && r.date > filters.dateTo) return false;
    if (filters.wioMin && r.wioActual !== undefined && r.wioActual < filters.wioMin) return false;
    if (filters.wioMax && r.wioActual !== undefined && r.wioActual > filters.wioMax) return false;
    if (filters.inventoryStatus && r.inventoryStatus && r.inventoryStatus !== filters.inventoryStatus) return false;
    if (filters.productVelocity && r.productVelocity && r.productVelocity !== filters.productVelocity) return false;
    return true;
  });
}
