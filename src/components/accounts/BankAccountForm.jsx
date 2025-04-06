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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export default function BankAccountForm({ account, onSave, onCancel }) {
  const [businesses, setBusinesses] = useState([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  
  const [formData, setFormData] = useState(account || {
    name: "",
    description: "",
    accountNumber: "",
    balance: 0,
    currency: "ILS",
    color: "#3b82f6",
    type: "checking",
    is_active: true,
    account_type: "personal",
    business_use_percentage: 0,
    business_id: "",
    institution: "",
    routingNumber: "",
    notes: ""
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
    const data = {
      ...formData,
      balance: Number(formData.balance),
      business_use_percentage: Number(formData.business_use_percentage)
    };
    onSave(data);
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAccountTypeChange = (type) => {
    setFormData(prev => {
      const newData = { ...prev, account_type: type };
      
      if (type === 'personal') {
        newData.business_id = '';
        newData.business_use_percentage = 0;
      }
      
      return newData;
    });
    setShowBusinessFields(type === 'business' || type === 'mixed');
  };

  const renderFieldWithTooltip = (label, tooltip, field) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-white">{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {field}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderFieldWithTooltip(
        "Account Name",
        "Enter a descriptive name for your bank account",
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
          required
        />
      )}

      {renderFieldWithTooltip(
        "Description",
        "Add any additional notes or details about this account",
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />
      )}

      {renderFieldWithTooltip(
        "Account Number",
        "Your bank account number (this will be encrypted)",
        <Input
          id="accountNumber"
          value={formData.accountNumber}
          onChange={(e) => handleChange('accountNumber', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />
      )}

      {renderFieldWithTooltip(
        "Routing Number",
        "Your bank's routing number (this will be encrypted)",
        <Input
          id="routingNumber"
          value={formData.routingNumber}
          onChange={(e) => handleChange('routingNumber', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
        />
      )}

      {renderFieldWithTooltip(
        "Institution",
        "The name of your bank or financial institution",
        <Input
          id="institution"
          value={formData.institution}
          onChange={(e) => handleChange('institution', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white"
          required
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        {renderFieldWithTooltip(
          "Balance",
          "Current balance in your account",
          <Input
            id="balance"
            type="number"
            value={formData.balance}
            onChange={(e) => handleChange('balance', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {renderFieldWithTooltip(
          "Currency",
          "The currency used for this account",
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
        )}

        {renderFieldWithTooltip(
          "Account Type",
          "The type of bank account",
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
        )}
      </div>

      {renderFieldWithTooltip(
        "Card Color",
        "Choose a color for this account's card",
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
      )}

      {renderFieldWithTooltip(
        "Usage Type",
        "How this account will be used (personal, business, or mixed)",
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
      )}
      
      {/* Business Fields */}
      {showBusinessFields && (
        <div className="space-y-4 p-4 border border-gray-700 rounded-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Business Details</h3>
            {isLoadingBusinesses && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            )}
          </div>
          
          {renderFieldWithTooltip(
            "Business",
            "Select the business associated with this account",
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
          )}
          
          {formData.account_type === 'mixed' && (
            renderFieldWithTooltip(
              "Business Use Percentage",
              "What percentage of this account is used for business activities?",
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
            )
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