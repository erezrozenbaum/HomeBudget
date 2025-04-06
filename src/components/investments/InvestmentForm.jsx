import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { InvokeLLM } from "@/api/integrations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, HelpCircle } from "lucide-react";

const INVESTMENT_TYPES = ["stock", "crypto", "savings", "pension", "real_estate", "other"];
const CURRENCIES = ["USD", "EUR", "GBP", "ILS", "JPY"];
const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", 
  "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"
];

export default function InvestmentForm({ investment, accounts, onSave, onCancel }) {
  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock',
    description: '',
    bank_account_id: '',
    initial_amount: 0,
    current_amount: 0,
    currency: 'USD',
    start_date: '',
    end_date: '',
    recurring_contribution: 0,
    units: 0,
    price_per_unit: 0,
    current_price_per_unit: 0,
    expected_return_rate: 0,
    tax_rate: 0,
    color: '#3b82f6',
    is_business_investment: false,
    business_id: '',
    business_category: ''
  });

  // Load businesses for the dropdown
  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setLoadingBusinesses(true);
      // Using dynamic import to avoid circular dependencies
      const Business = (await import('@/api/entities')).Business;
      const businessesData = await Business.list();
      setBusinesses(businessesData);
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  useEffect(() => {
    if (investment) {
      setFormData({
        name: investment.name || '',
        type: investment.type || 'stock',
        description: investment.description || '',
        bank_account_id: investment.bank_account_id || '',
        initial_amount: investment.initial_amount || 0,
        current_amount: investment.current_amount || 0,
        currency: investment.currency || 'USD',
        start_date: investment.start_date ? new Date(investment.start_date).toISOString().split('T')[0] : '',
        end_date: investment.end_date ? new Date(investment.end_date).toISOString().split('T')[0] : '',
        recurring_contribution: investment.recurring_contribution || 0,
        units: investment.units || 0,
        price_per_unit: investment.price_per_unit || 0,
        current_price_per_unit: investment.current_price_per_unit || 0,
        expected_return_rate: investment.expected_return_rate || 0,
        tax_rate: investment.tax_rate || 0,
        color: investment.color || '#3b82f6',
        is_business_investment: investment.is_business_investment || false,
        business_id: investment.business_id || '',
        business_category: investment.business_category || ''
      });
    }
  }, [investment]);

  const fetchCurrentPrice = async (type, name, currency) => {
    if (type !== 'crypto' || !name) return null;
    
    try {
      // Try to get crypto symbol from investment name
      const nameMatch = name.match(/(\w+)(?:\s*-\s*(\w+))?/);
      const cryptoSymbol = nameMatch?.[2] || nameMatch?.[1] || '';
      
      if (!cryptoSymbol) return null;
      
      try {
        const result = await InvokeLLM({
          prompt: `What is the current price of ${cryptoSymbol} cryptocurrency in ${currency || 'USD'}? Please return only the numeric value.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              price: { type: "number" }
            }
          }
        });
        
        if (result && typeof result.price === 'number') {
          return result.price;
        }
      } catch (error) {
        console.error("Error fetching crypto price:", error);
        return null;
      }
    } catch (e) {
      console.error("Error in fetchCurrentPrice:", e);
      return null;
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create a copy of the form data for processing
      const data = { ...formData };
      
      // For crypto investments, try to fetch current price
      if (data.type === 'crypto' && data.units) {
        const price = await fetchCurrentPrice(data.type, data.name, data.currency);
        
        if (price) {
          data.current_price_per_unit = price;
          data.current_amount = price * data.units;
        }
      }
      
      // Calculate current amount if not already set
      if (!data.current_amount && data.current_price_per_unit && data.units) {
        data.current_amount = data.current_price_per_unit * data.units;
      }
      
      // If not a business investment, reset business fields
      if (!data.is_business_investment) {
        data.business_id = '';
        data.business_category = '';
      }
      
      onSave(data);
    } catch (error) {
      console.error("Error submitting investment:", error);
      // Still save the basic form data without the calculated fields
      onSave(formData);
    }
  };

  // Find selected business color
  const selectedBusinessColor = formData.business_id ? 
    businesses.find(b => b.id === formData.business_id)?.color : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="name" className="text-white">Investment Name</Label>
          <Tooltip content="Enter a descriptive name for your investment">
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </div>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>

      {/* Business Investment Section with Yes/No Buttons */}
      <div className="space-y-4 p-4 border border-gray-700 rounded-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <Label className="text-white">Business Investment</Label>
            <Tooltip content="Associate this investment with one of your businesses">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <p className="text-sm text-gray-400 mb-3">Is this a business investment?</p>
          
          <div className="flex gap-3">
            <Button 
              type="button"
              variant={formData.is_business_investment ? "default" : "outline"}
              className={formData.is_business_investment ? "bg-blue-600" : "bg-gray-800 text-white"}
              onClick={() => setFormData({ ...formData, is_business_investment: true })}
            >
              Yes
            </Button>
            <Button 
              type="button"
              variant={!formData.is_business_investment ? "default" : "outline"}
              className={!formData.is_business_investment ? "bg-blue-600" : "bg-gray-800 text-white"}
              onClick={() => setFormData({ ...formData, is_business_investment: false, business_id: '', business_category: '' })}
            >
              No
            </Button>
          </div>
          
          {formData.is_business_investment && (
            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-white mb-2 block">Select Business</Label>
                <Select
                  value={formData.business_id}
                  onValueChange={(value) => setFormData({ ...formData, business_id: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id} className="text-gray-200">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: business.color || '#3b82f6' }}
                          />
                          {business.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="business_category" className="text-white mb-2 block">Business Category</Label>
                <Input
                  id="business_category"
                  value={formData.business_category}
                  onChange={(e) => setFormData({ ...formData, business_category: e.target.value })}
                  placeholder="e.g., Equipment, Marketing, R&D"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Type and Currency Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-white">Type</Label>
            <Tooltip content="Select the type of investment">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {INVESTMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type} className="text-gray-200">
                  {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-white">Currency</Label>
            <Tooltip content="Select the currency for this investment">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency} className="text-gray-200">
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-white">Linked Bank Account</Label>
          <Tooltip content="Link to a bank account">
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </div>
        <Select
          value={formData.bank_account_id}
          onValueChange={(value) => setFormData({ ...formData, bank_account_id: value })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value={null} className="text-gray-200">None</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id} className="text-gray-200">
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="initial_amount" className="text-white">Initial Amount</Label>
            <Tooltip content="The amount initially invested">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Input
            id="initial_amount"
            type="number"
            value={formData.initial_amount}
            onChange={(e) => setFormData({ ...formData, initial_amount: parseFloat(e.target.value) })}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="current_amount" className="text-white">Current Amount</Label>
            <Tooltip content="The current value of the investment">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Input
            id="current_amount"
            type="number"
            value={formData.current_amount}
            onChange={(e) => setFormData({ ...formData, current_amount: parseFloat(e.target.value) })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="start_date" className="text-white">Start Date</Label>
            <Tooltip content="The date the investment started">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="end_date" className="text-white">End Date</Label>
            <Tooltip content="The date the investment is expected to end">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="recurring_contribution" className="text-white">Monthly Contribution</Label>
            <Tooltip content="The amount contributed to the investment each month">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Input
            id="recurring_contribution"
            type="number"
            value={formData.recurring_contribution}
            onChange={(e) => setFormData({ ...formData, recurring_contribution: parseFloat(e.target.value) })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="units" className="text-white">Number of Units</Label>
            <Tooltip content="The number of units or shares in the investment">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Input
            id="units"
            type="number"
            value={formData.units}
            onChange={(e) => setFormData({ ...formData, units: parseFloat(e.target.value) })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="price_per_unit" className="text-white">Initial Price per Unit</Label>
            <Tooltip content="The initial price per unit or share">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Input
            id="price_per_unit"
            type="number"
            value={formData.price_per_unit}
            onChange={(e) => setFormData({ ...formData, price_per_unit: parseFloat(e.target.value) })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="current_price_per_unit" className="text-white">Current Price per Unit</Label>
            <Tooltip content="The current price per unit or share">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Input
            id="current_price_per_unit"
            type="number"
            value={formData.current_price_per_unit}
            onChange={(e) => setFormData({ ...formData, current_price_per_unit: parseFloat(e.target.value) })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="expected_return_rate" className="text-white">Expected Return Rate (%)</Label>
            <Tooltip content="The expected annual return rate in percentage">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Input
            id="expected_return_rate"
            type="number"
            value={formData.expected_return_rate}
            onChange={(e) => setFormData({ ...formData, expected_return_rate: parseFloat(e.target.value) })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="tax_rate" className="text-white">Tax Rate (%)</Label>
            <Tooltip content="The applicable tax rate on the investment gains">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <Input
            id="tax_rate"
            type="number"
            value={formData.tax_rate}
            onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-white">Color</Label>
          <Tooltip content="Choose a color to represent this investment visually">
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </div>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full ${
                formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color: color })}
            />
          ))}
          {/* If a business is selected, show its color as an option */}
          {selectedBusinessColor && !COLORS.includes(selectedBusinessColor) && (
            <button
              type="button"
              className={`w-8 h-8 rounded-full ${
                formData.color === selectedBusinessColor ? 'ring-2 ring-offset-2 ring-blue-500' : ''
              }`}
              style={{ backgroundColor: selectedBusinessColor }}
              onClick={() => setFormData({ ...formData, color: selectedBusinessColor })}
              title="Use business color"
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="description" className="text-white">Description</Label>
          <Tooltip content="A description of the investment">
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </div>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Investment
        </Button>
      </div>
    </form>
  );
}