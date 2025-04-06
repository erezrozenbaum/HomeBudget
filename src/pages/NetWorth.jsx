
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus,
  Home,
  Wallet,
  CreditCard,
  Landmark,
  BarChart3,
  PiggyBank
} from "lucide-react";
import { BankAccount } from '@/api/entities';
import { CreditCard as CreditCardEntity } from '@/api/entities';
import { Investment } from '@/api/entities';
import { Loan } from '@/api/entities';
import { Asset } from '@/api/entities';
import NetWorthChart from '../components/assets/NetWorthChart';
import NetWorthBreakdown from '../components/assets/NetWorthBreakdown';
import AssetCard from '../components/assets/AssetCard';
import AssetForm from '../components/assets/AssetForm';
import { UserSettings } from '@/api/entities';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className }) => (
  <div className={`bg-[#1e1f2d] rounded-lg shadow-lg w-full ${className || ''}`}>
    {children}
  </div>
);

const DialogHeader = ({ children, className }) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0 ${className || ''}`}
  >
    {children}
  </div>
);

const DialogTitle = ({ children, className }) => (
  <div
    className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}
  >
    {children}
  </div>
);

const DialogClose = ({ onClick, children, className }) => (
  <button
    className={`absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 ${className || ''}`}
    onClick={onClick}
  >
    {children || <Plus className="h-4 w-4 rotate-45" />}
  </button>
);

export default function NetWorth() {
  const [accounts, setAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState({ default_currency: 'ILS' });
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [timeframe, setTimeframe] = useState('1y');

  const exchangeRates = {
    'USD': 3.6,
    'EUR': 4.0,
    'GBP': 4.5,
    'ILS': 1,
  };

  const convertAmount = (amount, fromCurrency) => {
    if (!amount || !fromCurrency) return 0;
    if (fromCurrency === userSettings.default_currency) return amount;
    const rate = exchangeRates[fromCurrency] || 1;
    return amount * rate;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsData, cardsData, investmentsData, loansData, assetsData, settingsData] = await Promise.all([
        BankAccount.list(),
        CreditCardEntity.list(),
        Investment.list(),
        Loan.list(),
        Asset.list(),
        UserSettings.list()
      ]);
      
      setAccounts(accountsData);
      setCreditCards(cardsData);
      setInvestments(investmentsData);
      setLoans(loansData);
      setAssets(assetsData);
      
      // Get user settings for default currency
      if (settingsData.length > 0) {
        setUserSettings(settingsData[0]);
      }
      
      // Generate mock historical net worth data
      generateHistoricalNetWorth(accountsData, cardsData, investmentsData, loansData, assetsData);
    } catch (error) {
      console.error('Error loading net worth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (assetData) => {
    try {
      if (editingAsset) {
        await Asset.update(editingAsset.id, assetData);
      } else {
        await Asset.create(assetData);
      }
      setIsFormOpen(false);
      setEditingAsset(null);
      loadData();
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  const handleDelete = async (assetId) => {
    try {
      await Asset.delete(assetId);
      loadData();
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const generateHistoricalNetWorth = (accounts, cards, investments, loans, assets) => {
    const today = new Date();
    const data = [];
    
    // Generate data points for the last 12 months
    for (let i = 12; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      // Calculate total assets
      const totalAssets = accounts.reduce((sum, account) => 
        sum + convertAmount(account.current_balance || 0, account.currency), 0
      ) +
      investments.reduce((sum, inv) => 
        sum + convertAmount(inv.current_amount || inv.initial_amount || 0, inv.currency), 0
      ) +
      assets.reduce((sum, asset) => 
        sum + convertAmount(asset.current_value || 0, asset.currency), 0
      );

      // Calculate total liabilities
      const totalLiabilities = cards.reduce((sum, card) => 
        sum + convertAmount(card.current_balance || 0, card.currency), 0
      ) +
      loans.reduce((sum, loan) => 
        sum + convertAmount(loan.current_balance || 0, loan.currency), 0
      );

      // Add some random variation for historical data
      const randomFactor = 0.85 + (Math.random() * 0.3); // Between 0.85 and 1.15
      const historicalAssets = totalAssets * randomFactor;
      const historicalLiabilities = totalLiabilities * randomFactor;
      
      data.push({
        date: date.toISOString().slice(0, 7), // YYYY-MM format
        netWorth: historicalAssets - historicalLiabilities,
        assets: historicalAssets,
        liabilities: historicalLiabilities
      });
    }
    
    setNetWorthHistory(data);
  };

  const calculateTotalAssets = () => {
    // Convert bank accounts to default currency
    const bankTotal = accounts.reduce((sum, account) => {
      const convertedAmount = convertAmount(account.current_balance || 0, account.currency);
      return sum + convertedAmount;
    }, 0);
    
    // Convert investments to default currency
    const investmentTotal = investments.reduce((sum, inv) => {
      const amount = inv.current_amount !== undefined ? inv.current_amount : inv.initial_amount;
      const convertedAmount = convertAmount(amount || 0, inv.currency);
      return sum + convertedAmount;
    }, 0);
    
    // Convert assets to default currency
    const assetTotal = assets.reduce((sum, asset) => {
      const convertedAmount = convertAmount(asset.current_value || 0, asset.currency);
      return sum + convertedAmount;
    }, 0);
    
    return bankTotal + investmentTotal + assetTotal;
  };

  const calculateTotalLiabilities = () => {
    const creditCardTotal = creditCards.reduce((sum, card) => {
      const convertedAmount = convertAmount(card.current_balance || 0, card.currency);
      return sum + convertedAmount;
    }, 0);
    
    const loanTotal = loans.reduce((sum, loan) => {
      const convertedAmount = convertAmount(loan.current_balance || 0, loan.currency);
      return sum + convertedAmount;
    }, 0);
    
    return creditCardTotal + loanTotal;
  };

  const calculateNetWorth = () => {
    return calculateTotalAssets() - calculateTotalLiabilities();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userSettings.default_currency || 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  console.log("Dialog open state:", isFormOpen); // Debug log

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Net Worth</h1>
          <p className="text-muted-foreground">Track your assets and liabilities</p>
        </div>
        
        <Button 
          onClick={() => {
            console.log("Add Asset button clicked");
            setEditingAsset(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gray-800/90 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-400">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-300">
              {formatCurrency(calculateTotalAssets())}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/90 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-400">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-300">
              {formatCurrency(calculateTotalLiabilities())}
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-gray-800/90 border-gray-700`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-lg ${calculateNetWorth() >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${calculateNetWorth() >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {formatCurrency(calculateNetWorth())}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="text-gray-100 data-[state=active]:bg-blue-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="assets" className="text-gray-100 data-[state=active]:bg-blue-600">
            <Home className="w-4 h-4 mr-2" />
            Assets
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          <div className="space-y-6">
            <Card className="bg-gray-800/90 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Net Worth History</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={netWorthHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                    <XAxis dataKey="date" stroke="#9ca3af"/>
                    <YAxis stroke="#9ca3af"/>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => [`${formatCurrency(value)}`, '']}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }}/>
                    <Line 
                      type="monotone" 
                      dataKey="assets" 
                      stroke="#22c55e" 
                      name="Assets"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="liabilities" 
                      stroke="#ef4444" 
                      name="Liabilities"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netWorth" 
                      stroke="#3b82f6" 
                      name="Net Worth"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <NetWorthBreakdown 
              accounts={accounts}
              investments={investments}
              assets={assets}
              creditCards={creditCards}
              loans={loans}
              currency={userSettings.default_currency || 'ILS'}
              exchangeRates={exchangeRates}
              convertAmount={convertAmount}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="assets" className="pt-4">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onEdit={() => {
                  setEditingAsset(asset);
                  setIsFormOpen(true);
                }}
                onDelete={() => handleDelete(asset.id)}
              />
            ))}
            
            {assets.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-6 text-center">
                  <Home className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    No assets yet. Click "Add Asset" to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {isFormOpen && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <AssetForm
              asset={editingAsset}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingAsset(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
