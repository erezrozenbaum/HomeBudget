
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload, AlertCircle, CheckCircle2, XCircle, X } from "lucide-react";
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import { BusinessClient } from '@/api/entities';

export default function ClientBulkImport({ businessId, onImportComplete, onCancel }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const downloadTemplate = () => {
    // Add BOM for UTF-8 support
    const BOM = '\uFEFF';
    const headers = [
      'Name*',
      'Email',
      'Phone',
      'Address',
      'Website',
      'Contact Person',
      'Payment Terms',
      'Currency',
      'Notes'
    ].join(',');
    
    const example = [
      'לקוח לדוגמה בעמ',
      'contact@example.com',
      '050-1234567',
      'רחוב הרצל 1, תל אביב',
      'www.example.co.il',
      'ישראל ישראלי',
      'net_30',
      'ILS',
      'לקוח חשוב'
    ].join(',');

    const csv = `${BOM}${headers}\n${example}`;
    
    // Create and trigger download with UTF-8 encoding
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validateData = (data) => {
    const errors = {};
    data.forEach((row, index) => {
      if (!row.name) {
        errors[index] = { ...errors[index], name: 'Name is required' };
      }
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors[index] = { ...errors[index], email: 'Invalid email format' };
      }
      if (row.payment_terms && !['immediate', 'net_7', 'net_15', 'net_30', 'net_60', 'custom'].includes(row.payment_terms)) {
        errors[index] = { ...errors[index], payment_terms: 'Invalid payment terms' };
      }
      if (row.currency && !['USD', 'EUR', 'GBP', 'ILS', 'JPY'].includes(row.currency)) {
        errors[index] = { ...errors[index], currency: 'Invalid currency' };
      }
    });
    return errors;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setPreviewData(null);
    setValidationErrors({});

    try {
      const { file_url } = await UploadFile({ file });

      const { status, output } = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  phone: { type: "string" },
                  address: { type: "string" },
                  website: { type: "string" },
                  contact_person: { type: "string" },
                  payment_terms: { type: "string" },
                  currency: { type: "string" },
                  notes: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (status === 'success' && output?.data) {
        const errors = validateData(output.data);
        setValidationErrors(errors);
        setPreviewData(output.data);
      } else {
        setError("Could not process the file. Please make sure it matches the template format.");
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setError("An error occurred while processing the file. Please try again.");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleImport = async () => {
    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix validation errors before importing.");
      return;
    }

    try {
      // Add business_id to each client
      const clientsToImport = previewData.map(client => ({
        ...client,
        business_id: businessId,
        status: 'active'
      }));

      // Use bulkCreate from your BusinessClient entity
      await BusinessClient.bulkCreate(clientsToImport);
      onImportComplete();
    } catch (error) {
      console.error('Error importing clients:', error);
      setError("Failed to import clients. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Close button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Bulk Import Clients</h2>
          <p className="text-sm text-gray-400">Import multiple clients using a CSV file</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Card className="border-dashed border-2 border-gray-700 bg-gray-800/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              id="client-import"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <div className="flex gap-4">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <label htmlFor="client-import">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  disabled={isUploading}
                  asChild
                >
                  <div>
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Processing...' : 'Upload File'}
                  </div>
                </Button>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Supported formats: CSV (UTF-8 encoded), Excel (XLSX, XLS)
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {previewData && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Preview</h3>
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Phone</TableHead>
                  <TableHead className="text-white">Contact Person</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {validationErrors[index] ? (
                        <XCircle className="text-red-500 w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="text-green-500 w-4 h-4" />
                      )}
                    </TableCell>
                    <TableCell className={validationErrors[index]?.name ? 'text-red-400' : 'text-white'}>
                      {row.name}
                    </TableCell>
                    <TableCell className={validationErrors[index]?.email ? 'text-red-400' : 'text-white'}>
                      {row.email}
                    </TableCell>
                    <TableCell className="text-white">{row.phone}</TableCell>
                    <TableCell className="text-white">{row.contact_person}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={Object.keys(validationErrors).length > 0}
            >
              Import {previewData.length} Clients
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
