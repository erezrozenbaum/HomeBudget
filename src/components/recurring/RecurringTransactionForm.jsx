
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const CURRENCIES = ["USD", "EUR", "GBP", "ILS", "JPY"];
const FREQUENCIES = ["daily", "weekly", "bi-weekly", "monthly", "quarterly", "annually"];
const TRANSACTION_TYPES = ["income", "expense"];

export default function RecurringTransactionForm({ 
  transaction, 
  categories, 
  accounts, 
  creditCards,
  onSave, 
  onCancel 
}) {
  const [formData, setFormData] = useState(transaction || {
    name: "",
    type: "expense",
    amount: "",
    currency: "ILS",
    frequency: "monthly",
    start_date: new Date(),
    end_date: "",
    category: "",
    subcategory: "",
    description: "",
    bank_account_id: "",
    credit_card_id: "",
    auto_generate: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (field, date) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleCheckedChange = (field, checked) => {
    setFormData({ ...formData, [field]: checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert amount to number
    const data = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Transaction Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Salary, Rent, Netflix Subscription"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Transaction Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'income' ? 'Income' : 'Expense'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => handleSelectChange("frequency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((freq) => (
                <SelectItem key={freq} value={freq}>
                  {freq === 'bi-weekly' ? 'Bi-Weekly' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
            placeholder="e.g. 1000"
          />
        </div>
        
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleSelectChange("currency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date ? (
                  format(new Date(formData.start_date), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.start_date ? new Date(formData.start_date) : undefined}
                onSelect={(date) => handleDateChange("start_date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label>End Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date ? (
                  format(new Date(formData.end_date), "PPP")
                ) : (
                  <span>No end date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.end_date ? new Date(formData.end_date) : undefined}
                onSelect={(date) => handleDateChange("end_date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>None</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="subcategory">Subcategory (Optional)</Label>
          <Input
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            placeholder="e.g. Groceries, Utilities"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bank_account_id">Bank Account</Label>
          <Select
            value={formData.bank_account_id}
            onValueChange={(value) => handleSelectChange("bank_account_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>None</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="credit_card_id">Credit Card</Label>
          <Select
            value={formData.credit_card_id}
            onValueChange={(value) => handleSelectChange("credit_card_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select card" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>None</SelectItem>
              {creditCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add details about this recurring transaction"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="auto-generate"
          checked={formData.auto_generate}
          onCheckedChange={(checked) => handleCheckedChange("auto_generate", checked)}
        />
        <Label htmlFor="auto-generate">
          Automatically generate transactions based on this recurring schedule
        </Label>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {transaction ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
