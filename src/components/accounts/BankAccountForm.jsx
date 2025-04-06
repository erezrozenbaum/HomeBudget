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

export default function BankAccountForm({ account, onSave, onCancel }) {
  const [businesses, setBusinesses] = useState([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  
  const [formData, setFormData] = useState(account || {
    name: "",
    description: "",
    bank_number: "",
    initial_balance: 0,
    current_balance: 0,
    currency: "ILS",
    color: "#3b82f6",
    type: "checking",
    is_active: true,
    account_type: "personal",
    business_use_percentage: 0,
    business_id: ""
  });

  useEffect(() => {
    loadBusinesses();
    
    if (account && (account.account_type === 'business' || account.account_type === 'mixed')) {
      setShowBusinessFields(true);
    }
  }, [account]);

  const [showBusinessFields, setShowBusinessFields] = useState(
    formData.account_type === 'business' || formData.account_type === 'mixed'
  );

  const loadBusinesses = async () => {
    try {
      setIsLoadingBusinesses(true);
      const { Business } = await import('@/api/entities');
      const businessesData = await Business.list();
      setBusinesses(businessesData);
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      initial_balance: Number(formData.initial_balance),
      current_balance: Number(formData.current_balance),
      business_use_percentage: Number(formData.business_use_percentage)
    });
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAccountTypeChange = (type) => {
    setFormData(prev => ({ ...prev, account_type: type }));
    setShowBusinessFields(type === 'business' || type === 'mixed');
    
    if (type === 'personal') {
      setFormData(prev => ({
        ...prev,
        business_id: '',
        business_use_percentage: 0
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white">Account Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-white">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />
      </div>

      <div>
        <Label htmlFor="bank_number" className="text-white">Bank Number</Label>
        <Input
          id="bank_number"
          value={formData.bank_number}
          onChange={(e) => handleChange('bank_number', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="initial_balance" className="text-white">Initial Balance</Label>
          <Input
            id="initial_balance"
            type="number"
            value={formData.initial_balance}
            onChange={(e) => handleChange('initial_balance', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="current_balance" className="text-white">Current Balance</Label>
          <Input
            id="current_balance"
            type="number"
            value={formData.current_balance}
            onChange={(e) => handleChange('current_balance', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleChange('currency', value)}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="USD" className="text-gray-100">USD</SelectItem>
              <SelectItem value="EUR" className="text-gray-100">EUR</SelectItem>
              <SelectItem value="GBP" className="text-gray-100">GBP</SelectItem>
              <SelectItem value="ILS" className="text-gray-100">ILS</SelectItem>
              <SelectItem value="JPY" className="text-gray-100">JPY</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white">Account Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange('type', value)}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="checking" className="text-gray-100">Checking</SelectItem>
              <SelectItem value="savings" className="text-gray-100">Savings</SelectItem>
              <SelectItem value="investment" className="text-gray-100">Investment</SelectItem>
              <SelectItem value="other" className="text-gray-100">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-white">Card Color</Label>
        <div className="grid grid-cols-8 gap-2">
          {[
            '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
            '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'
          ].map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full ${
                formData.color === color ? 'ring-2 ring-offset-2 ring-white' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleChange('color', color)}
            />
          ))}
        </div>
      </div>

      {/* Account Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Account Type</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className={`px-4 py-2 text-sm rounded-md ${
              formData.account_type === 'personal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            onClick={() => handleAccountTypeChange('personal')}
          >
            Personal
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm rounded-md ${
              formData.account_type === 'business'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            onClick={() => handleAccountTypeChange('business')}
          >
            Business
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm rounded-md ${
              formData.account_type === 'mixed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            onClick={() => handleAccountTypeChange('mixed')}
          >
            Mixed
          </button>
        </div>
      </div>
      
      {/* Business Fields */}
      {showBusinessFields && (
        <div className="space-y-4 p-4 border border-gray-700 rounded-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Business Details</h3>
            {isLoadingBusinesses && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Business</label>
            <Select
              value={formData.business_id || ''}
              onValueChange={(value) => handleChange('business_id', value)}
              disabled={isLoadingBusinesses}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select a business" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {businesses.map(business => (
                  <SelectItem key={business.id} value={business.id} className="text-gray-100">
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {formData.account_type === 'mixed' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Business Use Percentage</label>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.business_use_percentage || 0}
                  onChange={(e) => handleChange('business_use_percentage', parseInt(e.target.value, 10))}
                  className="w-20 bg-gray-900 border-gray-700 text-white"
                />
                <span className="ml-2 text-white">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                For tax purposes, what percentage of this account is used for business activities?
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
          {account ? 'Save Changes' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}