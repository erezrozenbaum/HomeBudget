
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  Shield, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon
} from 'lucide-react';

export default function InsuranceAnalytics({ insurances, currency = 'ILS' }) {
  const [typeBreakdown, setTypeBreakdown] = useState([]);
  const [monthlyPremiums, setMonthlyPremiums] = useState([]);
  const [coverageBreakdown, setCoverageBreakdown] = useState([]);
  
  useEffect(() => {
    analyzeInsuranceData();
  }, [insurances]);
  
  const analyzeInsuranceData = () => {
    if (!insurances.length) return;
    
    // Generate type breakdown
    const typeData = {};
    insurances.forEach(insurance => {
      const type = insurance.type || 'other';
      typeData[type] = (typeData[type] || 0) + 1;
    });
    
    const typeBreakdownArray = Object.entries(typeData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
    
    setTypeBreakdown(typeBreakdownArray);
    
    // Generate monthly premium costs by type
    const premiumsByType = {};
    insurances.forEach(insurance => {
      if (!insurance.premium_amount) return;
      
      const type = insurance.type || 'other';
      const monthlyAmount = calculateMonthlyPremium(insurance);
      
      premiumsByType[type] = (premiumsByType[type] || 0) + monthlyAmount;
    });
    
    const monthlyPremiumsArray = Object.entries(premiumsByType).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value)
    }));
    
    setMonthlyPremiums(monthlyPremiumsArray);
    
    // Generate coverage breakdown
    const coverageByType = {};
    insurances.forEach(insurance => {
      if (!insurance.coverage_amount) return;
      
      const type = insurance.type || 'other';
      coverageByType[type] = (coverageByType[type] || 0) + insurance.coverage_amount;
    });
    
    const coverageBreakdownArray = Object.entries(coverageByType).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
    
    setCoverageBreakdown(coverageBreakdownArray);
  };
  
  const calculateMonthlyPremium = (insurance) => {
    if (!insurance.premium_amount) return 0;
    
    switch (insurance.premium_frequency) {
      case 'quarterly':
        return insurance.premium_amount / 3;
      case 'semi-annually':
        return insurance.premium_amount / 6;
      case 'annually':
        return insurance.premium_amount / 12;
      default: // monthly
        return insurance.premium_amount;
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
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="premiums">
        <TabsList>
          <TabsTrigger value="premiums">
            <BarChartIcon className="w-4 h-4 mr-2" />
            Monthly Premiums
          </TabsTrigger>
          <TabsTrigger value="types">
            <PieChartIcon className="w-4 h-4 mr-2" />
            Insurance Types
          </TabsTrigger>
          <TabsTrigger value="coverage">
            <Shield className="w-4 h-4 mr-2" />
            Coverage Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="premiums" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Premium Costs by Type</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {monthlyPremiums.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyPremiums}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => [formatCurrency(value), "Monthly Cost"]} />
                    <Legend />
                    <Bar dataKey="value" name="Monthly Premium" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No premium data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Premium Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Insurance Type</th>
                      <th className="text-right py-2">Monthly Cost</th>
                      <th className="text-right py-2">Annual Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyPremiums.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.name}</td>
                        <td className="text-right py-2">{formatCurrency(item.value)}</td>
                        <td className="text-right py-2">{formatCurrency(item.value * 12)}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="py-2">Total</td>
                      <td className="text-right py-2">
                        {formatCurrency(monthlyPremiums.reduce((sum, item) => sum + item.value, 0))}
                      </td>
                      <td className="text-right py-2">
                        {formatCurrency(monthlyPremiums.reduce((sum, item) => sum + item.value * 12, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Policy Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-muted-foreground">Total Policies</span>
                    <div className="text-2xl font-bold">{insurances.length}</div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Active Policies</span>
                    <div className="text-2xl font-bold">
                      {insurances.filter(i => i.status === 'active').length}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Auto-Renewing Policies</span>
                    <div className="text-2xl font-bold">
                      {insurances.filter(i => i.auto_renew).length}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Average Deductible</span>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        insurances
                          .filter(i => i.deductible)
                          .reduce((sum, i) => sum + i.deductible, 0) / 
                        insurances.filter(i => i.deductible).length || 0
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="types" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Policies by Type</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {typeBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Policies"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No insurance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="coverage" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Amount by Insurance Type</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {coverageBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={coverageBreakdown}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => [formatCurrency(value), "Coverage"]} />
                    <Legend />
                    <Bar dataKey="value" name="Coverage Amount" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No coverage data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Coverage Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Insurance Type</th>
                      <th className="text-right py-2">Coverage Amount</th>
                      <th className="text-right py-2">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverageBreakdown.map((item, index) => {
                      const totalCoverage = coverageBreakdown.reduce((sum, i) => sum + i.value, 0);
                      const percentage = totalCoverage ? (item.value / totalCoverage) * 100 : 0;
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="text-right py-2">{formatCurrency(item.value)}</td>
                          <td className="text-right py-2">{percentage.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                    <tr className="font-semibold">
                      <td className="py-2">Total</td>
                      <td className="text-right py-2">
                        {formatCurrency(coverageBreakdown.reduce((sum, item) => sum + item.value, 0))}
                      </td>
                      <td className="text-right py-2">100%</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Coverage-to-Premium Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Insurance Type</th>
                      <th className="text-right py-2">Annual Premium</th>
                      <th className="text-right py-2">Coverage Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverageBreakdown.map((item, index) => {
                      const premiumItem = monthlyPremiums.find(p => p.name === item.name);
                      const annualPremium = premiumItem ? premiumItem.value * 12 : 0;
                      const ratio = annualPremium ? (item.value / annualPremium).toFixed(1) : 'N/A';
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="text-right py-2">{formatCurrency(annualPremium)}</td>
                          <td className="text-right py-2">{ratio}x</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground mt-2">
                  Coverage Ratio = Coverage Amount ÷ Annual Premium
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
