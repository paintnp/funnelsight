# Research Report: Spreadsheet Upload Implementation for FunnelSight

## Executive Summary
This research provides a comprehensive implementation strategy for FunnelSight's spreadsheet upload feature, supporting CSV and Excel files from 100 to 100K+ rows. The recommended approach uses PapaParse for CSV parsing, xlsx (SheetJS) for Excel files, Zod for validation, and BullMQ for asynchronous processing of large files, with PostgreSQL's COPY command for optimal bulk insertion performance.

## Core Technologies Required
- **PapaParse**: v5.4.1 - Fastest CSV parser with streaming support, 2x faster than alternatives
- **xlsx (SheetJS)**: v0.20.x - Most versatile Excel parser, simpler API than exceljs
- **Zod**: v3.23.x - TypeScript-first validation with excellent type inference
- **BullMQ**: v5.x - Modern job queue for processing large files asynchronously
- **Multer**: v1.4.5 - Standard file upload middleware with security features
- **pg-copy-streams**: v6.x - PostgreSQL COPY command integration for bulk inserts
- **file-type**: v19.x - MIME type detection via magic numbers
- **clamscan**: v2.x - Optional virus scanning integration

## Architecture Recommendations

### Backend

#### 1. File Upload Pipeline
```typescript
// Three-tier processing strategy based on file size
interface ProcessingTier {
  small: { maxRows: 1000, mode: 'sync' };      // < 1K rows: process immediately
  medium: { maxRows: 10000, mode: 'async' };   // 1K-10K rows: background job, quick
  large: { maxRows: Infinity, mode: 'stream' }; // > 10K rows: stream + batch
}
```

#### 2. Parser Configuration
```typescript
// PapaParse for CSV
const csvConfig = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  streaming: true, // Enable for files > 10K rows
  chunk: (results, parser) => {
    // Process chunk of 1000 rows
    processBatch(results.data);
  },
  error: (error, file) => {
    // Row-level error handling
  }
};

// SheetJS for Excel
const excelConfig = {
  type: 'buffer',
  cellDates: true,
  cellNF: false, // Skip number formatting for performance
  sheetRows: 1000 // Preview limit
};
```

#### 3. Job Queue Architecture
```typescript
// BullMQ queue setup
const uploadQueue = new Queue('spreadsheet-upload', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
});

// Worker with concurrency control
new Worker('spreadsheet-upload', processSpreadsheet, {
  connection: redis,
  concurrency: 5, // Process 5 files simultaneously
  limiter: {
    max: 10,
    duration: 1000 // Max 10 jobs per second
  }
});
```

### Frontend

#### 1. Upload Component Architecture
```typescript
// Using shadcn/ui components with React Query
interface UploadState {
  file: File | null;
  uploadProgress: number;
  processingStatus: 'idle' | 'uploading' | 'mapping' | 'validating' | 'importing' | 'complete';
  mappings: ColumnMapping[];
  validationErrors: ValidationError[];
}
```

#### 2. Column Mapping UI
```typescript
interface ColumnMapping {
  sourceColumn: string;
  targetField: MarketingField;
  confidence: number; // 0-100 fuzzy match score
  transform?: DataTransform;
}

type MarketingField =
  | 'email'
  | 'campaign_name'
  | 'utm_source'
  | 'utm_medium'
  | 'utm_campaign'
  | 'registration_date'
  | 'event_name'
  | 'cost'
  | 'impressions'
  | 'clicks';
```

### Data Storage

#### 1. Database Schema Pattern
```sql
-- Main import tracking table
CREATE TABLE spreadsheet_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  row_count INTEGER,
  status VARCHAR(50) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  error_summary JSONB,
  column_mappings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Staging table for data validation
CREATE TABLE import_staging (
  import_id UUID REFERENCES spreadsheet_imports(id),
  row_number INTEGER,
  raw_data JSONB,
  validation_errors JSONB,
  status VARCHAR(20)
);

-- Final marketing data table
CREATE TABLE marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES spreadsheet_imports(id),
  email VARCHAR(255),
  campaign_data JSONB,
  event_date DATE,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Bulk Insert Strategy with Drizzle
```typescript
// For small batches (< 1000 rows)
await db.insert(marketingEvents)
  .values(rows)
  .onConflictDoUpdate({
    target: [marketingEvents.email, marketingEvents.eventDate],
    set: { metrics: sql`EXCLUDED.metrics` }
  });

