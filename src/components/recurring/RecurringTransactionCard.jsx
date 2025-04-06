
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, CalendarDays, Building2, CreditCard as CreditCardIcon, Pencil, Trash2 } from "lucide-react";

export default function RecurringTransactionCard({ transaction, category, account, creditCard, onEdit, onDelete }) {
  const getFrequencyText = () => {
    if (transaction.recurring_frequency === 'custom') {
      const interval = transaction.recurring_interval || 1;
      const unit = transaction.recurring_unit || 'month';
      return `Every ${interval} ${unit}${interval > 1 ? 's' : ''}`;
    }
    
    // Handle standard frequencies
    switch (transaction.recurring_frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'bi-weekly': return 'Every 2 weeks';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'annually': return 'Yearly';
      default: return 'Monthly';
    }
  };

  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{transaction.name}</CardTitle>
          <div className={`flex items-center p-1 rounded-full ${
            transaction.type === "income" ? "bg-green-100" : "bg-red-100"
          }`}>
            {transaction.type === "income" ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {getFrequencyText()}
            </p>
            <span className={`text-lg font-bold ${
              transaction.type === "income" ? "text-green-600" : "text-red-600"
            }`}>
              {transaction.currency} {transaction.amount.toLocaleString()}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {transaction.category && (
              <Badge variant="outline">{transaction.category}</Badge>
            )}
            {account && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-100">
                <Building2 className="h-3 w-3 mr-1" /> {account.name}
              </Badge>
            )}
            {creditCard && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-100">
                <CreditCardIcon className="h-3 w-3 mr-1" /> {creditCard.name}
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {transaction.start_date && (
              <p>Started: {format(new Date(transaction.start_date), "MMM d, yyyy")}</p>
            )}
            {transaction.end_date && (
              <p>Ends: {format(new Date(transaction.end_date), "MMM d, yyyy")}</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
