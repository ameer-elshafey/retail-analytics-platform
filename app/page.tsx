'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';
import { ChartBar as BarChart3, ShoppingCart, Package, TrendingUp, TriangleAlert as AlertTriangle, Brain, Upload, Filter, Download, ChevronRight, Search, LayoutDashboard, Tag, Users, Box, Shield, Bell, FileText, X, Check, CircleAlert as AlertCircle, Info, ChevronDown, Eye, Camera } from 'lucide-react';

import {
  SalesRecord, PurchaseRecord, InventoryRecord, ModuleView,
  KPI, WIORiskMatrix, AIInsight, AlertItem, GlobalFilters,
  ValidationResult, ColumnMapping, UploadState,
} from '@/lib/types';

import {
  computeSalesKPIs, computePurchaseKPIs, computeInventoryKPIs,
  computeWIORiskMatrix, computeSalesByBrand, computeSalesByMonth,
  computePurchaseByVendor, generateAIInsights, generateAlerts,
  applyFilters, computeInventoryStatus, computeRiskLevel,
  computeProductVelocity, computeABCClass, computeWIOActual,
} from '@/lib/analytics';

import { generateSalesData, generatePurchaseData, generateInventoryData } from '@/lib/sample-data';
import { autoMapHeaders, rowToRecord, normalizeHeaders, parseNumber } from '@/lib/normalization';
import { getFieldsForCategory } from '@/lib/schema';
import { validateData } from '@/lib/validation';
import { exportToCSV, exportToPDF, exportScreenshot } from '@/lib/export';

const NAV_ITEMS: { key: ModuleView; label: string; icon: React.ReactNode }[] = [
  { key: 'executive', label: 'Executive', icon: <LayoutDashboard size={18} /> },
  { key: 'sales', label: 'Sales', icon: <BarChart3 size={18} /> },
  { key: 'purchase', label: 'Purchase', icon: <ShoppingCart size={18} /> },
  { key: 'inventory', label: 'Inventory', icon: <Package size={18} /> },
  { key: 'brand', label: 'Brand', icon: <Tag size={18} /> },
  { key: 'vendor', label: 'Vendor', icon: <Users size={18} /> },
  { key: 'product', label: 'Product', icon: <Box size={18} /> },
  { key: 'risk', label: 'Risk Center', icon: <Shield size={18} /> },
  { key: 'ai-insights', label: 'AI Insights', icon: <Brain size={18} /> },
  { key: 'alerts', label: 'Alerts', icon: <Bell size={18} /> },
  { key: 'upload', label: 'Upload', icon: <Upload size={18} /> },
];

function formatValue(value: number, format: KPI['format']): string {
  switch (format) {
    case 'currency': return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
    case 'number': return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
    case 'percent': return `${value.toFixed(1)}%`;
    case 'days': return `${value.toFixed(1)}d`;
    default: return String(value);
  }
}

