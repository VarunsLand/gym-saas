'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2, AlertTriangle } from 'lucide-react';
import { useImportLeads } from '../hooks/useLeads';
import { CreateLeadPayload } from '../types';

interface ParsedRow {
  _original: Record<string, unknown>;
  first_name: string;
  last_name: string;
  email: string | undefined;
  phone_number: string;
  status: 'NEW' | 'IN_PROGRESS' | 'WON' | 'LOST';
  description: string | undefined;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function ImportLeadsDialog() {
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: importLeads, isPending } = useImportLeads();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateEmail = (email: string) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getValue = (row: Record<string, string>, possibleKeys: string[]): string => {
    // Create a normalized map of the row's keys (lowercase, no spaces, no underscores)
    const normalizedRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      const normKey = key.toLowerCase().replace(/[\s_]/g, '');
      normalizedRow[normKey] = value;
    }
    
    for (const key of possibleKeys) {
      if (normalizedRow[key] !== undefined && normalizedRow[key] !== null) {
        return String(normalizedRow[key]).trim();
      }
    }
    return '';
  };

  const processData = (data: Record<string, string>[]) => {
    const processed: ParsedRow[] = data.map((row) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Flexible matching for Name
      const exactFirstName = getValue(row, ['firstname', 'first']);
      const exactLastName = getValue(row, ['lastname', 'last']);
      const combinedName = getValue(row, ['name', 'fullname', 'contactname', 'leadname']);
      
      let first_name = '';
      let last_name = '';
      
      if (exactFirstName || exactLastName) {
        first_name = exactFirstName;
        last_name = exactLastName;
      } else if (combinedName) {
        const nameParts = combinedName.split(' ');
        first_name = nameParts[0];
        last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }

      if (!first_name) {
        errors.push('Name is required');
      }

      // Flexible matching for Phone
      const rawPhone = getValue(row, ['phone', 'phonenumber', 'mobile', 'cell', 'contactnumber']);
      // Normalize phone: keep only digits and leading plus
      const phone_number = rawPhone.replace(/(?!^\+)[^\d]/g, '');
      
      if (!phone_number) {
        errors.push('Phone is required');
      } else if (phone_number.length < 5) {
        errors.push('Phone must be at least 5 digits');
      }

      // Flexible matching for Email
      const email = getValue(row, ['email', 'emailaddress']).toLowerCase();
      if (email && !validateEmail(email)) {
        errors.push('Invalid email format');
      }

      // Flexible matching for Status
      const rawStatus = getValue(row, ['status', 'leadstatus', 'state']).toUpperCase().replace(/[\s-]/g, '_');
      let status: 'NEW' | 'IN_PROGRESS' | 'WON' | 'LOST' = 'NEW';
      
      if (!rawStatus) {
        // Default to NEW silently
        status = 'NEW';
      } else if (rawStatus.includes('IN_PROGRESS') || rawStatus.includes('PROGRESS')) {
        status = 'IN_PROGRESS';
      } else if (rawStatus.includes('WON') || rawStatus.includes('CLOSED_WON')) {
        status = 'WON';
      } else if (rawStatus.includes('LOST') || rawStatus.includes('CLOSED_LOST')) {
        status = 'LOST';
      } else if (rawStatus === 'NEW') {
        status = 'NEW';
      } else {
        warnings.push(`Unknown status "${getValue(row, ['status', 'leadstatus', 'state'])}", defaulting to NEW`);
        status = 'NEW';
      }

      // Description
      const description = getValue(row, ['description', 'notes', 'note', 'background']);

      return {
        _original: row,
        first_name,
        last_name,
        email: email || undefined,
        phone_number,
        status,
        description: description || undefined,
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    });

    setParsedData(processed);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Only CSV files are supported in Phase 1.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processData(results.data as Record<string, string>[]);
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message);
      }
    });
  };

  const handleImport = () => {
    const validRows = parsedData.filter(r => r.isValid);
    if (validRows.length === 0) return;
    if (validRows.length > 1000) {
      alert('Maximum 1000 leads can be imported at once.');
      return;
    }

    const payload: CreateLeadPayload[] = validRows.map(row => ({
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone_number: row.phone_number,
      status: row.status,
      description: row.description
    }));

    importLeads({ leads: payload }, {
      onSuccess: () => {
        setOpen(false);
        resetState();
      }
    });
  };

  const resetState = () => {
    setParsedData([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) resetState();
  };

  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.length - validCount;
  const totalWarnings = parsedData.reduce((acc, row) => acc + row.warnings.length, 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={
        <Button variant="outline" className="gap-2">
          <UploadCloud className="w-4 h-4" />
          Import
        </Button>
      } />
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
        </DialogHeader>

        {parsedData.length === 0 ? (
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full mb-4 text-indigo-600 dark:text-indigo-400">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">CSV up to 5MB</p>
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Browse File
              </Button>
            </label>
            <div className="mt-8 text-xs text-slate-400 dark:text-slate-500 flex flex-col gap-1">
              <p>Supported Columns:</p>
              <p className="font-mono">Name, Email, Phone, Status, Description</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                <span className="font-medium text-sm">{fileName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={resetState} className="text-xs h-7">
                Change File
              </Button>
            </div>

            <div className="flex gap-4 mb-4 text-sm">
              <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>{validCount} valid rows</span>
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  <span>{invalidCount} invalid rows</span>
                </div>
              )}
              {totalWarnings > 0 && (
                <div className="flex items-center text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  <span>{totalWarnings} warnings (will default to NEW)</span>
                </div>
              )}
            </div>

            <div className="border rounded-md flex-1 overflow-auto max-h-[400px]">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 100).map((row, idx) => (
                    <TableRow key={idx} className={row.isValid ? '' : 'bg-red-50 dark:bg-red-900/10'}>
                      <TableCell className="font-medium text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="text-sm">{row.first_name} {row.last_name}</div>
                        {!row.first_name && <div className="text-xs text-red-500 mt-0.5">Missing Name</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{row.phone_number}</div>
                        {row.errors.find(e => e.includes('Phone')) && <div className="text-xs text-red-500 mt-0.5">{row.errors.find(e => e.includes('Phone'))}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{row.email || '-'}</div>
                        {row.errors.find(e => e.includes('email')) && <div className="text-xs text-red-500 mt-0.5">Invalid format</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-2">
                          {row.status}
                          {row.warnings.length > 0 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                        </div>
                        {row.errors.find(e => e.includes('status')) && <div className="text-xs text-red-500 mt-0.5">Invalid status</div>}
                        {row.warnings.map((w, i) => <div key={i} className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{w}</div>)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedData.length > 100 && (
                <div className="text-center p-3 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900">
                  Showing first 100 of {parsedData.length} rows
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={resetState}>Cancel</Button>
              <Button onClick={handleImport} disabled={validCount === 0 || isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Import {validCount} Leads
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
