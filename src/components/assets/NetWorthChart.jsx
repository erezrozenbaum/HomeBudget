import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function NetWorthChart({ data = [], currency = 'USD' }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-green-600">Assets: {formatCurrency(payload[0].payload.assets)}</p>
          <p className="text-red-600">Liabilities: {formatCurrency(payload[0].payload.liabilities)}</p>
          <p className="font-bold text-blue-600">Net Worth: {formatCurrency(payload[0].payload.netWorth)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              tickFormatter={formatCurrency}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="assets" 
              stroke="#22c55e" 
              name="Assets"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="liabilities" 
              stroke="#ef4444" 
              name="Liabilities"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="netWorth" 
              stroke="#3b82f6" 
              name="Net Worth"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No historical data available
        </div>
      )}
    </div>
  );
}