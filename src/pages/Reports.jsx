
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subMonths, startOfYear, endOfMonth, startOfMonth } from "date-fns";
import { 
  BarChart3, 
  PieChart, 
  LineChart as LineChartIcon,
  Download, 
  Filter,
  Save,
  Building2,
  Wallet,
  CreditCard,
  Calendar as CalendarIcon,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { Transaction, UserSettings, BankAccount, Business } from '@/api/entities';
import { DatePickerWithRange } from '../components/dashboard/DatePickerWithRange';
import CustomTooltip from '../components/CustomTooltip';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  // State management
  const [loading, setLoading] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [settings, setSettings] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  
  const [reportType, setReportType] = useState('overview');
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [currentView, setCurrentView] = useState('all'); // 'all', 'personal', 'business'

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    if (accounts.length > 0) {
      loadTransactions();
    }
  }, [selectedAccounts, dateRange, selectedBusiness, currentView]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load accounts and businesses in parallel
      const [accountsData, businessesData, settingsData] = await Promise.all([
        BankAccount.list(),
        Business.list(),
        UserSettings.list()
      ]);

      setAccounts(accountsData);
      setBusinesses(businessesData);
      setSettings(settingsData[0] || { default_currency: 'ILS' });
      
      // Set default selected accounts (all)
      setSelectedAccounts(accountsData.map(acc => acc.id));
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      const filters = {
        date: {
          $gte: format(dateRange.from, 'yyyy-MM-dd'),
          $lte: format(dateRange.to, 'yyyy-MM-dd')
        }
      };

      if (selectedAccounts.length > 0) {
        filters.bank_account_id = { $in: selectedAccounts };
      }

      // Apply business filters
      if (currentView === 'business') {
        filters.is_business = true;
        if (selectedBusiness) {
          filters.business_id = selectedBusiness.id;
        }
      } else if (currentView === 'personal') {
        filters.is_business = false;
      }

      const transactionsData = await Transaction.filter(filters);
      setTransactions(transactionsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setLoading(false);
    }
  };

  // Data processing for charts
  const getCategorySummary = () => {
    const expensesByCategory = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Uncategorized';
        if (!expensesByCategory[category]) {
          expensesByCategory[category] = 0;
        }
        expensesByCategory[category] += Number(t.amount);
      });
    
    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getMonthlyData = () => {
    const monthlyData = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const month = format(date, 'MMM yyyy');
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          income: 0,
          expenses: 0
        };
      }
      
      if (t.type === 'income') {
        monthlyData[month].income += Number(t.amount);
      } else {
        monthlyData[month].expenses += Number(t.amount);
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      return new Date(a.month) - new Date(b.month);
    });
  };

  const getTotalSummary = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    };
  };

  const getCurrencySymbol = (currency) => {
    switch(currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'ILS': return '₪';
      case 'JPY': return '¥';
      default: return currency;
    }
  };

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const defaultCurrency = settings?.default_currency || 'ILS';
      const currencySymbol = getCurrencySymbol(defaultCurrency);
      
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
          <p className="font-medium text-white">{payload[0].name}</p>
          <p className="text-white">{currencySymbol}{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const categorySummary = getCategorySummary();
  const monthlyData = getMonthlyData();
  const summary = getTotalSummary();
  const defaultCurrency = settings?.default_currency || 'ILS';
  const currencySymbol = getCurrencySymbol(defaultCurrency);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Reports</h1>
          <p className="text-gray-400">Analyze your financial data and trends</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-gray-800 border-gray-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* View Selector */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">View</label>
              <div className="flex gap-2">
                <Button
                  variant={currentView === 'all' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('all')}
                >
                  All Transactions
                </Button>
                <Button
                  variant={currentView === 'personal' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('personal')}
                >
                  Personal Only
                </Button>
                <Button
                  variant={currentView === 'business' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('business')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Business Only
                </Button>
              </div>
            </div>

            {/* Business Selection (only shown when business view is selected) */}
            {currentView === 'business' && businesses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Business</label>
                <Select
                  value={selectedBusiness?.id || ''}
                  onValueChange={(value) => {
                    const business = businesses.find(b => b.id === value);
                    setSelectedBusiness(business || null);
                  }}
                >
                  <SelectTrigger className="w-full bg-gray-900 border-gray-700">
                    <SelectValue placeholder="All Businesses" className="text-white"/>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value={null} className="text-white">All Businesses</SelectItem>
                    {businesses.map(business => (
                      <SelectItem key={business.id} value={business.id} className="text-white">
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Account Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Accounts</label>
              <Select 
                value={selectedAccounts.length === accounts.length ? "all" : 
                       selectedAccounts.length === 1 ? selectedAccounts[0] : "multiple"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedAccounts(accounts.map(acc => acc.id));
                  } else {
                    setSelectedAccounts([value]);
                  }
                }}
              >
                <SelectTrigger className="w-[300px] bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Select Accounts" className="text-white">
                    {selectedAccounts.length === accounts.length 
                      ? "All Accounts" 
                      : selectedAccounts.length === 0 
                        ? "Select Accounts"
                        : selectedAccounts.length === 1
                          ? accounts.find(acc => acc.id === selectedAccounts[0])?.name
                          : `${selectedAccounts.length} accounts selected`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id} className="text-white hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: account.color || '#4b5563' }}
                        />
                        {account.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Date Range</label>
              <div className="flex gap-2">
                <Select 
                  defaultValue="last30days"
                  onValueChange={(value) => {
                    const today = new Date();
                    switch (value) {
                      case "today":
                        setDateRange({ from: today, to: today });
                        break;
                      case "yesterday":
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        setDateRange({ from: yesterday, to: yesterday });
                        break;
                      case "last7days":
                        const last7days = new Date(today);
                        last7days.setDate(last7days.getDate() - 7);
                        setDateRange({ from: last7days, to: today });
                        break;
                      case "last30days":
                        const last30days = new Date(today);
                        last30days.setDate(last30days.getDate() - 30);
                        setDateRange({ from: last30days, to: today });
                        break;
                      case "thisMonth":
                        setDateRange({
                          from: new Date(today.getFullYear(), today.getMonth(), 1),
                          to: today
                        });
                        break;
                      case "lastMonth":
                        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                        setDateRange({ from: firstDayLastMonth, to: lastDayLastMonth });
                        break;
                    }
                  }}
                  className="w-[200px]"
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Select range" className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="today" className="text-white">Today</SelectItem>
                    <SelectItem value="yesterday" className="text-white">Yesterday</SelectItem>
                    <SelectItem value="last7days" className="text-white">Last 7 days</SelectItem>
                    <SelectItem value="last30days" className="text-white">Last 30 days</SelectItem>
                    <SelectItem value="thisMonth" className="text-white">This Month</SelectItem>
                    <SelectItem value="lastMonth" className="text-white">Last Month</SelectItem>
                    <SelectItem value="custom" className="text-white">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[300px] justify-start bg-gray-900 border-gray-700 text-white">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-400">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{currencySymbol}{summary.income.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-400">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{currencySymbol}{summary.expenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-400">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              {currencySymbol}{summary.balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expense by Category */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {categorySummary.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={categorySummary}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categorySummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={renderCustomTooltip} />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No expense data available for the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <RechartsTooltip 
                      formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Income" 
                      dot={{ r: 4 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Expenses" 
                      dot={{ r: 4 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available for the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-700">
            <div className="grid grid-cols-7 bg-gray-900 text-gray-400 font-medium py-2 px-4">
              <div>Date</div>
              <div className="col-span-2">Description</div>
              <div>Category</div>
              <div>Account</div>
              <div>Type</div>
              <div className="text-right">Amount</div>
            </div>
            <div className="divide-y divide-gray-700">
              {transactions.length > 0 ? (
                transactions.slice(0, 10).map((transaction) => {
                  const account = accounts.find(a => a.id === transaction.bank_account_id);
                  return (
                    <div key={transaction.id} className="grid grid-cols-7 py-3 px-4 text-white">
                      <div>{format(new Date(transaction.date), 'MMM dd, yyyy')}</div>
                      <div className="col-span-2">{transaction.description || '-'}</div>
                      <div>{transaction.category || 'Uncategorized'}</div>
                      <div>{account?.name || '-'}</div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          transaction.type === 'income' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </div>
                      <div className={`text-right ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {getCurrencySymbol(transaction.currency)}{Number(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-gray-400">
                  No transactions found for the selected filters
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
