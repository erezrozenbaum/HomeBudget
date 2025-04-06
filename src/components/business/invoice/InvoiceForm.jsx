import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";

export default function InvoiceForm({ invoice, businessId, clients = [], projects = [], onSave, onCancel }) {
  const defaultItem = { description: '', quantity: 1, unit_price: 0, amount: 0 };
  
  const [formData, setFormData] = useState({
    business_id: businessId,
    client_id: invoice?.client_id || '',
    project_id: invoice?.project_id || '',
    invoice_number: invoice?.invoice_number || generateInvoiceNumber(),
    issue_date: invoice?.issue_date ? new Date(invoice.issue_date) : new Date(),
    due_date: invoice?.due_date ? new Date(invoice.due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
    currency: invoice?.currency || 'USD',
    items: invoice?.items || [defaultItem],
    subtotal: invoice?.subtotal || 0,
    tax_rate: invoice?.tax_rate || 0,
    tax_amount: invoice?.tax_amount || 0,
    total: invoice?.total || 0,
    status: invoice?.status || 'draft',
    notes: invoice?.notes || '',
    terms: invoice?.terms || '',
    paid_amount: invoice?.paid_amount || 0,
    bank_account_id: invoice?.bank_account_id || ''
  });

  function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  }

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate totals if needed
      if (['items', 'tax_rate'].includes(field)) {
        return recalculateTotals(updated);
      }
      
      return updated;
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    
    // Update the specific field
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Recalculate item amount if quantity or price changed
    if (field === 'quantity' || field === 'unit_price') {
      const item = updatedItems[index];
      updatedItems[index].amount = item.quantity * item.unit_price;
    }
    
    // Update the formData with new items
    setFormData(prev => {
      const updated = { ...prev, items: updatedItems };
      return recalculateTotals(updated);
    });
  };

  const recalculateTotals = (data) => {
    // Calculate subtotal from items
    const subtotal = data.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Calculate tax amount
    const taxAmount = subtotal * (data.tax_rate / 100);
    
    // Calculate total
    const total = subtotal + taxAmount;
    
    return {
      ...data,
      subtotal,
      tax_amount: taxAmount,
      total
    };
  };

  const addItem = () => {
    setFormData(prev => {
      const updated = {
        ...prev,
        items: [...prev.items, defaultItem]
      };
      return recalculateTotals(updated);
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return; // Maintain at least one item
    
    setFormData(prev => {
      const updated = {
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      };
      return recalculateTotals(updated);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client_id">Client</Label>
          <Select 
            value={formData.client_id} 
            onValueChange={(value) => handleChange('client_id', value)}
            required
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {clients.length === 0 ? (
                <SelectItem value={null} disabled>No clients available</SelectItem>
              ) : (
                clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="project_id">Project (Optional)</Label>
          <Select 
            value={formData.project_id} 
            onValueChange={(value) => handleChange('project_id', value)}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value={null}>None</SelectItem>
              {projects.length === 0 ? (
                <SelectItem value={null} disabled>No projects available</SelectItem>
              ) : (
                projects
                  .filter(project => !formData.client_id || project.client_id === formData.client_id)
                  .map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            value={formData.invoice_number}
            onChange={(e) => handleChange('invoice_number', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select 
            value={formData.currency} 
            onValueChange={(value) => handleChange('currency', value)}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="ILS">ILS - Israeli Shekel</SelectItem>
              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="issue_date">Issue Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !formData.issue_date && "text-muted-foreground"
                } bg-gray-900 border-gray-700 text-white`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.issue_date ? (
                  format(formData.issue_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
              <Calendar
                mode="single"
                selected={formData.issue_date}
                onSelect={(date) => handleChange('issue_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label htmlFor="due_date">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !formData.due_date && "text-muted-foreground"
                } bg-gray-900 border-gray-700 text-white`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.due_date ? (
                  format(formData.due_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
              <Calendar
                mode="single"
                selected={formData.due_date}
                onSelect={(date) => handleChange('due_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Invoice Items</h3>
          <Button type="button" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-400 px-2">
            <div className="col-span-6">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1"></div> {/* Actions column */}
          </div>
          
          {/* Items */}
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6">
                <Input
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Item description"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="col-span-1 text-right pr-2 text-white">
                {(item.amount || 0).toFixed(2)}
              </div>
              <div className="col-span-1 text-center">
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-4 space-y-2">
          <div className="flex justify-end items-center text-gray-300">
            <div className="w-1/3 text-right pr-4">Subtotal:</div>
            <div className="w-40 text-right font-medium">
              {formData.currency} {formData.subtotal.toFixed(2)}
            </div>
          </div>
          
          <div className="flex justify-end items-center">
            <div className="w-1/3 text-right pr-4 text-gray-300">
              Tax Rate (%):
            </div>
            <div className="w-40">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.tax_rate}
                onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value))}
                className="bg-gray-900 border-gray-700 text-white text-right"
              />
            </div>
          </div>
          
          <div className="flex justify-end items-center text-gray-300">
            <div className="w-1/3 text-right pr-4">Tax Amount:</div>
            <div className="w-40 text-right font-medium">
              {formData.currency} {formData.tax_amount.toFixed(2)}
            </div>
          </div>
          
          <div className="flex justify-end items-center pt-2 border-t border-gray-700">
            <div className="w-1/3 text-right pr-4 text-lg font-medium text-white">Total:</div>
            <div className="w-40 text-right text-lg font-bold text-white">
              {formData.currency} {formData.total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            rows={3}
            placeholder="Additional notes for the client..."
          />
        </div>
        
        <div>
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            value={formData.terms}
            onChange={(e) => handleChange('terms', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            rows={3}
            placeholder="Payment terms and conditions..."
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}