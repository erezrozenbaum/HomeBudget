import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function MonthlyTrends({ 
  data, 
  defaultCurrency, 
  getCurrencySymbol 
}) {
  const currencySymbol = getCurrencySymbol(defaultCurrency);
  
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-background border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color }}>
              {item.name}: {currencySymbol}{item.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Financial Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#22c55e" 
                name="Income" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                name="Expenses" 
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                name="Balance" 
                strokeDasharray="5 5" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}