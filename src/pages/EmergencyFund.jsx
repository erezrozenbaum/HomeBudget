
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Transaction, BankAccount, EmergencyFund } from '@/api/entities';
import { User } from '@/api/entities';
import { Shield, Wallet, ArrowUpRight, ArrowDownRight, AlertTriangle, Clock, DollarSign, Activity, X, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import EmergencyFundForm from '../components/emergency-fund/EmergencyFundForm';
import EmergencyFundContributionForm from '../components/emergency-fund/EmergencyFundContributionForm';
import EmergencyFundWithdrawalForm from '../components/emergency-fund/EmergencyFundWithdrawalForm';
import UnplannedExpenseAnalysis from '../components/emergency-fund/UnplannedExpenseAnalysis';
import EmergencyFundResilience from '../components/emergency-fund/EmergencyFundResilience';

export default function EmergencyFundPage() {
    const [emergencyFund, setEmergencyFund] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [unplannedTransactions, setUnplannedTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isContributionFormOpen, setIsContributionFormOpen] = useState(false);
    const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = useState(false);
    const [timeRange, setTimeRange] = useState('6m');
    
    useEffect(() => {
        loadData();
    }, []);
    
    const loadData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch accounts, emergency fund, and unplanned transactions
            const [accountsData, emergencyFundData, unplannedTransactionsData] = await Promise.all([
                BankAccount.list(),
                EmergencyFund.list(),
                Transaction.filter({
                    is_unplanned: true
                })
            ]);
            
            setAccounts(accountsData);
            
            // If no emergency fund exists, we'll show the create form
            if (emergencyFundData && emergencyFundData.length > 0) {
                setEmergencyFund(emergencyFundData[0]);
            } else {
                setIsFormOpen(true);
            }
            
            setUnplannedTransactions(unplannedTransactionsData);
        } catch (error) {
            console.error('Error loading emergency fund data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFormSave = async (formData) => {
        try {
            if (emergencyFund) {
                // Update existing emergency fund
                await EmergencyFund.update(emergencyFund.id, formData);
            } else {
                // Create new emergency fund
                await EmergencyFund.create(formData);
            }
            
            setIsFormOpen(false);
            loadData();
        } catch (error) {
            console.error('Error saving emergency fund:', error);
        }
    };
    
    const handleContributionSave = async (contributionData) => {
        try {
            // Create transaction for the contribution
            const transactionData = {
                date: format(contributionData.date, 'yyyy-MM-dd'),
                type: 'expense',
                amount: contributionData.amount,
                currency: emergencyFund.currency,
                bank_account_id: contributionData.from_account_id,
                category: 'Savings',
                subcategory: 'Emergency Fund',
                description: 'Emergency Fund Contribution'
            };
            
            const transaction = await Transaction.create(transactionData);
            
            // Update emergency fund record
            const newContributions = [...(emergencyFund.contributions || []), {
                date: format(contributionData.date, 'yyyy-MM-dd'),
                amount: contributionData.amount,
                transaction_id: transaction.id
            }];
            
            const updatedEmergencyFund = {
                ...emergencyFund,
                current_amount: emergencyFund.current_amount + contributionData.amount,
                last_contribution_date: format(contributionData.date, 'yyyy-MM-dd'),
                contributions: newContributions
            };
            
            await EmergencyFund.update(emergencyFund.id, updatedEmergencyFund);
            setIsContributionFormOpen(false);
            loadData();
        } catch (error) {
            console.error('Error saving contribution:', error);
        }
    };
    
    const handleWithdrawalSave = async (withdrawalData) => {
        try {
            // Create transaction for the withdrawal
            const transactionData = {
                date: format(withdrawalData.date, 'yyyy-MM-dd'),
                type: 'income',
                amount: withdrawalData.amount,
                currency: emergencyFund.currency,
                bank_account_id: withdrawalData.to_account_id,
                category: 'Savings',
                subcategory: 'Emergency Fund',
                description: `Emergency Fund Withdrawal: ${withdrawalData.reason}`,
                is_unplanned: true,
                unplanned_category: withdrawalData.unplanned_category,
                emergency_fund_withdrawal: true
            };
            
            const transaction = await Transaction.create(transactionData);
            
            // Update emergency fund record
            const newWithdrawals = [...(emergencyFund.withdrawals || []), {
                date: format(withdrawalData.date, 'yyyy-MM-dd'),
                amount: withdrawalData.amount,
                reason: withdrawalData.reason,
                transaction_id: transaction.id
            }];
            
            const updatedEmergencyFund = {
                ...emergencyFund,
                current_amount: Math.max(0, emergencyFund.current_amount - withdrawalData.amount),
                last_withdrawal_date: format(withdrawalData.date, 'yyyy-MM-dd'),
                withdrawals: newWithdrawals
            };
            
            await EmergencyFund.update(emergencyFund.id, updatedEmergencyFund);
            setIsWithdrawalFormOpen(false);
            loadData();
        } catch (error) {
            console.error('Error saving withdrawal:', error);
        }
    };
    
    const getEmergencyFundProgress = () => {
        if (!emergencyFund) return 0;
        return Math.min(100, (emergencyFund.current_amount / emergencyFund.target_amount) * 100);
    };
    
    const getContributionsData = () => {
        if (!emergencyFund || !emergencyFund.contributions) return [];
        
        // Group contributions by month
        const contributionsByMonth = {};
        
        emergencyFund.contributions.forEach(contribution => {
            const date = new Date(contribution.date);
            const monthYear = format(date, 'MMM yyyy');
            
            if (!contributionsByMonth[monthYear]) {
                contributionsByMonth[monthYear] = 0;
            }
            
            contributionsByMonth[monthYear] += contribution.amount;
        });
        
        // Convert to array for chart
        return Object.entries(contributionsByMonth).map(([month, amount]) => ({
            month,
            amount
        }));
    };
    
    const getWithdrawalsData = () => {
        if (!emergencyFund || !emergencyFund.withdrawals) return [];
        
        // Group withdrawals by month
        const withdrawalsByMonth = {};
        
        emergencyFund.withdrawals.forEach(withdrawal => {
            const date = new Date(withdrawal.date);
            const monthYear = format(date, 'MMM yyyy');
            
            if (!withdrawalsByMonth[monthYear]) {
                withdrawalsByMonth[monthYear] = 0;
            }
            
            withdrawalsByMonth[monthYear] += withdrawal.amount;
        });
        
        // Convert to array for chart
        return Object.entries(withdrawalsByMonth).map(([month, amount]) => ({
            month,
            amount
        }));
    };
    
    const getUnplannedTransactionsData = () => {
        if (!unplannedTransactions || unplannedTransactions.length === 0) return [];
        
        // Group unplanned transactions by month and type
        const transactionsByMonth = {};
        
        unplannedTransactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthYear = format(date, 'MMM yyyy');
            
            if (!transactionsByMonth[monthYear]) {
                transactionsByMonth[monthYear] = {
                    expenses: 0,
                    income: 0
                };
            }
            
            if (transaction.type === 'expense') {
                transactionsByMonth[monthYear].expenses += transaction.amount;
            } else if (transaction.type === 'income') {
                transactionsByMonth[monthYear].income += transaction.amount;
            }
        });
        
        // Convert to array for chart
        return Object.entries(transactionsByMonth).map(([month, data]) => ({
            month,
            expenses: data.expenses,
            income: data.income,
            net: data.income - data.expenses
        }));
    };
    
    const getEmergencyFundAccount = () => {
        if (!emergencyFund || !emergencyFund.bank_account_id) return null;
        return accounts.find(account => account.id === emergencyFund.bank_account_id);
    };
    
    const calculateResilienceScore = () => {
        if (!emergencyFund) return 0;
        
        // Base score on percentage of target
        let score = (emergencyFund.current_amount / emergencyFund.target_amount) * 100;
        
        // Adjust based on unplanned expense history
        const totalUnplannedExpenses = unplannedTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
        
        // If fund can cover historical unplanned expenses, boost score
        if (emergencyFund.current_amount > totalUnplannedExpenses) {
            score += 20;
        }
        
        // Cap at 100
        return Math.min(100, score);
    };
    
    const totalUnplannedExpenses = unplannedTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
        
    const totalUnplannedIncome = unplannedTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    const unplannedExpenseCount = unplannedTransactions
        .filter(tx => tx.type === 'expense')
        .length;
        
    const unplannedIncomeCount = unplannedTransactions
        .filter(tx => tx.type === 'income')
        .length;
    
    // Simple Dialog component
    const SimpleDialog = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;
        
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
                    <div className="bg-gray-900 rounded-lg shadow-lg w-full max-w-lg relative z-10 border border-gray-700">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white">{title}</h2>
                            <button 
                                className="text-gray-400 hover:text-gray-200" 
                                onClick={onClose}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Unplanned Transactions</h1>
                    <p className="text-gray-400">Track unexpected income, expenses and your emergency fund</p>
                </div>
                
                {emergencyFund && (
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsWithdrawalFormOpen(true)}
                            className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                        >
                            <ArrowUpRight className="w-4 h-4 mr-2" />
                            Withdraw
                        </Button>
                        <Button 
                            onClick={() => setIsContributionFormOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowDownRight className="w-4 h-4 mr-2" />
                            Contribute
                        </Button>
                    </div>
                )}
            </div>
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="transactions">History</TabsTrigger>
                    <TabsTrigger value="unplanned">Unplanned</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="resilience">Emergency Fund</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                    {emergencyFund ? (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <CardDescription>Emergency Fund Balance</CardDescription>
                                        <CardTitle className="text-2xl">
                                            {emergencyFund.currency} {emergencyFund.current_amount.toFixed(2)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-gray-400">
                                            {getEmergencyFundProgress().toFixed(0)}% of target
                                        </div>
                                        <Progress 
                                            value={getEmergencyFundProgress()} 
                                            className="h-2 mt-2"
                                        />
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <CardDescription>Target Amount</CardDescription>
                                        <CardTitle className="text-2xl">
                                            {emergencyFund.currency} {emergencyFund.target_amount.toFixed(2)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-gray-400 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {emergencyFund.target_months} months of expenses
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <CardDescription>Unplanned Expenses</CardDescription>
                                        <CardTitle className="text-xl text-red-400">
                                            {unplannedTransactions.length > 0 && unplannedTransactions[0].currency} {totalUnplannedExpenses.toFixed(2)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-gray-400 flex items-center">
                                            <TrendingDown className="w-3 h-3 mr-1 text-red-400" />
                                            {unplannedExpenseCount} unplanned expenses tracked
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <CardDescription>Unplanned Income</CardDescription>
                                        <CardTitle className="text-xl text-green-400">
                                            {unplannedTransactions.length > 0 && unplannedTransactions[0].currency} {totalUnplannedIncome.toFixed(2)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-gray-400 flex items-center">
                                            <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
                                            {unplannedIncomeCount} unplanned income tracked
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Emergency Fund Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={getContributionsData()}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="amount" 
                                                        name="Contributions" 
                                                        stroke="#3b82f6" 
                                                        activeDot={{ r: 8 }} 
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Unplanned Transactions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={getUnplannedTransactionsData()}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="expenses" name="Unplanned Expenses" fill="#ef4444" />
                                                    <Bar dataKey="income" name="Unplanned Income" fill="#22c55e" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <div className="flex justify-end">
                                <Button 
                                    variant="outline" 
                                    className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
                                    onClick={() => setIsFormOpen(true)}
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Edit Emergency Fund
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle>Set Up Your Emergency Fund</CardTitle>
                                <CardDescription>
                                    An emergency fund is a financial safety net for unexpected expenses or financial hardships.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-900/20 border border-blue-800">
                                    <Shield className="w-10 h-10 text-blue-400" />
                                    <div>
                                        <h3 className="font-medium text-blue-400">Financial Security</h3>
                                        <p className="text-sm text-blue-300">
                                            Most financial experts recommend saving 3-6 months of essential expenses in your emergency fund.
                                        </p>
                                    </div>
                                </div>
                                
                                <Button onClick={() => setIsFormOpen(true)} className="w-full">
                                    Set Up Emergency Fund
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                
                <TabsContent value="transactions" className="space-y-4">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Transaction History</CardTitle>
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
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-2 text-gray-200">Contributions</h3>
                                    {emergencyFund && emergencyFund.contributions && emergencyFund.contributions.length > 0 ? (
                                        <div className="rounded-lg border border-gray-700 overflow-hidden">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-900">
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Date</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                    {emergencyFund.contributions.map((contribution, index) => (
                                                        <tr key={index} className="bg-gray-800 hover:bg-gray-700">
                                                            <td className="px-4 py-2 text-sm text-gray-300">
                                                                {format(new Date(contribution.date), 'MMM d, yyyy')}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-green-400">
                                                                +{emergencyFund.currency} {contribution.amount.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-center py-4">No contributions yet</p>
                                    )}
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-medium mb-2 text-gray-200">Withdrawals</h3>
                                    {emergencyFund && emergencyFund.withdrawals && emergencyFund.withdrawals.length > 0 ? (
                                        <div className="rounded-lg border border-gray-700 overflow-hidden">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-900">
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Date</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Amount</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                    {emergencyFund.withdrawals.map((withdrawal, index) => (
                                                        <tr key={index} className="bg-gray-800 hover:bg-gray-700">
                                                            <td className="px-4 py-2 text-sm text-gray-300">
                                                                {format(new Date(withdrawal.date), 'MMM d, yyyy')}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-red-400">
                                                                -{emergencyFund.currency} {withdrawal.amount.toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-300">
                                                                {withdrawal.reason}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-center py-4">No withdrawals yet</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="unplanned" className="space-y-4">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Unplanned Transactions</CardTitle>
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
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-2 text-green-400">Unplanned Income</h3>
                                    {unplannedTransactions.filter(tx => tx.type === 'income').length > 0 ? (
                                        <div className="rounded-lg border border-gray-700 overflow-hidden">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-900">
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Date</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Amount</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Category</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                    {unplannedTransactions
                                                        .filter(tx => tx.type === 'income')
                                                        .map((tx, index) => (
                                                        <tr key={index} className="bg-gray-800 hover:bg-gray-700">
                                                            <td className="px-4 py-2 text-sm text-gray-300">
                                                                {format(new Date(tx.date), 'MMM d, yyyy')}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-green-400">
                                                                +{tx.currency} {tx.amount.toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-300">
                                                                {tx.unplanned_category || 'Uncategorized'}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-300">
                                                                {tx.description}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-center py-4">No unplanned income recorded yet</p>
                                    )}
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-medium mb-2 text-red-400">Unplanned Expenses</h3>
                                    {unplannedTransactions.filter(tx => tx.type === 'expense').length > 0 ? (
                                        <div className="rounded-lg border border-gray-700 overflow-hidden">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-900">
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Date</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Amount</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Category</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                    {unplannedTransactions
                                                        .filter(tx => tx.type === 'expense')
                                                        .map((tx, index) => (
                                                        <tr key={index} className="bg-gray-800 hover:bg-gray-700">
                                                            <td className="px-4 py-2 text-sm text-gray-300">
                                                                {format(new Date(tx.date), 'MMM d, yyyy')}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-red-400">
                                                                -{tx.currency} {tx.amount.toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-300">
                                                                {tx.unplanned_category || 'Uncategorized'}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-300">
                                                                {tx.description}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-center py-4">No unplanned expenses recorded yet</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="analysis">
                    <UnplannedExpenseAnalysis transactions={unplannedTransactions} />
                </TabsContent>
                
                <TabsContent value="resilience">
                    <EmergencyFundResilience 
                        emergencyFund={emergencyFund} 
                        unplannedTransactions={unplannedTransactions} 
                        resilienceScore={calculateResilienceScore()}
                    />
                </TabsContent>
            </Tabs>
            
            {/* Dialogs */}
            <SimpleDialog 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)}
                title={emergencyFund ? "Edit Emergency Fund" : "Create Emergency Fund"}
            >
                <EmergencyFundForm 
                    emergencyFund={emergencyFund}
                    accounts={accounts}
                    onSave={handleFormSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            </SimpleDialog>
            
            <SimpleDialog 
                isOpen={isContributionFormOpen} 
                onClose={() => setIsContributionFormOpen(false)}
                title="Contribute to Emergency Fund"
            >
                <EmergencyFundContributionForm 
                    accounts={accounts}
                    currency={emergencyFund?.currency}
                    onSave={handleContributionSave}
                    onCancel={() => setIsContributionFormOpen(false)}
                />
            </SimpleDialog>
            
            <SimpleDialog 
                isOpen={isWithdrawalFormOpen} 
                onClose={() => setIsWithdrawalFormOpen(false)}
                title="Withdraw from Emergency Fund"
            >
                <EmergencyFundWithdrawalForm 
                    accounts={accounts}
                    currency={emergencyFund?.currency}
                    maxAmount={emergencyFund?.current_amount || 0}
                    onSave={handleWithdrawalSave}
                    onCancel={() => setIsWithdrawalFormOpen(false)}
                />
            </SimpleDialog>
        </div>
    );
}
