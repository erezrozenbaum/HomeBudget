import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, differenceInMonths } from 'date-fns';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#d88084', '#84c1d8'];

const getCategoryLabel = (category) => {
    switch (category) {
        // Expense categories
        case 'medical': return 'Medical';
        case 'car_repairs': return 'Car Repairs';
        case 'home_repairs': return 'Home Repairs';
        case 'travel_emergencies': return 'Travel Emergencies';
        case 'unexpected_bills': return 'Unexpected Bills';
        case 'emergency_purchases': return 'Emergency Purchases';
        case 'family_emergency': return 'Family Emergency';
        
        // Income categories
        case 'bonus': return 'Unexpected Bonus';
        case 'gift': return 'Gift Received';
        case 'tax_refund': return 'Tax Refund';
        case 'insurance_payout': return 'Insurance Payout';
        case 'inheritance': return 'Inheritance';
        case 'gambling': return 'Gambling/Lottery';
        case 'refund': return 'Unexpected Refund';
        
        case 'other': return 'Other';
        default: return category;
    }
};

export default function UnplannedExpenseAnalysis({ transactions }) {
    const [timeRange, setTimeRange] = useState('1y');
    const [chartType, setChartType] = useState('category');
    const [transactionType, setTransactionType] = useState('all');
    
    const getFilteredTransactions = () => {
        let dateLimit;
        const now = new Date();
        
        switch (timeRange) {
            case '3m':
                dateLimit = subMonths(now, 3);
                break;
            case '6m':
                dateLimit = subMonths(now, 6);
                break;
            case '1y':
                dateLimit = subMonths(now, 12);
                break;
            default:
                dateLimit = subMonths(now, 36); // All (up to 3 years)
        }
        
        let filtered = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= dateLimit;
        });
        
        if (transactionType !== 'all') {
            filtered = filtered.filter(tx => tx.type === transactionType);
        }
        
        return filtered;
    };
    
    const getCategoryData = () => {
        const filteredTransactions = getFilteredTransactions();
        const expensesByCategory = {};
        
        filteredTransactions.forEach(tx => {
            const category = tx.unplanned_category || 'other';
            
            if (!expensesByCategory[category]) {
                expensesByCategory[category] = 0;
            }
            expensesByCategory[category] += tx.amount;
        });
        
        return Object.entries(expensesByCategory).map(([category, amount]) => ({
            name: getCategoryLabel(category),
            value: amount
        }));
    };
    
    const getMonthlyData = () => {
        const filteredTransactions = getFilteredTransactions();
        const txByMonth = {};
        
        filteredTransactions.forEach(tx => {
            const monthYear = format(new Date(tx.date), 'MMM yyyy');
            
            if (!txByMonth[monthYear]) {
                txByMonth[monthYear] = {
                    expenses: 0,
                    income: 0
                };
            }
            
            if (tx.type === 'expense') {
                txByMonth[monthYear].expenses += tx.amount;
            } else {
                txByMonth[monthYear].income += tx.amount;
            }
        });
        
        // Convert to array for chart
        return Object.entries(txByMonth).map(([month, data]) => ({
            month,
            expenses: data.expenses,
            income: data.income,
            net: data.income - data.expenses
        }));
    };
    
    const getFrequencyData = () => {
        const filteredTransactions = getFilteredTransactions();
        
        if (filteredTransactions.length === 0) return [];
        
        // Get date range in months
        const oldestDate = new Date(
            Math.min(...filteredTransactions.map(tx => new Date(tx.date).getTime()))
        );
        const newestDate = new Date(
            Math.max(...filteredTransactions.map(tx => new Date(tx.date).getTime()))
        );
        
        const monthsCount = differenceInMonths(newestDate, oldestDate) + 1;
        
        // Count transactions by category
        const categoryCounts = {};
        filteredTransactions.forEach(tx => {
            const category = tx.unplanned_category || 'other';
            if (!categoryCounts[category]) {
                categoryCounts[category] = {
                    count: 0,
                    amount: 0,
                    type: tx.type
                };
            }
            categoryCounts[category].count++;
            categoryCounts[category].amount += tx.amount;
        });
        
        // Calculate frequency data
        const frequencyData = Object.entries(categoryCounts).map(([category, data]) => ({
            name: getCategoryLabel(category),
            count: data.count,
            perMonth: data.count / monthsCount,
            perYear: (data.count / monthsCount) * 12,
            avgAmount: data.amount / data.count,
            type: data.type
        }));
        
        return frequencyData;
    };
    
    const calculateTotals = () => {
        const filteredTransactions = getFilteredTransactions();
        const expenses = filteredTransactions.filter(tx => tx.type === 'expense');
        const income = filteredTransactions.filter(tx => tx.type === 'income');
        
        const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);
        const totalIncome = income.reduce((sum, tx) => sum + tx.amount, 0);
        const expenseCount = expenses.length;
        const incomeCount = income.length;
        
        // Get date range in months
        if (filteredTransactions.length === 0) 
            return { 
                totalExpenses: 0, 
                totalIncome: 0,
                expenseCount: 0, 
                incomeCount: 0,
                avgExpensePerMonth: 0, 
                avgIncomePerMonth: 0,
                avgExpenseAmount: 0,
                avgIncomeAmount: 0
            };
        
        const oldestDate = new Date(
            Math.min(...filteredTransactions.map(tx => new Date(tx.date).getTime()))
        );
        const newestDate = new Date(
            Math.max(...filteredTransactions.map(tx => new Date(tx.date).getTime()))
        );
        
        const monthsCount = Math.max(1, differenceInMonths(newestDate, oldestDate) + 1);
        
        return {
            totalExpenses,
            totalIncome,
            expenseCount,
            incomeCount,
            avgExpensePerMonth: expenseCount / monthsCount,
            avgIncomePerMonth: incomeCount / monthsCount,
            avgExpenseAmount: expenseCount > 0 ? totalExpenses / expenseCount : 0,
            avgIncomeAmount: incomeCount > 0 ? totalIncome / incomeCount : 0
        };
    };
    
    const totals = calculateTotals();
    const categoryData = getCategoryData();
    const monthlyData = getMonthlyData();
    const frequencyData = getFrequencyData();
    
    const formatCurrency = (value) => {
        // Use the first transaction's currency or default to USD
        const currency = transactions[0]?.currency || 'USD';
        return `${currency} ${value.toFixed(2)}`;
    };
    
    const getChartTitle = () => {
        if (transactionType === 'expense') return 'Unplanned Expenses';
        if (transactionType === 'income') return 'Unplanned Income';
        return 'Unplanned Transactions';
    }
    
    return (
        <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <CardTitle>{getChartTitle()} Analysis</CardTitle>
                        <div className="flex gap-2">
                            <Select value={transactionType} onValueChange={setTransactionType}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Transaction type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="expense">Expenses Only</SelectItem>
                                    <SelectItem value="income">Income Only</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3m">Last 3 months</SelectItem>
                                    <SelectItem value="6m">Last 6 months</SelectItem>
                                    <SelectItem value="1y">Last year</SelectItem>
                                    <SelectItem value="all">All time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Expenses</p>
                            <p className="text-xl font-semibold text-red-400">
                                {formatCurrency(totals.totalExpenses)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {totals.expenseCount} transactions
                            </p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Income</p>
                            <p className="text-xl font-semibold text-green-400">
                                {formatCurrency(totals.totalIncome)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {totals.incomeCount} transactions
                            </p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Net</p>
                            <p className={`text-xl font-semibold ${
                                totals.totalIncome - totals.totalExpenses >= 0 ? 
                                'text-green-400' : 'text-red-400'
                            }`}>
                                {formatCurrency(totals.totalIncome - totals.totalExpenses)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {totals.expenseCount + totals.incomeCount} total transactions
                            </p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Monthly Avg</p>
                            <p className="text-xl font-semibold text-white">
                                {totals.avgExpensePerMonth.toFixed(1)} expenses
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {totals.avgIncomePerMonth.toFixed(1)} income events
                            </p>
                        </div>
                    </div>
                    
                    <Tabs defaultValue={chartType} onValueChange={setChartType} className="space-y-4">
                        <TabsList className="mb-2">
                            <TabsTrigger value="category">By Category</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
                            <TabsTrigger value="frequency">Frequency</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="category" className="space-y-4">
                            <div className="h-96">
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="name"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        No unplanned transactions data for this period
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-300">Category Breakdown</h3>
                                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                    {categoryData.map((category) => (
                                        <div 
                                            key={category.name} 
                                            className="bg-gray-900 p-3 rounded-lg flex justify-between items-center"
                                        >
                                            <span className="text-gray-300">{category.name}</span>
                                            <Badge className="bg-blue-900/30 text-blue-400 border-blue-800">
                                                {formatCurrency(category.value)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="monthly" className="space-y-4">
                            <div className="h-80">
                                {monthlyData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={monthlyData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip 
                                                formatter={(value) => formatCurrency(value)}
                                                labelFormatter={(label) => `Month: ${label}`}
                                            />
                                            <Legend />
                                            <Bar dataKey="expenses" name="Unplanned Expenses" fill="#ef4444" />
                                            <Bar dataKey="income" name="Unplanned Income" fill="#22c55e" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        No unplanned transactions data for this period
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-300">Monthly Pattern</h3>
                                <p className="text-gray-400">
                                    {monthlyData.length > 0 
                                        ? transactionType !== 'income' 
                                          ? `You tend to have ${totals.avgExpensePerMonth.toFixed(1)} unplanned expenses per month, with an average amount of ${formatCurrency(totals.avgExpenseAmount)}.`
                                          : `You tend to have ${totals.avgIncomePerMonth.toFixed(1)} unplanned income events per month, with an average amount of ${formatCurrency(totals.avgIncomeAmount)}.`
                                        : 'No data available to analyze patterns.'}
                                </p>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="frequency" className="space-y-4">
                            <div className="h-80">
                                {frequencyData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={frequencyData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar 
                                                dataKey="perYear" 
                                                name="Occurrences per Year" 
                                                fill="#82ca9d" 
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        No frequency data available for this period
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="font-medium text-gray-300">Frequency Analysis</h3>
                                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                    {frequencyData.map((item) => (
                                        <div 
                                            key={item.name} 
                                            className={`bg-gray-900 p-3 rounded-lg ${
                                                item.type === 'expense' ? 'border-l-2 border-red-500' : 
                                                item.type === 'income' ? 'border-l-2 border-green-500' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-gray-300">{item.name}</span>
                                                <Badge className={`${
                                                    item.type === 'expense' ? 'bg-red-900/30 text-red-400 border-red-800' :
                                                    'bg-green-900/30 text-green-400 border-green-800'
                                                }`}>
                                                    {item.count} times
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Occurs approximately {item.perYear.toFixed(1)} times per year
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Avg: {formatCurrency(item.avgAmount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}