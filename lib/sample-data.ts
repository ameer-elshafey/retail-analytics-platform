import { SalesRecord, PurchaseRecord, InventoryRecord } from './types';

const brands = ['Samsung', 'LG', 'Sony', 'Bose', 'JBL', 'Apple', 'Dell', 'HP', 'Lenovo', 'Asus'];
const classes = ['TV', 'Audio', 'Mobile', 'Laptop', 'Tablet', 'Accessory', 'Monitor', 'Printer'];
const vendors = ['V001', 'V002', 'V003', 'V004', 'V005'];
const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const productNames: Record<string, string[]> = {
  TV: ['55" 4K Smart TV', '65" OLED TV', '75" QLED TV', '43" LED TV', '50" 8K TV'],
  Audio: ['Soundbar 300W', 'Wireless Earbuds', 'Bookshelf Speakers', 'Home Theater System', 'Bluetooth Speaker'],
  Mobile: ['Galaxy S24', 'iPhone 15', 'Pixel 8', 'OnePlus 12', 'Galaxy Z Fold'],
  Laptop: ['ThinkPad X1', 'MacBook Pro 14', 'Dell XPS 15', 'HP Spectre', 'ZenBook 14'],
  Tablet: ['iPad Air', 'Galaxy Tab S9', 'Surface Pro', 'iPad Mini', 'Galaxy Tab A'],
  Accessory: ['USB-C Hub', 'Wireless Charger', 'Phone Case', 'Screen Protector', 'Cable Pack'],
  Monitor: ['27" 4K Monitor', '32" Curved Monitor', '24" FHD Monitor', '34" Ultrawide', 'Portable Monitor'],
  Printer: ['LaserJet Pro', 'EcoTank ET-3850', 'Color Laser Printer', 'All-in-One Printer', 'Photo Printer'],
};

export function generateSalesData(count: number = 200): SalesRecord[] {
  const records: SalesRecord[] = [];
  for (let i = 0; i < count; i++) {
    const cls = pick(classes);
    const brand = pick(brands);
    const products = productNames[cls] || ['Generic Product'];
    const desc = pick(products);
    const qty = rand(1, 50);
    const unitCost = rand(20, 2000);
    const month = pick(months);
    records.push({
      id: uid(),
      date: `${month}-${String(rand(1, 28)).padStart(2, '0')}`,
      month,
      code: `${brand.slice(0, 3).toUpperCase()}-${rand(100, 999)}`,
      description: `${brand} ${desc}`,
      brand,
      class: cls,
      qty,
      unitCost,
      total: qty * unitCost,
      vendorId: pick(vendors),
    });
  }
  return records;
}

export function generatePurchaseData(count: number = 150): PurchaseRecord[] {
  const records: PurchaseRecord[] = [];
  for (let i = 0; i < count; i++) {
    const cls = pick(classes);
    const brand = pick(brands);
    const products = productNames[cls] || ['Generic Product'];
    const desc = pick(products);
    const qty = rand(10, 200);
    const unitCost = rand(15, 1800);
    const month = pick(months);
    records.push({
      id: uid(),
      date: `${month}-${String(rand(1, 28)).padStart(2, '0')}`,
      poNumber: `PO-${rand(10000, 99999)}`,
      code: `${brand.slice(0, 3).toUpperCase()}-${rand(100, 999)}`,
      description: `${brand} ${desc}`,
      brand,
      class: cls,
      qty,
      unitCost,
      total: qty * unitCost,
      vendorId: pick(vendors),
      credit: Math.random() > 0.7 ? rand(50, 500) : 0,
      dueDate: `${month}-${String(rand(1, 28)).padStart(2, '0')}`,
    });
  }
  return records;
}

export function generateInventoryData(count: number = 300): InventoryRecord[] {
  const records: InventoryRecord[] = [];
  for (let i = 0; i < count; i++) {
    const cls = pick(classes);
    const brand = pick(brands);
    const products = productNames[cls] || ['Generic Product'];
    const desc = pick(products);
    const qty = rand(0, 500);
    const unitCost = rand(15, 2000);
    const totalValue = qty * unitCost;
    const wioBenchmark = rand(15, 90);
    const salesVelocity = Math.random() * 20 + 0.5;
    const wioActual = qty / salesVelocity;
    const ratio = wioActual / wioBenchmark;

    let inventoryStatus: InventoryRecord['inventoryStatus'] = 'healthy';
    if (ratio > 2.0) inventoryStatus = 'overstock';
    else if (ratio < 0.4) inventoryStatus = 'critical';
    else if (ratio < 0.75) inventoryStatus = 'low';

    let riskLevel: InventoryRecord['riskLevel'] = 'low';
    if (ratio > 2.5 || ratio < 0.2) riskLevel = 'critical';
    else if (ratio > 1.8 || ratio < 0.4) riskLevel = 'high';
    else if (ratio > 1.4 || ratio < 0.6) riskLevel = 'medium';

    let abcClass: InventoryRecord['abcClass'] = 'C';
    if (totalValue > 50000) abcClass = 'A';
    else if (totalValue > 10000) abcClass = 'B';

    let productVelocity: InventoryRecord['productVelocity'] = 'slow';
    if (salesVelocity >= 5) productVelocity = 'fast';
    else if (salesVelocity >= 1) productVelocity = 'medium';

    records.push({
      id: uid(),
      code: `${brand.slice(0, 3).toUpperCase()}-${rand(100, 999)}`,
      description: `${brand} ${desc}`,
      brand,
      class: cls,
      vendorId: pick(vendors),
      qty,
      unitCost,
      totalValue,
      wioBenchmark,
      wioActual: Math.round(wioActual * 10) / 10,
      salesVelocity: Math.round(salesVelocity * 100) / 100,
      inventoryStatus,
      riskLevel,
      abcClass,
      productVelocity,
    });
  }
  return records;
}
