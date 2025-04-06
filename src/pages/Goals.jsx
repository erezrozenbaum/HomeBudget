
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Search, Filter, X } from "lucide-react";
import { Goal, Investment, UserSettings } from '@/api/entities';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GoalForm from '../components/goals/GoalForm';
import GoalCard from '../components/goals/GoalCard';
import { InvokeLLM } from '@/api/integrations';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: ''
  });
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load user settings first to get default currency
      const settingsData = await UserSettings.list();
      const settings = settingsData.length > 0 ? settingsData[0] : null;
      const currency = settings?.default_currency || 'USD';
      
      // Get exchange rates from settings or fetch them
      let rates = settings?.exchange_rates || {};
      
      // If no rates in settings, fetch them
      if (!Object.keys(rates).length) {
        rates = await fetchExchangeRates(['USD', 'EUR', 'GBP', 'ILS', 'JPY'], currency);
      }

      setDefaultCurrency(currency);
      setExchangeRates({ ...rates, [currency]: 1 });

      // Load goals and investments
      const [goalsData, investmentsData] = await Promise.all([
        Goal.list(),
        Investment.list()
      ]);
      
      setGoals(goalsData);
      setInvestments(investmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const fetchExchangeRates = async (currencies, baseCurrency) => {
    try {
      const prompt = `Get the current exchange rates for these currencies relative to ${baseCurrency}: ${currencies.join(', ')}. Return only the rates as a JSON object where keys are currency codes and values are the exchange rates.`;
      
      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: currencies.reduce((acc, curr) => ({
            ...acc,
            [curr]: { type: "number" }
          }), {})
        }
      });

      return response;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Return 1:1 rates as fallback
      return currencies.reduce((acc, curr) => ({
        ...acc,
        [curr]: 1
      }), {});
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleSave = async (goalData) => {
    try {
      // If linked to investment, also update the investment
      if (goalData.investment_id) {
        const investment = investments.find(i => i.id === goalData.investment_id);
        
        if (investment) {
          // Update the investment with goal target data
          await Investment.update(investment.id, {
            ...investment,
            target_amount: goalData.target_amount,
            target_date: goalData.target_date
          });
        }
      }
      
      // Save or update the goal
      if (editingGoal) {
        await Goal.update(editingGoal.id, goalData);
      } else {
        await Goal.create(goalData);
      }
      
      setIsFormOpen(false);
      setEditingGoal(null);
      loadData();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDelete = async (goalId) => {
    try {
      await Goal.delete(goalId);
      loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (filters.category !== 'all' && goal.category !== filters.category) return false;
    if (filters.status !== 'all' && goal.status !== filters.status) return false;
    if (filters.search && !goal.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Convert amount to default currency for display
  const convertToDefaultCurrency = (amount, fromCurrency) => {
    if (!amount || fromCurrency === defaultCurrency) return amount;
    
    const rate = exchangeRates[fromCurrency] || 1;
    return parseFloat((amount / rate).toFixed(2));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Goals</h1>
          <p className="text-gray-400">Track and plan your financial goals</p>
        </div>
        
        <Button 
          onClick={() => {
            setEditingGoal(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search goals..."
                  className="pl-9 bg-gray-900 border-gray-700 text-white"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters({...filters, category: value})}
              >
                <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-gray-100">All Categories</SelectItem>
                  <SelectItem value="retirement" className="text-gray-100">Retirement</SelectItem>
                  <SelectItem value="education" className="text-gray-100">Education</SelectItem>
                  <SelectItem value="housing" className="text-gray-100">Housing</SelectItem>
                  <SelectItem value="travel" className="text-gray-100">Travel</SelectItem>
                  <SelectItem value="emergency" className="text-gray-100">Emergency Fund</SelectItem>
                  <SelectItem value="other" className="text-gray-100">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-gray-100">All Statuses</SelectItem>
                  <SelectItem value="active" className="text-gray-100">Active</SelectItem>
                  <SelectItem value="on_hold" className="text-gray-100">On Hold</SelectItem>
                  <SelectItem value="completed" className="text-gray-100">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setIsFormOpen(false);
              setEditingGoal(null);
            }}
          />
          <div className="relative bg-gray-900 rounded-lg shadow-lg w-full max-w-md md:max-w-lg overflow-auto p-6 z-50">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
              onClick={() => {
                setIsFormOpen(false);
                setEditingGoal(null);
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">
                {editingGoal ? 'Edit Financial Goal' : 'New Financial Goal'}
              </h2>
            </div>
            <GoalForm
              goal={editingGoal}
              investments={investments}
              defaultCurrency={defaultCurrency}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingGoal(null);
              }}
            />
          </div>
        </div>
      )}

      {filteredGoals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              linkedInvestment={goal.investment_id ? investments.find(i => i.id === goal.investment_id) : null}
              defaultCurrency={defaultCurrency}
              convertAmount={convertToDefaultCurrency}
              onEdit={() => handleEdit(goal)}
              onDelete={() => handleDelete(goal.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400">
              {filters.category !== 'all' || filters.status !== 'all' || filters.search 
                ? "No goals match your filters. Try adjusting your search criteria."
                : "No financial goals yet. Click \"Add Goal\" to create one."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
