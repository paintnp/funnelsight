import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, AlertCircle, X, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import type { ColumnMapping, ImportStatus } from '../../../shared/schema.zod';

type UploadState = 'idle' | 'selected' | 'parsing' | 'mapping' | 'validating' | 'complete' | 'error';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

function FileDropzone({ onFileSelect, disabled }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      onFileSelect(droppedFile);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef) {
      fileInputRef.click();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      onFileSelect(selectedFile);
    }
  };

  const isValidFile = (file: File) => {
    const ext = file.name.toLowerCase().split('.').pop();
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      alert('Invalid file type. Please upload a CSV or Excel file.');
      return false;
    }

    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 50MB.');
      return false;
    }

    return true;
  };

  return (
    <div
      className={`
        min-h-[300px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer transition-all
        ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary hover:bg-primary/5'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Upload file by clicking or dragging"
    >
      <input
        type="file"
        ref={setFileInputRef}
        accept=".csv,.xlsx,.xls"
        onChange={handleFileInput}
        className="hidden"
      />

      <Upload className="h-16 w-16 text-muted-foreground mb-4" />
      <p className="text-lg font-medium mb-2">Drag and drop your CSV or Excel file here</p>
      <p className="text-sm text-muted-foreground mb-4">or click to browse</p>

      <div className="text-xs text-muted-foreground space-y-1 text-center">
        <p>Supported formats: .csv, .xlsx, .xls</p>
        <p>Maximum file size: 50MB</p>
      </div>
    </div>
  );
}

interface FilePreviewProps {
  filename: string;
  fileSize: number;
  onRemove: () => void;
}

function FilePreview({ filename, fileSize, onRemove }: FilePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <FileText className="h-10 w-10 text-primary" />

          <div className="flex-1">
            <p className="font-semibold">{filename}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)} • CSV/Excel File</p>
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
      </CardContent>
    </Card>
  );
}

const targetFields = [
  { value: 'email', label: 'Email Address' },
  { value: 'campaign_name', label: 'Campaign Name' },
  { value: 'utm_source', label: 'UTM Source' },
  { value: 'utm_medium', label: 'UTM Medium' },
  { value: 'utm_campaign', label: 'UTM Campaign' },
  { value: 'registration_date', label: 'Registration Date' },
  { value: 'event_name', label: 'Event Name' },
  { value: 'event_date', label: 'Event Date' },
  { value: 'cost', label: 'Cost' },
  { value: 'impressions', label: 'Impressions' },
  { value: 'clicks', label: 'Clicks' },
  { value: 'conversions', label: 'Conversions/Registrations' },
  { value: 'attendees', label: 'Attendees/Attended' },
  { value: 'attendee_name', label: 'Attendee Name' },
  { value: 'company', label: 'Company' },
];

export default function UploadDataPage() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [importId, setImportId] = useState<number | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validationResult, setValidationResult] = useState<ImportStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem('auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
      const response = await fetch(`${apiUrl}/api/spreadsheets/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Upload successful:', data);
      setImportId(data.importId);
      setColumns(data.columns || []);
      setPreviewRows(data.previewRows || []);
      setMappings(data.suggestedMappings || []);
      setState('mapping');
    },
    onError: (err: Error) => {
      console.error('Upload error:', err);
      setError(err.message);
      setState('error');
    },
  });

  // Confirm mapping mutation
  const confirmMutation = useMutation({
    mutationFn: async ({ importId, mappings }: { importId: number; mappings: ColumnMapping[] }) => {
      const token = localStorage.getItem('auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
      const response = await fetch(
        `${apiUrl}/api/spreadsheets/imports/${importId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mappings }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Validation failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('Validation complete:', data);
      setValidationResult(data);
      setState(data.status === 'completed' ? 'complete' : 'error');
    },
    onError: (err: Error) => {
      console.error('Validation error:', err);
      setError(err.message);
      setState('error');
    },
  });

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setState('selected');

    // Immediately start upload
    const formData = new FormData();
    formData.append('file', selectedFile);

    setState('parsing');
    uploadMutation.mutate(formData);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setState('idle');
    setError(null);
  };

  const handleMappingChange = (sourceColumn: string, targetField: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.sourceColumn === sourceColumn
          ? { ...m, targetField: targetField as any }
          : m
      )
    );
  };

  const handleConfirmMapping = () => {
    if (!importId) return;

    setState('validating');
    confirmMutation.mutate({ importId, mappings });
  };

  const handleReset = () => {
    setFile(null);
    setState('idle');
    setImportId(null);
    setColumns([]);
    setPreviewRows([]);
    setMappings([]);
    setValidationResult(null);
    setError(null);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return (
        <Badge className="bg-green-900/30 text-green-400 border-green-700/50">
          High {confidence}%
        </Badge>
      );
    } else if (confidence >= 70) {
      return (
        <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-700/50">
          Medium {confidence}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          Low {confidence}%
        </Badge>
      );
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Import Marketing Data</h1>
          <p className="text-muted-foreground">
            Upload your CSV or Excel file to import campaign and event performance data into FunnelSight
          </p>
        </div>

        {/* State: Idle */}
        {state === 'idle' && (
          <>
            <FileDropzone onFileSelect={handleFileSelect} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  What data can I import?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Campaign performance (impressions, clicks, cost)</li>
                  <li>• Event registrations and attendance</li>
                  <li>• UTM parameters and attribution data</li>
                  <li>• Contact information and engagement metrics</li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {/* State: Selected/Parsing */}
        {(state === 'selected' || state === 'parsing') && file && (
          <div className="space-y-6">
            <FilePreview
              filename={file.name}
              fileSize={file.size}
              onRemove={handleRemoveFile}
            />

            {state === 'parsing' && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold">Parsing your file...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This may take a few moments for large files
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* State: Mapping */}
        {state === 'mapping' && (
          <div className="space-y-6">
            {/* Data Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  First 5 rows of your spreadsheet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((col) => (
                          <TableHead key={col}>{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((row, idx) => (
                        <TableRow key={idx}>
                          {columns.map((col) => (
                            <TableCell key={col} className="font-mono text-xs">
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

            {/* Column Mapping */}
            <Card>
              <CardHeader>
                <CardTitle>Column Mapping</CardTitle>
                <CardDescription>
                  Match each column from your file to a FunnelSight field
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mappings.map((mapping) => {
                    const previewValue = previewRows[0]?.[mapping.sourceColumn];

                    return (
                      <div key={mapping.sourceColumn} className="border-b border-border/50 pb-4 last:border-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Source Column */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{mapping.sourceColumn}</span>
                            </div>
                            <p className="text-xs text-muted-foreground italic mt-1">
                              Preview: {previewValue?.toString().substring(0, 50) || 'N/A'}
                            </p>
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="hidden md:block text-muted-foreground h-4 w-4" />

                          {/* Target Field */}
                          <div className="flex-1">
                            <Select
                              value={mapping.targetField}
                              onValueChange={(value) => handleMappingChange(mapping.sourceColumn, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Skip this column" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="skip">Skip</SelectItem>
                                {targetFields.map((field) => (
                                  <SelectItem key={field.value} value={field.value}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Confidence Badge */}
                          <div className="self-start md:self-auto">
                            {getConfidenceBadge(mapping.confidence)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-6" />

                <div className="text-sm text-muted-foreground space-y-3">
                  <p>* Required field</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-green-900/30 text-green-400 border-green-700/50">
                      High Confidence (90-100%)
                    </Badge>
                    <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-700/50">
                      Medium Confidence (70-89%)
                    </Badge>
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      Low Confidence (&lt;70%)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <Button variant="outline" onClick={handleReset}>
                ← Back
              </Button>
              <Button onClick={handleConfirmMapping} disabled={confirmMutation.isPending}>
                {confirmMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Confirm Import →
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* State: Validating */}
        {state === 'validating' && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
              <p className="text-lg font-semibold mb-4">Validating your data...</p>

              {validationResult && (
                <>
                  <Progress value={validationResult.progress} className="mb-4 max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {validationResult.rowsProcessed} rows processed •{' '}
                    {validationResult.rowsValid} valid •{' '}
                    {validationResult.rowsInvalid} errors
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* State: Complete */}
        {state === 'complete' && validationResult && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-green-500 mb-2">Import Successful!</h2>
              <p className="text-muted-foreground mb-6">
                {validationResult.rowsValid.toLocaleString()} rows imported successfully
              </p>

              <Card className="bg-muted/50 max-w-md mx-auto mb-6 text-left">
                <CardHeader>
                  <CardTitle className="text-lg">Import Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Total rows processed: {validationResult.rowsProcessed.toLocaleString()}</li>
                    <li>• Valid rows: {validationResult.rowsValid.toLocaleString()}</li>
                    <li>• Errors: {validationResult.rowsInvalid}</li>
                    <li>• Status: {validationResult.status}</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/dashboard')}>
                  View Data in Dashboard
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Import Another File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* State: Error */}
        {state === 'error' && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-yellow-500 mb-2">
                {validationResult?.rowsInvalid ? 'Import completed with errors' : 'Import failed'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {validationResult?.rowsValid
                  ? `${validationResult.rowsValid.toLocaleString()} rows imported • ${validationResult.rowsInvalid} rows had errors`
                  : error || 'An error occurred during import'}
              </p>

              {validationResult?.errors && validationResult.errors.length > 0 && (
                <Alert variant="destructive" className="max-w-2xl mx-auto mb-6 text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2 mt-2">
                      {validationResult.errors.slice(0, 5).map((err, idx) => (
                        <div key={idx} className="text-xs font-mono bg-background/50 p-2 rounded">
                          <p className="font-semibold">Row {err.row}: {err.message}</p>
                          {err.column && (
                            <p className="text-muted-foreground">
                              Column: {err.column} • Value: "{err.value}"
                            </p>
                          )}
                        </div>
                      ))}

                      {validationResult.errors.length > 5 && (
                        <p className="text-sm italic mt-2">
                          ... and {validationResult.errors.length - 5} more errors
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={handleReset}>
                  Fix and Re-upload
                </Button>
                {validationResult?.rowsValid && validationResult.rowsValid > 0 && (
                  <Button onClick={() => navigate('/dashboard')}>
                    Continue with Valid Rows
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
