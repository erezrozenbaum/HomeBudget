
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { Target, Calendar, Pencil, Trash2, Link, TrendingUp, AlertTriangle, Star, Clock, Building2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PRIORITY_COLORS = {
  high: { bg: "bg-red-500", text: "text-red-500" },
  medium: { bg: "bg-yellow-500", text: "text-yellow-500" },
  low: { bg: "bg-blue-500", text: "text-blue-500" }
};

const STATUS_BADGES = {
  active: { variant: "default", label: "Active" },
  on_hold: { variant: "secondary", label: "On Hold" },
  completed: { variant: "success", label: "Completed" }
};

const CATEGORY_ICONS = {
  retirement: PiggyBank,
  education: BookOpen,
  housing: Home,
  travel: Plane,
  emergency: Shield,
  other: Target
};

// Importing icons
import { PiggyBank, BookOpen, Home, Plane, Shield } from "lucide-react";

export default function GoalCard({ goal, linkedInvestment, defaultCurrency, convertAmount, onEdit, onDelete }) {
  const convertToCurrency = (amount, fromCurrency) => {
    if (!amount || fromCurrency === defaultCurrency) return amount;
    if (!exchangeRates || !exchangeRates[fromCurrency]) {
      console.warn(`No exchange rate found for ${fromCurrency}, using 1:1 rate`);
      return amount;
    }
    return parseFloat((amount / exchangeRates[fromCurrency]).toFixed(2));
  };

  const formatAmount = (amount, currency) => {
    if (!amount) return '0';
    
    const originalFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || defaultCurrency
    }).format(amount);

    if (currency === defaultCurrency) {
      return originalFormatted;
    }

    const convertedAmount = convertToCurrency(amount, currency);
    const convertedFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: defaultCurrency
    }).format(convertedAmount);

    return `${originalFormatted} (${convertedFormatted})`;
  };

    // Calculate current amount based on initial + growth
    const currentAmount = goal.current_amount || 0;
    const progress = goal.target_amount ? (currentAmount / goal.target_amount) * 100 : 0;
    
    // Handle case where target date is in the past
    const now = new Date();
    const targetDate = new Date(goal.target_date);
    const daysLeft = differenceInDays(targetDate, now);
    const isPastDue = daysLeft < 0;
    
    // Get category icon
    const CategoryIcon = CATEGORY_ICONS[goal.category] || Target;
    
    // Calculate monthly contribution needed
    const monthsLeft = Math.max(1, Math.floor(daysLeft / 30));
    const amountLeft = goal.target_amount - currentAmount;
    const monthlyNeeded = amountLeft / monthsLeft;
    
    // Check if on track
    const isOnTrack = goal.monthly_contribution >= monthlyNeeded;

    const calculateRequiredMonthlySaving = () => {
      return amountLeft / monthsLeft;
    }

  const exchangeRates = {};

  return (
    <Card className="overflow-hidden border-gray-700 bg-gray-800 hover:shadow-lg transition-shadow">
      <div 
        className="h-2"
        style={{ backgroundColor: goal.color || '#3b82f6' }}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div 
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: `${goal.color || '#3b82f6'}20`, 
              color: goal.color || '#3b82f6' 
            }}
          >
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{goal.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={STATUS_BADGES[goal.status].variant}>
                {STATUS_BADGES[goal.status].label}
              </Badge>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center ${PRIORITY_COLORS[goal.priority].text}`}>
                      <Star className="w-3 h-3 mr-1" fill="currentColor" />
                      <span className="text-xs capitalize">{goal.priority}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{goal.priority} priority goal</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {linkedInvestment && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-blue-400 flex items-center">
                        <Link className="w-3 h-3 mr-1" />
                        <span className="text-xs">Linked</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Linked to: {linkedInvestment.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {goal.is_business_goal && goal.business_id && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-blue-400 flex items-center">
                        <Building2 className="w-3 h-3 mr-1" />
                        <span className="text-xs">Business Goal</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Business goal</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} className="text-gray-400 hover:text-white h-8 w-8">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-gray-400 hover:text-white h-8 w-8">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {goal.description && (
          <p className="text-sm text-gray-400">
            {goal.description}
          </p>
        )}
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-medium text-white">{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-gray-700"
            style={{
              "--progress-background": goal.color || '#3b82f6'
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Current</p>
            <p className="font-bold text-white">
              {formatAmount(currentAmount, goal.currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Target</p>
            <p className="font-bold text-white">
              {formatAmount(goal.target_amount, goal.currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          {isPastDue ? (
            <span className="text-red-400">
              Target date passed ({format(targetDate, 'MMM d, yyyy')})
            </span>
          ) : (
            <>
              <span className="text-white">{daysLeft} days left</span>
              <span className="text-gray-400">
                (until {format(targetDate, 'MMM d, yyyy')})
              </span>
            </>
          )}
        </div>

        {!linkedInvestment && goal.monthly_contribution > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">
              Saving {formatAmount(goal.monthly_contribution, goal.currency)} monthly
            </span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-gray-700 p-4 bg-gray-800/50">
        {!isPastDue && goal.status === 'active' && !linkedInvestment && (
          <div className="w-full flex items-center gap-2">
            <div className={`p-1 rounded-full ${isOnTrack ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
              {isOnTrack ? (
                <Clock className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="text-xs flex-1">
              {isOnTrack ? (
                <span className="text-green-400">
                  On track to meet your goal by the target date
                </span>
              ) : (
                <span className="text-yellow-400">
                  Need to save {formatAmount(monthlyNeeded, goal.currency)} monthly to reach your goal
                </span>
              )}
            </div>
          </div>
        )}
        
        {linkedInvestment && (
          <div className="w-full text-xs text-gray-400">
            Tracking progress through: {linkedInvestment.name}
          </div>
        )}
        
        {goal.status === 'completed' && (
          <div className="w-full flex items-center gap-2">
            <div className="p-1 rounded-full bg-green-500/20">
              <Target className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-xs text-green-400">
              Goal completed! Congratulations!
            </div>
          </div>
        )}
        
        {goal.status === 'on_hold' && (
          <div className="w-full flex items-center gap-2">
            <div className="p-1 rounded-full bg-gray-500/20">
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xs text-gray-400">
              This goal is currently on hold
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
