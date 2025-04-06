
import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Target, DollarSign, CalendarCheck, Star, BarChart3, Building2, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const GOAL_CATEGORIES = [
  { value: "retirement", label: "Retirement", color: "#3b82f6" },
  { value: "education", label: "Education", color: "#8b5cf6" },
  { value: "housing", label: "Housing", color: "#10b981" },
  { value: "travel", label: "Travel", color: "#f59e0b" },
  { value: "emergency", label: "Emergency Fund", color: "#ef4444" },
  { value: "other", label: "Other", color: "#6b7280" }
];

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "ILS", label: "ILS - Israeli Shekel", symbol: "₪" },
  { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" }
];

export default function GoalForm({ goal, investments, onSave, onCancel, defaultCurrency }) {
  const [businesses, setBusinesses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: 0,
    current_amount: 0,
    target_date: '',
    currency: defaultCurrency || 'USD',
    investment_id: '',
    monthly_contribution: 0,
    category: 'other',
    priority: 'medium',
    status: 'active',
    is_business_goal: false,
    business_id: ''
  });

  const [showInvestmentSelect, setShowInvestmentSelect] = useState(false);
  const [tabView, setTabView] = useState('basic');
  const [savingPlan, setSavingPlan] = useState(null);

  useEffect(() => {
    if (goal) {
      setFormData({
        ...goal,
        target_date: goal.target_date ? new Date(goal.target_date).toISOString().split('T')[0] : ''
      });
      setShowInvestmentSelect(!!goal.investment_id);
    }
  }, [goal]);

  useEffect(() => {
    // Calculate saving plan whenever relevant fields change
    calculateSavingPlan();
  }, [formData.target_amount, formData.current_amount, formData.target_date, formData.monthly_contribution]);

  const calculateSavingPlan = () => {
    if (!formData.target_date) return;

    const now = new Date();
    const targetDate = new Date(formData.target_date);
    
    // Check if target date is in the future
    if (targetDate <= now) {
      setSavingPlan(null);
      return;
    }

    // Calculate months between now and target date
    const monthsDiff = (targetDate.getFullYear() - now.getFullYear()) * 12 + 
                        (targetDate.getMonth() - now.getMonth());
    
    // Calculate amount needed to save
    const remainingAmount = formData.target_amount - (formData.current_amount || 0);
    const monthlyNeeded = remainingAmount / monthsDiff;
    
    // Calculate percentage of goal achieved
    const percentComplete = formData.current_amount ? 
      (formData.current_amount / formData.target_amount) * 100 : 0;
    
    // Check if monthly contribution will meet the goal
    const willReachGoal = formData.monthly_contribution >= monthlyNeeded;
    
    // Calculate expected final amount with current contribution
    const expectedAmount = formData.current_amount + (formData.monthly_contribution * monthsDiff);
    const expectedPercentage = (expectedAmount / formData.target_amount) * 100;

    setSavingPlan({
      monthsRemaining: monthsDiff,
      monthlyNeeded,
      percentComplete,
      willReachGoal,
      expectedAmount,
      expectedPercentage,
      shortfall: willReachGoal ? 0 : formData.target_amount - expectedAmount
    });
  };

    useEffect(() => {
        const loadBusinesses = async () => {
            try {
                const { Business } = await import('@/api/entities');
                const businessesData = await Business.list();
                setBusinesses(businessesData);
            } catch (error) {
                console.error('Error loading businesses:', error);
            }
        };
        loadBusinesses();
    }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      investment_id: showInvestmentSelect ? formData.investment_id : null
    });
  };

  // Set color based on category
  useEffect(() => {
    const categoryObj = GOAL_CATEGORIES.find(cat => cat.value === formData.category);
    if (categoryObj) {
      handleChange('color', categoryObj.color);
    }
  }, [formData.category]);

  const getCurrencySymbol = (currencyCode) => {
    const currency = CURRENCIES.find(c => c.value === currencyCode);
    return currency ? currency.symbol : currencyCode;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={tabView} onValueChange={setTabView} className="w-full">
        <TabsList className="w-full bg-gray-800">
          <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
          <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
          {!showInvestmentSelect && <TabsTrigger value="plan" className="flex-1">Saving Plan</TabsTrigger>}
        </TabsList>

        <TabsContent value="basic" className="pt-4 space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Goal Name</Label>
              <Input
                id="name"
                placeholder="e.g., Dream Vacation, Down Payment"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                placeholder="Why is this goal important to you?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white mt-1.5 h-24"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-white">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {GOAL_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="text-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  id="link_investment"
                  checked={showInvestmentSelect}
                  onCheckedChange={setShowInvestmentSelect}
                  className="border-gray-400 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor="link_investment" className="text-white">Link to Investment</Label>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Linking to an investment will track the investment's progress toward this goal
              </p>
              
              {showInvestmentSelect && investments.length > 0 && (
                <Select
                  value={formData.investment_id}
                  onValueChange={(value) => setFormData({ ...formData, investment_id: value })}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Select investment" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {investments.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id} className="text-gray-100">
                        {inv.name} ({inv.current_amount || inv.initial_amount} {inv.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {showInvestmentSelect && investments.length === 0 && (
                <p className="text-yellow-400 text-sm">
                  No investments available. Add an investment first or create a standalone goal.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_amount" className="text-white">Target Amount</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <Input
                    id="target_amount"
                    type="number"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
                    className="bg-gray-900 border-gray-700 text-white pl-8"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="currency" className="text-white">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white mt-1.5">
                    <SelectValue placeholder="Select currency"/>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value} className="text-gray-100">
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!showInvestmentSelect && (
              <div>
                <Label htmlFor="current_amount" className="text-white">Current Amount Saved</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <Input
                    id="current_amount"
                    type="number"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({ ...formData, current_amount: parseFloat(e.target.value) || 0 })}
                    className="bg-gray-900 border-gray-700 text-white pl-8"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="target_date" className="text-white">Target Date</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white mt-1.5"
                required
              />
            </div>
          </div >

                    {/* Business Goal Section with Yes/No Buttons */}
                    <div className="space-y-4 p-4 rounded-lg border border-gray-700">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <Label className="text-white">Business Goal</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-4 h-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Associate this goal with one of your businesses</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">Is this a business-related goal?</p>

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant={formData.is_business_goal ? "default" : "outline"}
                            className={formData.is_business_goal ? "bg-blue-600" : "bg-gray-800 text-white"}
                            onClick={() => setFormData({ ...formData, is_business_goal: true })}
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            variant={!formData.is_business_goal ? "default" : "outline"}
                            className={!formData.is_business_goal ? "bg-blue-600" : "bg-gray-800 text-white"}
                            onClick={() => setFormData({ ...formData, is_business_goal: false, business_id: '' })}
                          >
                            No
                          </Button>
                        </div>

                        {formData.is_business_goal && (
                          <div className="mt-4">
                            <Label className="text-white mb-2 block">Select Business</Label>
                            <Select
                              value={formData.business_id}
                              onValueChange={(value) => setFormData({ ...formData, business_id: value })}
                            >
                              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                                <SelectValue placeholder="Choose a business" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-700">
                                {businesses.map((business) => (
                                  <SelectItem key={business.id} value={business.id} className="text-gray-100">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: business.color || '#4f46e5' }}
                                      />
                                      {business.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
        </TabsContent>

        <TabsContent value="details" className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-white">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange('priority', value)}
            >
              <SelectTrigger id="priority" className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="high" className="text-gray-100">High</SelectItem>
                <SelectItem value="medium" className="text-gray-100">Medium</SelectItem>
                <SelectItem value="low" className="text-gray-100">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-white">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger id="status" className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="active" className="text-gray-100">Active</SelectItem>
                <SelectItem value="on_hold" className="text-gray-100">On Hold</SelectItem>
                <SelectItem value="completed" className="text-gray-100">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!showInvestmentSelect && (
            <div className="space-y-2">
              <Label htmlFor="monthly_contribution" className="text-white">Monthly Contribution</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {getCurrencySymbol(formData.currency)}
                </span>
                <Input
                  id="monthly_contribution"
                  type="number"
                  value={formData.monthly_contribution}
                  onChange={(e) => handleChange('monthly_contribution', parseFloat(e.target.value) || 0)}
                  className="bg-gray-900 border-gray-700 text-white pl-8"
                />
              </div>
            </div>
          )}
        </TabsContent>

        {!showInvestmentSelect && (
          <TabsContent value="plan" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_contribution" className="text-white">Monthly Contribution</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {getCurrencySymbol(formData.currency)}
                </span>
                <Input
                  id="monthly_contribution"
                  type="number"
                  value={formData.monthly_contribution}
                  onChange={(e) => handleChange('monthly_contribution', parseFloat(e.target.value) || 0)}
                  className="bg-gray-900 border-gray-700 text-white pl-8"
                />
              </div>
            </div>

            {savingPlan && (
              <Card className="border-gray-700 bg-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Saving Plan Analysis</CardTitle>
                  <CardDescription>
                    {savingPlan.monthsRemaining} months until target date
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Progress</span>
                      <span className="font-medium text-white">{savingPlan.percentComplete.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(savingPlan.percentComplete, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Recommended Monthly</p>
                      <p className="font-bold text-white">
                        {getCurrencySymbol(formData.currency)}{savingPlan.monthlyNeeded.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Your Plan</p>
                      <p className={`font-bold ${savingPlan.willReachGoal ? 'text-green-400' : 'text-yellow-400'}`}>
                        {getCurrencySymbol(formData.currency)}{formData.monthly_contribution.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {!savingPlan.willReachGoal && (
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-sm text-yellow-400">
                        With your current saving plan, you'll reach approximately {savingPlan.expectedPercentage.toFixed(1)}% 
                        of your goal by the target date.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Shortfall: {getCurrencySymbol(formData.currency)}{savingPlan.shortfall.toFixed(0)}
                      </p>
                    </div>
                  )}

                  {savingPlan.willReachGoal && (
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-sm text-green-400">
                        With your current saving plan, you'll reach your goal by the target date!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {!showInvestmentSelect && (
        <div className="space-y-2">
          <Label htmlFor="monthly_contribution" className="text-white">Monthly Contribution</Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {getCurrencySymbol(formData.currency)}
            </span>
            <Input
              id="monthly_contribution"
              type="number"
              value={formData.monthly_contribution}
              onChange={(e) => setFormData({ ...formData, monthly_contribution: parseFloat(e.target.value) || 0 })}
              className="bg-gray-900 border-gray-700 text-white pl-8"
            />
          </div>
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
          Save Goal
        </Button>
      </div>
    </form>
  );
}
