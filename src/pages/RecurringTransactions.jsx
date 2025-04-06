import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, BarChart3, Repeat, X, RefreshCw } from "lucide-react";
import { RecurringTransaction } from '@/api/entities';
import { Category } from '@/api/entities';
import { BankAccount } from '@/api/entities';
import { CreditCard } from '@/api/entities';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend } from 'recharts';
import RecurringTransactionForm from '../components/recurring/RecurringTransactionForm';
import RecurringTransactionCard from '../components/recurring/RecurringTransactionCard';
import RecurringCalendarView from '../components/recurring/RecurringCalendarView';
import { UserSettings } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function RecurringTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSettings, setUserSettings] = useState({ default_currency: 'ILS' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use Promise.allSettled instead of Promise.all to handle partial failures
      const results = await Promise.allSettled([
        Transaction.list('-date'),
        Category.list(),
        BankAccount.list(),
        CreditCard.list(),
        UserSettings.list()
      ]);
      
      // Process results and extract data or errors
      const [
        transactionsResult,
        categoriesResult, 
        accountsResult, 
        cardsResult, 
        settingsResult
      ] = results;
      
      // Handle each result individually
      if (transactionsResult.status === 'fulfilled') {
        const transactionsData = transactionsResult.value || [];
        setTransactions(transactionsData);
        
        // Process recurring transactions
        const recurringData = transactionsData.filter(t => t.is_recurring);
        
        // Group by recurring_group_id to find unique recurring transaction patterns
        const recurringGroups = {};
        
        recurringData.forEach(t => {
          if (t.recurring_group_id) {
            if (!recurringGroups[t.recurring_group_id]) {
              recurringGroups[t.recurring_group_id] = [];
            }
            recurringGroups[t.recurring_group_id].push(t);
          } else {
            // For backward compatibility, create a group for standalone recurring transactions
            recurringGroups[t.id] = [t];
          }
        });
        
        // Convert to RecurringTransaction format
        const processedRecurringTransactions = Object.values(recurringGroups).map(group => {
          // Use most recent transaction in group as the template
          const latestTransaction = group.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          )[0];
          
          return {
            id: latestTransaction.recurring_group_id || latestTransaction.id,
            name: latestTransaction.description || latestTransaction.category,
            type: latestTransaction.type,
            amount: latestTransaction.amount,
            currency: latestTransaction.currency,
            frequency: latestTransaction.recurring_frequency || "monthly",
            start_date: latestTransaction.date,
            end_date: latestTransaction.recurring_end_date,
            category: latestTransaction.category,
            subcategory: latestTransaction.subcategory,
            bank_account_id: latestTransaction.bank_account_id,
            credit_card_id: latestTransaction.credit_card_id,
            transactions: group
          };
        });
        
        setRecurringTransactions(processedRecurringTransactions);
      } else {
        console.error('Failed to load transactions:', transactionsResult.reason);
        setError('Failed to load transactions. Please try again later.');
      }
      
      // Set other data if available
      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value || []);
      }
      
      if (accountsResult.status === 'fulfilled') {
        setAccounts(accountsResult.value || []);
      }
      
      if (cardsResult.status === 'fulfilled') {
        setCreditCards(cardsResult.value || []);
      }
      
      // Get user settings for default currency
      if (settingsResult.status === 'fulfilled' && settingsResult.value.length > 0) {
        setUserSettings(settingsResult.value[0]);
      }
    } catch (error) {
      console.error('Error loading recurring transactions data:', error);
      setError('Error loading data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewRecurring = () => {
    // This will open the transaction form, not the recurring transaction form
    // We'll navigate to the Transactions page with a special parameter
    window.location.href = createPageUrl('Transactions?addRecurring=true');
  };

  const handleDelete = async (transactionId) => {
    try {
      // Delete all transactions with the same recurring_group_id or id
      const transactionsToDelete = transactions.filter(t => t.recurring_group_id === transactionId || t.id === transactionId);
      
      if (transactionsToDelete.length > 0) {
        // Use serial deletion to avoid rate limiting
        for (const t of transactionsToDelete) {
          await Transaction.delete(t.id);
          // Add a small delay between operations to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Refresh data after successful deletion
        loadData();
      }
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      setError('Failed to delete transaction. Please try again later.');
    }
  };

  const filteredTransactions = filter === 'all' 
    ? recurringTransactions 
    : recurringTransactions.filter(t => t.type === filter);

  const calculateTotalMonthly = (type) => {
    return recurringTransactions
      .filter(t => t.type === type)
      .reduce((total, transaction) => {
        // Adjust amount based on frequency
        let monthlyAmount = transaction.amount || 0;
        
        if (transaction.frequency === 'custom') {
          // Custom recurring logic
          if (transaction.recurring_unit === 'day') {
            monthlyAmount = (monthlyAmount / transaction.recurring_interval) * 30;
          } else if (transaction.recurring_unit === 'week') {
            monthlyAmount = (monthlyAmount / transaction.recurring_interval) * 4.33;
          } else if (transaction.recurring_unit === 'month') {
            monthlyAmount = monthlyAmount / transaction.recurring_interval;
          } else if (transaction.recurring_unit === 'year') {
            monthlyAmount = monthlyAmount / (transaction.recurring_interval * 12);
          }
        } else {
          // Standard recurring options
          switch (transaction.frequency) {
            case 'daily':
              monthlyAmount *= 30;
              break;
            case 'weekly':
              monthlyAmount *= 4.33;
              break;
            case 'bi-weekly':
              monthlyAmount *= 2.17;
              break;
            case 'quarterly':
              monthlyAmount /= 3;
              break;
            case 'annually':
              monthlyAmount /= 12;
              break;
            // Monthly is default, no adjustment needed
          }
        }
        
        return total + monthlyAmount;
      }, 0);
  };

  const calculateMonthlyIncome = () => calculateTotalMonthly('income');
  const calculateMonthlyExpenses = () => calculateTotalMonthly('expense');
  const calculateNetMonthly = () => calculateMonthlyIncome() - calculateMonthlyExpenses();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userSettings.default_currency || 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Error and loading UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="text-red-500 dark:text-red-400 text-lg">{error}</div>
        <Button onClick={loadData} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Recurring Transactions</h1>
          <p className="text-gray-400">Smart tracking of your recurring income and expenses</p>
        </div>
        
        <Button onClick={handleAddNewRecurring}>
          <Plus className="w-4 h-4 mr-2" />
          Add Recurring Transaction
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading recurring transactions...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border border-gray-800 bg-gray-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-white">Monthly Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {formatCurrency(calculateMonthlyIncome())}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-800 bg-gray-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-white">Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">
                  {formatCurrency(calculateMonthlyExpenses())}
                </div>
              </CardContent>
            </Card>
            
            <Card className={`border ${calculateNetMonthly() >= 0 ? 
              "bg-green-900/30 border-green-600" : 
              "bg-red-900/30 border-red-600"}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-white">Net Monthly</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${
                  calculateNetMonthly() >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(calculateNetMonthly())}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">
                <Repeat className="w-4 h-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="projection">
                <BarChart3 className="w-4 h-4 mr-2" />
                Cash Flow Projection
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center justify-end mt-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant={filter === 'all' ? 'default' : 'outline'} 
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button 
                  variant={filter === 'income' ? 'default' : 'outline'} 
                  onClick={() => setFilter('income')}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Income
                </Button>
                <Button 
                  variant={filter === 'expense' ? 'default' : 'outline'} 
                  onClick={() => setFilter('expense')}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Expenses
                </Button>
              </div>
            </div>
            
            <TabsContent value="list" className="pt-4">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredTransactions.map((transaction) => (
                  <RecurringTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    category={categories.find(c => c.id === transaction.category)}
                    account={accounts.find(a => a.id === transaction.bank_account_id)}
                    creditCard={creditCards.find(c => c.id === transaction.credit_card_id)}
                    onEdit={() => {
                      window.location.href = createPageUrl(`Transactions?editRecurring=${transaction.id}`);
                    }}
                    onDelete={() => handleDelete(transaction.id)}
                  />
                ))}
                
                {filteredTransactions.length === 0 && (
                  <Card className="col-span-full border border-gray-800 bg-gray-900">
                    <CardContent className="p-6 text-center">
                      <Repeat className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        {filter === 'all' 
                          ? 'No recurring transactions yet. Click "Add Recurring Transaction" to get started.' 
                          : `No recurring ${filter === 'income' ? 'income' : 'expenses'} yet.`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="calendar" className="pt-4">
              <RecurringCalendarView 
                transactions={recurringTransactions}
                categories={categories}
                accounts={accounts}
                creditCards={creditCards}
              />
            </TabsContent>
            
            <TabsContent value="projection" className="pt-4">
              <Card className="border border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">6-Month Cash Flow Projection</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {recurringTransactions.length > 0 ? (
                    <CashFlowProjection 
                      transactions={recurringTransactions}
                      userSettings={userSettings}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Add recurring transactions to see cash flow projections</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// Cash Flow Projection Component
function CashFlowProjection({ transactions, userSettings }) {
  const [projectionData, setProjectionData] = useState([]);
  
  useEffect(() => {
    generateProjection();
  }, [transactions, userSettings]);
  
  const generateProjection = () => {
    const months = 6;
    const now = new Date();
    const data = [];
    
    // Get month names for the next 6 months
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      data.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        income: 0,
        expenses: 0,
        net: 0
      });
    }
    
    // Calculate monthly income and expenses for each transaction
    transactions.forEach(transaction => {
      const amount = transaction.amount || 0;
      const monthlyAmount = getMonthlyAmount(amount, transaction.frequency);
      
      // Add to each month's data
      for (let i = 0; i < months; i++) {
        if (transaction.type === 'income') {
          data[i].income += monthlyAmount;
        } else {
          data[i].expenses += monthlyAmount;
        }
        data[i].net = data[i].income - data[i].expenses;
      }
    });
    
    setProjectionData(data);
  };
  
  // Convert different frequencies to monthly amounts
  const getMonthlyAmount = (amount, frequency) => {
    switch (frequency) {
      case 'daily':
        return amount * 30;
      case 'weekly':
        return amount * 4.33;
      case 'bi-weekly':
        return amount * 2.17;
      case 'quarterly':
        return amount / 3;
      case 'annually':
        return amount / 12;
      default: // monthly
        return amount;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userSettings.default_currency || 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={projectionData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="month" 
            tickFormatter={(value, index) => `${value} ${projectionData[index]?.year}`}
            stroke="rgba(255,255,255,0.5)"
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            stroke="rgba(255,255,255,0.5)"
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(value), '']}
            labelFormatter={(label, data) => `${label} ${data[0]?.payload?.year}`}
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: 'white' }}
          />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#22c55e" />
          <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
          <Bar dataKey="net" name="Net Cash Flow" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}