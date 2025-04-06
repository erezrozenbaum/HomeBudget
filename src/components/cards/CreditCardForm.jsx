import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";

export default function CreditCardForm({ card, accounts, onSave, onCancel }) {
  const [businesses, setBusinesses] = useState([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  
  const [formData, setFormData] = useState(card || {
    name: "",
    description: "",
    bank_account_id: "",
    spending_limit: "",
    last_four_digits: "",
    expiration_date: "",
    billing_day: 1,
    is_active: true,
    color: "#ef4444",
    account_type: "personal",
    business_use_percentage: 0,
    business_id: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Card Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full bg-[#0f172a] border-gray-700 text-white"
        required
      />

      <Textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full bg-[#0f172a] border-gray-700 text-white"
      />

      <Select
        value={formData.bank_account_id}
        onValueChange={(value) => setFormData({ ...formData, bank_account_id: value })}
      >
        <SelectTrigger className="w-full bg-[#0f172a] border-gray-700 text-white">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent className="bg-[#0f172a] border-gray-700">
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id} className="text-gray-100">
              {account.name} ({account.currency})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          placeholder="Monthly Limit"
          value={formData.spending_limit}
          onChange={(e) => setFormData({ ...formData, spending_limit: e.target.value })}
          className="bg-[#0f172a] border-gray-700 text-white"
        />

        <Input
          type="number"
          placeholder="Billing Day"
          min="1"
          max="31"
          value={formData.billing_day}
          onChange={(e) => setFormData({ ...formData, billing_day: e.target.value })}
          className="bg-[#0f172a] border-gray-700 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Last 4 Digits"
          maxLength="4"
          pattern="[0-9]{4}"
          value={formData.last_four_digits}
          onChange={(e) => setFormData({ ...formData, last_four_digits: e.target.value })}
          className="bg-[#0f172a] border-gray-700 text-white"
          required
        />

        <Input
          type="date"
          value={formData.expiration_date}
          onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
          className="bg-[#0f172a] border-gray-700 text-white"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          className={`${
            formData.account_type === 'personal'
              ? 'bg-blue-600 text-white'
              : 'bg-[#1e293b] text-gray-200 hover:bg-gray-600'
          }`}
          onClick={() => setFormData({ ...formData, account_type: 'personal' })}
        >
          Personal
        </Button>
        <Button
          type="button"
          className={`${
            formData.account_type === 'business'
              ? 'bg-blue-600 text-white'
              : 'bg-[#1e293b] text-gray-200 hover:bg-gray-600'
          }`}
          onClick={() => setFormData({ ...formData, account_type: 'business' })}
        >
          Business
        </Button>
        <Button
          type="button"
          className={`${
            formData.account_type === 'mixed'
              ? 'bg-blue-600 text-white'
              : 'bg-[#1e293b] text-gray-200 hover:bg-gray-600'
          }`}
          onClick={() => setFormData({ ...formData, account_type: 'mixed' })}
        >
          Mixed
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button"
          onClick={onCancel}
          className="bg-[#0f172a] text-white hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
          {card ? 'Save Changes' : 'Create Card'}
        </Button>
      </div>
    </form>
  );
}