
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
import { BankAccount, Transaction, Investment, UserSettings } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { format, subDays, subMonths, startOfYear, isWithinInterval, parseISO, getYear, getMonth } from 'date-fns';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  Calendar,
  Star,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Building2
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { DatePickerWithRange } from '../components/dashboard/DatePickerWithRange';
import AccountTransactions from '../components/dashboard/AccountTransactions';
import AccountInvestments from '../components/dashboard/AccountInvestments';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import MonthlyTrends from '../components/dashboard/MonthlyTrends';
import AccountsList from '../components/dashboard/AccountsList';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const COLORS = ['#4f46e5', '#10b981', '#f97316', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#0ea5e9', '#8b5cf6'];

const DATE_PRESETS = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '3m': 'Last 3 Months',
  '6m': 'Last 6 Months',
  '1y': 'Last Year',
  'ytd': 'Year to Date',
  'custom': 'Custom Range'
};

const translations = {
  en: {
    // Headers and titles
    financialOverview: "Financial Overview",
    lastUpdated: "Last updated",
    businessView: "Business View",
    clearFilter: "Clear Filter",
    yourAccounts: "Your Accounts",
    accountBalances: "Account Balances",
    selectAccount: "Select account",
    
    // Stats cards
    totalBalance: "Total Balance",
    monthlyIncome: "Monthly Income",
    monthlyExpenses: "Monthly Expenses",
    totalInvestments: "Total Investments",
    currentValue: "Current value",
    thisMonth: "This month",
    acrossAllAccounts: "Across all accounts",
    comparedToInitialBalance: "Compared to initial balance",
    comparedToLastMonth: "Compared to last month",
    businessBalance: "Business Balance",
    businessIncome: "Business Income",
    businessExpenses: "Business Expenses",
    businessInvestments: "Business Investments",
    
    // Analysis tabs
    monthlyAnalysis: "Monthly Analysis",
    yearlyAnalysis: "Yearly Analysis",
    categoryBreakdown: "Category Breakdown",
    categories: "Categories",
    latestTransactions: "Latest Transactions",
    linkedInvestments: "Linked Investments",
    noTransactions: "No transactions found for the selected period",
    viewAll: "View All",
    general: "General",
    
    // Date ranges
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last3Months: "Last 3 Months",
    last6Months: "Last 6 Months",
    lastYear: "Last Year",
    yearToDate: "Year to Date",
    customRange: "Custom Range",
    selectYear: "Select year",

    // Additional translations
    selectAccountPrompt: "Select an account to view detailed analytics",
    
    // Categories
    transportation: "Transportation",
    gas: "Gas",
    foodAndDining: "Food & Dining",
    restaurants: "Restaurants",
    coffeeShops: "Coffee Shops",
    test: "Test",
    
    // Months (move these into a separate months object)
    months: {
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec"
    }
  },
  he: {
    // Headers and titles
    financialOverview: "סקירה פיננסית",
    lastUpdated: "עודכן לאחרונה",
    businessView: "תצוגת עסק",
    clearFilter: "נקה סינון",
    yourAccounts: "החשבונות שלך",
    accountBalances: "יתרות חשבון",
    selectAccount: "בחר חשבון",
    
    // Stats cards
    totalBalance: "יתרה כוללת",
    monthlyIncome: "הכנסה חודשית",
    monthlyExpenses: "הוצאות חודשיות",
    totalInvestments: "סך השקעות",
    currentValue: "ערך נוכחי",
    thisMonth: "החודש",
    acrossAllAccounts: "בכל החשבונות",
    comparedToInitialBalance: "בהשוואה ליתרה התחלתית",
    comparedToLastMonth: "בהשוואה לחודש קודם",
    businessBalance: "יתרת עסק",
    businessIncome: "הכנסות עסק",
    businessExpenses: "הוצאות עסק",
    businessInvestments: "השקעות עסק",
    
    // Analysis tabs
    monthlyAnalysis: "ניתוח חודשי",
    yearlyAnalysis: "ניתוח שנתי",
    categoryBreakdown: "פילוח קטגוריות",
    categories: "קטגוריות",
    latestTransactions: "עסקאות אחרונות",
    linkedInvestments: "השקעות מקושרות",
    noTransactions: "לא נמצאו עסקאות לתקופה שנבחרה",
    viewAll: "הצג הכל",
    general: "כללי",
    
    // Date ranges
    last7Days: "7 ימים אחרונים",
    last30Days: "30 ימים אחרונים",
    last3Months: "3 חודשים אחרונים",
    last6Months: "6 חודשים אחרונים",
    lastYear: "שנה אחרונה",
    yearToDate: "מתחילת השנה",
    customRange: "טווח מותאם אישית",
    selectYear: "בחר שנה",

    // Additional translations
    selectAccountPrompt: "בחר חשבון להצגת ניתוח מפורט",
    
    // Categories
    transportation: "תחבורה",
    gas: "דלק",
    foodAndDining: "אוכל ומסעדות",
    restaurants: "מסעדות",
    coffeeShops: "בתי קפה",
    test: "בדיקה",
    
    // Months (move these into a separate months object)
    months: {
      jan: "ינו",
      feb: "פבר",
      mar: "מרץ",
      apr: "אפר",
      may: "מאי",
      jun: "יונ",
      jul: "יול",
      aug: "אוג",
      sep: "ספט",
      oct: "אוק",
      nov: "נוב",
      dec: "דצמ"
    }
  }
};

