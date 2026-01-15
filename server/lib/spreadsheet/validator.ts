import { parse, isValid } from 'date-fns';
import type { ColumnMapping, ValidationError, MarketingDataRow } from '../../../shared/schema.zod.js';
import { marketingDataRowSchema } from '../../../shared/schema.zod.js';

export interface ValidationResult {
  valid: MarketingDataRow[];
  errors: ValidationError[];
  validCount: number;
  errorCount: number;
}

export class SpreadsheetValidator {
  private dateFormats = [
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'yyyy-MM-dd',
    'MMM dd, yyyy',
    'dd-MMM-yyyy',
    'yyyy/MM/dd',
    'dd.MM.yyyy',
    'M/d/yyyy',
  ];

  /**
   * Validate rows against mappings
   */
  validate(rows: Record<string, any>[], mappings: ColumnMapping[]): ValidationResult {
    const valid: MarketingDataRow[] = [];
    const errors: ValidationError[] = [];

    rows.forEach((row, index) => {
      try {
        // Map row to target fields
        const mappedRow = this.mapRow(row, mappings);

        // Validate with Zod schema
        const result = marketingDataRowSchema.safeParse(mappedRow);

        if (result.success) {
          valid.push(result.data);
        } else {
          // Collect validation errors
          const zodErrors = result.error.flatten();

          // Add field errors
          Object.entries(zodErrors.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              errors.push({
                row: index + 2, // +2 because row 1 is headers, index is 0-based
                column: field,
                message: messages.join(', '),
                value: mappedRow[field as keyof typeof mappedRow],
              });
            }
          });

          // Add form errors
          if (zodErrors.formErrors.length > 0) {
            errors.push({
              row: index + 2,
              message: zodErrors.formErrors.join(', '),
            });
          }
        }
      } catch (error) {
        errors.push({
          row: index + 2,
          message: error instanceof Error ? error.message : 'Unknown validation error',
        });
      }
    });

    return {
      valid,
      errors,
      validCount: valid.length,
      errorCount: errors.length,
    };
  }

  /**
   * Map row from source columns to target fields using mappings
   */
  private mapRow(row: Record<string, any>, mappings: ColumnMapping[]): Record<string, any> {
    const mapped: Record<string, any> = {};

    mappings.forEach((mapping) => {
      const value = row[mapping.sourceColumn];

      if (value !== undefined && value !== null && value !== '') {
        // Apply transform if specified
        const transformed = this.applyTransform(value, mapping.transform);
        mapped[this.toCamelCase(mapping.targetField)] = transformed;
      }
    });

    return mapped;
  }

  /**
   * Apply data transformation
   */
  private applyTransform(value: any, transform?: string): any {
    if (!transform) return value;

    switch (transform) {
      case 'lowercase':
        return String(value).toLowerCase();

      case 'uppercase':
        return String(value).toUpperCase();

      case 'trim':
        return String(value).trim();

      case 'parse_date':
        return this.parseDate(value);

      case 'parse_number':
        return this.parseNumber(value);

      default:
        return value;
    }
  }

  /**
   * Parse date from various formats
   */
  private parseDate(value: any): Date | null {
    if (value instanceof Date) return value;

    const str = String(value).trim();
    if (!str) return null;

    // Try each format
    for (const format of this.dateFormats) {
      try {
        const parsed = parse(str, format, new Date());
        if (isValid(parsed)) {
          return parsed;
        }
      } catch {
        continue;
      }
    }

    // Try native Date parsing as fallback
    try {
      const parsed = new Date(str);
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      // Ignore
    }

    return null;
  }

  /**
   * Parse number from string (handles currency, percentages, etc.)
   */
  private parseNumber(value: any): number | null {
    if (typeof value === 'number') return value;

    const str = String(value)
      .trim()
      .replace(/[$,€£¥%]/g, ''); // Remove currency and percentage symbols

    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  }

  /**
   * Convert snake_case to camelCase
   */
  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Sanitize value to prevent injection attacks
   */
  static sanitize(value: any): any {
    if (typeof value !== 'string') return value;

    // Remove potential formula injection
    if (value.startsWith('=') || value.startsWith('+') || value.startsWith('-') || value.startsWith('@')) {
      return "'" + value; // Prefix with single quote to neutralize
    }

    return value;
  }
}
