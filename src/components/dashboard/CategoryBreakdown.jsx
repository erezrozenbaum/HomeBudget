import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, parseISO, getMonth, getYear } from 'date-fns';

const COLORS = [
  '#4f46e5', '#10b981', '#f97316', '#ef4444', '#06b6d4', 
  '#8b5cf6', '#ec4899', '#64748b', '#eab308', '#14b8a6'
];

export default function CategoryBreakdown({ 
  transactions, 
  defaultCurrency, 
  getCurrencySymbol,
  dateRange,
  analyticsView,
  selectedYear
}) {
  const [viewType, setViewType] = useState('expense');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={10}
      >
        {`${name}: ${currencySymbol}${value.toLocaleString()}`}
      </text>
    );
  };

  // Filter transactions based on analysis view
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      
      if (analyticsView === 'yearly') {
        // For yearly view, only show transactions from selected year
        return getYear(transactionDate) === selectedYear;
      } else {
        // For monthly view, use the date range
        return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const getCategoryDataByPeriod = () => {
    if (!filteredTransactions.length) return [];
    
    const periodData = {};
    
    filteredTransactions
      .filter(t => t.type === viewType)
      .forEach(t => {
        const date = parseISO(t.date);
        const periodKey = analyticsView === 'yearly' 
          ? format(date, 'MMM yyyy')  // Monthly breakdown for yearly view
          : format(date, 'MMM dd');   // Daily breakdown for monthly view
        
        const category = t.category || 'Uncategorized';
        
        if (!periodData[periodKey]) {
          periodData[periodKey] = {};
        }
        
        if (!periodData[periodKey][category]) {
          periodData[periodKey][category] = 0;
        }
        
        periodData[periodKey][category] += Number(t.amount) || 0;
      });
    
    return Object.entries(periodData).map(([period, categories]) => ({
      period,
      ...categories
    }));
  };

  const getSubcategoriesByPeriod = () => {
    if (!filteredTransactions.length || !selectedCategory) return [];
    
    const periodData = {};
    
    filteredTransactions
      .filter(t => t.type === viewType && t.category === selectedCategory)
      .forEach(t => {
        const date = parseISO(t.date);
        const periodKey = analyticsView === 'yearly' 
          ? format(date, 'MMM yyyy') 
          : format(date, 'MMM dd');
        
        const subcategory = t.subcategory || 'General';
        
        if (!periodData[periodKey]) {
          periodData[periodKey] = {};
        }
        
        if (!periodData[periodKey][subcategory]) {
          periodData[periodKey][subcategory] = 0;
        }
        
        periodData[periodKey][subcategory] += Number(t.amount) || 0;
      });
    
    return Object.entries(periodData).map(([period, subcategories]) => ({
      period,
      ...subcategories
    }));
  };

  const getTotalsByCategory = () => {
    const totals = {};
    
    filteredTransactions
      .filter(t => t.type === viewType)
      .forEach(t => {
        const category = t.category?.name || 'Uncategorized';
        if (!totals[category]) {
          totals[category] = {
            name: category,
            value: 0,
            subcategories: {}
          };
        }
        
        const subcategory = t.subcategory?.name || 'General';
        if (!totals[category].subcategories[subcategory]) {
          totals[category].subcategories[subcategory] = 0;
        }
        
        const amount = Number(t.amount) || 0;
        totals[category].value += amount;
        totals[category].subcategories[subcategory] += amount;
      });
    
    return Object.values(totals)
      .map(category => ({
        ...category,
        subcategories: Object.entries(category.subcategories)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      }))
      .sort((a, b) => b.value - a.value);
  };

  const categoryData = getTotalsByCategory();
  const periodCategoryData = getCategoryDataByPeriod();
  const periodSubcategoryData = getSubcategoriesByPeriod();
  
  const currencySymbol = getCurrencySymbol ? getCurrencySymbol(defaultCurrency) : '$';
  
  const renderTooltip = (props) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-sm">
          <p className="font-medium mb-1">{payload[0].payload.period || payload[0].payload.name}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {currencySymbol}{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* View Type Toggle */}
      <div className="flex justify-end">
        <Tabs value={viewType} className="w-[200px]">
          <TabsList>
            <TabsTrigger 
              value="expense" 
              onClick={() => {
                setViewType('expense');
                setSelectedCategory(null);
              }}
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="income" 
              onClick={() => {
                setViewType('income');
                setSelectedCategory(null);
              }}
            >
              Income
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Categories Overview</CardTitle>
          </CardHeader>
          <CardContent>
                <div className="h-[400px]">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          innerRadius={60}
                          outerRadius={120}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          onClick={(entry) => setSelectedCategory(entry.name)}
                          isAnimationActive={false}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              stroke={selectedCategory === entry.name ? '#fff' : 'none'}
                              strokeWidth={selectedCategory === entry.name ? 2 : 0}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={renderTooltip} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
          </CardContent>
        </Card>

        {/* Period Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>
              {analyticsView === 'yearly' ? 'Monthly' : 'Daily'} Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {periodCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={periodCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip content={renderTooltip} />
                    <Legend />
                    {categoryData.map((category, index) => (
                      <Bar
                        key={category.name}
                        dataKey={category.name}
                        stackId="a"
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subcategories Breakdown */}
        {selectedCategory && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Subcategories for {selectedCategory}</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
                  Clear Selection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData.find(c => c.name === selectedCategory)?.subcategories || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.find(c => c.name === selectedCategory)?.subcategories.map((entry, index) => (
                          <Cell key={`subcell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={renderTooltip} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={periodSubcategoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip content={renderTooltip} />
                      <Legend />
                      {categoryData
                        .find(c => c.name === selectedCategory)
                        ?.subcategories
                        .map((subcategory, index) => (
                          <Bar
                            key={subcategory.name}
                            dataKey={subcategory.name}
                            stackId="a"
                            fill={COLORS[(index + 5) % COLORS.length]}
                          />
                        ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
