
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, addMonths } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function AmortizationSchedule({ loan }) {
  const [schedule, setSchedule] = useState([]);
  const [additionalPayment, setAdditionalPayment] = useState(0);
  const [summaryData, setSummaryData] = useState({
    totalPayments: 0,
    totalInterest: 0,
    months: 0,
    yearsSaved: 0,
    interestSaved: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (loan) {
      calculateAmortizationSchedule();
    }
  }, [loan, additionalPayment]);

  const calculateAmortizationSchedule = () => {
    if (!loan.payment_amount || !loan.interest_rate || !loan.current_balance) {
      return;
    }

    const monthlyInterestRate = loan.interest_rate / 100 / 12;
    const monthlyPayment = loan.payment_amount;
    let balance = loan.current_balance;
    const schedule = [];
    let totalPayments = 0;
    let totalInterest = 0;
    let startDate = loan.start_date ? new Date(loan.start_date) : new Date();
    
    // Calculate original loan stats for comparison
    const originalSchedule = calculateOriginalSchedule(
      loan.current_balance, 
      monthlyInterestRate, 
      monthlyPayment
    );
    
    while (balance > 0) {
      const interestPayment = balance * monthlyInterestRate;
      let principalPayment = monthlyPayment - interestPayment;
      
      // Add additional payment to principal
      if (additionalPayment > 0) {
        principalPayment += additionalPayment;
      }
      
      // For the last payment
      if (principalPayment > balance) {
        principalPayment = balance;
      }
      
      const totalPayment = interestPayment + principalPayment;
      
      // Update running totals
      totalPayments += totalPayment;
      totalInterest += interestPayment;
      
      schedule.push({
        date: format(startDate, 'MMM yyyy'),
        payment: totalPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: balance - principalPayment
      });
      
      balance -= principalPayment;
      startDate = addMonths(startDate, 1);
      
      // Safety check
      if (schedule.length > 600) { // 50 years max
        break;
      }
    }
    
    setSchedule(schedule);
    
    // Set summary data
    setSummaryData({
      totalPayments,
      totalInterest,
      months: schedule.length,
      yearsSaved: (originalSchedule.months - schedule.length) / 12,
      interestSaved: originalSchedule.totalInterest - totalInterest
    });
    
    // Prepare chart data - group by year for better visualization
    const chartData = [];
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    let currentYear = '';
    
    schedule.forEach((month, index) => {
      const year = month.date.split(' ')[1]; // Extract year from "MMM yyyy"
      
      if (currentYear !== year) {
        if (currentYear !== '') {
          chartData.push({
            year: currentYear,
            principal: yearlyPrincipal,
            interest: yearlyInterest,
          });
        }
        currentYear = year;
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
      
      yearlyPrincipal += month.principal;
      yearlyInterest += month.interest;
      
      // Add the last year
      if (index === schedule.length - 1) {
        chartData.push({
          year: currentYear,
          principal: yearlyPrincipal,
          interest: yearlyInterest,
        });
      }
    });
    
    setChartData(chartData);
  };
  
  // Calculate original schedule stats for comparison when extra payments added
  const calculateOriginalSchedule = (balance, monthlyRate, payment) => {
    let remainingBalance = balance;
    let monthCount = 0;
    let totalInterest = 0;
    
    while (remainingBalance > 0) {
      const interestPayment = remainingBalance * monthlyRate;
      let principalPayment = payment - interestPayment;
      
      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }
      
      remainingBalance -= principalPayment;
      totalInterest += interestPayment;
      monthCount++;
      
      if (monthCount > 600) break; // Safety
    }
    
    return { months: monthCount, totalInterest };
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: loan?.currency || 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!loan) {
    return <p>Select a loan to view its amortization schedule.</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-700 bg-gray-800/90">
        <CardHeader>
          <CardTitle className="text-white">Amortization Schedule for {loan.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="additional-payment" className="text-gray-300">Additional Monthly Payment</Label>
                <Input
                  id="additional-payment"
                  type="number"
                  min="0"
                  step="10"
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(Number(e.target.value))}
                  placeholder="e.g. 100"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1 text-gray-300">Payoff Date</h4>
                <p className="text-lg font-semibold text-white">
                  {schedule.length > 0 ? 
                    schedule[schedule.length - 1].date : 
                    "Not available"}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1 text-gray-300">Total Interest</h4>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(summaryData.totalInterest)}
                </p>
              </div>
            </div>
            
            {additionalPayment > 0 && (
              <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-gray-300">Time Saved</h4>
                    <p className="text-lg font-semibold text-white">
                      {summaryData.yearsSaved.toFixed(1)} years
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-gray-300">Interest Saved</h4>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(summaryData.interestSaved)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-gray-300">New Payoff Time</h4>
                    <p className="text-lg font-semibold text-white">
                      {(summaryData.months / 12).toFixed(1)} years
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="h-80">
              <h4 className="text-sm font-medium mb-2 text-white">Yearly Payment Breakdown</h4>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis 
                    tickFormatter={(value) => (value === 0 ? 0 : `${(value / 1000).toFixed(0)}k`)}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(value)}`, '']}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="principal" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    name="Principal"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="interest" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    name="Interest"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 text-white">Monthly Breakdown</h4>
              <div className="border rounded-md border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Payment</TableHead>
                      <TableHead className="text-gray-300">Principal</TableHead>
                      <TableHead className="text-gray-300">Interest</TableHead>
                      <TableHead className="text-gray-300">Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.slice(0, 24).map((row, index) => (
                      <TableRow key={index} className="border-gray-700">
                        <TableCell className="text-gray-300">{row.date}</TableCell>
                        <TableCell className="text-gray-300">{formatCurrency(row.payment)}</TableCell>
                        <TableCell className="text-gray-300">{formatCurrency(row.principal)}</TableCell>
                        <TableCell className="text-gray-300">{formatCurrency(row.interest)}</TableCell>
                        <TableCell className="text-gray-300">{formatCurrency(row.balance)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {schedule.length > 24 && (
                      <TableRow className="border-gray-700">
                        <TableCell colSpan={5} className="text-center py-4">
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {schedule.length - 24} more payment periods...
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {schedule.length > 24 && (
                      <TableRow className="border-gray-700">
                        <TableCell className="text-gray-300">{schedule[schedule.length - 1].date}</TableCell>
                        <TableCell className="text-gray-300">{formatCurrency(schedule[schedule.length - 1].payment)}</TableCell>
                        <TableCell className="text-gray-300">{formatCurrency(schedule[schedule.length - 1].principal)}</TableCell>
                        <TableCell className="text-gray-300">{formatCurrency(schedule[schedule.length - 1].interest)}</TableCell>
                        <TableCell className="text-gray-300">{formatCurrency(0)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
