
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Home, Wallet, CreditCard, ArrowDownUp, Building2, TrendingUp, Target, BarChart2, PiggyBank, Repeat2, Heart, Shield, MessageCircle, ActivitySquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getItemIcon = (name) => {
  switch (name) {
    case 'Dashboard': return <Home className="w-4 h-4" />;
    case 'BankAccounts': return <Wallet className="w-4 h-4" />;
    case 'CreditCards': return <CreditCard className="w-4 h-4" />;
    case 'Transactions': return <ArrowDownUp className="w-4 h-4" />;
    case 'Business': return <Building2 className="w-4 h-4" />;
    case 'Investments': return <TrendingUp className="w-4 h-4" />;
    case 'Goals': return <Target className="w-4 h-4" />;
    case 'Reports': return <BarChart2 className="w-4 h-4" />;
    case 'Loans': return <PiggyBank className="w-4 h-4" />;
    case 'NetWorth': return <TrendingUp className="w-4 h-4" />;
    case 'RecurringTransactions': return <Repeat2 className="w-4 h-4" />;
    case 'Insurance': return <Heart className="w-4 h-4" />;
    case 'EmergencyFund': return <Shield className="w-4 h-4" />;
    case 'FinancialAdvisor': return <MessageCircle className="w-4 h-4" />;
    case 'UserAudit': return <ActivitySquare className="w-4 h-4" />;
    case 'Settings': return <Settings className="w-4 h-4" />;
    default: return <Home className="w-4 h-4" />;
  }
};

const translateItemName = (name, isRTL, t) => {
  if (!isRTL) return name;
  
  // Hebrew translations for sidebar items
  const translations = {
    Dashboard: "לוח בקרה",
    BankAccounts: "חשבונות בנק",
    CreditCards: "כרטיסי אשראי",
    Transactions: "עסקאות",
    Business: "עסקים",
    Investments: "השקעות",
    Goals: "יעדים",
    Reports: "דוחות",
    Loans: "הלוואות",
    NetWorth: "הון נקי",
    RecurringTransactions: "עסקאות קבועות",
    Insurance: "ביטוח",
    EmergencyFund: "קרן חירום",
    FinancialAdvisor: "יועץ פיננסי",
    UserAudit: "יומן פעילות",
    Settings: "הגדרות"
  };
  
  return translations[name] || name;
};

const defaultNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
  { name: 'BankAccounts', href: '/bank-accounts', icon: 'Wallet' },
  { name: 'CreditCards', href: '/credit-cards', icon: 'CreditCard' },
  { name: 'Transactions', href: '/transactions', icon: 'ArrowDownUp' },
  { name: 'Business', href: '/business', icon: 'Building2' },
  { name: 'Investments', href: '/investments', icon: 'TrendingUp' },
  { name: 'Goals', href: '/goals', icon: 'Target' },
  { name: 'Reports', href: '/reports', icon: 'BarChart2' },
  { name: 'Loans', href: '/loans', icon: 'PiggyBank' },
  { name: 'NetWorth', href: '/net-worth', icon: 'TrendingUp' },
  { name: 'RecurringTransactions', href: '/recurring-transactions', icon: 'Repeat2' },
  { name: 'Insurance', href: '/insurance', icon: 'Heart' },
  { name: 'EmergencyFund', href: '/emergency-fund', icon: 'Shield' },
  { name: 'FinancialAdvisor', href: '/financial-advisor', icon: 'MessageCircle' },
  { name: 'UserAudit', href: '/user-audit', icon: 'ActivitySquare' },
  { name: 'Settings', href: '/settings', icon: 'Settings' },
];

export default function SidebarReorder({ 
  items, 
  onChange, 
  isRTL = false, 
  t = key => key,
  fixedItems = { first: null, last: null }
}) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    
    // Add back the fixed items
    const finalOrder = [
      fixedItems.first,
      ...reorderedItems,
      fixedItems.last
    ].filter(Boolean);
    
    onChange(finalOrder);
  };
  
  const allItems = [
    fixedItems.first,
    ...items,
    fixedItems.last
  ].filter(Boolean);
  
  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              {allItems.map((item, index) => {
                const isFixed = item === fixedItems.first || item === fixedItems.last;
                
                return (
                  <Draggable 
                    key={item} 
                    draggableId={item} 
                    index={index}
                    isDragDisabled={isFixed}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...(isFixed ? {} : provided.dragHandleProps)}
                        className={`flex items-center p-3 bg-gray-700 border-b border-gray-600 last:border-b-0 ${
                          isFixed ? 'opacity-50' : 'hover:bg-gray-650'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {!isFixed && <GripVertical className="w-4 h-4 text-gray-400" />}
                          <span className="text-white">{t(item.toLowerCase())}</span>
                        </div>
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
      
      <Button 
        onClick={() => {
          const defaultOrder = [
            fixedItems.first,
            ...defaultNavigation
              .map(item => item.name)
              .filter(name => name !== fixedItems.first && name !== fixedItems.last),
            fixedItems.last
          ].filter(Boolean);
          
          onChange(defaultOrder);
        }}
        variant="outline"
        className="mt-4 bg-gray-700 border-gray-600 text-white hover:bg-gray-650"
      >
        {t('resetToDefault')}
      </Button>
    </div>
  );
}
