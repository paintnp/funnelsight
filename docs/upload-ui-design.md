# FunnelSight Spreadsheet Upload UI Design Specification

**Version**: 1.0
**Date**: 2025-10-27
**Designer**: Claude UI/UX Design Agent
**Status**: Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Visual Mockups](#visual-mockups)
4. [Component Specifications](#component-specifications)
5. [Color & Typography Guidelines](#color-typography-guidelines)
6. [Interaction Patterns](#interaction-patterns)
7. [State Machine](#state-machine)
8. [Responsive Design](#responsive-design)
9. [Accessibility Checklist](#accessibility-checklist)
10. [Implementation Notes](#implementation-notes)

---

## Overview

The spreadsheet upload feature enables FunnelSight users to import marketing data from CSV and Excel files. This design specification provides a complete blueprint for implementing a modern, dark-mode UI that guides users through a multi-step import process.

### User Journey

```
1. Land on upload page (idle state)
   ↓
2. Select/drag file (selected state)
   ↓
3. File parsed automatically (parsing state)
   ↓
4. Review data preview (mapping state)
   ↓
5. Map columns to FunnelSight fields (mapping state)
   ↓
6. Confirm and validate (validating state)
   ↓
7. View results and next steps (complete/error state)
```

### Key Features

- **Drag-and-drop file upload** with click-to-browse fallback
- **Automatic column detection** with confidence scoring
- **Interactive mapping interface** with visual feedback
- **Real-time validation** with detailed error reporting
- **Progress indicators** for long-running operations
- **Success/error states** with actionable next steps

---

## Design Philosophy

### Dark Mode First

FunnelSight uses a sophisticated dark mode design system that prioritizes:
- **High contrast** for readability (WCAG AAA compliant)
- **Subtle depth** through layering and shadows
- **Primary blue accent** (#5B9FED) for interactive elements
- **Semantic colors** for status indicators (green=success, yellow=warning, red=error)

### Modern Minimalism

- **Clean layouts** with generous whitespace
- **Card-based components** with subtle borders
- **Smooth transitions** for state changes (300ms ease-in-out)
- **Micro-interactions** to provide feedback
- **Progressive disclosure** of complex information

### User-Centered Design

- **Clear visual hierarchy** with typography and spacing
- **Contextual help** at each step
- **Error prevention** through validation and confirmation
- **Graceful error handling** with recovery options
- **Accessibility first** with keyboard navigation and ARIA labels

---

## Visual Mockups

### 1. Initial State (Idle)

```
┌────────────────────────────────────────────────────────────────┐
│  AppLayout Navigation (sticky)                                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Import Marketing Data                                         │
│  Upload your CSV or Excel file to import campaign and event    │
│  performance data into FunnelSight                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │                   ┌─────────────┐                        │ │
│  │                   │             │                        │ │
│  │                   │  ☁ Upload   │   [Icon: Cloud upload] │ │
│  │                   │             │                        │ │
│  │                   └─────────────┘                        │ │
│  │                                                           │ │
│  │     Drag and drop your CSV or Excel file here,           │ │
│  │              or click to browse                          │ │
│  │                                                           │ │
│  │     Supported formats: .csv, .xlsx, .xls                 │ │
│  │     Maximum file size: 50MB                              │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│    [Dashed border, hover effect on drag-over]                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  📋 What data can I import?                              │ │
│  │                                                           │ │
│  │  • Campaign performance (impressions, clicks, cost)      │ │
│  │  • Event registrations and attendance                    │ │
│  │  • UTM parameters and attribution data                   │ │
│  │  • Contact information and engagement metrics            │ │
│  └──────────────────────────────────────────────────────────┘ │
│    [Info card with soft background]                            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Visual Details**:
- Drop zone: `min-h-[300px]`, dashed border `border-2 border-dashed border-muted`
- Hover state: `border-primary bg-primary/5`
- Upload icon: `text-muted-foreground`, size `h-16 w-16`
- Typography: Title `text-3xl font-bold`, helper text `text-sm text-muted-foreground`

---

### 2. File Selected & Preview State

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Import Marketing Data                                         │
│  Upload your CSV or Excel file to import campaign and event    │
│  performance data into FunnelSight                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ✓  marketing_data_Q4_2024.csv                           │ │
│  │      2.3 MB • CSV File                                    │ │
│  │                                           [Remove] [X]    │ │
│  └──────────────────────────────────────────────────────────┘ │
│    [Success background with file icon]                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Data Preview                                             │ │
│  │  ─────────────                                            │ │
│  │                                                           │ │
│  │  First 5 rows of your spreadsheet:                       │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │ Email      Campaign   UTM_Source  Registrations ... │ │
│  │  ├────────────────────────────────────────────────────┤  │ │
│  │  │ jane@...   Q4-Launch  linkedin    Yes          ... │ │
│  │  │ john@...   Webinar    email       Yes          ... │ │
│  │  │ ...        ...        ...         ...          ... │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                           │ │
│  │  1,247 rows detected                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Continue to Mapping →]                                       │
│    [Primary button, centered]                                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Visual Details**:
- File preview card: `bg-green-900/10 border-green-700/50`
- Checkmark icon: `text-green-500`
- Table: `border border-border`, alternating rows `even:bg-muted/50`
- Table text: `text-sm font-mono` for data cells
- Continue button: `bg-primary hover:bg-primary/90 text-primary-foreground`

---

### 3. Column Mapping State

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Import Marketing Data                                         │
│  Map your spreadsheet columns to FunnelSight fields            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  📊 Column Mapping                                        │ │
│  │                                                           │ │
│  │  Match each column from your file to a FunnelSight field │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │ Source Column        →  Target Field         ✓    │  │ │
│  │  ├────────────────────────────────────────────────────┤  │ │
│  │  │ Email*              →  [Email ▼]           🟢 95%  │  │ │
│  │  │ Preview: jane@example.com                         │  │ │
│  │  │                                                    │  │ │
│  │  │ Campaign Name       →  [Campaign Name ▼]   🟢 92%  │  │ │
│  │  │ Preview: Q4-Launch-2024                           │  │ │
│  │  │                                                    │  │ │
│  │  │ UTM_Source          →  [UTM Source ▼]      🟡 78%  │  │ │
│  │  │ Preview: linkedin                                 │  │ │
│  │  │                                                    │  │ │
│  │  │ Registrations       →  [Skip / Select ▼]   ⚪     │  │ │
│  │  │ Preview: Yes                                      │  │ │
│  │  │                                                    │  │ │
│  │  │ Old_Event_ID        →  [Skip ▼]            ⚪     │  │ │
│  │  │ Preview: EVT_12345                                │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                           │ │
│  │  * Required field                                         │ │
│  │                                                           │ │
│  │  Confidence Scores:                                       │ │
│  │  🟢 High (90-100%)  🟡 Medium (70-89%)  ⚪ Low/None      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [← Back]                               [Confirm Import →]    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Visual Details**:
- Mapping rows: Separated by subtle dividers `border-b border-border/50`
- Source column: `font-semibold`, required asterisk `text-destructive`
- Dropdowns: Full shadcn/ui Select component
- Confidence badges:
  - High: `bg-green-900/30 text-green-400 border-green-700/50`
  - Medium: `bg-yellow-900/30 text-yellow-400 border-yellow-700/50`
  - Low: `bg-muted text-muted-foreground`
- Preview text: `text-xs text-muted-foreground italic`
- Legend: `text-sm` with inline badge examples

---

### 4. Validating State

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Import Marketing Data                                         │
│  Validating and importing your data...                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │              [Spinner animation]                          │ │
│  │                                                           │ │
│  │           Validating 1,247 rows...                        │ │
│  │                                                           │ │
│  │  ████████████████████░░░░░░░  73%                        │ │
│  │                                                           │ │
│  │  910 rows processed • 910 valid • 0 errors               │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Visual Details**:
- Spinner: `animate-spin h-12 w-12 border-4 border-primary border-t-transparent`
- Progress bar: shadcn/ui Progress component
- Progress fill: `bg-primary transition-all duration-300`
- Stats: `text-sm text-muted-foreground`, numbers in `font-semibold`

---

### 5. Success State

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Import Marketing Data                                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │                  ✓                                        │ │
│  │              [Checkmark]                                  │ │
│  │                                                           │ │
│  │          Import Successful!                               │ │
│  │                                                           │ │
│  │  1,247 rows imported successfully                        │ │
│  │                                                           │ │
│  │  Your marketing data is now available in FunnelSight.    │ │
│  │  View the imported data or upload another file.          │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  📊 Import Summary                                  │  │
│  │  │                                                     │  │
│  │  │  • Emails: 1,247                                   │  │
│  │  │  • Campaigns: 8 unique                             │  │
│  │  │  • Events: 3 unique                                │  │
│  │  │  • Date range: Jan 1 - Dec 31, 2024               │  │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                           │ │
│  │  [View Data in Dashboard]   [Import Another File]        │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Visual Details**:
- Success icon: `text-green-500 h-16 w-16` with subtle pulse animation
- Title: `text-2xl font-bold text-green-500`
- Summary card: `bg-muted/50 border border-border`
- Buttons: Primary for "View Data", outline for "Import Another"

---

### 6. Error State

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Import Marketing Data                                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │                  ⚠                                        │ │
│  │            [Alert triangle]                               │ │
│  │                                                           │ │
│  │       Import completed with errors                        │ │
│  │                                                           │ │
│  │  1,183 rows imported • 64 rows had errors                │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  ⚠ Common Errors                                    │  │
│  │  │                                                     │  │
│  │  │  Row 5: Invalid email format                       │  │
│  │  │  Column: email • Value: "not-an-email"             │  │
│  │  │                                                     │  │
│  │  │  Row 12: Missing required field                    │  │
│  │  │  Column: event_name • Value: (empty)               │  │
│  │  │                                                     │  │
│  │  │  Row 23: Invalid date format                       │  │
│  │  │  Column: event_date • Value: "2024-13-45"          │  │
│  │  │                                                     │  │
│  │  │  ... and 61 more errors                            │  │
│  │  │                                                     │  │
│  │  │  [Show All Errors]                                 │  │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                           │ │
│  │  [Fix and Re-upload]   [Continue with Valid Rows]        │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Visual Details**:
- Warning icon: `text-yellow-500 h-16 w-16`
- Title: `text-2xl font-bold text-yellow-500`
- Error list: shadcn/ui Alert component
- Each error: `bg-destructive/10 border-l-4 border-destructive p-3 mb-2`
- Error details: `text-xs text-muted-foreground font-mono`
- Expandable section: Using shadcn/ui Accordion or custom toggle

---

## Component Specifications

### Component 1: FileDropzone

**Purpose**: Allows users to select files via drag-and-drop or click to browse.

**Props**:
```typescript
interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}
```

**States**:
- `idle`: Default state, waiting for file
- `dragOver`: User dragging file over zone
- `disabled`: Upload in progress or complete

**Visual Specs**:
```css
Container:
  - min-height: 300px
  - border: 2px dashed hsl(var(--muted))
  - border-radius: var(--radius)
  - background: transparent
  - transition: all 300ms ease-in-out

Hover/DragOver:
  - border-color: hsl(var(--primary))
  - background: hsl(var(--primary) / 0.05)
  - cursor: pointer

Disabled:
  - opacity: 0.5
  - cursor: not-allowed
```

**Accessibility**:
- `role="button"`
- `aria-label="Upload file by clicking or dragging"`
- `tabindex="0"`
- Keyboard support: Enter/Space to open file picker
- Screen reader announces accepted formats and size limit

**Pseudo-code**:
```tsx
<div
  className="file-dropzone"
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  onClick={openFilePicker}
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  <input type="file" ref={fileInputRef} hidden />

  <div className="dropzone-content">
    <Upload className="icon" />
    <p className="primary-text">Drag and drop your CSV or Excel file here</p>
    <p className="secondary-text">or click to browse</p>

    <div className="file-info">
      <span>Supported formats: .csv, .xlsx, .xls</span>
      <span>Maximum file size: 50MB</span>
    </div>
  </div>
</div>
```

---

### Component 2: FilePreview

**Purpose**: Displays selected file information with option to remove.

**Props**:
```typescript
interface FilePreviewProps {
  filename: string;
  fileSize: number;
  fileType: string;
  onRemove: () => void;
}
```

**Visual Specs**:
```css
Container:
  - padding: 1rem
  - background: hsl(var(--card))
  - border: 1px solid hsl(var(--border))
  - border-left: 4px solid hsl(var(--primary))
  - border-radius: var(--radius)

Icon:
  - FileText from lucide-react
  - color: hsl(var(--primary))
  - size: h-10 w-10

Text:
  - Filename: text-base font-semibold
  - File info: text-sm text-muted-foreground
```

**Pseudo-code**:
```tsx
<Card className="file-preview">
  <div className="flex items-center gap-4">
    <FileText className="text-primary h-10 w-10" />

    <div className="flex-1">
      <p className="font-semibold">{filename}</p>
      <p className="text-sm text-muted-foreground">
        {formatFileSize(fileSize)} • {fileType}
      </p>
    </div>

    <Button
      variant="ghost"
      size="icon"
      onClick={onRemove}
      aria-label="Remove file"
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
</Card>
```

---

### Component 3: DataPreviewTable

**Purpose**: Displays first 5 rows of uploaded spreadsheet data.

**Props**:
```typescript
interface DataPreviewTableProps {
  columns: string[];
  rows: Record<string, any>[];
  totalRowCount: number;
}
```

**Visual Specs**:
```css
Table:
  - width: 100%
  - border: 1px solid hsl(var(--border))
  - border-radius: var(--radius)

Header:
  - background: hsl(var(--muted))
  - font-weight: 600
  - text-align: left
  - padding: 0.75rem

Row:
  - even rows: background: hsl(var(--muted) / 0.3)
  - hover: background: hsl(var(--muted) / 0.5)
  - padding: 0.75rem

Cell:
  - font-family: monospace
  - font-size: 0.875rem
  - max-width: 200px
  - overflow: hidden
  - text-overflow: ellipsis
```

**Responsive**:
- Desktop: Show all columns
- Tablet: Horizontal scroll
- Mobile: Horizontal scroll with sticky first column

**Pseudo-code**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Data Preview</CardTitle>
    <CardDescription>
      First 5 rows of your spreadsheet ({totalRowCount.toLocaleString()} rows total)
    </CardDescription>
  </CardHeader>

  <CardContent>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map(col => (
                <TableCell key={col} className="font-mono">
                  {row[col]?.toString() || '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>
```

---

### Component 4: ColumnMappingTable

**Purpose**: Interactive interface for mapping source columns to target fields.

**Props**:
```typescript
interface ColumnMappingTableProps {
  sourceCols: string[];
  targetFields: TargetField[];
  suggestedMappings: ColumnMapping[];
  previewData: Record<string, any>[];
  onMappingChange: (sourceCol: string, targetField: string) => void;
  requiredFields: string[];
}

interface TargetField {
  value: string;
  label: string;
  description?: string;
}

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  confidence: number;
}
```

**Visual Specs**:
```css
Row Container:
  - padding: 1rem
  - border-bottom: 1px solid hsl(var(--border) / 0.5)
  - transition: background 200ms

Row Hover:
  - background: hsl(var(--muted) / 0.3)

Source Column:
  - font-weight: 600
  - Required indicator: color: hsl(var(--destructive))

Arrow Icon:
  - ArrowRight from lucide-react
  - color: hsl(var(--muted-foreground))
  - size: h-4 w-4

Confidence Badge:
  - High (90-100%):
    - background: hsl(142 76% 36% / 0.2)
    - text: hsl(142 76% 60%)
    - border: 1px solid hsl(142 76% 36%)
  - Medium (70-89%):
    - background: hsl(48 96% 53% / 0.2)
    - text: hsl(48 96% 60%)
    - border: 1px solid hsl(48 96% 53%)
  - Low (<70%):
    - background: hsl(var(--muted))
    - text: hsl(var(--muted-foreground))
    - no border

Preview:
  - font-size: 0.75rem
  - color: hsl(var(--muted-foreground))
  - font-style: italic
  - margin-top: 0.25rem
```

**Interaction**:
- Click dropdown to change mapping
- Shows preview data from first row
- Validates required fields are mapped
- Updates confidence badge dynamically

**Pseudo-code**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Column Mapping</CardTitle>
    <CardDescription>
      Match each column from your file to a FunnelSight field
    </CardDescription>
  </CardHeader>

  <CardContent>
    <div className="space-y-4">
      {sourceCols.map(sourceCol => {
        const mapping = suggestedMappings.find(m => m.sourceColumn === sourceCol);
        const isRequired = requiredFields.includes(mapping?.targetField);

        return (
          <div key={sourceCol} className="mapping-row">
            <div className="flex items-center gap-4">
              {/* Source column */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{sourceCol}</span>
                  {isRequired && <span className="text-destructive">*</span>}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Preview: {previewData[0]?.[sourceCol] || 'N/A'}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight className="text-muted-foreground" />

              {/* Target field dropdown */}
              <div className="flex-1">
                <Select
                  value={mapping?.targetField}
                  onValueChange={(value) => onMappingChange(sourceCol, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Skip this column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip</SelectItem>
                    {targetFields.map(field => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Confidence badge */}
              <ConfidenceBadge confidence={mapping?.confidence} />
            </div>
          </div>
        );
      })}
    </div>

    <Separator className="my-4" />

    <div className="text-sm text-muted-foreground">
      <p>* Required field</p>
      <div className="flex gap-4 mt-2">
        <Badge variant="outline" className="bg-green-900/30">
          High Confidence (90-100%)
        </Badge>
        <Badge variant="outline" className="bg-yellow-900/30">
          Medium Confidence (70-89%)
        </Badge>
        <Badge variant="outline">
          Low Confidence (&lt;70%)
        </Badge>
      </div>
    </div>
  </CardContent>
</Card>
```

---

### Component 5: ValidationProgress

**Purpose**: Shows real-time progress during data validation.

**Props**:
```typescript
interface ValidationProgressProps {
  totalRows: number;
  processedRows: number;
  validRows: number;
  errorCount: number;
  status: 'validating' | 'complete' | 'failed';
}
```

**Visual Specs**:
```css
Container:
  - text-align: center
  - padding: 3rem

Spinner:
  - animation: spin 1s linear infinite
  - border: 4px solid transparent
  - border-top: 4px solid hsl(var(--primary))
  - border-radius: 50%
  - size: 48px

Progress Bar:
  - height: 8px
  - background: hsl(var(--muted))
  - border-radius: 9999px
  - overflow: hidden

Progress Fill:
  - background: hsl(var(--primary))
  - transition: width 300ms ease-in-out
```

**Pseudo-code**:
```tsx
<Card>
  <CardContent className="text-center py-12">
    {status === 'validating' && (
      <>
        <div className="spinner mx-auto mb-6" />
        <p className="text-lg font-semibold mb-4">
          Validating {totalRows.toLocaleString()} rows...
        </p>

        <Progress
          value={(processedRows / totalRows) * 100}
          className="mb-4"
        />

        <p className="text-sm text-muted-foreground">
          {processedRows.toLocaleString()} rows processed •
          {validRows.toLocaleString()} valid •
          {errorCount} errors
        </p>
      </>
    )}
  </CardContent>
</Card>
```

---

### Component 6: ValidationResults

**Purpose**: Displays import results, including errors if any.

**Props**:
```typescript
interface ValidationResultsProps {
  status: 'success' | 'partial' | 'failed';
  totalRows: number;
  validRows: number;
  errors: ValidationError[];
  summary?: ImportSummary;
  onRetry?: () => void;
  onContinue?: () => void;
  onViewData?: () => void;
}

interface ValidationError {
  row: number;
  column?: string;
  message: string;
  value?: any;
}

interface ImportSummary {
  emailCount: number;
  campaignCount: number;
  eventCount: number;
  dateRange: { start: string; end: string };
}
```

**Visual Specs**:
```css
Success Icon:
  - CheckCircle from lucide-react
  - color: hsl(142 76% 60%)
  - size: 64px
  - animation: scale-in + pulse

Warning Icon:
  - AlertTriangle from lucide-react
  - color: hsl(48 96% 60%)
  - size: 64px

Error Icon:
  - XCircle from lucide-react
  - color: hsl(0 84.2% 60.2%)
  - size: 64px

Error List Item:
  - background: hsl(var(--destructive) / 0.1)
  - border-left: 4px solid hsl(var(--destructive))
  - padding: 0.75rem
  - margin-bottom: 0.5rem
  - border-radius: var(--radius)
```

**Pseudo-code**:
```tsx
<Card>
  <CardContent className="text-center py-12">
    {/* Success */}
    {status === 'success' && (
      <>
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-500 mb-2">
          Import Successful!
        </h2>
        <p className="text-muted-foreground mb-6">
          {totalRows.toLocaleString()} rows imported successfully
        </p>

        {summary && (
          <Card className="bg-muted/50 max-w-md mx-auto mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Import Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-left space-y-2 text-sm">
                <li>• Emails: {summary.emailCount.toLocaleString()}</li>
                <li>• Campaigns: {summary.campaignCount} unique</li>
                <li>• Events: {summary.eventCount} unique</li>
                <li>• Date range: {formatDateRange(summary.dateRange)}</li>
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={onViewData}>
            View Data in Dashboard
          </Button>
          <Button variant="outline" onClick={onRetry}>
            Import Another File
          </Button>
        </div>
      </>
    )}

    {/* Partial success (with errors) */}
    {status === 'partial' && (
      <>
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-yellow-500 mb-2">
          Import completed with errors
        </h2>
        <p className="text-muted-foreground mb-6">
          {validRows.toLocaleString()} rows imported •
          {errors.length} rows had errors
        </p>

        <Alert variant="destructive" className="max-w-2xl mx-auto mb-6 text-left">
          <AlertTitle>Common Errors</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              {errors.slice(0, 3).map((error, idx) => (
                <div key={idx} className="text-xs font-mono">
                  <p className="font-semibold">Row {error.row}: {error.message}</p>
                  {error.column && (
                    <p className="text-muted-foreground">
                      Column: {error.column} • Value: "{error.value}"
                    </p>
                  )}
                </div>
              ))}

              {errors.length > 3 && (
                <p className="text-sm italic">
                  ... and {errors.length - 3} more errors
                </p>
              )}

              <Button variant="ghost" size="sm" className="mt-2">
                Show All Errors
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={onRetry}>
            Fix and Re-upload
          </Button>
          <Button onClick={onContinue}>
            Continue with Valid Rows
          </Button>
        </div>
      </>
    )}
  </CardContent>
</Card>
```

---

## Color & Typography Guidelines

### Color Palette (Dark Mode)

**Base Colors**:
```css
--background: 222.2 84% 4.9%;      /* Almost black: #0a0e1a */
--foreground: 210 40% 98%;          /* Almost white: #f8f9fa */
--card: 222.2 84% 4.9%;             /* Same as background for flat design */
--card-foreground: 210 40% 98%;     /* Same as foreground */
```

**Brand Colors**:
```css
--primary: 217.2 91.2% 59.8%;       /* Blue: #5B9FED */
--primary-foreground: 222.2 47.4% 11.2%;  /* Dark blue text */
```

**Semantic Colors**:
```css
--success: 142 76% 36%;             /* Green: #16a34a */
--success-light: 142 76% 60%;       /* Light green: #4ade80 */
--warning: 48 96% 53%;              /* Yellow: #facc15 */
--warning-light: 48 96% 60%;        /* Light yellow: #fde047 */
--destructive: 0 62.8% 30.6%;       /* Red: #991b1b */
--destructive-light: 0 84.2% 60.2%; /* Light red: #ef4444 */
```

**Neutral Colors**:
```css
--muted: 217.2 32.6% 17.5%;         /* Dark gray: #1e293b */
--muted-foreground: 215 20.2% 65.1%; /* Medium gray: #94a3b8 */
--border: 217.2 32.6% 17.5%;        /* Same as muted */
```

### Typography Scale

**Font Family**:
- Primary: System font stack (default)
- Monospace: For data display, code snippets

**Scale**:
```css
/* Page titles */
.text-3xl: 1.875rem (30px), font-weight: 700, line-height: 1.2

/* Section headers */
.text-xl: 1.25rem (20px), font-weight: 600, line-height: 1.3

/* Card titles */
.text-lg: 1.125rem (18px), font-weight: 600, line-height: 1.4

/* Body text */
.text-base: 1rem (16px), font-weight: 400, line-height: 1.5

/* Helper text */
.text-sm: 0.875rem (14px), font-weight: 400, line-height: 1.5

/* Fine print */
.text-xs: 0.75rem (12px), font-weight: 400, line-height: 1.5
```

### Spacing System

Based on Tailwind's spacing scale (4px base unit):

```css
gap-2:  0.5rem (8px)   /* Tight spacing between related items */
gap-4:  1rem (16px)    /* Default spacing between elements */
gap-6:  1.5rem (24px)  /* Spacing between sections */
gap-8:  2rem (32px)    /* Large spacing between major sections */

p-4:    1rem (16px)    /* Default card padding */
p-6:    1.5rem (24px)  /* Large card padding */

space-y-4: 1rem vertical spacing in flex containers
space-y-6: 1.5rem vertical spacing in flex containers
```

### Border Radius

```css
--radius: 0.5rem (8px)  /* Default border radius */

rounded-lg: var(--radius)
rounded-md: calc(var(--radius) - 2px)
rounded-sm: calc(var(--radius) - 4px)
rounded-full: 9999px (for pills/badges)
```

---

## Interaction Patterns

### Hover Effects

**Cards**:
```css
transition: all 300ms ease-in-out;

/* Default */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

/* Hover */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
transform: translateY(-2px);
```

**Buttons**:
```css
/* Primary button */
default: background: hsl(var(--primary))
hover:   background: hsl(var(--primary) / 0.9)
         transform: scale(1.02)

/* Outline button */
default: border: 1px solid hsl(var(--border))
hover:   border-color: hsl(var(--primary))
         background: hsl(var(--primary) / 0.1)
```

**Dropzone**:
```css
/* Default */
border: 2px dashed hsl(var(--muted))
background: transparent

/* Hover */
border-color: hsl(var(--primary))
background: hsl(var(--primary) / 0.05)
cursor: pointer

/* Drag over */
border-color: hsl(var(--primary))
background: hsl(var(--primary) / 0.1)
border-style: solid
```

### Click/Tap Feedback

**Buttons**:
```css
active: transform: scale(0.98)
        opacity: 0.9
```

**Dropdowns**:
- Open with smooth 200ms fade-in
- Close with 150ms fade-out
- Animate max-height for smooth expansion

### Loading States

**Spinner**:
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
  border: 4px solid transparent;
  border-top-color: hsl(var(--primary));
  border-radius: 50%;
}
```

**Skeleton Loaders**:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  background: hsl(var(--muted));
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: var(--radius);
}
```

### Progress Bar Animation

```css
.progress-fill {
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(
    90deg,
    hsl(var(--primary)),
    hsl(var(--primary) / 0.8)
  );
}
```

### Success Animation

```css
@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.success-icon {
  animation: scale-in 300ms ease-out,
             pulse 2s ease-in-out infinite;
}
```

### Micro-interactions

**Badge appearance**:
- Fade in with 200ms delay
- Slide in from right

**Error list expansion**:
- Accordion-style with smooth height transition
- 300ms ease-in-out

**File preview**:
- Slide down from top: 300ms
- Fade in simultaneously

---

## State Machine

### Upload State Flow

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  IDLE                                                   │
│  • Show dropzone                                        │
│  • Show help text                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
              │
              │ User selects/drops file
              ↓
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  SELECTED                                               │
│  • Show file preview                                    │
│  • Button: "Remove" to go back to IDLE                 │
│  • Button: "Continue" to start parsing                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
              │
              │ Auto-trigger or user clicks "Continue"
              ↓
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  PARSING                                                │
│  • Show spinner                                         │
│  • Upload file to server                               │
│  • Parse rows and columns                              │
│  • Generate preview data                               │
│  • Auto-suggest column mappings                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
              │
              │ Parse complete
              ↓
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  MAPPING                                                │
│  • Show data preview table                             │
│  • Show column mapping interface                       │
│  • User reviews and adjusts mappings                   │
│  • Button: "Back" to SELECTED                          │
│  • Button: "Confirm Import" to proceed                 │
│  • Validate all required fields mapped                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
              │
              │ User confirms mappings
              ↓
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  VALIDATING                                             │
│  • Show progress bar                                    │
│  • Validate each row                                    │
│  • Collect errors                                       │
│  • Transform data                                       │
│  • Import valid rows to database                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
              │
              ↓
      ┌───────────────┐
      │               │
      ↓               ↓
┌──────────┐    ┌──────────────┐
│          │    │              │
│ COMPLETE │    │    ERROR     │
│          │    │              │
└──────────┘    └──────────────┘
     │                 │
     │                 │
     ↓                 ↓
All rows      Some/all rows
imported      had errors
successfully
     │                 │
     ↓                 ↓
Show success    Show partial
+ summary      success/error
     │          + error list
     │                 │
     ↓                 ↓
Actions:        Actions:
• View Data    • Fix & Re-upload
• Import More  • Continue with Valid
```

### State Transitions

| Current State | Trigger | Next State | Side Effects |
|--------------|---------|-----------|--------------|
| IDLE | User selects file | SELECTED | Store file in state |
| IDLE | User drags file | IDLE (dragOver) | Visual feedback |
| SELECTED | User clicks "Remove" | IDLE | Clear file |
| SELECTED | User clicks "Continue" | PARSING | Upload file to API |
| PARSING | Parse successful | MAPPING | Store columns, preview, mappings |
| PARSING | Parse failed | ERROR | Show error message |
| MAPPING | User clicks "Back" | SELECTED | Preserve file |
| MAPPING | User confirms | VALIDATING | Send mappings to API |
| VALIDATING | All rows valid | COMPLETE | Show success |
| VALIDATING | Some rows invalid | ERROR (partial) | Show errors + valid count |
| VALIDATING | All rows invalid | ERROR (failed) | Show error summary |
| COMPLETE | User clicks "Import More" | IDLE | Reset state |
| ERROR | User clicks "Retry" | IDLE | Reset state |

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
default: 0px - 639px     (mobile)
sm:      640px - 767px   (large mobile)
md:      768px - 1023px  (tablet)
lg:      1024px - 1279px (desktop)
xl:      1280px+         (large desktop)
```

### Layout Adjustments

#### Mobile (< 640px)

**Dropzone**:
- Full width
- min-height: 250px (smaller)
- Icon size: h-12 w-12
- Text: text-sm

**File Preview**:
- Vertical layout
- Icon above text
- Full-width remove button

**Data Preview Table**:
- Horizontal scroll
- Sticky first column
- Font size: text-xs

**Column Mapping**:
- Vertical stack (source above target)
- Full-width dropdowns
- Compact spacing (gap-2)

**Buttons**:
- Full width
- Stacked vertically
- Order: Primary first, then secondary

#### Tablet (640px - 1023px)

**Dropzone**:
- min-height: 280px
- Icon size: h-14 w-14

**Column Mapping**:
- Horizontal layout maintained
- Slightly compressed
- Arrow icon smaller

**Buttons**:
- Inline, but with wrap
- Centered

#### Desktop (1024px+)

**All components at full size**:
- max-width: 1200px
- Centered with container
- Generous spacing

**Table**:
- Show all columns
- No horizontal scroll (if < 8 columns)

**Buttons**:
- Inline, right-aligned for actions
- Centered for primary CTAs

### Responsive Pseudo-code

```tsx
<div className="container mx-auto px-4 py-8 max-w-5xl">
  {/* Dropzone */}
  <div className="
    min-h-[250px] md:min-h-[300px]
    p-4 md:p-6
  ">
    <Upload className="h-12 w-12 md:h-16 md:w-16" />
    <p className="text-sm md:text-base">...</p>
  </div>

  {/* Column Mapping */}
  <div className="
    flex flex-col md:flex-row
    gap-2 md:gap-4
    items-start md:items-center
  ">
    <div className="w-full md:flex-1">Source</div>
    <ArrowRight className="hidden md:block" />
    <div className="w-full md:flex-1">Target</div>
    <Badge className="self-start md:self-auto" />
  </div>

  {/* Action buttons */}
  <div className="
    flex flex-col md:flex-row
    gap-4
    justify-center md:justify-end
  ">
    <Button className="w-full md:w-auto">Primary</Button>
    <Button variant="outline" className="w-full md:w-auto">
      Secondary
    </Button>
  </div>
</div>
```

---

## Accessibility Checklist

### Keyboard Navigation

- [ ] All interactive elements focusable with Tab
- [ ] Visual focus indicators (ring-2 ring-primary)
- [ ] Dropzone: Enter/Space to open file picker
- [ ] Dropdowns: Arrow keys to navigate, Enter to select
- [ ] Buttons: Enter/Space to activate
- [ ] Escape key: Close modals/dropdowns

### Screen Reader Support

- [ ] **Dropzone**:
  - `role="button"`
  - `aria-label="Upload file by clicking or dragging. Supported formats: CSV, Excel. Maximum size: 50MB"`
  - Announce drag state changes

- [ ] **File Preview**:
  - Announce filename when file selected
  - Remove button: `aria-label="Remove file {filename}"`

- [ ] **Progress**:
  - `role="progressbar"`
  - `aria-valuenow={progress}`
  - `aria-valuemin="0"`
  - `aria-valuemax="100"`
  - `aria-label="Validation progress"`

- [ ] **Validation Results**:
  - Use `role="status"` or `role="alert"` for live regions
  - Announce completion/errors

- [ ] **Error List**:
  - `role="list"`
  - Each error: `role="listitem"`

### Color Contrast

All text must meet WCAG AAA (7:1 for normal text, 4.5:1 for large):

- [ ] Body text on background: `#f8f9fa` on `#0a0e1a` = 16.7:1 ✓
- [ ] Muted text on background: `#94a3b8` on `#0a0e1a` = 7.2:1 ✓
- [ ] Primary on background: `#5B9FED` on `#0a0e1a` = 8.5:1 ✓
- [ ] Success text: `#4ade80` on `#0a0e1a` = 10.1:1 ✓
- [ ] Warning text: `#fde047` on `#0a0e1a` = 13.8:1 ✓
- [ ] Error text: `#ef4444` on `#0a0e1a` = 5.8:1 ✓

### Focus Management

- [ ] Focus moves to file input when dropzone clicked
- [ ] Focus returns to trigger after modal closes
- [ ] Focus moves to success/error message after validation
- [ ] Skip links for keyboard users

### ARIA Labels

All interactive elements must have accessible names:

```tsx
// Examples
<Button aria-label="Remove file">
  <X className="h-4 w-4" />
</Button>

<Select aria-label="Select target field for {sourceColumn}">
  ...
</Select>

<Progress
  aria-label="Import progress"
  aria-valuenow={progress}
/>
```

### Motion & Animation

Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Notes

### File Upload Flow

1. **Client uploads file**: POST to `/api/uploads/spreadsheet`
   - Use FormData to send file
   - Include user authentication

2. **Server parses file**:
   - Save to temp storage
   - Parse with papaparse (CSV) or xlsx (Excel)
   - Extract columns and first 5 rows
   - Run ML/heuristic column mapping algorithm
   - Return: importId, columns, previewRows, suggestedMappings

3. **User reviews mappings**:
   - Client stores mappings in state
   - User adjusts as needed
   - Validate required fields are mapped

4. **User confirms**: POST to `/api/uploads/confirm-mapping`
   - Send: importId, finalMappings
   - Server validates entire dataset
   - Returns: status, validRows, errors

5. **Handle results**:
   - SUCCESS: Show summary, redirect to dashboard
   - PARTIAL: Show errors, offer to continue or re-upload
   - FAILED: Show errors, offer to fix and retry

### State Management

Recommend using React hooks for local state:

```typescript
type UploadState =
  | { status: 'idle' }
  | { status: 'selected'; file: File }
  | { status: 'parsing'; file: File }
  | {
      status: 'mapping';
      importId: number;
      columns: string[];
      previewData: any[];
      mappings: ColumnMapping[];
    }
  | { status: 'validating'; importId: number }
  | {
      status: 'complete';
      validRows: number;
      summary: ImportSummary;
    }
  | {
      status: 'error';
      errors: ValidationError[];
      validRows?: number;
    };

const [uploadState, setUploadState] = useState<UploadState>({
  status: 'idle'
});
```

### API Integration

Use existing `apiClient` from ts-rest contracts:

```typescript
// Assumed contracts (to be implemented)
const result = await apiClient.uploads.uploadSpreadsheet({
  body: formData
});

if (result.status === 200) {
  setUploadState({
    status: 'mapping',
    importId: result.body.importId,
    columns: result.body.columns,
    previewData: result.body.previewRows,
    mappings: result.body.suggestedMappings,
  });
}
```

### Error Handling

Handle network errors gracefully:

```typescript
try {
  const result = await apiClient.uploads.uploadSpreadsheet({
    body: formData
  });
  // ... handle success
} catch (error) {
  toast.error('Failed to upload file. Please try again.');
  setUploadState({ status: 'idle' });
}
```

### Performance Considerations

- **Large files**: Show progress for uploads > 5MB
- **Many rows**: Paginate error display (show first 10, expand for more)
- **Validation**: Consider streaming validation for > 10k rows
- **Debounce**: Mapping changes to prevent excessive re-renders

### Testing Scenarios

1. **Happy path**: Upload valid CSV, auto-mappings correct, import succeeds
2. **Manual mapping**: Auto-mappings need adjustment
3. **Partial errors**: Some rows invalid, user continues with valid
4. **All errors**: All rows invalid, user must fix
5. **Network failure**: Upload fails, user retries
6. **Large file**: 50MB file, show progress
7. **Unsupported format**: .txt file rejected
8. **File too large**: 51MB file rejected

---

## Example Code Snippets

### UploadDataPage (Main Component Structure)

```tsx
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FileDropzone } from '@/components/upload/FileDropzone';
import { FilePreview } from '@/components/upload/FilePreview';
import { DataPreviewTable } from '@/components/upload/DataPreviewTable';
import { ColumnMappingTable } from '@/components/upload/ColumnMappingTable';
import { ValidationProgress } from '@/components/upload/ValidationProgress';
import { ValidationResults } from '@/components/upload/ValidationResults';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

type UploadState = /* ... as defined above ... */;

export default function UploadDataPage() {
  const [state, setState] = useState<UploadState>({ status: 'idle' });

  const handleFileSelect = async (file: File) => {
    setState({ status: 'selected', file });

    // Auto-start parsing
    setState({ status: 'parsing', file });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await apiClient.uploads.uploadSpreadsheet({
        body: formData
      });

      if (result.status === 200) {
        setState({
          status: 'mapping',
          importId: result.body.importId,
          columns: result.body.columns,
          previewData: result.body.previewRows,
          mappings: result.body.suggestedMappings,
        });
      }
    } catch (error) {
      // Handle error
    }
  };

  const handleConfirmMapping = async () => {
    if (state.status !== 'mapping') return;

    setState({ status: 'validating', importId: state.importId });

    try {
      const result = await apiClient.uploads.confirmMapping({
        body: {
          importId: state.importId,
          mappings: state.mappings,
        }
      });

      // Handle result...
    } catch (error) {
      // Handle error
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Import Marketing Data</h1>
          <p className="text-muted-foreground mt-2">
            Upload your CSV or Excel file to import campaign and event
            performance data into FunnelSight
          </p>
        </div>

        {/* State-based rendering */}
        {state.status === 'idle' && (
          <>
            <FileDropzone
              onFileSelect={handleFileSelect}
              acceptedFormats={['.csv', '.xlsx', '.xls']}
              maxSizeMB={50}
            />

            {/* Help card */}
            <HelpCard />
          </>
        )}

        {state.status === 'selected' && (
          <>
            <FilePreview
              filename={state.file.name}
              fileSize={state.file.size}
              fileType={state.file.type}
              onRemove={() => setState({ status: 'idle' })}
            />
            <Button onClick={() => handleFileSelect(state.file)}>
              Continue to Mapping →
            </Button>
          </>
        )}

        {state.status === 'parsing' && (
          <div className="text-center py-12">
            <Spinner />
            <p className="mt-4 text-muted-foreground">
              Parsing your file...
            </p>
          </div>
        )}

        {state.status === 'mapping' && (
          <>
            <DataPreviewTable
              columns={state.columns}
              rows={state.previewData}
              totalRowCount={/* ... */}
            />

            <ColumnMappingTable
              sourceCols={state.columns}
              targetFields={TARGET_FIELDS}
              suggestedMappings={state.mappings}
              previewData={state.previewData}
              onMappingChange={handleMappingChange}
              requiredFields={REQUIRED_FIELDS}
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setState({
                  status: 'selected',
                  file: /* preserve file */
                })}
              >
                ← Back
              </Button>
              <Button onClick={handleConfirmMapping}>
                Confirm Import →
              </Button>
            </div>
          </>
        )}

        {state.status === 'validating' && (
          <ValidationProgress
            totalRows={/* ... */}
            processedRows={/* ... */}
            validRows={/* ... */}
            errorCount={/* ... */}
            status="validating"
          />
        )}

        {(state.status === 'complete' || state.status === 'error') && (
          <ValidationResults
            status={state.status === 'complete' ? 'success' : 'error'}
            totalRows={/* ... */}
            validRows={state.validRows}
            errors={state.status === 'error' ? state.errors : []}
            summary={state.status === 'complete' ? state.summary : undefined}
            onRetry={() => setState({ status: 'idle' })}
            onViewData={() => navigate('/dashboard')}
          />
        )}
      </div>
    </AppLayout>
  );
}
```

### Constants

```typescript
// Target fields available for mapping
const TARGET_FIELDS = [
  { value: 'email', label: 'Email Address', description: 'Contact email' },
  { value: 'campaign_name', label: 'Campaign Name' },
  { value: 'utm_source', label: 'UTM Source' },
  { value: 'utm_medium', label: 'UTM Medium' },
  { value: 'utm_campaign', label: 'UTM Campaign' },
  { value: 'registration_date', label: 'Registration Date' },
  { value: 'event_name', label: 'Event Name' },
  { value: 'event_date', label: 'Event Date' },
  { value: 'cost', label: 'Cost/Spend' },
  { value: 'impressions', label: 'Impressions' },
  { value: 'clicks', label: 'Clicks' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'attendee_name', label: 'Attendee Name' },
  { value: 'company', label: 'Company' },
];

const REQUIRED_FIELDS = ['email', 'event_name'];
```

---

## Appendix: Design Tokens

### CSS Variables (to add to index.css)

```css
@layer base {
  :root {
    /* Existing variables... */

    /* Upload-specific */
    --dropzone-height: 300px;
    --dropzone-border-width: 2px;
    --confidence-high: 142 76% 60%;
    --confidence-medium: 48 96% 60%;
    --confidence-low: 215 20.2% 65.1%;
  }
}
```

### Animation Keyframes (to add to tailwind.config.js)

```javascript
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'scale-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
      animation: {
        'scale-in': 'scale-in 300ms ease-out',
        'slide-down': 'slide-down 300ms ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
    },
  },
};
```

---

## Summary

This design specification provides a complete blueprint for implementing the FunnelSight spreadsheet upload feature. The design prioritizes:

1. **User Experience**: Clear visual hierarchy, helpful guidance, and graceful error handling
2. **Modern Aesthetics**: Dark mode, smooth animations, and minimalist design
3. **Accessibility**: WCAG AAA compliance, keyboard navigation, and screen reader support
4. **Responsiveness**: Mobile-first design that scales beautifully to desktop
5. **Maintainability**: Reusable components, consistent design tokens, and clear patterns

### Next Steps for Implementation

1. **Set up routes**: Add `/upload` route to App.tsx
2. **Create component files**: Set up component structure in `/client/src/components/upload/`
3. **Implement API contracts**: Define upload endpoints in shared/contracts
4. **Build components**: Implement each component following this spec
5. **Add navigation**: Link from Data Sources page and Dashboard
6. **Test thoroughly**: Cover all user flows and edge cases
7. **Polish interactions**: Fine-tune animations and transitions

**Questions or clarifications?** Refer back to this document or the existing FunnelSight design system (DashboardPage, AppLayout) for consistency.

---

**End of Design Specification**
