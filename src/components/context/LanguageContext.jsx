import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings } from '@/api/entities';

const translations = {
  en: {
    // Navigation & Common
    dashboard: "Dashboard",
    bankAccounts: "Bank Accounts",
    creditCards: "Credit Cards",
    transactions: "Transactions",
    business: "Business",
    investments: "Investments",
    goals: "Goals",
    reports: "Reports",
    loans: "Loans",
    netWorth: "Net Worth",
    recurringTransactions: "Recurring Transactions",
    insurance: "Insurance",
    emergencyFund: "Emergency Fund",
    financialAdvisor: "Financial Advisor",
    userAudit: "User Audit",
    settings: "Settings",
    budgetMaster: "BudgetMaster",

    // Dashboard
    financialOverview: "Financial Overview",
    lastUpdated: "Last updated",
    businessView: "Business View",
    clearFilter: "Clear Filter",
    yourAccounts: "Your Accounts",
    accountBalances: "Account Balances",
    selectAccount: "Select account",
    totalBalance: "Total Balance",
    monthlyIncome: "Monthly Income",
    monthlyExpenses: "Monthly Expenses",
    totalInvestments: "Total Investments",
    currentValue: "Current value",
    thisMonth: "This month",
    acrossAllAccounts: "Across all accounts",
    comparedToInitialBalance: "Compared to initial balance",
    comparedToLastMonth: "Compared to last month",
  },
  he: {
    // Navigation & Common
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
    emergencyFund: "קרן חירום",
    financialAdvisor: "יועץ פיננסי",
    userAudit: "יומן משתמש",
    settings: "הגדרות",
    budgetMaster: "ניהול תקציב",

    // Dashboard
    financialOverview: "סקירה פיננסית",
    lastUpdated: "עודכן לאחרונה",
    businessView: "תצוגת עסק",
    clearFilter: "נקה סינון",
    yourAccounts: "החשבונות שלך",
    accountBalances: "יתרות חשבון",
    selectAccount: "בחר חשבון",
    totalBalance: "יתרה כוללת",
    monthlyIncome: "הכנסה חודשית",
    monthlyExpenses: "הוצאות חודשיות",
    totalInvestments: "סך השקעות",
    currentValue: "ערך נוכחי",
    thisMonth: "החודש",
    acrossAllAccounts: "בכל החשבונות",
    comparedToInitialBalance: "בהשוואה ליתרה התחלתית",
    comparedToLastMonth: "בהשוואה לחודש קודם",
  }
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  isRTL: false,
  t: (key) => key
});

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      isRTL: false,
      t: (key) => key
    };
  }
  return context;
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const loadLanguageSettings = async () => {
      try {
        const settings = await UserSettings.list();
        if (settings && settings.length > 0 && settings[0].language) {
          const userLanguage = settings[0].language;
          setLanguage(userLanguage);
          setIsRTL(userLanguage === 'he');
          document.documentElement.dir = userLanguage === 'he' ? 'rtl' : 'ltr';
          document.documentElement.lang = userLanguage;
          document.documentElement.className = userLanguage === 'he' ? 'rtl' : 'ltr';
        }
      } catch (error) {
        console.error('Error loading language settings:', error);
      }
    };

    loadLanguageSettings();
  }, []);

  const handleSetLanguage = async (newLanguage) => {
    try {
      setLanguage(newLanguage);
      setIsRTL(newLanguage === 'he');
      
      document.documentElement.dir = newLanguage === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLanguage;
      document.documentElement.className = newLanguage === 'he' ? 'rtl' : 'ltr';

      const settings = await UserSettings.list();
      if (settings && settings.length > 0) {
        await UserSettings.update(settings[0].id, {
          ...settings[0],
          language: newLanguage
        });
      } else {
        await UserSettings.create({
          language: newLanguage,
          theme: 'system',
          default_currency: 'USD'
        });
      }
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;