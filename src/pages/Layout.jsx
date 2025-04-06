

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  CreditCard,
  Home,
  Wallet,
  ArrowDownUp,
  Settings,
  TrendingUp,
  Target,
  BarChart2,
  PiggyBank,
  Repeat2,
  Heart,
  Sun,
  Moon,
  Laptop,
  Menu,
  Building2,
  MessageCircle,
  Shield,
  ActivitySquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { UserSettings } from '@/api/entities';

// Hebrew translations directly in the layout component
const hebrewTranslations = {
  dashboard: "לוח בקרה",
  bankAccounts: "חשבונות בנק",
  creditCards: "כרטיסי אשראי",
  transactions: "עסקאות",
  business: "עסקים",
  investments: "השקעות",
  goals: "יעדים",
  reports: "דוחות",
  loans: "הלוואות",
  netWorth: "הון נקי",
  recurringTransactions: "עסקאות קבועות",
  insurance: "ביטוח",
  emergencyFund: "עסקאות לא מתוכננות",
  financialAdvisor: "יועץ פיננסי",
  userAudit: "יומן פעילות",
  settings: "הגדרות",
  budgetMaster: "ניהול תקציב"
};

export const defaultNavigation = [
  { name: 'Dashboard', icon: Home },
  { name: 'BankAccounts', icon: Wallet },
  { name: 'CreditCards', icon: CreditCard },
  { name: 'Transactions', icon: ArrowDownUp },
  { name: 'Business', icon: Building2 },
  { name: 'Investments', icon: TrendingUp },
  { name: 'Goals', icon: Target },
  { name: 'Reports', icon: BarChart2 },
  { name: 'Loans', icon: PiggyBank },
  { name: 'NetWorth', icon: TrendingUp },
  { name: 'RecurringTransactions', icon: Repeat2 },
  { name: 'Insurance', icon: Heart },
  { name: 'EmergencyFund', icon: Shield },
  { name: 'FinancialAdvisor', icon: MessageCircle },
  { name: 'UserAudit', icon: ActivitySquare },
  { name: 'Settings', icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [navOrder, setNavOrder] = useState([]);
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  
  const isDarkMode = localStorage.getItem('theme') === 'dark' || 
    ((!localStorage.getItem('theme') || localStorage.getItem('theme') === 'system') && 
    window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await UserSettings.list();
        if (settings && settings.length > 0) {
          setUserSettings(settings[0]);
          
          // Set language and RTL
          if (settings[0].language) {
            setLanguage(settings[0].language);
            setIsRTL(settings[0].language === 'he');
            
            // Apply RTL to document
            document.documentElement.dir = settings[0].language === 'he' ? 'rtl' : 'ltr';
            document.documentElement.className = settings[0].language === 'he' ? 'rtl' : 'ltr';
          }
          
          // Set sidebar order
          if (settings[0].sidebar_order && settings[0].sidebar_order.length > 0) {
            setNavOrder(settings[0].sidebar_order);
          }
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Simple translation function
  const translate = (key) => {
    if (language === 'he' && hebrewTranslations[key]) {
      return hebrewTranslations[key];
    }
    return key;
  };

  const getOrderedNavigation = () => {
    if (!navOrder || navOrder.length === 0) {
      return defaultNavigation;
    }

    const navMap = {};
    defaultNavigation.forEach(item => {
      navMap[item.name] = item;
    });

    const orderedNav = navOrder
      .filter(name => navMap[name])
      .map(name => navMap[name]);
      
    const orderedNames = new Set(navOrder);
    defaultNavigation.forEach(item => {
      if (!orderedNames.has(item.name)) {
        if (orderedNav.length > 0 && orderedNav[orderedNav.length - 1].name === 'Settings') {
          orderedNav.splice(orderedNav.length - 1, 0, item);
        } else {
          orderedNav.push(item);
        }
      }
    });

    return orderedNav;
  };

  const NavContent = () => (
    <>
      <div className="p-6">
        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 text-lg font-semibold text-white">
          <PiggyBank className="h-6 w-6" />
          <span>{translate('budgetMaster')}</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-4">
          {getOrderedNavigation().map(({ name, icon: Icon }) => {
            const isActive = currentPageName === name;
            const itemKey = name.charAt(0).toLowerCase() + name.slice(1);
            
            return (
              <Link
                key={name}
                to={createPageUrl(name)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-gray-100 ${
                  isActive ? "bg-gray-800 text-gray-100" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{translate(name.toLowerCase())}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="p-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              localStorage.setItem('theme', 'light');
              document.documentElement.classList.remove('dark');
              window.location.reload();
            }}
            className="text-gray-300 hover:text-gray-100"
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              localStorage.setItem('theme', 'system');
              if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
              window.location.reload();
            }}
            className="text-gray-300 hover:text-gray-100"
          >
            <Laptop className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              localStorage.setItem('theme', 'dark');
              document.documentElement.classList.add('dark');
              window.location.reload();
            }}
            className="text-gray-300 hover:text-gray-100"
          >
            <Moon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'rtl' : 'ltr'}>
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center gap-4 border-b border-gray-700 bg-gray-900 px-4 sm:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-300">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side={isRTL ? "right" : "left"} className="w-72 p-0 bg-gray-900 border-gray-700">
            <NavContent />
          </SheetContent>
        </Sheet>
        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 text-lg font-semibold text-white">
          <PiggyBank className="h-6 w-6" />
          <span>{translate('budgetMaster')}</span>
        </Link>
      </div>

      <div className={`hidden sm:fixed sm:inset-y-0 sm:z-50 sm:flex sm:w-72 sm:flex-col bg-gray-900 ${
        isRTL ? 'sm:right-0' : 'sm:left-0'
      }`}>
        <NavContent />
      </div>

      <main className={`min-h-screen flex bg-gray-900 ${
        isRTL ? 'sm:pr-72' : 'sm:pl-72'
      }`}>
        <div className="flex-1 container p-4 sm:p-8 mt-16 sm:mt-0 bg-gray-900 text-white">
          {children}
        </div>
      </main>
    </div>
  );
}

