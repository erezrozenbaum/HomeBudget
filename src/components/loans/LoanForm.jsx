
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LoanForm({ loan, accounts, onSave, onCancel }) {
  const [businesses, setBusinesses] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState(loan || {
    name: '',
    type: 'personal',
    initial_amount: '',
    current_balance: '',
    interest_rate: '',
    start_date: '',
    end_date: '',
    payment_amount: '',
    payment_frequency: 'monthly',
    linked_account_id: '',
    currency: 'ILS',
    status: 'active',
    description: '',
    is_business_loan: false,
    business_id: '',
    business_purpose: ''
  });

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const { Business } = await import('@/api/entities');
      const businessesData = await Business.list();
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert string values to numbers where appropriate
    const processedData = {
      ...formData,
      initial_amount: parseFloat(formData.initial_amount) || 0,
      current_balance: parseFloat(formData.current_balance) || 0,
      interest_rate: parseFloat(formData.interest_rate) || 0,
      payment_amount: parseFloat(formData.payment_amount) || 0
    };
    onSave(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 bg-gray-800 border border-gray-700">
          <TabsTrigger value="basic" className="data-[state=active]:bg-blue-600">Basic Info</TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-blue-600">Payment</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-blue-600">Details</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Loan Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Home Mortgage, Car Loan"
              className="bg-[#0f172a] border-gray-700 text-white"
              required
            />
          </div>

          {/* Business Loan Section */}
          <div className="bg-[#111827]/70 p-4 rounded-md border border-gray-700 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-300" />
              <Label className="text-white font-medium">Business Loan</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Indicate if this is a business loan</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-gray-300">Is this a business loan?</p>

            <div className="flex gap-3">
              <Button
                type="button"
                className={formData.is_business_loan ? "bg-blue-600 text-white" : "bg-[#0f172a] border-gray-700 text-white"}
                onClick={() => setFormData({ ...formData, is_business_loan: true })}
              >
                Yes
              </Button>
              <Button
                type="button"
                className={!formData.is_business_loan ? "bg-blue-600 text-white" : "bg-[#0f172a] border-gray-700 text-white"}
                onClick={() => setFormData({ ...formData, is_business_loan: false, business_id: '' })}
              >
                No
              </Button>
            </div>

            {formData.is_business_loan && (
              <div className="pt-2 space-y-3">
                <div>
                  <Label className="text-white">Select Business</Label>
                  <Select
                    value={formData.business_id}
                    onValueChange={(value) => setFormData({ ...formData, business_id: value })}
                  >
                    <SelectTrigger className="bg-[#0f172a] border-gray-700 text-white mt-1">
                      <SelectValue placeholder="Choose a business" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f172a] border-gray-700">
                      {businesses.length > 0 ? (
                        businesses.map((business) => (
                          <SelectItem key={business.id} value={business.id} className="text-white">
                            {business.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={null} disabled className="text-gray-400">
                          No businesses available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-white">Purpose</Label>
                  <Input
                    value={formData.business_purpose || ''}
                    onChange={(e) => setFormData({ ...formData, business_purpose: e.target.value })}
                    placeholder="e.g., Equipment, Expansion"
                    className="bg-[#0f172a] border-gray-700 text-white mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Loan Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type" className="bg-[#0f172a] border-gray-700 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-gray-700">
                  <SelectItem value="personal" className="text-white">Personal Loan</SelectItem>
                  <SelectItem value="mortgage" className="text-white">Mortgage</SelectItem>
                  <SelectItem value="car" className="text-white">Car Loan</SelectItem>
                  <SelectItem value="student" className="text-white">Student Loan</SelectItem>
                  <SelectItem value="business" className="text-white">Business Loan</SelectItem>
                  <SelectItem value="other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-white">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency" className="bg-[#0f172a] border-gray-700 text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-gray-700">
                  <SelectItem value="ILS" className="text-white">ILS - Israeli Shekel</SelectItem>
                  <SelectItem value="USD" className="text-white">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR" className="text-white">EUR - Euro</SelectItem>
                  <SelectItem value="GBP" className="text-white">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY" className="text-white">JPY - Japanese Yen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial_amount" className="text-white">Initial Amount</Label>
              <Input
                id="initial_amount"
                type="number"
                value={formData.initial_amount}
                onChange={(e) => setFormData({ ...formData, initial_amount: e.target.value })}
                className="bg-[#0f172a] border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_balance" className="text-white">Current Balance</Label>
              <Input
                id="current_balance"
                type="number"
                value={formData.current_balance}
                onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                className="bg-[#0f172a] border-gray-700 text-white"
              />
            </div>
          </div>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interest_rate" className="text-white">Interest Rate (%)</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                className="bg-[#0f172a] border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_amount" className="text-white">Payment Amount</Label>
              <Input
                id="payment_amount"
                type="number"
                value={formData.payment_amount}
                onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                className="bg-[#0f172a] border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-white">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="bg-[#0f172a] border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-white">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="bg-[#0f172a] border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_frequency" className="text-white">Payment Frequency</Label>
            <Select
              value={formData.payment_frequency}
              onValueChange={(value) => setFormData({ ...formData, payment_frequency: value })}
            >
              <SelectTrigger id="payment_frequency" className="bg-[#0f172a]  border-gray-700 text-white">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-gray-700">
                <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
                <SelectItem value="bi-weekly" className="text-white">Bi-Weekly</SelectItem>
                <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linked_account_id" className="text-white">Bank Account</Label>
            <Select
              value={formData.linked_account_id}
              onValueChange={(value) => setFormData({ ...formData, linked_account_id: value })}
            >
              <SelectTrigger id="linked_account_id" className="bg-[#0f172a] border-gray-700 text-white">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-gray-700">
                <SelectItem value={null} className="text-white">None</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id} className="text-white">
                    {account.name} ({account.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-white">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status" className="bg-[#0f172a] border-gray-700 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-gray-700">
                <SelectItem value="active" className="text-white">Active</SelectItem>
                <SelectItem value="paid_off" className="text-white">Paid Off</SelectItem>
                <SelectItem value="defaulted" className="text-white">Defaulted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this loan"
              className="bg-[#0f172a] border-gray-700 text-white h-24"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="bg-[#0f172a] border-gray-700 text-white hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
          {loan ? 'Save Changes' : 'Create Loan'}
        </Button>
      </div>
    </form>
  );
}
