
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  addMonths, 
  addDays,
  format, 
  isBefore, 
  differenceInDays,
  compareDesc 
} from "date-fns";
import { 
  Shield, 
  Calendar, 
  AlertTriangle, 
  Check,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight
} from "lucide-react";

export default function InsuranceReminders({ insurances, accounts, assets, onEdit, currency = 'ILS' }) {
  const [reminders, setReminders] = useState([]);
  const [timeframe, setTimeframe] = useState('month');
  
  useEffect(() => {
    generateReminders();
  }, [insurances, timeframe]);
  
  const generateReminders = () => {
    const now = new Date();
    let futureDate;
    
    // Set the future date based on selected timeframe
    switch (timeframe) {
      case 'week':
        futureDate = addDays(now, 7);
        break;
      case 'month':
        futureDate = addMonths(now, 1);
        break;
      case 'quarter':
        futureDate = addMonths(now, 3);
        break;
      case 'year':
        futureDate = addMonths(now, 12);
        break;
      default:
        futureDate = addMonths(now, 1);
    }
    
    // Generate renewal reminders
    const renewalReminders = insurances
      .filter(insurance => insurance.renewal_date && insurance.status === 'active')
      .map(insurance => {
        const renewalDate = new Date(insurance.renewal_date);
        const daysDiff = differenceInDays(renewalDate, now);
        
        // Only include if renewal date is before future date and not in the past
        if (renewalDate <= futureDate && daysDiff >= -7) {
          const status = daysDiff < 0 ? 'overdue' : 
                        daysDiff <= 7 ? 'urgent' : 
                        daysDiff <= 30 ? 'upcoming' : 'future';
                        
          return {
            id: `renewal-${insurance.id}`,
            insurance,
            type: 'renewal',
            date: renewalDate,
            status,
            message: daysDiff < 0 ? 
              `Renewal overdue by ${Math.abs(daysDiff)} days` : 
              `Renews in ${daysDiff} days`
          };
        }
        return null;
      })
      .filter(Boolean);
    
    // Generate premium payment reminders
    const paymentReminders = insurances
      .filter(insurance => insurance.premium_frequency && insurance.status === 'active')
      .flatMap(insurance => {
        const nextPayments = [];
        let nextPaymentDate = getNextPaymentDate(insurance, now);
        
        // Generate next few payments within the timeframe
        while (nextPaymentDate <= futureDate) {
          const daysDiff = differenceInDays(nextPaymentDate, now);
          
          const status = daysDiff < 0 ? 'overdue' : 
                        daysDiff <= 7 ? 'urgent' : 
                        daysDiff <= 30 ? 'upcoming' : 'future';
          
          nextPayments.push({
            id: `payment-${insurance.id}-${nextPaymentDate.getTime()}`,
            insurance,
            type: 'payment',
            date: new Date(nextPaymentDate),
            status,
            message: daysDiff < 0 ? 
              `Payment overdue by ${Math.abs(daysDiff)} days` : 
              `Payment due in ${daysDiff} days`,
            amount: insurance.premium_amount
          });
          
          // Get the next payment date
          nextPaymentDate = getNextPaymentAfter(insurance, nextPaymentDate);
        }
        
        return nextPayments;
      });
    
    // Combine and sort reminders by date
    const allReminders = [...renewalReminders, ...paymentReminders]
      .sort((a, b) => compareDesc(b.date, a.date));
    
    setReminders(allReminders);
  };
  
  const getNextPaymentDate = (insurance, fromDate) => {
    const startDate = new Date(insurance.start_date);
    if (startDate > fromDate) return startDate;
    
    let nextDate = new Date(startDate);
    
    // Find the next payment date based on frequency
    switch (insurance.premium_frequency) {
      case 'monthly':
        while (nextDate < fromDate) {
          nextDate = addMonths(nextDate, 1);
        }
        break;
      case 'quarterly':
        while (nextDate < fromDate) {
          nextDate = addMonths(nextDate, 3);
        }
        break;
      case 'semi-annually':
        while (nextDate < fromDate) {
          nextDate = addMonths(nextDate, 6);
        }
        break;
      case 'annually':
        while (nextDate < fromDate) {
          nextDate = addMonths(nextDate, 12);
        }
        break;
      default:
        while (nextDate < fromDate) {
          nextDate = addMonths(nextDate, 1);
        }
    }
    
    return nextDate;
  };
  
  const getNextPaymentAfter = (insurance, lastPaymentDate) => {
    switch (insurance.premium_frequency) {
      case 'monthly':
        return addMonths(lastPaymentDate, 1);
      case 'quarterly':
        return addMonths(lastPaymentDate, 3);
      case 'semi-annually':
        return addMonths(lastPaymentDate, 6);
      case 'annually':
        return addMonths(lastPaymentDate, 12);
      default:
        return addMonths(lastPaymentDate, 1);
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'upcoming':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'future':
        return <RefreshCw className="w-5 h-5 text-gray-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'future':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Show reminders for:</span>
          <div className="flex bg-secondary rounded-md">
            <Button 
              variant={timeframe === 'week' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setTimeframe('week')}
              className="rounded-r-none"
            >
              Week
            </Button>
            <Button 
              variant={timeframe === 'month' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setTimeframe('month')}
              className="rounded-none"
            >
              Month
            </Button>
            <Button 
              variant={timeframe === 'quarter' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setTimeframe('quarter')}
              className="rounded-none"
            >
              Quarter
            </Button>
            <Button 
              variant={timeframe === 'year' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setTimeframe('year')}
              className="rounded-l-none"
            >
              Year
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Check className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">
                No insurance reminders for the selected timeframe.
              </p>
            </CardContent>
          </Card>
        ) : (
          reminders.map(reminder => (
            <Card key={reminder.id} className={`border ${getStatusColor(reminder.status)}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="pt-1">
                      {getStatusIcon(reminder.status)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {reminder.insurance.name}
                        <Badge className="ml-2">
                          {reminder.type === 'renewal' ? 'Renewal' : 'Payment'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reminder.message}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {format(reminder.date, 'MMMM d, yyyy')}
                        </span>
                        
                        {reminder.type === 'payment' && (
                          <span className="text-sm font-semibold">
                            {formatCurrency(reminder.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" onClick={() => onEdit(reminder.insurance)}>
                    Manage
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
