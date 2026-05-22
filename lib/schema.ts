export interface FieldSpec {
  key: string;
  label: string;
  required: boolean;
  aliases: string[];
}

export const salesFields: FieldSpec[] = [
  { key: 'date', label: 'Date', required: true, aliases: ['date', 'sale_date', 'sales_date', 'transaction_date', 'inv_date'] },
  { key: 'month', label: 'Month', required: false, aliases: ['month', 'sale_month', 'period'] },
  { key: 'code', label: 'Code', required: true, aliases: ['code', 'product_code', 'item_code', 'sku', 'part_number', 'item'] },
  { key: 'description', label: 'Description', required: false, aliases: ['description', 'desc', 'item_desc', 'product_desc', 'name'] },
  { key: 'brand', label: 'Brand', required: false, aliases: ['brand', 'manufacturer', 'make'] },
  { key: 'class', label: 'Class', required: false, aliases: ['class', 'category', 'product_class', 'type'] },
  { key: 'qty', label: 'Qty', required: true, aliases: ['qty', 'quantity', 'units', 'units_sold', 'sold'] },
  { key: 'unitCost', label: 'Unit Cost', required: true, aliases: ['unit_cost', 'unitcost', 'cost', 'price', 'unit_price', 'rate'] },
  { key: 'total', label: 'Total', required: true, aliases: ['total', 'amount', 'sale_total', 'revenue', 'ext_price', 'extended'] },
  { key: 'vendorId', label: 'Vendor ID', required: false, aliases: ['vendor_id', 'vendorid', 'vendor', 'supplier', 'supplier_id'] },
];

export const purchaseFields: FieldSpec[] = [
  { key: 'date', label: 'Date', required: true, aliases: ['date', 'po_date', 'order_date', 'purchase_date'] },
  { key: 'poNumber', label: 'PO Number', required: false, aliases: ['po_number', 'po', 'po_no', 'purchase_order', 'order_number'] },
  { key: 'code', label: 'Code', required: true, aliases: ['code', 'product_code', 'item_code', 'sku', 'part_number'] },
  { key: 'description', label: 'Description', required: false, aliases: ['description', 'desc', 'item_desc'] },
  { key: 'brand', label: 'Brand', required: false, aliases: ['brand', 'manufacturer'] },
  { key: 'class', label: 'Class', required: false, aliases: ['class', 'category'] },
  { key: 'qty', label: 'Qty', required: true, aliases: ['qty', 'quantity', 'units_ordered'] },
  { key: 'unitCost', label: 'Unit Cost', required: true, aliases: ['unit_cost', 'unitcost', 'cost', 'price'] },
  { key: 'total', label: 'Total', required: true, aliases: ['total', 'amount', 'po_total'] },
  { key: 'vendorId', label: 'Vendor ID', required: false, aliases: ['vendor_id', 'vendorid', 'vendor', 'supplier'] },
  { key: 'credit', label: 'Credit', required: false, aliases: ['credit', 'credit_amount', 'discount'] },
  { key: 'dueDate', label: 'Due Date', required: false, aliases: ['due_date', 'duedate', 'payment_due', 'terms'] },
];

export const inventoryFields: FieldSpec[] = [
  { key: 'code', label: 'Code', required: true, aliases: ['code', 'product_code', 'item_code', 'sku', 'part_number'] },
  { key: 'description', label: 'Description', required: false, aliases: ['description', 'desc', 'item_desc'] },
  { key: 'brand', label: 'Brand', required: false, aliases: ['brand', 'manufacturer'] },
  { key: 'class', label: 'Class', required: false, aliases: ['class', 'category'] },
  { key: 'vendorId', label: 'Vendor ID', required: false, aliases: ['vendor_id', 'vendorid', 'vendor', 'supplier'] },
  { key: 'qty', label: 'Qty', required: true, aliases: ['qty', 'quantity', 'on_hand', 'stock', 'inventory'] },
  { key: 'unitCost', label: 'Unit Cost', required: true, aliases: ['unit_cost', 'unitcost', 'cost', 'price'] },
  { key: 'totalValue', label: 'Total Value', required: false, aliases: ['total_value', 'total', 'value', 'ext_value'] },
  { key: 'wioBenchmark', label: 'WIO Benchmark', required: true, aliases: ['wio_benchmark', 'wio_bench', 'benchmark', 'wio_target', 'target_wio', 'wio'] },
];

export function getFieldsForCategory(category: string): FieldSpec[] {
  switch (category) {
    case 'sales': return salesFields;
    case 'purchase': return purchaseFields;
    case 'inventory': return inventoryFields;
    default: return [];
  }
}

export function autoMapColumn(header: string, fields: FieldSpec[]): string | null {
  const normalized = header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  for (const field of fields) {
    for (const alias of field.aliases) {
      const normalizedAlias = alias.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (normalized === normalizedAlias) return field.key;
    }
  }
  for (const field of fields) {
    for (const alias of field.aliases) {
      if (normalized.includes(alias.toLowerCase().replace(/[^a-z0-9]/g, ''))) return field.key;
    }
  }
  return null;
}