export default function Dashboard() {
  // Original state variables...
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    accounts: [],
    transactions: [],
    investments: [],
    settings: null,
    defaultCurrency: 'USD',
    exchangeRates: {}
  });
  
  // Track exchange rates loading separately
  const [loadingRates, setLoadingRates] = useState(false);
  
  // Simplified state management
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [defaultAccountId, setDefaultAccountId] = useState(null);
  const [datePreset, setDatePreset] = useState('30d');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  
  const [analyticsView, setAnalyticsView] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [trends, setTrends] = useState({
    balance: { value: 0, trend: 0 },
    income: { value: 0, trend: 0 },
    expenses: { value: 0, trend: 0 },
    investments: { value: 0, trend: 0 },
  });

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [showBusinessFilter, setShowBusinessFilter] = useState(false);
  
  // Load language settings directly
  useEffect(() => {
    const loadLanguageSettings = async () => {
      try {
        const settings = await UserSettings.list();
        if (settings && settings.length > 0 && settings[0].language) {
          setLanguage(settings[0].language);
          setIsRTL(settings[0].language === 'he');
        }
      } catch (error) {
        console.error('Error loading language settings:', error);
      }
    };
    
    loadLanguageSettings();
  }, []);
  
  // Simple translation function
  const t = (key) => {
    // Check if it's a month key
    if (key.length === 3 && translations[language]?.months?.[key.toLowerCase()]) {
      return translations[language].months[key.toLowerCase()];
    }
    return translations[language]?.[key] || translations.en[key] || key;
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

  // Load only essential data first
  useEffect(() => {
    const loadEssentialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load settings first to get default currency and exchange rates
        const settingsData = await UserSettings.list();
        const settings = settingsData.length > 0 ? settingsData[0] : null;
        const defaultCurrency = settings?.default_currency || 'USD';

        // Get exchange rates from settings or use 1:1 as fallback
        const exchangeRates = settings?.exchange_rates || {
          USD: 1,
          EUR: 1,
          GBP: 1,
          ILS: 1,
          JPY: 1
        };

        // Update immediately with settings and rates
        setData(prev => ({
          ...prev,
          settings,
          defaultCurrency,
          exchangeRates: { ...exchangeRates, [defaultCurrency]: 1 }
        }));

        // Load accounts and set default account
        const accounts = await BankAccount.list();
        if (settings?.default_account_id) {
          const defaultAccount = accounts.find(a => a.id === settings.default_account_id);
          if (defaultAccount) {
            setSelectedAccount(defaultAccount);
            setDefaultAccountId(settings.default_account_id);
          }
        }

        // Update with accounts
        setData(prev => ({
          ...prev,
          accounts
        }));

        // Load last 30 days of transactions
        const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        const transactions = await Transaction.filter(
          { date: { $gte: thirtyDaysAgo } },
          '-date'
        );

        // Load investments
        const investments = await Investment.list();

        // Update with all data
        setData(prev => ({
          ...prev,
          transactions,
          investments
        }));

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    loadEssentialData();

    // Load businesses
    loadBusinesses();
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const { Business } = await import('@/api/entities');
      const businessesData = await Business.list();
      
      if (businessesData.length > 0) {
        setBusinesses(businessesData);
        setShowBusinessFilter(true);
      }
    } catch (error) {
      console.error("Error loading businesses:", error);
    }
  };

  const loadExchangeRates = async () => {
    try {
      setLoadingRates(true);
      
      // Get all unique currencies
      const uniqueCurrencies = new Set();
      data.accounts.forEach(acc => uniqueCurrencies.add(acc.currency));
      data.transactions.forEach(t => uniqueCurrencies.add(t.currency));
      data.investments.forEach(inv => uniqueCurrencies.add(inv.currency));

      // Remove the default currency from the set
      uniqueCurrencies.delete(data.defaultCurrency);

      // If all currencies are the same, no need to fetch rates
      if (uniqueCurrencies.size === 0) {
        setLoadingRates(false);
        return;
      }

      const currenciesArray = Array.from(uniqueCurrencies);
      const rates = await fetchExchangeRates(currenciesArray, data.defaultCurrency);
      
      setData(prev => ({
        ...prev,
        exchangeRates: { ...rates, [data.defaultCurrency]: 1 }
      }));
    } catch (error) {
      console.error('Error loading exchange rates:', error);
      // On error, use 1:1 rates as fallback
      const fallbackRates = {};
      data.accounts.forEach(acc => {
        if (acc.currency !== data.defaultCurrency) {
          fallbackRates[acc.currency] = 1;
        }
      });
      data.transactions.forEach(t => {
        if (t.currency !== data.defaultCurrency) {
          fallbackRates[t.currency] = 1;
        }
      });
      data.investments.forEach(inv => {
        if (inv.currency !== data.defaultCurrency) {
          fallbackRates[inv.currency] = 1;
        }
      });
      
      setData(prev => ({
        ...prev,
        exchangeRates: { ...fallbackRates, [data.defaultCurrency]: 1 }
      }));
    } finally {
      setLoadingRates(false);
    }
  };

  const convertAmount = (amount, fromCurrency) => {
    if (!amount || !fromCurrency) return 0;
    if (fromCurrency === data.defaultCurrency) return amount;
    
    const rate = data.exchangeRates[fromCurrency];
    if (!rate) {
      console.warn(`No exchange rate found for ${fromCurrency}, using 1:1 rate`);
      return amount;
    }
    
    // Convert to ILS by dividing by the rate
    return parseFloat((amount / rate).toFixed(2));
  };

  const filterTransactionsByDate = (transactions) => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return isWithinInterval(transactionDate, { start: dateRange.from, end: dateRange.to });
    });
  };
  
  const setDefaultAccountAndSave = async (account) => {
    if (!account) return;
    
    setSelectedAccount(account);
    setDefaultAccountId(account.id);
    
    try {
      if (data.settings) {
        await UserSettings.update(data.settings.id, {
          ...data.settings,
          default_account_id: account.id
        });
      } else {
        await UserSettings.create({
          default_currency: data.defaultCurrency,
          default_account_id: account.id,
          theme: 'system',
          language: 'en'
        });
      }
      
      const newSettings = await UserSettings.list();
      if (newSettings.length > 0) {
        setData(prev => ({
          ...prev,
          settings: newSettings[0]
        }));
      }
    } catch (error) {
      console.error('Error saving default account:', error);
    }
  };

  const getAccountSpecificData = () => {
    if (!selectedAccount) return null;

    const accountTransactions = filterTransactionsByDate(
      data.transactions.filter(t => {
        return t.bank_account_id === selectedAccount.id;
      })
    );

    const accountInvestments = data.investments.filter(i => i.bank_account_id === selectedAccount.id);

    const income = accountTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);

    const expenses = accountTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency), 0);

    return {
      transactions: accountTransactions,
      investments: accountInvestments,
      income,
      expenses,
      balance: convertAmount(selectedAccount.current_balance, selectedAccount.currency)
    };
  };

  const getCategoryDataByMonth = () => {
    if (!selectedAccount || !selectedAccountData) return [];
    
    const expensesByMonthAndCategory = {};
    
    selectedAccountData.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = new Date(t.date);
        const monthYear = format(date, 'MMM yyyy');
        const category = t.category || 'Uncategorized';
        
        if (!expensesByMonthAndCategory[monthYear]) {
          expensesByMonthAndCategory[monthYear] = {};
        }
        
        if (!expensesByMonthAndCategory[monthYear][category]) {
          expensesByMonthAndCategory[monthYear][category] = 0;
        }
        
        expensesByMonthAndCategory[monthYear][category] += convertAmount(t.amount, t.currency);
      });
    
    return Object.entries(expensesByMonthAndCategory)
      .map(([monthYear, categories]) => {
        const result = { month: monthYear };
        Object.entries(categories).forEach(([category, amount]) => {
          result[category] = amount;
        });
        return result;
      })
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
      });
  };

  const getUniqueCategories = () => {
    if (!selectedAccountData) return [];
    
    const categories = new Set();
    selectedAccountData.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories.add(t.category || 'Uncategorized');
      });
      
    return Array.from(categories);
  };

  const getYearlyData = () => {
    if (!selectedAccount || !selectedAccountData) return [];
    
    const yearlyData = {};
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Initialize with current year months up to current month
    const currentMonth = new Date().getMonth();
    monthNames.slice(0, currentMonth + 1).forEach(month => {
      yearlyData[`${month} ${selectedYear}`] = {
        month: `${month} ${selectedYear}`,
        income: 0,
        expenses: 0,
        investments: 0
      };
    });
    
    // Process transactions
    selectedAccountData.transactions
      .filter(t => getYear(parseISO(t.date)) === selectedYear)
      .forEach(t => {
        const date = parseISO(t.date);
        const month = monthNames[getMonth(date)];
        const monthYear = `${month} ${selectedYear}`;
        
        if (yearlyData[monthYear]) {  // Only process if month exists (up to current month)
          if (t.type === 'income') {
            yearlyData[monthYear].income += convertAmount(t.amount, t.currency);
          } else {
            yearlyData[monthYear].expenses += convertAmount(t.amount, t.currency);
          }
        }
      });
    
    // Process investments - only show current value in the latest month
    const currentMonthKey = `${monthNames[currentMonth]} ${selectedYear}`;
    if (yearlyData[currentMonthKey] && selectedAccountData.investments.length > 0) {
      const totalInvestmentValue = selectedAccountData.investments.reduce((sum, inv) => {
        return sum + convertAmount(inv.current_amount || inv.initial_amount, inv.currency);
      }, 0);
      yearlyData[currentMonthKey].investments = totalInvestmentValue;
    }
    
    return Object.entries(yearlyData)
      .map(([, data]) => data)
      .sort((a, b) => {
        const monthAIndex = monthNames.findIndex(m => a.month.startsWith(m));
        const monthBIndex = monthNames.findIndex(m => b.month.startsWith(m));
        return monthAIndex - monthBIndex;
      });
  };

  const getMonthlyTrends = () => {
    if (!selectedAccount || !selectedAccountData) return [];
    
    const monthlyData = {};
    
    // Process transactions
    selectedAccountData.transactions.forEach(t => {
      const date = parseISO(t.date);
      const monthYear = format(date, 'MMM yyyy');
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          income: 0,
          expenses: 0,
          investments: 0,
          balance: 0
        };
      }
      
      const amount = convertAmount(t.amount, t.currency);
      if (t.type === 'income') {
        monthlyData[monthYear].income += amount;
      } else {
        monthlyData[monthYear].expenses += amount;
      }
    });
    
    // Calculate running balance and add investment value
    let runningBalance = 0;
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a) - new Date(b);
    });
    
    sortedMonths.forEach(month => {
      runningBalance += monthlyData[month].income - monthlyData[month].expenses;
      monthlyData[month].balance = runningBalance;
      
      // Add investment value to the current month only
      if (month === format(new Date(), 'MMM yyyy') && selectedAccountData.investments.length > 0) {
        monthlyData[month].investments = selectedAccountData.investments.reduce((sum, inv) => {
          return sum + convertAmount(inv.current_amount || inv.initial_amount, inv.currency);
        }, 0);
      }
    });
    
    return sortedMonths.map(month => monthlyData[month]);
  };
  
  const getCurrencySymbol = (currency) => {
    switch(currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'ILS': return '₪';
      case 'JPY': return '¥';
      default: return currency + ' ';
    }
  };

  const getAvailableYears = () => {
    if (!selectedAccount || !selectedAccountData) return [new Date().getFullYear()];
    
    const years = new Set();
    // Get years from transactions
    selectedAccountData.transactions.forEach(t => {
      if (t.date) {
        years.add(getYear(parseISO(t.date)));
      }
    });
    
    // Get years from investments - safely handle missing purchase_date
    selectedAccountData.investments.forEach(i => {
      if (i.purchase_date) {
        years.add(getYear(parseISO(i.purchase_date)));
      } else if (i.start_date) {
        years.add(getYear(parseISO(i.start_date)));
      }
    });
    
    // Always include current year
    years.add(new Date().getFullYear());
    
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  };

  // Fix the investment value calculation
  const getInvestmentValues = () => {
    const investmentValues = data.investments.map(inv => {
      // For investments, always prefer current_amount if available
      const amount = inv.current_amount !== null && inv.current_amount !== undefined ? 
        inv.current_amount : 
        inv.initial_amount;
      
      return {
        id: inv.id,
        amount: amount,
        currency: inv.currency
      };
    });
    
    return investmentValues;
  };

  const calculateTrends = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate trends for accounts with proper currency conversion
    const accountTrends = data.accounts.reduce((acc, account) => {
      const currentBalance = convertAmount(account.current_balance || 0, account.currency);
      const initialBalance = convertAmount(account.initial_balance || 0, account.currency);
      return {
        current: acc.current + currentBalance,
        initial: acc.initial + initialBalance
      };
    }, { current: 0, initial: 0 });

    // Calculate trends for transactions this month with currency conversion
    const monthlyTransactions = data.transactions.filter(t => new Date(t.date) >= startOfMonth);
    const incomeThisMonth = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertAmount(t.amount || 0, t.currency), 0);
    
    const expensesThisMonth = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertAmount(t.amount || 0, t.currency), 0);

    // Previous month transactions for comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevMonthTransactions = data.transactions.filter(t => {
      const date = new Date(t.date);
      return date >= prevMonthStart && date <= prevMonthEnd;
    });

    const prevMonthIncome = prevMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertAmount(t.amount || 0, t.currency), 0);
    
    const prevMonthExpenses = prevMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertAmount(t.amount || 0, t.currency), 0);

    // Calculate investment trends - properly convert currencies
    let totalCurrentInvestmentValue = 0;
    let totalInitialInvestmentValue = 0;

    data.investments.forEach(inv => {
      // Always use current_amount if available, otherwise fall back to initial
      const currentAmount = inv.current_amount !== undefined && inv.current_amount !== null
        ? convertAmount(inv.current_amount, inv.currency)
        : convertAmount(inv.initial_amount || 0, inv.currency);
      
      const initialAmount = convertAmount(inv.initial_amount || 0, inv.currency);
      
      totalCurrentInvestmentValue += currentAmount;
      totalInitialInvestmentValue += initialAmount;
    });

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / Math.abs(previous)) * 100;
    };

    return {
      balance: {
        value: accountTrends.current,
        trend: calculatePercentageChange(accountTrends.current, accountTrends.initial)
      },
      income: {
        value: incomeThisMonth,
        trend: calculatePercentageChange(incomeThisMonth, prevMonthIncome)
      },
      expenses: {
        value: expensesThisMonth,
        trend: calculatePercentageChange(expensesThisMonth, prevMonthExpenses)
      },
      investments: {
        value: totalCurrentInvestmentValue,
        trend: calculatePercentageChange(totalCurrentInvestmentValue, totalInitialInvestmentValue)
      }
    };
  };

  // Update trends when data and exchange rates are loaded
  useEffect(() => {
    if (!loading && !loadingRates) {
      const newTrends = calculateTrends();
      setTrends(newTrends);
    }
  }, [loading, loadingRates, data.exchangeRates, data.accounts, data.transactions, data.investments]);

  const selectedAccountData = getAccountSpecificData();
  const categoryData = getCategoryDataByMonth();
  const uniqueCategories = getUniqueCategories();
  const yearlyData = getYearlyData();
  const monthlyTrends = getMonthlyTrends();
  const availableYears = getAvailableYears();
  const calculatedTrends = calculateTrends();

  // Update trends after data and exchange rates are loaded
  useEffect(() => {
    if (!loading && !loadingRates) {
      const newTrends = calculateTrends();
      setTrends(newTrends);
    }
  }, [loading, loadingRates, data]);

  const getFilteredTransactions = () => {
    if (!selectedBusiness) {
      return data.transactions; // Return all transactions if no business is selected
    }
    
    // Filter transactions by business ID
    return data.transactions.filter(tx => 
      tx.business_id === selectedBusiness.id
    );
  };
  
  // Get business-specific totals
  const getBusinessTotals = () => {
    if (!selectedBusiness) return { income: 0, expense: 0 };
    
    const businessTransactions = data.transactions.filter(tx => 
      tx.business_id === selectedBusiness.id
    );
    
    const income = businessTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + convertAmount(tx.amount, tx.currency), 0);
    
    const expense = businessTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + convertAmount(tx.amount, tx.currency), 0);
    
    return { income, expense };
  };

  const getBusinessFilteredTransactions = () => {
    if (!selectedBusiness) return data.transactions;
    return data.transactions.filter(tx => tx.business_id === selectedBusiness.id);
  };

  const getBusinessFilteredStats = () => {
    const filteredTransactions = getBusinessFilteredTransactions();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate business-specific stats
    const monthlyTransactions = filteredTransactions.filter(t => new Date(t.date) >= startOfMonth);
    const incomeThisMonth = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertAmount(t.amount || 0, t.currency), 0);

    const expensesThisMonth = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertAmount(t.amount || 0, t.currency), 0);

      const businessBalance = data.accounts
      .filter(acc => acc.business_id === selectedBusiness?.id) // Ensure selectedBusiness is not null
      .reduce((sum, acc) => sum + convertAmount(acc.current_balance || 0, acc.currency), 0);

    const businessInvestments = data.investments
      .filter(inv => inv.business_id === selectedBusiness?.id) // Ensure selectedBusiness is not null
      .reduce((sum, inv) => {
        const currentAmount = inv.current_amount !== undefined ? inv.current_amount : inv.initial_amount;
        return sum + convertAmount(currentAmount || 0, inv.currency);
      }, 0);

    return {
      balance: businessBalance,
      income: incomeThisMonth,
      expenses: expensesThisMonth,
      investments: businessInvestments
    };
  };

  const formatCurrency = (amount) => {
    return `${getCurrencySymbol(data.defaultCurrency)}${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Title and Business Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {selectedBusiness ? selectedBusiness.name : t('financialOverview')}
            </h1>
            <p className="text-sm text-gray-400">
              {t('lastUpdated')}: {format(new Date(), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        </div>

        {/* Business Filter */}
        {businesses.length > 0 && (
          <div className="flex flex-wrap gap-2 bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-400 mr-4">
              <Building2 className="w-4 h-4" />
              {t('businessView')}:
            </div>
            {businesses.map(business => (
              <button
                key={business.id}
                onClick={() => setSelectedBusiness(business.id === selectedBusiness?.id ? null : business)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  business.id === selectedBusiness?.id 
                    ? 'text-white'
                    : 'text-gray-300 hover:text-gray-100'
                }`}
                style={{ 
                  backgroundColor: business.id === selectedBusiness?.id ? business.color : 'rgb(31, 41, 55)',
                }}
              >
                <Building2 className="w-4 h-4" />
                {business.name}
              </button>
            ))}
            {selectedBusiness && (
              <button
                onClick={() => setSelectedBusiness(null)}
                className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-300 bg-gray-800 hover:bg-gray-700"
              >
                {t('clearFilter')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {selectedBusiness ? (
          <>
            <StatsCard
              title={t('businessBalance')}
              value={getBusinessFilteredStats().balance}
              trend={0}
              trendType="balance"
              currencySymbol={getCurrencySymbol(data.defaultCurrency)}
              description={t('acrossAllAccounts')}
              icon={Wallet}
              color="blue"
              t={t}
            />
            <StatsCard
              title={t('businessIncome')}
              value={getBusinessFilteredStats().income}
              trend={0}
              trendType="income"
              currencySymbol={getCurrencySymbol(data.defaultCurrency)}
              description={t('thisMonth')}
              icon={TrendingUp}
              color="green"
              t={t}
            />
            <StatsCard
              title={t('businessExpenses')}
              value={getBusinessFilteredStats().expenses}
              trend={0}
              trendType="expenses"
              currencySymbol={getCurrencySymbol(data.defaultCurrency)}
              description={t('thisMonth')}
              icon={TrendingDown}
              color="red"
              t={t}
            />
            <StatsCard
              title={t('businessInvestments')}
              value={getBusinessFilteredStats().investments}
              trend={0}
              trendType="investments"
              currencySymbol={getCurrencySymbol(data.defaultCurrency)}
              description={t('currentValue')}
              icon={PiggyBank}
              color="amber"
              t={t}
            />
          </>
        ) : (
          <>
            <StatsCard
              title={t('totalBalance')}
              value={calculatedTrends.balance.value}
              trend={calculatedTrends.balance.trend}
              trendType="balance"
              currencySymbol={getCurrencySymbol(data.defaultCurrency)}
              description={t('acrossAllAccounts')}
              icon={Wallet}
              color="blue"
              t={t}
            />
            <StatsCard
              title={t('monthlyIncome')}
              value={calculatedTrends.income.value}
              trend={calculatedTrends.income.trend}
              trendType="income"
              currencySymbol={getCurrencySymbol(data.defaultCurrency)}
              description={t('thisMonth')}
              icon={TrendingUp}
              color="green"
              t={t}
            />
            <StatsCard
              title={t('monthlyExpenses')}
              value={calculatedTrends.expenses.value}
              trend={calculatedTrends.expenses.trend}
              trendType="expenses"
              currencySymbol={getCurrencySymbol(data.defaultCurrency)}
              description={t('thisMonth')}
              icon={TrendingDown}
              color="red"
              t={t}
            />
            <StatsCard
              title={t('totalInvestments')}
              value={calculatedTrends.investments.value}
              trend={calculatedTrends.investments.trend}
              trendType="investments"
              currencySymbol={getCurrencySymbol(data.defaultCurrency)}
              description={t('currentValue')}
              icon={PiggyBank}
              color="amber"
              t={t}
            />
          </>
        )}
      </div>
      
      {/* Make "Your Accounts" card full width */}
      <div className="grid gap-6">
        <AccountsList 
          accounts={data.accounts} 
          cards={data.cards || []}
          defaultCurrency={data.defaultCurrency}
          getCurrencySymbol={getCurrencySymbol}
          t={t}
        />
      </div>

      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
            <div className="w-full md:w-64">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium mb-1.5 text-white">{t('selectAccount')}</label>
                <div className="flex gap-2">
                  <Select
                    value={selectedAccount?.id || ''}
                    onValueChange={(value) => {
                      const account = data.accounts.find(a => a.id === value);
                      setSelectedAccount(account);
                    }}
                  >
                    <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-white">
                      <SelectValue placeholder={t('selectAccount')} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {data.accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id} className="text-gray-100">
                          {account.name} ({account.current_balance} {account.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAccount && (
                    <Button
                      variant={defaultAccountId === selectedAccount.id ? "secondary" : "outline"}
                      size="icon"
                      onClick={() => setDefaultAccountAndSave(selectedAccount)}
                      title="Set as default account"
                    >
                      <Star className={`h-4 w-4 ${defaultAccountId === selectedAccount.id ? "text-yellow-500 fill-yellow-500" : ""}`} />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-medium mb-1.5 text-white">Date Range</label>
                <Select value={datePreset} onValueChange={setDatePreset}>
                  <SelectTrigger className="w-full md:w-48 bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {Object.entries(DATE_PRESETS).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-gray-100">
                        {t(key === '7d' ? 'last7Days' :
                          key === '30d' ? 'last30Days' :
                          key === '3m' ? 'last3Months' :
                          key === '6m' ? 'last6Months' :
                          key === '1y' ? 'lastYear' :
                          key === 'ytd' ? 'yearToDate' :
                          key === 'custom' ? 'customRange' : key
                        ) || label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {datePreset === 'custom' && (
              <div className="w-full md:w-auto self-end">
                <DatePickerWithRange 
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
            )}
          </div>
          
          {/* Option 2: Show account balances in the account section when no account is selected */}
          {!selectedAccount && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-white mb-3">{t('accountBalances')}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.accounts.map(account => (
                  <div 
                    key={account.id} 
                    className="p-3 rounded-md border border-gray-700 bg-gray-900 hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedAccount(account)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-8 rounded-full"
                          style={{ backgroundColor: account.color || '#4f46e5' }}
                        />
                        <span className="font-medium text-white">{account.name}</span>
                      </div>
                      {account.id === defaultAccountId && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {account.currency} {account.current_balance?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditional Business Badge */}
      {selectedBusiness && (
        <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: selectedBusiness.color || '#4f46e5' }}
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedBusiness.name}</h2>
              <p className="text-gray-400">{selectedBusiness.industry || 'Business Dashboard'}</p>
            </div>
          </div>
          
          {/* Business Summary */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-gray-900 rounded-lg">
              <h3 className="text-sm text-gray-400 mb-1">{t('businessIncome')}</h3>
              <p className="text-lg font-bold text-green-400">
                {formatCurrency(getBusinessTotals().income)}
              </p>
            </div>
            <div className="p-3 bg-gray-900 rounded-lg">
              <h3 className="text-sm text-gray-400 mb-1">{t('businessExpenses')}</h3>
              <p className="text-lg font-bold text-red-400">
                {formatCurrency(getBusinessTotals().expense)}
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedAccount ? (
        <>
          <Tabs defaultValue="monthly">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="monthly" onClick={() => setAnalyticsView('monthly')}>
                  <LineChartIcon className="w-4 h-4 mr-2" />
                  {t('monthlyAnalysis')}
                </TabsTrigger>
                <TabsTrigger value="yearly" onClick={() => setAnalyticsView('yearly')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('yearlyAnalysis')}
                </TabsTrigger>
                <TabsTrigger value="categories">
                  <PieChartIcon className="w-4 h-4 mr-2" />
                  {t('categoryBreakdown')}
                </TabsTrigger>
              </TabsList>
              
              {analyticsView === 'yearly' && (
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder={t('selectYear')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <TabsContent value="monthly" className="mt-0">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-gray-700 bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Monthly Income vs Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#6b7280"/>
                          <XAxis dataKey="month" stroke="#9ca3af"/>
                          <YAxis stroke="#9ca3af"/>
                          <Tooltip 
                            formatter={(value) => [`${getCurrencySymbol(data.defaultCurrency)}${value.toLocaleString()}`, '']}
                            contentStyle={{ backgroundColor: '#374151', border: 'none', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Legend wrapperStyle={{ color: '#9ca3af' }} />
                          <Line type="monotone" dataKey="income" stroke="#22c55e" name="Income" />
                          <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" />
                          <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="Balance" strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="investments" stroke="#f59e0b" name="Investments" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-700 bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Monthly Expenses by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#6b7280"/>
                          <XAxis dataKey="month" stroke="#9ca3af"/>
                          <YAxis stroke="#9ca3af"/>
                          <Tooltip 
                            formatter={(value) => [`${getCurrencySymbol(data.defaultCurrency)}${value.toLocaleString()}`, '']}
                            contentStyle={{ backgroundColor: '#374151', border: 'none', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Legend wrapperStyle={{ color: '#9ca3af' }} />
                          {uniqueCategories.map((category, index) => (
                            <Bar 
                              key={category} 
                              dataKey={category} 
                              stackId="a" 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="yearly" className="mt-0">
              <Card className="border-gray-700 bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">{selectedYear} Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#6b7280"/>
                        <XAxis dataKey="month" stroke="#9ca3af"/>
                        <YAxis stroke="#9ca3af"/>
                        <Tooltip 
                          formatter={(value) => [`${getCurrencySymbol(data.defaultCurrency)}${value.toLocaleString()}`, '']}
                          contentStyle={{ backgroundColor: '#374151', border: 'none', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ color: '#9ca3af' }} />
                        <Bar dataKey="income" name="Income" fill="#22c55e" />
                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                        <Bar dataKey="investments" name="Investments" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories" className="mt-0">
              <CategoryBreakdown 
                transactions={selectedAccountData?.transactions || []}
                defaultCurrency={data.defaultCurrency}
                getCurrencySymbol={getCurrencySymbol}
                dateRange={dateRange}
                analyticsView={analyticsView}
                selectedYear={selectedYear}
                uniqueCategories={uniqueCategories}
              />
            </TabsContent>
          </Tabs>

          <AccountTransactions 
            transactions={selectedAccountData?.transactions || []}
            defaultCurrency={data.defaultCurrency}
          />

          <AccountInvestments 
            investments={selectedAccountData?.investments || []}
            defaultCurrency={data.defaultCurrency}
          />
        </>
      ) : (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-6 text-center text-gray-400">
            {t('selectAccountPrompt')}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* ... keep existing code for stats cards */}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Transactions (filtered by business if selected) */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-700">
              <CardTitle className="text-lg text-white">{selectedBusiness ? 'Business Transactions' : t('latestTransactions')}</CardTitle>
              <Link to={createPageUrl('Transactions')}>
                <Button variant="outline" className="bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white">
                  {t('viewAll')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <AccountTransactions
                transactions={getFilteredTransactions()}
                defaultCurrency={data.defaultCurrency}
                t={t}
                isRTL={isRTL}
              />
            </CardContent>
          </Card>
          
          {/* ... keep existing code for other components */}
        </div>
        
        <div className="space-y-6">
          {/* ... keep existing code for sidebar components */}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, currencySymbol, description, icon: Icon, color, trend, trendType, t }) {

  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    amber: "text-amber-600"
  };

  const trendColorClass = trend >= 0 ? "text-green-600" : "text-red-600";
  const trendIcon = trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  const formattedTrend = trend ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%` : '0.0%';

  let trendExplanation = '';
  switch (trendType) {
    case 'balance':
      trendExplanation = t('comparedToInitialBalance');
      break;
    case 'income':
      trendExplanation = t('comparedToLastMonth');
      break;
    case 'expenses':
      trendExplanation = t('comparedToLastMonth');
      break;
    case 'investments':
      trendExplanation = 'Compared to initial value';
      break;
    default:
      trendExplanation = 'Compared to previous period';
      break;
  }

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className={`flex items-center gap-1 ${trendColorClass}`}>
            {trendIcon}
            <span className="text-sm">{formattedTrend}</span>
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-gray-400">{title}</span>
          <h3 className="text-2xl font-bold mt-1 text-white">{currencySymbol}{value.toLocaleString()}</h3>
          <span className="text-sm text-gray-400 mt-1">{description}</span>
          {trendExplanation && (
              <span className="text-xs text-gray-400 block mt-1">
                  {trendExplanation}
              </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
