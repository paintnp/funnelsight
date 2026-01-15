import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ColumnMapping } from '../../../shared/schema.zod.js';

export interface ParsedSpreadsheet {
  headers: string[];
  rows: Record<string, any>[];
  rowCount: number;
}

export class SpreadsheetParser {
  /**
   * Parse CSV file
   */
  async parseCSV(fileBuffer: Buffer): Promise<ParsedSpreadsheet> {
    return new Promise((resolve, reject) => {
      const fileContent = fileBuffer.toString('utf-8');

      Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('[SpreadsheetParser] CSV parsing errors:', results.errors);
          }

          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, any>[];

          resolve({
            headers,
            rows,
            rowCount: rows.length,
          });
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        },
      });
    });
  }

  /**
   * Parse Excel file (.xlsx, .xls)
   */
  async parseExcel(fileBuffer: Buffer): Promise<ParsedSpreadsheet> {
    try {
      const workbook = XLSX.read(fileBuffer, {
        type: 'buffer',
        cellDates: true,
        cellNF: false, // Skip number formatting for performance
      });

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('Excel file has no sheets');
      }

      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        blankrows: false,
      }) as any[][];

      if (jsonData.length === 0) {
        throw new Error('Excel sheet is empty');
      }

      // First row is headers
      const headers = jsonData[0].map((h) => String(h || '').trim()).filter(Boolean);

      // Remaining rows are data
      const dataRows = jsonData.slice(1);

      // Convert to object format
      const rows = dataRows.map((row) => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      return {
        headers,
        rows,
        rowCount: rows.length,
      };
    } catch (error) {
      throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Auto-detect file type and parse
   */
  async parse(filename: string, fileBuffer: Buffer): Promise<ParsedSpreadsheet> {
    const ext = filename.toLowerCase().split('.').pop();

    if (ext === 'csv') {
      return this.parseCSV(fileBuffer);
    } else if (ext === 'xlsx' || ext === 'xls') {
      return this.parseExcel(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  }
}

/**
 * Column detection with fuzzy matching
 */
export class ColumnDetector {
  // Common column name patterns for marketing data
  private patterns: Record<string, RegExp[]> = {
    email: [
      /^e-?mail$/i,
      /^contact[_\s]?e-?mail$/i,
      /^subscriber[_\s]?e-?mail$/i,
      /^attendee[_\s]?e-?mail$/i,
      /^registrant[_\s]?e-?mail$/i,
    ],
    campaign_name: [
      /^campaign[_\s]?name$/i,
      /^campaign$/i,
      /^source[_\s]?campaign$/i,
      /^marketing[_\s]?campaign$/i,
    ],
    utm_source: [
      /^utm[_\s]?source$/i,
      /^source$/i,
      /^traffic[_\s]?source$/i,
    ],
    utm_medium: [
      /^utm[_\s]?medium$/i,
      /^medium$/i,
      /^marketing[_\s]?medium$/i,
    ],
    utm_campaign: [
      /^utm[_\s]?campaign$/i,
    ],
    registration_date: [
      /^registration[_\s]?date$/i,
      /^reg[_\s]?date$/i,
      /^signup[_\s]?date$/i,
      /^created[_\s]?date$/i,
      /^date[_\s]?registered$/i,
    ],
    event_name: [
      /^event[_\s]?name$/i,
      /^event[_\s]?title$/i,
      /^webinar[_\s]?name$/i,
      /^conference[_\s]?name$/i,
    ],
    event_date: [
      /^event[_\s]?date$/i,
      /^webinar[_\s]?date$/i,
      /^scheduled[_\s]?date$/i,
    ],
    cost: [
      /^cost$/i,
      /^spend$/i,
      /^amount$/i,
      /^marketing[_\s]?spend$/i,
      /^campaign[_\s]?cost$/i,
    ],
    impressions: [
      /^impressions?$/i,
      /^views?$/i,
      /^ad[_\s]?impressions$/i,
    ],
    clicks: [
      /^clicks?$/i,
      /^click[_\s]?count$/i,
      /^ad[_\s]?clicks$/i,
    ],
    conversions: [
      /^conversions?$/i,
      /^converts?$/i,
      /^leads?$/i,
    ],
    registrations: [
      /^registrations?$/i,
      /^registered$/i,
      /^signups?$/i,
      /^enrollments?$/i,
    ],
    attendees: [
      /^attendees?$/i,
      /^attended$/i,
      /^attendance$/i,
      /^participants?$/i,
    ],
    attendee_name: [
      /^attendee[_\s]?name$/i,
      /^full[_\s]?name$/i,
      /^name$/i,
      /^registrant[_\s]?name$/i,
    ],
    company: [
      /^company$/i,
      /^organization$/i,
      /^org$/i,
      /^account[_\s]?name$/i,
    ],
  };

  /**
   * Detect column mappings with confidence scores
   */
  detectMappings(headers: string[]): ColumnMapping[] {
    const mappings: ColumnMapping[] = [];

    headers.forEach((header) => {
      const normalized = header.trim().toLowerCase().replace(/[^a-z0-9_\s]/g, '');

      // Try exact match first
      for (const [field, patterns] of Object.entries(this.patterns)) {
        for (const pattern of patterns) {
          if (pattern.test(normalized)) {
            mappings.push({
              sourceColumn: header,
              targetField: field as any,
              confidence: 95, // High confidence for exact pattern match
            });
            return; // Move to next header
          }
        }
      }

      // Try fuzzy match with Levenshtein distance
      const fuzzyMatch = this.fuzzyMatch(normalized);
      if (fuzzyMatch && fuzzyMatch.confidence > 70) {
        mappings.push({
          sourceColumn: header,
          targetField: fuzzyMatch.field as any,
          confidence: fuzzyMatch.confidence,
        });
      }
    });

    return mappings;
  }

  /**
   * Fuzzy match using Levenshtein distance
   */
  private fuzzyMatch(normalized: string): { field: string; confidence: number } | null {
    let bestMatch: { field: string; confidence: number } | null = null;

    // Simple keywords for fuzzy matching
    const keywords: Record<string, string[]> = {
      email: ['email', 'mail', 'contact'],
      campaign_name: ['campaign', 'campign'], // Include common typos
      utm_source: ['utmsource', 'source'],
      utm_medium: ['utmmedium', 'medium'],
      registration_date: ['regdate', 'signupdate', 'registered'],
      event_name: ['eventname', 'event'],
      cost: ['cost', 'spend', 'price'],
      impressions: ['impression', 'view'],
      clicks: ['click'],
      registrations: ['registration', 'signup', 'enrollment'],
      attendees: ['attendee', 'attended', 'participant'],
      attendee_name: ['attendee', 'name', 'fullname'],
      company: ['company', 'org', 'organization'],
    };

    for (const [field, terms] of Object.entries(keywords)) {
      for (const term of terms) {
        if (normalized.includes(term) || term.includes(normalized)) {
          const similarity = this.calculateSimilarity(normalized, term);
          if (similarity > (bestMatch?.confidence || 0)) {
            bestMatch = { field, confidence: similarity };
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Calculate similarity between two strings (0-100)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 100;

    const distance = this.levenshteinDistance(longer, shorter);
    return Math.round((1 - distance / longer.length) * 100);
  }

  /**
   * Levenshtein distance algorithm
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2[i - 1] === str1[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
