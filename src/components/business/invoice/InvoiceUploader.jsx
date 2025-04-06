import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, AlertCircle, X } from "lucide-react";
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import { format } from "date-fns";

export default function InvoiceUploader({ onDataExtracted, onCancel }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // First upload the file
      const { file_url } = await UploadFile({ file });

      // Then extract data from it
      const { status, output, details } = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            invoice_number: { type: "string" },
            issue_date: { type: "string", format: "date" },
            due_date: { type: "string", format: "date" },
            client_name: { type: "string" },
            client_details: {
              type: "object",
              properties: {
                email: { type: "string" },
                address: { type: "string" },
                phone: { type: "string" }
              }
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  quantity: { type: "number" },
                  unit_price: { type: "number" },
                  amount: { type: "number" }
                }
              }
            },
            subtotal: { type: "number" },
            tax_rate: { type: "number" },
            tax_amount: { type: "number" },
            total: { type: "number" },
            notes: { type: "string" },
            currency: { type: "string" }
          }
        }
      });

      if (status === 'success' && output) {
        setExtractedData({
          ...output,
          receipt_url: file_url // Keep the uploaded file URL
        });
      } else {
        setError("Could not extract data from the invoice. Please check the file format and try again.");
      }
    } catch (error) {
      console.error('Error processing invoice:', error);
      setError("An error occurred while processing the invoice. Please try again.");
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with close button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Upload Invoice</h2>
          <p className="text-sm text-gray-400">Upload and automatically extract invoice data</p>
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

      {!extractedData ? (
        <>
          <Card className="border-dashed border-2 border-gray-700 bg-gray-800/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-3 rounded-full bg-gray-700">
                  <FileText className="h-8 w-8 text-gray-300" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white mb-1">Upload Invoice</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Upload your invoice file and we'll automatically extract the information
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="invoice-upload"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label htmlFor="invoice-upload">
                  <Button
                    variant="outline"
                    className="cursor-pointer border-gray-600"
                    disabled={isUploading}
                    asChild
                  >
                    <div>
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? 'Processing...' : 'Select File'}
                    </div>
                  </Button>
                </label>
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, JPG, JPEG, PNG
                </p>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-500">Error Processing Invoice</h4>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Review Extracted Data</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Invoice Number</p>
              <p className="text-white">{extractedData.invoice_number}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Client</p>
              <p className="text-white">{extractedData.client_name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Issue Date</p>
              <p className="text-white">{extractedData.issue_date ? format(new Date(extractedData.issue_date), 'PP') : 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Due Date</p>
              <p className="text-white">{extractedData.due_date ? format(new Date(extractedData.due_date), 'PP') : 'N/A'}</p>
            </div>
          </div>

          {extractedData.items && extractedData.items.length > 0 && (
            <div className="rounded-md border border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-white">Description</th>
                    <th className="text-right p-3 text-white">Quantity</th>
                    <th className="text-right p-3 text-white">Unit Price</th>
                    <th className="text-right p-3 text-white">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedData.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="p-3 text-white">{item.description}</td>
                      <td className="p-3 text-right text-white">{item.quantity}</td>
                      <td className="p-3 text-right text-white">
                        {item.unit_price?.toLocaleString('en-US', {
                          style: 'currency',
                          currency: extractedData.currency || 'USD'
                        })}
                      </td>
                      <td className="p-3 text-right text-white">
                        {item.amount?.toLocaleString('en-US', {
                          style: 'currency',
                          currency: extractedData.currency || 'USD'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>
                {extractedData.subtotal?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: extractedData.currency || 'USD'
                })}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tax ({extractedData.tax_rate}%)</span>
              <span>
                {extractedData.tax_amount?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: extractedData.currency || 'USD'
                })}
              </span>
            </div>
            <div className="flex justify-between text-white font-bold">
              <span>Total</span>
              <span>
                {extractedData.total?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: extractedData.currency || 'USD'
                })}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onDataExtracted(extractedData)}>
              Confirm & Create Invoice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}