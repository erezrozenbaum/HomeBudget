import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function EmergencyFundResilience({ emergencyFund, unplannedTransactions, resilienceScore }) {
    if (!emergencyFund) {
        return (
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle>Emergency Fund Resilience</CardTitle>
                    <CardDescription>
                        Set up your emergency fund to see resilience metrics
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-900/20 border border-blue-800">
                        <Shield className="w-10 h-10 text-blue-400" />
                        <div>
                            <h3 className="font-medium text-blue-400">Financial Security</h3>
                            <p className="text-sm text-blue-300">
                                An emergency fund provides financial security and helps you handle unexpected expenses without going into debt.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    // Calculate some metrics
    const fundToExpensesRatio = unplannedTransactions.filter(tx => tx.type === 'expense').length > 0
        ? emergencyFund.current_amount / unplannedTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0)
        : 1; // If no expenses, ratio is good
    
    const avgExpenseAmount = unplannedTransactions.filter(tx => tx.type === 'expense').length > 0
        ? unplannedTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0) / 
            unplannedTransactions.filter(tx => tx.type === 'expense').length
        : 0;
    
    const numExpensesCovered = avgExpenseAmount > 0 
        ? Math.floor(emergencyFund.current_amount / avgExpenseAmount)
        : 0;
    
    // Determine resilience level based on score
    const getResilienceLevel = () => {
        if (resilienceScore >= 80) return 'Excellent';
        if (resilienceScore >= 60) return 'Good';
        if (resilienceScore >= 40) return 'Fair';
        if (resilienceScore >= 20) return 'Needs Improvement';
        return 'Low';
    };
    
    const getResilienceColor = () => {
        if (resilienceScore >= 80) return 'text-green-400';
        if (resilienceScore >= 60) return 'text-blue-400';
        if (resilienceScore >= 40) return 'text-yellow-400';
        if (resilienceScore >= 20) return 'text-orange-400';
        return 'text-red-400';
    };
    
    const getResilienceIcon = () => {
        if (resilienceScore >= 60) return <CheckCircle className="w-6 h-6 text-green-400" />;
        if (resilienceScore >= 30) return <Shield className="w-6 h-6 text-yellow-400" />;
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
    };
    
    const getRecommendation = () => {
        if (resilienceScore >= 80) {
            return "Your emergency fund is in excellent shape! Continue to maintain this level and consider automating regular contributions.";
        }
        if (resilienceScore >= 60) {
            return "Your emergency fund is good, but could be strengthened further. Try to increase your contributions slightly.";
        }
        if (resilienceScore >= 40) {
            return "Your emergency fund provides some protection, but consider increasing your contributions to improve your financial security.";
        }
        if (resilienceScore >= 20) {
            return "Your emergency fund needs improvement. Try to increase your contributions and reduce unplanned expenses where possible.";
        }
        return "Your emergency fund needs significant attention. Consider making this a financial priority to build your safety net.";
    };
    
    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle>Emergency Fund Resilience</CardTitle>
                <CardDescription>
                    How well your emergency fund can handle financial surprises
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative h-40 w-40 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="h-full w-full">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#2d3748"
                                strokeWidth="10"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={resilienceScore >= 80 ? '#22c55e' : resilienceScore >= 60 ? '#3b82f6' : resilienceScore >= 40 ? '#eab308' : resilienceScore >= 20 ? '#f97316' : '#ef4444'}
                                strokeWidth="10"
                                strokeDasharray="282.7"
                                strokeDashoffset={282.7 - (resilienceScore / 100) * 282.7}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-bold ${getResilienceColor()}`}>
                                {Math.round(resilienceScore)}
                            </span>
                            <span className="text-xs text-gray-400">out of 100</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2">
                            {getResilienceIcon()}
                            <h3 className={`text-xl font-medium ${getResilienceColor()}`}>
                                {getResilienceLevel()} Resilience
                            </h3>
                        </div>
                        
                        <p className="text-gray-300">
                            {getRecommendation()}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-900 p-3 rounded-lg">
                                <div className="text-sm text-gray-400">Months Covered</div>
                                <div className="text-xl font-semibold">
                                    {(emergencyFund.current_amount / (emergencyFund.target_amount / emergencyFund.target_months)).toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    of {emergencyFund.target_months} month target
                                </div>
                            </div>
                            
                            <div className="bg-gray-900 p-3 rounded-lg">
                                <div className="text-sm text-gray-400">Unexpected Expenses Coverage</div>
                                <div className="text-xl font-semibold">
                                    {numExpensesCovered}
                                </div>
                                <div className="text-xs text-gray-500">
                                    average unplanned expenses
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <h3 className="font-medium text-gray-300">Resilience Factors</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-400">Fund Progress</span>
                                <span className="text-sm text-gray-400">
                                    {Math.min(100, (emergencyFund.current_amount / emergencyFund.target_amount * 100)).toFixed(0)}%
                                </span>
                            </div>
                            <Progress 
                                value={Math.min(100, (emergencyFund.current_amount / emergencyFund.target_amount * 100))} 
                                className="h-2"
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-400">Historical Expense Coverage</span>
                                <span className="text-sm text-gray-400">
                                    {Math.min(100, fundToExpensesRatio * 100).toFixed(0)}%
                                </span>
                            </div>
                            <Progress 
                                value={Math.min(100, fundToExpensesRatio * 100)} 
                                className="h-2"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-300 mb-2">Recommendations</h3>
                    <ul className="space-y-2 text-gray-400">
                        {resilienceScore < 80 && (
                            <li className="flex items-start gap-2">
                                <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>
                                    Aim to contribute {emergencyFund.currency} {((emergencyFund.target_amount - emergencyFund.current_amount) / 6).toFixed(2)} monthly for the next 6 months to reach your target.
                                </span>
                            </li>
                        )}
                        
                        {avgExpenseAmount > 0 && numExpensesCovered < 3 && (
                            <li className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span>
                                    Your fund currently covers only {numExpensesCovered} average unplanned expenses. Try to build it up to cover at least 3-5.
                                </span>
                            </li>
                        )}
                        
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>
                                Keep your emergency fund in an easily accessible account, but consider a high-yield savings account to earn interest.
                            </span>
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}