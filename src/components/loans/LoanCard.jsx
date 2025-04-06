import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { differenceInMonths, format } from "date-fns";
import { Landmark, PiggyBank, Pencil, Trash2, Calendar, Building2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LoanCard({ loan, account, onEdit, onDelete, isSelected, onSelect }) {
  // Format currency
  const formatCurrency = (value, currency = 'ILS') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!loan.initial_amount || !loan.current_balance) return 0;
    const paid = loan.initial_amount - loan.current_balance;
    return Math.min(100, Math.max(0, (paid / loan.initial_amount) * 100));
  };

  // Calculate remaining months
  const calculateRemainingMonths = () => {
    if (!loan.end_date) return null;
    const now = new Date();
    const endDate = new Date(loan.end_date);
    if (endDate <= now) return 0;
    return differenceInMonths(endDate, now);
  };

  // Get color for loan type
  const getLoanTypeColor = () => {
    const colors = {
      'mortgage': '#3b82f6', // blue
      'car': '#10b981', // green
      'personal': '#8b5cf6', // purple
      'student': '#f59e0b', // yellow
      'business': '#ef4444', // red
      'other': '#6b7280', // gray
    };
    return colors[loan.type] || colors.other;
  };

  const remainingMonths = calculateRemainingMonths();
  const progress = calculateProgress();

  return (
    <Card 
      className={`border-gray-700 bg-gray-800/90 hover:shadow-md transition-shadow overflow-hidden ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div 
        className="h-2"
        style={{ backgroundColor: getLoanTypeColor() }}
      />
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-start gap-2">
          <div 
            className="p-2 rounded-lg" 
            style={{ 
              backgroundColor: `${getLoanTypeColor()}30`, 
              color: getLoanTypeColor() 
            }}
          >
            {loan.type === 'business' ? (
              <Building2 className="w-5 h-5" />
            ) : (
              <Landmark className="w-5 h-5" />
            )}
          </div>
          <div>
            <CardTitle className="text-white text-lg">{loan.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={loan.status === 'active' ? 'default' : loan.status === 'paid_off' ? 'success' : 'destructive'}
                className="bg-opacity-80"
              >
                {loan.status === 'active' ? 'Active' : 
                 loan.status === 'paid_off' ? 'Paid Off' : 'Defaulted'}
              </Badge>
              <Badge variant="outline" className="capitalize text-gray-300 border-gray-600">
                {loan.type} Loan
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-gray-300 hover:text-white h-8 w-8">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-300 hover:text-white h-8 w-8">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loan.status === 'active' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Paid Off</span>
              <span className="text-sm font-medium text-white">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-gray-700"
              indicatorClassName="bg-blue-600"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-300">Original Amount</p>
            <p className="font-bold text-white">
              {formatCurrency(loan.initial_amount, loan.currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Current Balance</p>
            <p className="font-bold text-white">
              {formatCurrency(loan.current_balance, loan.currency)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-300">Interest Rate</p>
            <p className="font-medium text-white">{loan.interest_rate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Monthly Payment</p>
            <p className="font-medium text-white">
              {formatCurrency(loan.payment_amount, loan.currency)}
            </p>
          </div>
        </div>

        {remainingMonths !== null && loan.status === 'active' && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-300" />
            <span className="text-white">
              {remainingMonths} months remaining
              {loan.end_date && (
                <span className="text-gray-300 ml-1">
                  (until {format(new Date(loan.end_date), "MMM yyyy")})
                </span>
              )}
            </span>
          </div>
        )}
        
        {loan.is_business_loan && (
          <div className="mt-2">
            <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700">
              <Building2 className="w-3 h-3 mr-1" />
              Business Loan
            </Badge>
          </div>
        )}
      </CardContent>
      
      {account && (
        <CardFooter className="border-t border-gray-700 p-4 bg-gray-800/50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-gray-300 w-full">
                  <PiggyBank className="w-4 h-4" />
                  <span>Payments from: {account.name}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Payments are made from this account</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      )}
    </Card>
  );
}