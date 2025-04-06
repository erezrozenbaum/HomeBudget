
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Home, Car, Gem, PiggyBank, Wallet, CreditCard, Landmark } from "lucide-react";

export default function NetWorthBreakdown({
  accounts,
  investments,
  assets,
  creditCards,
  loans,
  currency = 'ILS',
  exchangeRates,
  convertAmount
}) {
  // Calculate totals with currency conversion
  const bankAccountsTotal = accounts.reduce((sum, account) => {
    return sum + convertAmount(account.current_balance || 0, account.currency);
  }, 0);

  const investmentsTotal = investments.reduce((sum, inv) => {
    const amount = inv.current_amount !== undefined ? inv.current_amount : inv.initial_amount;
    return sum + convertAmount(amount || 0, inv.currency);
  }, 0);

  // Calculate assets by type
  const assetsByType = assets.reduce((acc, asset) => {
    const type = asset.type || 'other';
    const convertedAmount = convertAmount(asset.current_value || 0, asset.currency);
    acc[type] = (acc[type] || 0) + convertedAmount;
    return acc;
  }, {});

  const totalAssets = bankAccountsTotal + investmentsTotal + 
    Object.values(assetsByType).reduce((sum, value) => sum + value, 0);

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate percentages
  const calculatePercentage = (value) => {
    return totalAssets > 0 ? (value / totalAssets) * 100 : 0;
  };

  // Get asset type display name
  const getAssetTypeLabel = (type) => {
    const labels = {
      real_estate: 'Real Estate',
      vehicle: 'Vehicles',
      art: 'Art',
      jewelry: 'Jewelry',
      other: 'Other Assets'
    };
    return labels[type] || type;
  };

  // Get asset type icon
  const getAssetTypeIcon = (type) => {
    switch (type) {
      case 'real_estate':
        return <Home className="w-4 h-4 text-blue-600" />;
      case 'vehicle':
        return <Car className="w-4 h-4 text-green-600" />;
      case 'jewelry':
        return <Gem className="w-4 h-4 text-purple-600" />;
      default:
        return <Home className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Assets</h3>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Asset</TableHead>
              <TableHead className="text-gray-300">Amount</TableHead>
              <TableHead className="text-gray-300 w-[100px]">% of Assets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankAccountsTotal > 0 && (
              <TableRow className="border-gray-700">
                <TableCell className="font-medium text-gray-200">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-400" />
                    Bank Accounts
                  </div>
                </TableCell>
                <TableCell className="text-gray-200">{formatCurrency(bankAccountsTotal)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={calculatePercentage(bankAccountsTotal)} className="h-2" />
                    <span className="text-xs text-gray-300">{calculatePercentage(bankAccountsTotal).toFixed(1)}%</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            
            {investmentsTotal > 0 && (
              <TableRow className="border-gray-700">
                <TableCell className="font-medium text-gray-200">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-purple-600" />
                    Investments
                  </div>
                </TableCell>
                <TableCell className="text-gray-200">{formatCurrency(investmentsTotal)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={calculatePercentage(investmentsTotal)} className="h-2" />
                    <span className="text-xs text-gray-300">{calculatePercentage(investmentsTotal).toFixed(1)}%</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            
            {Object.entries(assetsByType).map(([type, value]) => (
              <TableRow key={type} className="border-gray-700">
                <TableCell className="font-medium text-gray-200">
                  <div className="flex items-center gap-2">
                    {getAssetTypeIcon(type)}
                    {getAssetTypeLabel(type)}
                  </div>
                </TableCell>
                <TableCell className="text-gray-200">{formatCurrency(value)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={calculatePercentage(value)} className="h-2" />
                    <span className="text-xs text-gray-300">{calculatePercentage(value).toFixed(1)}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            <TableRow className="font-bold border-gray-700">
              <TableCell className="text-gray-200">Total Assets</TableCell>
              <TableCell className="text-gray-200">{formatCurrency(totalAssets)}</TableCell>
              <TableCell className="text-gray-200">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {(creditCards.length > 0 || loans.length > 0) && (
        <div>
          <h3 className="text-lg font-medium mb-4">Liabilities</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Liability</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[100px]">% of Liabilities</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Credit card liabilities */}
              {/* Loan liabilities */}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
