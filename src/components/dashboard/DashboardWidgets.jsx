import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, X, Plus, GripVertical } from "lucide-react";
import { apiClient } from '@/api/client';
import CategoryBreakdown from './CategoryBreakdown';
import MonthlyTrends from './MonthlyTrends';
import AccountInvestments from './AccountInvestments';
import AccountsList from './AccountsList';
import AccountTransactions from './AccountTransactions';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Available widgets with their default settings
const availableWidgets = {
  categoryBreakdown: {
    id: 'categoryBreakdown',
    title: 'Category Breakdown',
    component: CategoryBreakdown,
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 3, h: 2 }
  },
  monthlyTrends: {
    id: 'monthlyTrends',
    title: 'Monthly Trends',
    component: MonthlyTrends,
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 3, h: 2 }
  },
  accountInvestments: {
    id: 'accountInvestments',
    title: 'Account Investments',
    component: AccountInvestments,
    defaultSize: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 2 }
  },
  accountsList: {
    id: 'accountsList',
    title: 'Accounts List',
    component: AccountsList,
    defaultSize: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 2 }
  },
  accountTransactions: {
    id: 'accountTransactions',
    title: 'Recent Transactions',
    component: AccountTransactions,
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 3, h: 2 }
  }
};

export default function DashboardWidgets() {
  const [widgets, setWidgets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [categories, setCategories] = useState([]);

  // Analytics states
  const [analyticsView, setAnalyticsView] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subMonths(new Date(), 2)),
    to: endOfMonth(new Date())
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current date range (last 3 months)
      const now = new Date();
      const startDate = startOfMonth(subMonths(now, 2));
      const endDate = endOfMonth(now);

      // Load all required data in parallel
      const [
        settingsData,
        transactionsResponse,
        accountsData,
        cardsData,
        categoriesData
      ] = await Promise.all([
        apiClient.request('/user-settings'),
        apiClient.request('/transactions', {
          params: {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            limit: 100 // Get more transactions for the dashboard
          }
        }),
        apiClient.request('/bank-accounts'),
        apiClient.request('/credit-cards'),
        apiClient.request('/categories')
      ]);

      // Update states with fetched data
      if (settingsData) {
        setUserSettings(settingsData);
        
        // Load widget configuration from user settings
        if (settingsData.dashboard_widgets && settingsData.dashboard_widgets.length > 0) {
          setWidgets(settingsData.dashboard_widgets);
        } else {
          // Default widget configuration
          const defaultWidgets = [
            { id: 'categoryBreakdown', position: 0, size: availableWidgets.categoryBreakdown.defaultSize },
            { id: 'monthlyTrends', position: 1, size: availableWidgets.monthlyTrends.defaultSize },
            { id: 'accountsList', position: 2, size: availableWidgets.accountsList.defaultSize },
            { id: 'accountTransactions', position: 3, size: availableWidgets.accountTransactions.defaultSize }
          ];
          setWidgets(defaultWidgets);
          
          // Save default configuration
          try {
            await apiClient.request('/user-settings', {
              method: 'PUT',
              data: {
                ...settingsData,
                dashboard_widgets: defaultWidgets
              }
            });
          } catch (error) {
            console.error('Error saving default widget configuration:', error);
          }
        }
      }

      // Extract transactions from the paginated response
      const transactions = transactionsResponse?.transactions || [];
      
      setTransactions(transactions);
      setAccounts(accountsData);
      setCreditCards(cardsData);
      setCategories(categoriesData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save widget configuration
  const saveWidgetConfig = async (newWidgets) => {
    if (userSettings) {
      try {
        await apiClient.request('/user-settings', {
          method: 'PUT',
          data: {
            dashboard_widgets: newWidgets
          }
        });
      } catch (error) {
        console.error('Error saving widget configuration:', error);
      }
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));
    
    setWidgets(updatedItems);
    saveWidgetConfig(updatedItems);
  };

  const addWidget = (widgetId) => {
    const widget = availableWidgets[widgetId];
    if (!widget) return;
    
    const newWidget = {
      id: widgetId,
      position: widgets.length,
      size: widget.defaultSize
    };
    
    const newWidgets = [...widgets, newWidget];
    setWidgets(newWidgets);
    saveWidgetConfig(newWidgets);
    setShowAddWidget(false);
  };

  const removeWidget = (widgetId) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(newWidgets);
    saveWidgetConfig(newWidgets);
  };

  const resizeWidget = (widgetId, newSize) => {
    const widget = availableWidgets[widgetId];
    if (!widget) return;
    
    // Ensure size is within limits
    const size = {
      w: Math.max(widget.minSize.w, Math.min(widget.maxSize.w, newSize.w)),
      h: Math.max(widget.minSize.h, Math.min(widget.maxSize.h, newSize.h))
    };
    
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, size } : w
    );
    
    setWidgets(newWidgets);
    saveWidgetConfig(newWidgets);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!userSettings || widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg text-gray-500">No widgets configured</div>
        <Button onClick={() => setShowAddWidget(true)}>Add Widget</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex gap-2">
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddWidget(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Done
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </>
            )}
          </Button>
        </div>
      </div>

      {showAddWidget && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Add Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(availableWidgets).map(([id, widget]) => (
                <Button
                  key={id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => addWidget(id)}
                >
                  <span>{widget.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="vertical">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
              }}
            >
              {widgets.map((widget, index) => {
                const widgetConfig = availableWidgets[widget.id];
                if (!widgetConfig) return null;

                const WidgetComponent = widgetConfig.component;
                
                return (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={!isEditing}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          gridColumn: `span ${widget.size.w}`,
                          gridRow: `span ${widget.size.h}`,
                          ...provided.draggableProps.style
                        }}
                      >
                        <Card className={`h-full ${snapshot.isDragging ? 'shadow-lg' : ''}`}>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">
                              {widgetConfig.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {isEditing && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeWidget(widget.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                  </div>
                                </>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <WidgetComponent
                              transactions={transactions}
                              accounts={accounts}
                              creditCards={creditCards}
                              categories={categories}
                              defaultCurrency={userSettings?.currency || 'USD'}
                              getCurrencySymbol={(currency) => currency === 'USD' ? '$' : '₪'}
                              dateRange={dateRange}
                              analyticsView={analyticsView}
                              selectedYear={selectedYear}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 