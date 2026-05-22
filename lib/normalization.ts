import { getFieldsForCategory, autoMapColumn } from './schema';

export function normalizeHeaders(headers: string[]): string[] {
  return headers.map(h => h.trim().replace(/\s+/g, ' '));
}

export function parseNumber(val: unknown): number {
  if (typeof val === 'number') return val;
  if (val === null || val === undefined) return 0;
  const str = String(val).replace(/[$,\s]/g, '').replace(/[()]/g, m => m === '(' ? '-' : '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function parseDate(val: unknown): string {
  if (!val) return '';
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return str;
}

export function autoMapHeaders(headers: string[], category: string): Record<string, string> {
  const fields = getFieldsForCategory(category);
  const mapping: Record<string, string> = {};
  for (const header of headers) {
    const target = autoMapColumn(header, fields);
    if (target) mapping[header] = target;
  }
  return mapping;
}

export function rowToRecord(row: Record<string, unknown>, mapping: Record<string, string>, category: string): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const [source, target] of Object.entries(mapping)) {
    let val = row[source];
    if (['qty', 'unitCost', 'total', 'totalValue', 'wioBenchmark', 'credit', 'salesVelocity'].includes(target)) {
      val = parseNumber(val);
    } else if (['date', 'dueDate'].includes(target)) {
      val = parseDate(val);
    }
    record[target] = val;
  }
  if (category === 'inventory' && record.qty && record.unitCost && !record.totalValue) {
    record.totalValue = parseNumber(record.qty) * parseNumber(record.unitCost);
  }
  return record;
}