// For large batches (> 1000 rows) - use pg-copy-streams
import { from } from 'pg-copy-streams';
const copyStream = client.query(from(
  `COPY marketing_events (email, campaign_data, event_date)
   FROM STDIN WITH (FORMAT csv, HEADER false)`
));
```

## Implementation Challenges

1. **Challenge**: Detecting marketing data columns with varying naming conventions
   **Solution**: Implement fuzzy matching with common variations library
   ```typescript
   const columnPatterns = {
     email: /^(email|e-mail|contact|subscriber)/i,
     campaign: /^(campaign|utm_campaign|source_campaign)/i,
     date: /^(date|created|registered|timestamp)/i
   };
   ```

2. **Challenge**: Memory management for large Excel files
   **Solution**: Use streaming mode with SheetJS and process in chunks
   ```typescript
   const stream = XLSX.stream.to_csv(worksheet, { FS: ',', RS: '\n' });
   stream.pipe(csvParser()).on('data', processBatch);
   ```

3. **Challenge**: Handling various date formats in spreadsheets
   **Solution**: Use date-fns with multiple format patterns
   ```typescript
   const dateFormats = [
     'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd',
     'MMM dd, yyyy', 'dd-MMM-yyyy'
   ];
   const parsed = parse(value, format, new Date());
   ```

## Code Patterns

### File Upload Endpoint
```typescript
// Using ts-rest contract
export const uploadContract = c.router({
  upload: {
    method: 'POST',
    path: '/api/spreadsheets/upload',
    body: c.type<{ file: File }>(),
    responses: {
      201: c.type<{
        importId: string,
        status: 'processing' | 'mapping_required',
        columns?: string[],
        previewRows?: any[]
      }>(),
      400: c.type<{ error: string }>(),
      413: c.type<{ error: 'File too large' }>()
    }
  }
});
```

### Validation Schema with Zod
```typescript
const MarketingRowSchema = z.object({
  email: z.string().email().toLowerCase(),
  campaignName: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  registrationDate: z.coerce.date(),
  eventName: z.string(),
  metrics: z.object({
    cost: z.number().positive().optional(),
    impressions: z.number().int().positive().optional(),
    clicks: z.number().int().positive().optional()
  }).optional()
});

// Validate with error collection
const validateRows = (rows: unknown[]) => {
  const errors: ValidationError[] = [];
  const valid: MarketingRow[] = [];

  rows.forEach((row, index) => {
    const result = MarketingRowSchema.safeParse(row);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({
        row: index + 1,
        errors: result.error.flatten()
      });
    }
  });

  return { valid, errors };
};
```

### Column Detection Algorithm
```typescript
interface ColumnDetection {
  detectColumns(headers: string[]): ColumnMapping[] {
    const mappings: ColumnMapping[] = [];

    headers.forEach(header => {
      // Try exact match first
      let match = this.exactMatch(header);

      // Try fuzzy match if no exact match
      if (!match) {
        match = this.fuzzyMatch(header);
      }

      if (match) {
        mappings.push({
          sourceColumn: header,
          targetField: match.field,
          confidence: match.confidence
        });
      }
    });

    return mappings;
  }

