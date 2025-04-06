
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AccountsList({ accounts = [], cards = [], defaultCurrency, getCurrencySymbol, t }) {
  // If t is not provided, use a simple fallback
  const translate = t || ((key) => key);
  
  const totalBankBalance = accounts.reduce((sum, account) => sum + (account.current_balance || 0), 0);
  const totalCreditBalance = cards.reduce((sum, card) => sum + (card.current_balance || 0), 0);
  
  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-white">{translate('yourAccounts')}</CardTitle>
        <div className="text-sm text-gray-400">
          {getCurrencySymbol(defaultCurrency)}{totalBankBalance.toLocaleString()}
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-0">
        <div className="space-y-1">
          {accounts.map(account => (
            <Link 
              key={account.id}
              to={createPageUrl('BankAccounts')}
              className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-2 h-10 rounded-full" 
                  style={{ backgroundColor: account.color || '#4f46e5' }}
                />
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-white">{account.name}</span>
                </div>
              </div>
              <div className="font-medium text-white">
                {account.currency} {account.current_balance?.toLocaleString()}
              </div>
            </Link>
          ))}

          {cards.length > 0 && (
            <div className="pt-2 mt-2 border-t border-gray-700">
              <div className="flex justify-between items-center py-1 text-sm text-gray-400">
                <span>Credit Cards</span>
              </div>
              
              {cards.map(card => {
                const linkedAccount = accounts.find(a => a.id === card.bank_account_id);
                return (
                  <Link 
                    key={card.id}
                    to={createPageUrl('CreditCards')}
                    className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-10 rounded-full" 
                        style={{ backgroundColor: card.color || '#ef4444' }}
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{card.name}</span>
                      </div>
                    </div>
                    {linkedAccount && (
                      <div className="font-medium text-white">
                        {linkedAccount.currency} {card.current_balance?.toLocaleString() || '0'}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {accounts.length === 0 && (
            <div className="py-4 text-center text-gray-400">
              No accounts found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