function KPICard({ kpi }: { kpi: KPI }) {
  const trendColor = kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-red-500' : 'text-slate-500';
  const trendIcon = kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→';
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-sm text-slate-500 mb-1">{kpi.label}</div>
      <div className="text-2xl font-bold text-slate-900">{formatValue(kpi.value, kpi.format)}</div>
      {kpi.change !== undefined && (
        <div className={`text-sm mt-1 ${trendColor}`}>
          {trendIcon} {Math.abs(kpi.change).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    overstock: 'bg-amber-100 text-amber-800',
    healthy: 'bg-emerald-100 text-emerald-800',
    low: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-800'}`}>
      {status}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[level] || 'bg-slate-100 text-slate-800'}`}>
      {level}
    </span>
  );
}

export default function HomePage() {
  const [activeModule, setActiveModule] = useState<ModuleView>('executive');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<GlobalFilters>({
    dateFrom: '', dateTo: '', brand: '', class: '', vendorId: '',
    code: '', description: '', wioMin: 0, wioMax: 0,
    inventoryStatus: '', productVelocity: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [alertsDismissed, setAlertsDismissed] = useState<Set<string>>(new Set());

  const [salesData, setSalesData] = useState<SalesRecord[]>(() => generateSalesData(200));
  const [purchaseData, setPurchaseData] = useState<PurchaseRecord[]>(() => generatePurchaseData(150));
  const [inventoryData, setInventoryData] = useState<InventoryRecord[]>(() => generateInventoryData(300));

  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({
    sales: { category: 'sales', file: null, fileName: '', sheets: [], selectedSheet: '', preview: [], headers: [], mapping: [], validation: null, processing: false, complete: false, error: null },
    purchase: { category: 'purchase', file: null, fileName: '', sheets: [], selectedSheet: '', preview: [], headers: [], mapping: [], validation: null, processing: false, complete: false, error: null },
    inventory: { category: 'inventory', file: null, fileName: '', sheets: [], selectedSheet: '', preview: [], headers: [], mapping: [], validation: null, processing: false, complete: false, error: null },
  });

  const mainRef = useRef<HTMLDivElement>(null);

  const filteredSales = useMemo(() => applyFilters(salesData, filters), [salesData, filters]);
  const filteredPurchases = useMemo(() => applyFilters(purchaseData, filters), [purchaseData, filters]);
  const filteredInventory = useMemo(() => applyFilters(inventoryData, filters), [inventoryData, filters]);

  const salesKPIs = useMemo(() => computeSalesKPIs(filteredSales), [filteredSales]);
  const purchaseKPIs = useMemo(() => computePurchaseKPIs(filteredPurchases), [filteredPurchases]);
  const inventoryKPIs = useMemo(() => computeInventoryKPIs(filteredInventory), [filteredInventory]);

  const wioRiskMatrix = useMemo(() => computeWIORiskMatrix(filteredInventory), [filteredInventory]);
  const salesByBrand = useMemo(() => computeSalesByBrand(filteredSales), [filteredSales]);
  const salesByMonth = useMemo(() => computeSalesByMonth(filteredSales), [filteredSales]);
  const purchaseByVendor = useMemo(() => computePurchaseByVendor(filteredPurchases), [filteredPurchases]);
  const aiInsights = useMemo(() => generateAIInsights(filteredSales, filteredPurchases, filteredInventory), [filteredSales, filteredPurchases, filteredInventory]);
  const alerts = useMemo(() => generateAlerts(filteredInventory), [filteredInventory]);

  const uniqueBrands = useMemo(() => [...new Set(inventoryData.map(i => i.brand))].sort(), [inventoryData]);
  const uniqueClasses = useMemo(() => [...new Set(inventoryData.map(i => i.class))].sort(), [inventoryData]);
  const uniqueVendors = useMemo(() => [...new Set(inventoryData.map(i => i.vendorId))].sort(), [inventoryData]);

  const handleFileUpload = useCallback(async (category: string, file: File) => {
    const state = { ...uploadStates[category] };
    state.file = file;
    state.fileName = file.name;
    state.error = null;
    state.complete = false;

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      state.sheets = wb.SheetNames;
      state.selectedSheet = wb.SheetNames[0];

      const ws = wb.Sheets[state.selectedSheet];
      const jsonData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (jsonData.length === 0) {
        state.error = 'No data found in file';
        setUploadStates(prev => ({ ...prev, [category]: state }));
        return;
      }

      const headers = normalizeHeaders(Object.keys(jsonData[0]));
      state.headers = headers;
      state.preview = jsonData.slice(0, 50);

      const autoMapping = autoMapHeaders(headers, category);
      state.mapping = Object.entries(autoMapping).map(([source, target]) => ({ source, target }));

      setUploadStates(prev => ({ ...prev, [category]: state }));
    } catch (err) {
      state.error = `Failed to read file: ${String(err)}`;
      setUploadStates(prev => ({ ...prev, [category]: state }));
    }
  }, [uploadStates]);

  const handleValidate = useCallback((category: string) => {
    const state = uploadStates[category];
    const mappingObj: Record<string, string> = {};
    for (const m of state.mapping) mappingObj[m.source] = m.target;

    const result = validateData(state.preview, category, mappingObj);
    setUploadStates(prev => ({
      ...prev,
      [category]: { ...prev[category], validation: result },
    }));
  }, [uploadStates]);

  const handleProcess = useCallback((category: string) => {
    const state = uploadStates[category];
    if (!state.validation || !state.validation.valid) return;

    const mappingObj: Record<string, string> = {};
    for (const m of state.mapping) mappingObj[m.source] = m.target;

    const processed = state.preview.map((row, idx) => {
      const record = rowToRecord(row, mappingObj, category);
      record.id = `upload-${idx}`;

      if (category === 'inventory') {
        const qty = parseNumber(record.qty);
        const unitCost = parseNumber(record.unitCost);
        const wioBenchmark = parseNumber(record.wioBenchmark);
        const salesVelocity = Math.random() * 15 + 0.5;
        const wioActual = computeWIOActual(qty, salesVelocity);
        record.totalValue = qty * unitCost;
        record.wioActual = Math.round(wioActual * 10) / 10;
        record.wioBenchmark = wioBenchmark;
        record.salesVelocity = Math.round(salesVelocity * 100) / 100;
        record.inventoryStatus = computeInventoryStatus(wioActual, wioBenchmark);
        record.riskLevel = computeRiskLevel(wioActual, wioBenchmark);
        record.abcClass = computeABCClass(qty * unitCost, { a: 50000, b: 10000 });
        record.productVelocity = computeProductVelocity(salesVelocity);
      }

      return record;
    });

    if (category === 'sales') setSalesData(prev => [...prev, ...processed as unknown as SalesRecord[]]);
    if (category === 'purchase') setPurchaseData(prev => [...prev, ...processed as unknown as PurchaseRecord[]]);
    if (category === 'inventory') setInventoryData(prev => [...prev, ...processed as unknown as InventoryRecord[]]);

    setUploadStates(prev => ({
      ...prev,
      [category]: { ...prev[category], complete: true, processing: false },
    }));
  }, [uploadStates]);

  const salesChartOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const },
    xAxis: { type: 'category' as const, data: salesByMonth.map(d => d.month) },
    yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `$${(v / 1000).toFixed(0)}K` } },
    series: [{ data: salesByMonth.map(d => d.revenue), type: 'bar' as const, itemStyle: { color: '#0284c7' } }],
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
  }), [salesByMonth]);

  const brandChartOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const },
    xAxis: { type: 'category' as const, data: salesByBrand.slice(0, 8).map(d => d.brand), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `$${(v / 1000).toFixed(0)}K` } },
    series: [{ data: salesByBrand.slice(0, 8).map(d => d.revenue), type: 'bar' as const, itemStyle: { color: '#0891b2' } }],
    grid: { left: 60, right: 20, top: 20, bottom: 60 },
  }), [salesByBrand]);

  const vendorChartOption = useMemo(() => ({
    tooltip: { trigger: 'item' as const },
    series: [{
      type: 'pie' as const,
      radius: ['40%', '70%'],
      data: purchaseByVendor.slice(0, 6).map(d => ({ name: d.vendorId, value: d.total })),
      label: { show: true, formatter: '{b}: ${c}' },
    }],
  }), [purchaseByVendor]);

  const inventoryPieOption = useMemo(() => {
    const counts = {
      overstock: filteredInventory.filter(i => i.inventoryStatus === 'overstock').length,
      healthy: filteredInventory.filter(i => i.inventoryStatus === 'healthy').length,
      low: filteredInventory.filter(i => i.inventoryStatus === 'low').length,
      critical: filteredInventory.filter(i => i.inventoryStatus === 'critical').length,
    };
    return {
      tooltip: { trigger: 'item' as const },
      series: [{
        type: 'pie' as const,
        radius: ['40%', '70%'],
        data: [
          { name: 'Overstock', value: counts.overstock, itemStyle: { color: '#f59e0b' } },
          { name: 'Healthy', value: counts.healthy, itemStyle: { color: '#10b981' } },
          { name: 'Low', value: counts.low, itemStyle: { color: '#f97316' } },
          { name: 'Critical', value: counts.critical, itemStyle: { color: '#ef4444' } },
        ],
        label: { show: true, formatter: '{b}: {c}' },
      }],
    };
  }, [filteredInventory]);

  const renderExecutive = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {inventoryKPIs.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Monthly Revenue Trend</h3>
          <ReactECharts option={salesChartOption} style={{ height: 280 }} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Inventory Health</h3>
          <ReactECharts option={inventoryPieOption} style={{ height: 280 }} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">WIO Risk Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Brand</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Class</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Items</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Overstock</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Healthy</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Low</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Critical</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Avg WIO</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Benchmark</th>
              </tr>
            </thead>
            <tbody>
              {wioRiskMatrix.slice(0, 15).map((row, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3 font-medium">{row.brand}</td>
                  <td className="py-2 px-3">{row.class}</td>
                  <td className="py-2 px-3 text-right">{row.totalItems}</td>
                  <td className="py-2 px-3 text-right text-amber-600">{row.overstock}</td>
                  <td className="py-2 px-3 text-right text-emerald-600">{row.healthy}</td>
                  <td className="py-2 px-3 text-right text-orange-600">{row.low}</td>
                  <td className="py-2 px-3 text-right text-red-600 font-medium">{row.critical}</td>
                  <td className="py-2 px-3 text-right">{row.avgWIO.toFixed(1)}d</td>
                  <td className="py-2 px-3 text-right">{row.avgBenchmark.toFixed(1)}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {aiInsights.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Brain size={16} className="text-cyan-600" /> AI Executive Brief
          </h3>
          <div className="space-y-3">
            {aiInsights.slice(0, 4).map(insight => (
              <div key={insight.id} className={`p-3 rounded-lg border ${
                insight.severity === 'critical' ? 'border-red-200 bg-red-50' :
                insight.severity === 'warning' ? 'border-amber-200 bg-amber-50' :
                'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-start gap-2">
                  {insight.severity === 'critical' ? <AlertCircle size={16} className="text-red-500 mt-0.5" /> :
                   insight.severity === 'warning' ? <AlertTriangle size={16} className="text-amber-500 mt-0.5" /> :
                   <Info size={16} className="text-slate-500 mt-0.5" />}
                  <div>
                    <div className="font-medium text-sm">{insight.title}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{insight.description}</div>
                    <div className="text-xs text-slate-500 mt-1 italic">{insight.recommendation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSales = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {salesKPIs.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Revenue by Month</h3>
          <ReactECharts option={salesChartOption} style={{ height: 300 }} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Revenue by Brand</h3>
          <ReactECharts option={brandChartOption} style={{ height: 300 }} />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Sales Transactions</h3>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Date</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Code</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Description</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Brand</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Qty</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Unit Cost</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.slice(0, 100).map(r => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3">{r.date}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.code}</td>
                  <td className="py-2 px-3 max-w-48 truncate">{r.description}</td>
                  <td className="py-2 px-3">{r.brand}</td>
                  <td className="py-2 px-3 text-right">{r.qty}</td>
                  <td className="py-2 px-3 text-right">${r.unitCost.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-medium">${r.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPurchase = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {purchaseKPIs.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Spend by Vendor</h3>
          <ReactECharts option={vendorChartOption} style={{ height: 300 }} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Vendors</h3>
          <div className="space-y-2">
            {purchaseByVendor.slice(0, 8).map((v, i) => (
              <div key={v.vendorId} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-5">{i + 1}</span>
                  <span className="font-medium text-sm">{v.vendorId}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatValue(v.total, 'currency')}</div>
                  <div className="text-xs text-slate-500">{v.count} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Purchase Orders</h3>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Date</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">PO#</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Code</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Brand</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Qty</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Total</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Credit</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.slice(0, 100).map(r => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3">{r.date}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.poNumber}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.code}</td>
                  <td className="py-2 px-3">{r.brand}</td>
                  <td className="py-2 px-3 text-right">{r.qty}</td>
                  <td className="py-2 px-3 text-right font-medium">${r.total.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right text-emerald-600">${r.credit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {inventoryKPIs.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Inventory Health Distribution</h3>
        <ReactECharts option={inventoryPieOption} style={{ height: 300 }} />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Inventory Items</h3>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Code</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Description</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Brand</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Qty</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Value</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">WIO</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Benchmark</th>
                <th className="text-center py-2 px-3 text-slate-600 font-medium">Status</th>
                <th className="text-center py-2 px-3 text-slate-600 font-medium">Risk</th>
                <th className="text-center py-2 px-3 text-slate-600 font-medium">ABC</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.slice(0, 100).map(r => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-xs">{r.code}</td>
                  <td className="py-2 px-3 max-w-40 truncate">{r.description}</td>
                  <td className="py-2 px-3">{r.brand}</td>
                  <td className="py-2 px-3 text-right">{r.qty}</td>
                  <td className="py-2 px-3 text-right">${r.totalValue.toFixed(0)}</td>
                  <td className="py-2 px-3 text-right">{r.wioActual.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right">{r.wioBenchmark.toFixed(1)}</td>
                  <td className="py-2 px-3 text-center"><StatusBadge status={r.inventoryStatus} /></td>
                  <td className="py-2 px-3 text-center"><RiskBadge level={r.riskLevel} /></td>
                  <td className="py-2 px-3 text-center font-medium">{r.abcClass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBrand = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Revenue by Brand</h3>
        <ReactECharts option={brandChartOption} style={{ height: 350 }} />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Brand Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Brand</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Revenue</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Units</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Avg Price</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Inventory Items</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Overstock</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Critical</th>
              </tr>
            </thead>
            <tbody>
              {salesByBrand.map(b => {
                const invItems = filteredInventory.filter(i => i.brand === b.brand);
                return (
                  <tr key={b.brand} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium">{b.brand}</td>
                    <td className="py-2 px-3 text-right">{formatValue(b.revenue, 'currency')}</td>
                    <td className="py-2 px-3 text-right">{b.qty}</td>
                    <td className="py-2 px-3 text-right">${(b.revenue / b.qty).toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">{invItems.length}</td>
                    <td className="py-2 px-3 text-right text-amber-600">{invItems.filter(i => i.inventoryStatus === 'overstock').length}</td>
                    <td className="py-2 px-3 text-right text-red-600">{invItems.filter(i => i.inventoryStatus === 'critical').length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderVendor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Spend Distribution</h3>
          <ReactECharts option={vendorChartOption} style={{ height: 300 }} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Vendor Rankings</h3>
          <div className="space-y-2">
            {purchaseByVendor.map((v, i) => (
              <div key={v.vendorId} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                <span className="text-xs text-slate-400 w-5">#{i + 1}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{v.vendorId}</div>
                  <div className="text-xs text-slate-500">{v.count} purchase orders</div>
                </div>
                <div className="text-sm font-medium">{formatValue(v.total, 'currency')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProduct = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Product Intelligence</h3>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Code</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Description</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Brand</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Class</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Qty</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Value</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Velocity</th>
                <th className="text-center py-2 px-3 text-slate-600 font-medium">ABC</th>
                <th className="text-center py-2 px-3 text-slate-600 font-medium">Speed</th>
                <th className="text-center py-2 px-3 text-slate-600 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.slice(0, 150).map(r => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-xs">{r.code}</td>
                  <td className="py-2 px-3 max-w-40 truncate">{r.description}</td>
                  <td className="py-2 px-3">{r.brand}</td>
                  <td className="py-2 px-3">{r.class}</td>
                  <td className="py-2 px-3 text-right">{r.qty}</td>
                  <td className="py-2 px-3 text-right">${r.totalValue.toFixed(0)}</td>
                  <td className="py-2 px-3 text-right">{r.salesVelocity.toFixed(2)}</td>
                  <td className="py-2 px-3 text-center font-medium">{r.abcClass}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.productVelocity === 'fast' ? 'bg-emerald-100 text-emerald-800' :
                      r.productVelocity === 'medium' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>{r.productVelocity}</span>
                  </td>
                  <td className="py-2 px-3 text-center"><StatusBadge status={r.inventoryStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRisk = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">WIO Risk Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Brand</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Class</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Items</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Overstock</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Low</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Critical</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Avg WIO</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Benchmark</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Gap</th>
              </tr>
            </thead>
            <tbody>
              {wioRiskMatrix.map((row, i) => {
                const gap = row.avgWIO - row.avgBenchmark;
                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium">{row.brand}</td>
                    <td className="py-2 px-3">{row.class}</td>
                    <td className="py-2 px-3 text-right">{row.totalItems}</td>
                    <td className="py-2 px-3 text-right text-amber-600">{row.overstock}</td>
                    <td className="py-2 px-3 text-right text-orange-600">{row.low}</td>
                    <td className="py-2 px-3 text-right text-red-600 font-medium">{row.critical}</td>
                    <td className="py-2 px-3 text-right">{row.avgWIO.toFixed(1)}d</td>
                    <td className="py-2 px-3 text-right">{row.avgBenchmark.toFixed(1)}d</td>
                    <td className={`py-2 px-3 text-right font-medium ${gap > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {gap > 0 ? '+' : ''}{gap.toFixed(1)}d
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Critical & High Risk Items</h3>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Code</th>
                <th className="text-left py-2 px-3 text-slate-600 font-medium">Description</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">WIO</th>
                <th className="text-right py-2 px-3 text-slate-600 font-medium">Benchmark</th>
                <th className="text-center py-2 px-3 text-slate-600 font-medium">Risk</th>
                <th className="text-center py-2 px-3 text-slate-600 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory
                .filter(i => i.riskLevel === 'critical' || i.riskLevel === 'high')
                .slice(0, 50)
                .map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-xs">{r.code}</td>
                    <td className="py-2 px-3 max-w-40 truncate">{r.description}</td>
                    <td className="py-2 px-3 text-right">{r.wioActual.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right">{r.wioBenchmark.toFixed(1)}</td>
                    <td className="py-2 px-3 text-center"><RiskBadge level={r.riskLevel} /></td>
                    <td className="py-2 px-3 text-center"><StatusBadge status={r.inventoryStatus} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAIInsights = () => (
    <div className="space-y-4">
      {aiInsights.map(insight => (
        <div key={insight.id} className={`bg-white rounded-xl border p-5 shadow-sm ${
          insight.severity === 'critical' ? 'border-red-300' :
          insight.severity === 'warning' ? 'border-amber-300' :
          'border-slate-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              insight.severity === 'critical' ? 'bg-red-100' :
              insight.severity === 'warning' ? 'bg-amber-100' :
              'bg-cyan-100'
            }`}>
              {insight.category === 'risk' ? <AlertTriangle size={20} className="text-red-600" /> :
               insight.category === 'opportunity' ? <TrendingUp size={20} className="text-emerald-600" /> :
               insight.category === 'trend' ? <BarChart3 size={20} className="text-cyan-600" /> :
               <Brain size={20} className="text-cyan-600" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{insight.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  insight.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  insight.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                  'bg-cyan-100 text-cyan-800'
                }`}>{insight.severity}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{insight.category}</span>
              </div>
              <p className="text-sm text-slate-600">{insight.description}</p>
              <p className="text-sm text-slate-500 mt-2 italic">{insight.recommendation}</p>
              <div className="flex gap-4 mt-2 text-xs text-slate-500">
                <span>Affected: {insight.affectedItems} items</span>
                <span>Impact: {formatValue(insight.potentialImpact, 'currency')}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAlerts = () => {
    const activeAlerts = alerts.filter(a => !alertsDismissed.has(a.id));
    return (
      <div className="space-y-3">
        {activeAlerts.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            No active alerts
          </div>
        )}
        {activeAlerts.map(alert => (
          <div key={alert.id} className={`bg-white rounded-xl border p-4 shadow-sm flex items-start gap-3 ${
            alert.severity === 'critical' ? 'border-red-300' : 'border-amber-300'
          }`}>
            <div className={`p-1.5 rounded-lg ${
              alert.severity === 'critical' ? 'bg-red-100' : 'bg-amber-100'
            }`}>
              {alert.type === 'critical' ? <AlertCircle size={18} className="text-red-600" /> :
               <AlertTriangle size={18} className="text-amber-600" />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{alert.title}</div>
              <div className="text-xs text-slate-600 mt-0.5">{alert.message}</div>
            </div>
            <button
              onClick={() => setAlertsDismissed(prev => new Set(prev).add(alert.id))}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderUpload = () => (
    <div className="space-y-6">
      {(['sales', 'purchase', 'inventory'] as const).map(category => {
        const state = uploadStates[category];
        const fields = getFieldsForCategory(category);
        return (
          <div key={category} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 capitalize">{category} Data Upload</h3>

            {!state.fileName && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-cyan-400 transition-colors">
                <Upload size={24} className="text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">Drop {category} file or click to browse</span>
                <span className="text-xs text-slate-400 mt-1">Supports .xlsx, .xls, .csv</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(category, file);
                  }}
                />
              </label>
            )}

            {state.fileName && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-cyan-600" />
                  <span className="font-medium">{state.fileName}</span>
                  {state.sheets.length > 1 && (
                    <select
                      value={state.selectedSheet}
                      onChange={e => {
                        const newState = { ...state, selectedSheet: e.target.value };
                        setUploadStates(prev => ({ ...prev, [category]: newState }));
                      }}
                      className="ml-2 text-xs border border-slate-300 rounded px-2 py-1"
                    >
                      {state.sheets.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                  <button onClick={() => setUploadStates(prev => ({
                    ...prev,
                    [category]: { category: category as 'sales' | 'purchase' | 'inventory', file: null, fileName: '', sheets: [], selectedSheet: '', preview: [], headers: [], mapping: [], validation: null, processing: false, complete: false, error: null }
                  }))} className="ml-auto text-slate-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>

                {state.headers.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600 mb-2">Column Mapping</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {state.headers.map(header => {
                        const mapped = state.mapping.find(m => m.source === header);
                        return (
                          <div key={header} className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 truncate max-w-24" title={header}>{header}</span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <select
                              value={mapped?.target || ''}
                              onChange={e => {
                                const newMapping = [...state.mapping.filter(m => m.source !== header)];
                                if (e.target.value) newMapping.push({ source: header, target: e.target.value });
                                setUploadStates(prev => ({
                                  ...prev,
                                  [category]: { ...prev[category], mapping: newMapping, validation: null }
                                }));
                              }}
                              className="border border-slate-300 rounded px-1 py-0.5 flex-1"
                            >
                              <option value="">-- skip --</option>
                              {fields.map(f => <option key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</option>)}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {state.preview.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600 mb-2">Preview ({state.preview.length} rows)</h4>
                    <div className="overflow-x-auto max-h-40 border border-slate-200 rounded">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-slate-50">
                          <tr>
                            {state.headers.slice(0, 6).map(h => (
                              <th key={h} className="text-left py-1 px-2 text-slate-600 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {state.preview.slice(0, 5).map((row, i) => (
                            <tr key={i} className="border-t border-slate-100">
                              {state.headers.slice(0, 6).map(h => (
                                <td key={h} className="py-1 px-2 truncate max-w-32">{String(row[h] ?? '')}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {state.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {state.error}
                  </div>
                )}

                {state.validation && (
                  <div className={`p-3 rounded-lg text-sm ${
                    state.validation.summary.blocked ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'
                  }`}>
                    <div className="font-medium mb-1">
                      {state.validation.summary.blocked ? 'Validation Failed' : 'Validation Passed'}
                    </div>
                    <div className="text-xs">
                      {state.validation.summary.totalRows} rows | {state.validation.summary.errors} errors | {state.validation.summary.warnings} warnings
                    </div>
                    {state.validation.summary.blockReason && (
                      <div className="text-xs mt-1 text-red-600">{state.validation.summary.blockReason}</div>
                    )}
                    {state.validation.issues.slice(0, 5).map((issue, i) => (
                      <div key={i} className="text-xs mt-1">
                        Row {issue.row}, {issue.column}: {issue.message}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {!state.validation && (
                    <button
                      onClick={() => handleValidate(category)}
                      className="px-4 py-2 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      Validate
                    </button>
                  )}
                  {state.validation && !state.validation.summary.blocked && !state.complete && (
                    <button
                      onClick={() => handleProcess(category)}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Process & Import
                    </button>
                  )}
                  {state.complete && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm">
                      <Check size={16} /> Imported successfully
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderModule = () => {
    switch (activeModule) {
      case 'executive': return renderExecutive();
      case 'sales': return renderSales();
      case 'purchase': return renderPurchase();
      case 'inventory': return renderInventory();
      case 'brand': return renderBrand();
      case 'vendor': return renderVendor();
      case 'product': return renderProduct();
      case 'risk': return renderRisk();
      case 'ai-insights': return renderAIInsights();
      case 'alerts': return renderAlerts();
      case 'upload': return renderUpload();
      default: return renderExecutive();
    }
  };

  const activeAlertCount = alerts.filter(a => !alertsDismissed.has(a.id)).length;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-white border-r border-slate-200 flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="p-3 border-b border-slate-200 flex items-center gap-2">
          {sidebarOpen && <span className="font-bold text-sm text-slate-900">Retail Intel</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto p-1 hover:bg-slate-100 rounded">
            <ChevronRight size={16} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveModule(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                activeModule === item.key
                  ? 'bg-cyan-50 text-cyan-700 font-medium border-r-2 border-cyan-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
              {item.key === 'alerts' && activeAlertCount > 0 && sidebarOpen && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{activeAlertCount}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 flex-shrink-0">
          <h1 className="text-lg font-semibold text-slate-900">
            {NAV_ITEMS.find(n => n.key === activeModule)?.label || 'Executive Overview'}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                showFilters ? 'bg-cyan-50 border-cyan-300 text-cyan-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={14} /> Filters
            </button>
            <button
              onClick={() => exportToCSV(filteredInventory as unknown as Record<string, unknown>[], `retail-${activeModule}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <Download size={14} /> CSV
            </button>
            <button
              onClick={() => exportToPDF('main-content', `retail-${activeModule}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <FileText size={14} /> PDF
            </button>
            <button
              onClick={() => exportScreenshot('main-content', `retail-${activeModule}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <Camera size={14} /> Screenshot
            </button>
          </div>
        </header>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border-b border-slate-200 p-4 flex-shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Brand</label>
                <select
                  value={filters.brand}
                  onChange={e => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                >
                  <option value="">All Brands</option>
                  {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Class</label>
                <select
                  value={filters.class}
                  onChange={e => setFilters(prev => ({ ...prev, class: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Vendor</label>
                <select
                  value={filters.vendorId}
                  onChange={e => setFilters(prev => ({ ...prev, vendorId: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                >
                  <option value="">All Vendors</option>
                  {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Code</label>
                <input
                  type="text"
                  value={filters.code}
                  onChange={e => setFilters(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Search code..."
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Inventory Status</label>
                <select
                  value={filters.inventoryStatus}
                  onChange={e => setFilters(prev => ({ ...prev, inventoryStatus: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                >
                  <option value="">All</option>
                  <option value="overstock">Overstock</option>
                  <option value="healthy">Healthy</option>
                  <option value="low">Low</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Velocity</label>
                <select
                  value={filters.productVelocity}
                  onChange={e => setFilters(prev => ({ ...prev, productVelocity: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                >
                  <option value="">All</option>
                  <option value="fast">Fast</option>
                  <option value="medium">Medium</option>
                  <option value="slow">Slow</option>
                </select>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => setFilters({
                  dateFrom: '', dateTo: '', brand: '', class: '', vendorId: '',
                  code: '', description: '', wioMin: 0, wioMax: 0,
                  inventoryStatus: '', productVelocity: '',
                })}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div id="main-content" ref={mainRef} className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}
