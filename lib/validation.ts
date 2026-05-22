import { ValidationIssue, ValidationResult } from './types';
import { getFieldsForCategory } from './schema';
import { parseNumber } from './normalization';

export function validateData(
  rows: Record<string, unknown>[],
  category: string,
  mapping: Record<string, string>
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const fields = getFieldsForCategory(category);
  const requiredFields = fields.filter(f => f.required);

  const missingRequired = requiredFields.filter(
    f => !Object.values(mapping).includes(f.key)
  );

  if (missingRequired.length > 0) {
    return {
      valid: false,
      issues: [{
        row: 0,
        column: missingRequired.map(f => f.label).join(', '),
        severity: 'error',
        message: `Missing required columns: ${missingRequired.map(f => f.label).join(', ')}`
      }],
      summary: {
        totalRows: rows.length,
        errors: 1,
        warnings: 0,
        blocked: true,
        blockReason: `Required columns not mapped: ${missingRequired.map(f => f.label).join(', ')}`
      }
    };
  }

  if (category === 'inventory') {
    const hasWIOBenchmark = Object.values(mapping).includes('wioBenchmark');
    if (!hasWIOBenchmark) {
      return {
        valid: false,
        issues: [{
          row: 0,
          column: 'WIO Benchmark',
          severity: 'error',
          message: 'WIO Benchmark column is required for inventory processing'
        }],
        summary: {
          totalRows: rows.length,
          errors: 1,
          warnings: 0,
          blocked: true,
          blockReason: 'WIO Benchmark column is missing. Inventory risk cannot be calculated without benchmark values.'
        }
      };
    }
  }

  let errorCount = 0;
  let warningCount = 0;
  const maxRows = Math.min(rows.length, 500);

  for (let i = 0; i < maxRows; i++) {
    const row = rows[i];
    for (const field of requiredFields) {
      const val = row[Object.entries(mapping).find(([, v]) => v === field.key)?.[0] || ''];
      if (val === undefined || val === null || val === '') {
        issues.push({
          row: i + 1,
          column: field.label,
          severity: 'warning',
          message: `Empty value in required field "${field.label}" at row ${i + 1}`
        });
        warningCount++;
      }
    }

    for (const [source, target] of Object.entries(mapping)) {
      if (['qty', 'unitCost', 'total', 'totalValue', 'wioBenchmark'].includes(target)) {
        const raw = row[source];
        const num = parseNumber(raw);
        if (raw !== undefined && raw !== null && raw !== '' && (isNaN(num) || num < 0)) {
          issues.push({
            row: i + 1,
            column: target,
            severity: 'error',
            message: `Invalid number in "${target}" at row ${i + 1}: "${raw}"`
          });
          errorCount++;
        }
      }
    }

    if (category === 'inventory') {
      const wioKey = Object.entries(mapping).find(([, v]) => v === 'wioBenchmark')?.[0];
      if (wioKey) {
        const wioVal = parseNumber(row[wioKey]);
        if (wioVal <= 0) {
          issues.push({
            row: i + 1,
            column: 'WIO Benchmark',
            severity: 'error',
            message: `Invalid WIO Benchmark at row ${i + 1}: must be greater than 0`
          });
          errorCount++;
        }
      }
    }
  }

  const blocked = errorCount > 0;

  return {
    valid: !blocked,
    issues: issues.slice(0, 100),
    summary: {
      totalRows: rows.length,
      errors: errorCount,
      warnings: warningCount,
      blocked,
      blockReason: blocked ? `${errorCount} data errors found. Fix errors before processing.` : undefined
    }
  };
}