  private fuzzyMatch(header: string): Match | null {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check against known patterns
    for (const [field, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        const score = this.levenshteinDistance(normalized, pattern);
        if (score > 0.8) {
          return { field, confidence: score * 100 };
        }
      }
    }

    return null;
  }
}
```

## External APIs/Services

- **File Type Detection**: [file-type npm package](https://www.npmjs.com/package/file-type) - Magic number detection
- **Virus Scanning**: [ClamAV](https://www.clamav.net/) + [clamscan](https://www.npmjs.com/package/clamscan) - Optional malware scanning
- **CSV Parsing**: [PapaParse Documentation](https://www.papaparse.com/docs)
- **Excel Parsing**: [SheetJS Documentation](https://docs.sheetjs.com/)
- **Job Queue**: [BullMQ Documentation](https://docs.bullmq.io/)
- **Bulk Insert**: [pg-copy-streams](https://github.com/brianc/node-pg-copy-streams)

## Timeline Estimate

- **Stage 1 (Plan)**: Complexity Rating **3/5**
  - Define data models and validation rules
  - Design API contracts with ts-rest
  - Plan error handling strategies

- **Stage 2 (Build)**: Complexity Rating **4/5**
  - Implement file upload with security
  - Build column detection and mapping
  - Create validation pipeline
  - Implement bulk insert with transactions
  - Add job queue for large files

## Risk Assessment

### High Risk
- **Large file memory management**: Files over 50MB could crash the server without proper streaming
- **SQL injection via CSV data**: Malicious data in cells could exploit database if not properly sanitized
- **Formula injection attacks**: Excel/CSV formulas (=cmd|'/c calc'!A1) could execute on user machines

### Medium Risk
- **Date format inconsistencies**: International date formats could cause data corruption
- **Duplicate data handling**: Need clear strategy for handling re-uploads and duplicates
- **Column mapping accuracy**: Fuzzy matching might map columns incorrectly
- **Transaction rollback complexity**: Partial imports need careful handling

### Mitigation Strategies

1. **Security First**
   - MIME type validation via magic numbers
   - File size limits (50MB default, configurable)
   - Sanitize all cell values before database insertion
   - Disable formula evaluation in parsers
   - Optional ClamAV integration for enterprise

2. **Performance Optimization**
   - Stream processing for files > 10K rows
   - PostgreSQL COPY for bulk inserts (100x faster)
   - BullMQ for async processing with Redis
   - Batch processing with configurable chunk size

3. **User Experience**
   - Clear progress indicators during upload
   - Row-level error reporting with line numbers
   - Column mapping preview with confidence scores
   - Ability to download error report CSV
   - Resume failed imports from last successful row

## Testing Strategy

### Unit Tests
```typescript
describe('SpreadsheetUpload', () => {
  describe('Column Detection', () => {
    it('should detect email columns with various formats', () => {
      const headers = ['E-mail', 'Contact Email', 'subscriber_email'];
      const mappings = detectColumns(headers);
      expect(mappings).toHaveLength(3);
      expect(mappings.every(m => m.targetField === 'email')).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate and sanitize email addresses', () => {
      const rows = [
        { email: 'USER@EXAMPLE.COM' },
        { email: 'invalid-email' }
      ];
      const { valid, errors } = validateRows(rows);
      expect(valid[0].email).toBe('user@example.com');
      expect(errors).toHaveLength(1);
    });
  });
});
```

### Integration Tests
- Upload various file sizes (100 rows, 1K, 10K, 100K)
- Test malformed CSV/Excel files
- Verify transaction rollback on errors
- Test concurrent uploads
- Verify memory usage stays within limits

### Performance Tests
- Benchmark parsing speed for different libraries
- Test database insertion performance
- Monitor memory usage during streaming
- Load test with multiple concurrent uploads

## Edge Cases

1. **Empty cells in required columns** - Skip row with error logging
2. **Mixed data types in columns** - Attempt type coercion with fallback
3. **Excel files with multiple sheets** - Allow sheet selection or process all
4. **CSV files with BOM** - Strip BOM before parsing
5. **Extremely wide spreadsheets (500+ columns)** - Limit column processing
6. **Unicode and special characters** - Normalize to UTF-8
7. **Circular references in Excel formulas** - Disable formula evaluation
8. **Password-protected Excel files** - Return clear error message
9. **Corrupted file uploads** - Validate file integrity before processing
10. **Network interruption during upload** - Implement resumable uploads

## Production Readiness Checklist

- [ ] File size limits enforced (50MB default)
- [ ] MIME type validation via magic numbers
- [ ] Virus scanning integration (optional)
- [ ] Rate limiting on upload endpoint
- [ ] Audit logging for all uploads
- [ ] Database transactions for data integrity
- [ ] Error recovery mechanisms
- [ ] Monitoring and alerting setup
- [ ] Documentation for column mapping
- [ ] User training materials prepared