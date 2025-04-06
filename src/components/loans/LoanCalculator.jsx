import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { UserSettings } from '@/api/entities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [additionalPayment, setAdditionalPayment] = useState(0);
  const [calculationTab, setCalculationTab] = useState('monthly');
  
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [payoffTimeWithExtra, setPayoffTimeWithExtra] = useState(0);
  const [interestSaved, setInterestSaved] = useState(0);
  
  const [comparisonData, setComparisonData] = useState([]);
  
  // Currency state
  const [currency, setCurrency] = useState('ILS');
  const [availableCurrencies] = useState([
    { value: 'ILS', label: 'ILS - Israeli Shekel' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JPY', label: 'JPY - Japanese Yen' }
  ]);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const settings = await UserSettings.list();
      if (settings.length > 0) {
        setCurrency(settings[0].default_currency || 'ILS');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  // Calculate loan details
  useEffect(() => {
    // Calculate standard payment
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    // Monthly payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
    // Where P = payment, L = loan amount, c = monthly interest rate, n = number of payments
    const standard = loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    
    setMonthlyPayment(standard);
    
    // Calculate total payment and interest
    const totalStandardPayment = standard * numberOfPayments;
    const totalStandardInterest = totalStandardPayment - loanAmount;
    
    setTotalPayment(totalStandardPayment);
    setTotalInterest(totalStandardInterest);
    
    // Calculate with additional payment
    if (additionalPayment > 0) {
      let balance = loanAmount;
      let monthCount = 0;
      let totalPaid = 0;
      let totalInterestPaid = 0;
      
      while (balance > 0 && monthCount < 1200) { // 100 years max to prevent infinite loops
        monthCount++;
        const interestForMonth = balance * monthlyInterestRate;
        let principalForMonth = standard - interestForMonth;
        
        // Add the additional payment to the principal payment
        principalForMonth += additionalPayment;
        
        // Adjust for final payment
        if (principalForMonth > balance) {
          principalForMonth = balance;
        }
        
        balance -= principalForMonth;
        totalPaid += (principalForMonth + interestForMonth);
        totalInterestPaid += interestForMonth;
      }
      
      setPayoffTimeWithExtra(monthCount / 12); // Convert to years
      setInterestSaved(totalStandardInterest - totalInterestPaid);
      
      // Generate comparison data for chart
      const comparisonPoints = [];
      let originalLoan = { ...simulateLoan(loanAmount, monthlyInterestRate, standard, 0) };
      let acceleratedLoan = { ...simulateLoan(loanAmount, monthlyInterestRate, standard, additionalPayment) };
      
      // Create data points for every year
      for (let year = 0; year <= Math.ceil(loanTerm); year++) {
        const month = year * 12;
        comparisonPoints.push({
          year,
          originalBalance: month < originalLoan.balances.length ? originalLoan.balances[month] : 0,
          acceleratedBalance: month < acceleratedLoan.balances.length ? acceleratedLoan.balances[month] : 0,
        });
      }
      
      setComparisonData(comparisonPoints);
    } else {
      setPayoffTimeWithExtra(loanTerm);
      setInterestSaved(0);
      
      // Generate comparison data for standard loan only
      const comparisonPoints = [];
      let originalLoan = { ...simulateLoan(loanAmount, monthlyInterestRate, standard, 0) };
      
      // Create data points for every year
      for (let year = 0; year <= Math.ceil(loanTerm); year++) {
        const month = year * 12;
        comparisonPoints.push({
          year,
          originalBalance: month < originalLoan.balances.length ? originalLoan.balances[month] : 0,
          acceleratedBalance: month < originalLoan.balances.length ? originalLoan.balances[month] : 0,
        });
      }
      
      setComparisonData(comparisonPoints);
    }
  }, [loanAmount, interestRate, loanTerm, additionalPayment, currency]);
  
  // Helper function to simulate a loan
  const simulateLoan = (principal, monthlyRate, payment, additionalPayment) => {
    let balance = principal;
    let monthCount = 0;
    const balances = [balance];
    
    while (balance > 0 && monthCount < 1200) {
      monthCount++;
      const interestForMonth = balance * monthlyRate;
      let principalForMonth = payment - interestForMonth;
      
      // Add the additional payment
      principalForMonth += additionalPayment;
      
      // Adjust for final payment
      if (principalForMonth > balance) {
        principalForMonth = balance;
      }
      
      balance -= principalForMonth;
      balances.push(balance);
    }
    
    return {
      months: monthCount,
      balances
    };
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
      <Card className="border-gray-700 bg-gray-800/90">
        <CardHeader>
          <CardTitle className="text-white">Loan Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="loan-amount" className="text-gray-300">Loan Amount: {formatCurrency(loanAmount)}</Label>
                  <div className="flex items-center gap-4">
                    <Slider 
                      id="loan-amount"
                      min={1000}
                      max={1000000}
                      step={1000}
                      value={[loanAmount]}
                      onValueChange={(values) => setLoanAmount(values[0])}
                    />
                    <Input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-24 bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="interest-rate" className="text-gray-300">Interest Rate: {interestRate}%</Label>
                  <div className="flex items-center gap-4">
                    <Slider 
                      id="interest-rate"
                      min={0.1}
                      max={20}
                      step={0.1}
                      value={[interestRate]}
                      onValueChange={(values) => setInterestRate(values[0])}
                    />
                    <Input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-24 bg-gray-900 border-gray-700 text-white"
                      step={0.1}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="loan-term" className="text-gray-300">Loan Term: {loanTerm} years</Label>
                  <div className="flex items-center gap-4">
                    <Slider 
                      id="loan-term"
                      min={1}
                      max={50}
                      step={1}
                      value={[loanTerm]}
                      onValueChange={(values) => setLoanTerm(values[0])}
                    />
                    <Input
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-24 bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="additional-payment" className="text-gray-300">
                    Additional Monthly Payment: {formatCurrency(additionalPayment)}
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider 
                      id="additional-payment"
                      min={0}
                      max={2000}
                      step={10}
                      value={[additionalPayment]}
                      onValueChange={(values) => setAdditionalPayment(values[0])}
                    />
                    <Input
                      type="number"
                      value={additionalPayment}
                      onChange={(e) => setAdditionalPayment(Number(e.target.value))}
                      className="w-24 bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={setCurrency}
                  >
                    <SelectTrigger id="currency" className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {availableCurrencies.map(curr => (
                        <SelectItem key={curr.value} value={curr.value} className="text-white">
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Tabs value={calculationTab} onValueChange={setCalculationTab}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                  <TabsTrigger value="monthly" className="data-[state=active]:bg-blue-600">Monthly Payment</TabsTrigger>
                  <TabsTrigger value="comparison" className="data-[state=active]:bg-blue-600">Payment Comparison</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly" className="space-y-4">
                  <div className="bg-green-900/30 border border-green-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-300">Monthly Payment:</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(monthlyPayment)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-300">Loan Amount:</p>
                      <p className="text-lg font-medium text-white">{formatCurrency(loanAmount)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-300">Total Interest:</p>
                      <p className="text-lg font-medium text-white">{formatCurrency(totalInterest)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-300">Total Payment:</p>
                      <p className="text-lg font-medium text-white">{formatCurrency(totalPayment)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-300">Payoff Time:</p>
                      <p className="text-lg font-medium text-white">{loanTerm} years</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="comparison" className="space-y-4">
                  {additionalPayment > 0 ? (
                    <>
                      <div className="bg-blue-900/30 border border-blue-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-300">With Additional Payment:</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(monthlyPayment + additionalPayment)}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-300">Years Saved:</p>
                          <p className="text-lg font-medium text-white">{(loanTerm - payoffTimeWithExtra).toFixed(1)} years</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-300">Interest Saved:</p>
                          <p className="text-lg font-medium text-white">{formatCurrency(interestSaved)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-300">New Payoff Time:</p>
                          <p className="text-lg font-medium text-white">{payoffTimeWithExtra.toFixed(1)} years</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-300">Total Savings:</p>
                          <p className="text-lg font-medium text-white">
                            {formatCurrency((loanTerm - payoffTimeWithExtra) * 12 * monthlyPayment)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-gray-800 rounded-lg text-center">
                      <p className="text-gray-300">
                        Add an additional monthly payment to see the comparison
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2 text-white">Balance Over Time</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={comparisonData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tickFormatter={(value) => (value === 0 ? 0 : `${(value / 1000).toFixed(0)}k`)}
                        label={{ value: 'Balance', angle: -90, position: 'insideLeft' }} 
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        formatter={(value) => [`${formatCurrency(value)}`, '']}
                        labelFormatter={(year) => `Year ${year}`}
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="originalBalance" 
                        name="Standard" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                      />
                      {additionalPayment > 0 && (
                        <Line 
                          type="monotone" 
                          dataKey="acceleratedBalance" 
                          name="With Extra Payment" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}