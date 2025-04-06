
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BankAccount, CreditCard, Transaction, Investment, Goal, Loan, RecurringTransaction, Insurance, Category, InsuranceCategory, UserSettings } from '@/api/entities';
import { Download, Trash, GripVertical, Save, Plus, Pencil, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DocumentationContent from '../components/settings/DocumentationContent';

const defaultNavigation = [
  { name: 'Dashboard', icon: 'Home' },
  { name: 'BankAccounts', icon: 'Wallet' },
  { name: 'CreditCards', icon: 'CreditCard' },
  { name: 'Transactions', icon: 'ArrowDownUp' },
  { name: 'Business', icon: 'Building2' },
  { name: 'Investments', icon: 'TrendingUp' },
  { name: 'Goals', icon: 'Target' },
  { name: 'Reports', icon: 'BarChart2' },
  { name: 'Loans', icon: 'PiggyBank' },
  { name: 'NetWorth', icon: 'TrendingDown' },
  { name: 'RecurringTransactions', icon: 'Repeat2' },
  { name: 'Insurance', icon: 'Heart' },
  { name: 'EmergencyFund', icon: 'Shield' },
  { name: 'FinancialAdvisor', icon: 'MessageCircle' },
  { name: 'UserAudit', icon: 'ActivitySquare' },
  { name: 'Settings', icon: 'Settings' },
];

const translations = {
  en: {
    settings: "Settings",
    generalSettings: "General Settings",
    categories: "Categories",
    manageCategories: "Manage Categories",
    insuranceCategories: "Insurance Categories",
    language: "Language",
    theme: "Theme",
    defaultCurrency: "Default Currency",
    timezone: "Timezone",
    dataManagement: "Data Management",
    backupRestore: "Backup & Restore",
    deleteUserData: "Delete User Data",
    sidebar: "Sidebar",
    documentation: "Documentation",
    sidebarOrder: "Sidebar Order",
    dragAndDrop: "Drag and drop items to change their order in the sidebar.",
    light: "Light",
    dark: "Dark",
    system: "System",
    addCategory: "Add Category",
    editCategory: "Edit Category",
    deleteCategory: "Delete Category",
    categoryName: "Category Name",
    categoryNameHebrew: "Category Name (Hebrew)",
    color: "Color",
    subcategories: "Subcategories",
    addSubcategory: "Add Subcategory",
    editSubcategory: "Edit Subcategory",
    save: "Save",
    cancel: "Cancel",
    deleteAllData: "Delete All Data",
    exportData: "Export Data",
    downloadBackup: "Download Backup",
    deleteAllDataWarning: "This will permanently delete all your data. This action cannot be undone.",
    iUnderstand: "I understand, delete my data",
    dataDeletedSuccessfully: "Data deleted successfully",
    errorDeletingData: "Error deleting data",
    addInsuranceCategory: "Add Insurance Category",
    editInsuranceCategory: "Edit Insurance Category",
    deleteInsuranceCategory: "Delete Insurance Category",
    selectTimezone: "Select Timezone",
    userManual: "User Manual",
    deleteAllDataConfirmation: "Are you sure you want to delete all your data? This action cannot be undone."
  },
  he: {
    settings: "הגדרות",
    generalSettings: "הגדרות כלליות",
    categories: "קטגוריות",
    manageCategories: "ניהול קטגוריות",
    insuranceCategories: "קטגוריות ביטוח",
    language: "שפה",
    theme: "ערכת נושא",
    defaultCurrency: "מטבע ברירת מחדל",
    timezone: "אזור זמן",
    dataManagement: "ניהול נתונים",
    backupRestore: "גיבוי ושחזור",
    deleteUserData: "מחיקת נתוני משתמש",
    sidebar: "סרגל צד",
    documentation: "תיעוד",
    sidebarOrder: "סדר סרגל צד",
    dragAndDrop: "גרור ושחרר פריטים כדי לשנות את הסדר שלהם בסרגל הצד.",
    light: "בהיר",
    dark: "כהה",
    system: "מערכת",
    addCategory: "הוסף קטגוריה",
    editCategory: "ערוך קטגוריה",
    deleteCategory: "מחק קטגוריה",
    categoryName: "שם קטגוריה",
    categoryNameHebrew: "שם קטגוריה (עברית)",
    color: "צבע",
    subcategories: "תת-קטגוריות",
    addSubcategory: "הוסף תת-קטגוריה",
    editSubcategory: "ערוך תת-קטגוריה",
    save: "שמור",
    cancel: "ביטול",
    deleteAllData: "מחק את כל הנתונים",
    exportData: "ייצוא נתונים",
    downloadBackup: "הורד גיבוי",
    deleteAllDataWarning: "פעולה זו תמחק לצמיתות את כל הנתונים שלך. לא ניתן לבטל פעולה זו.",
    iUnderstand: "אני מבין, מחק את הנתונים שלי",
    dataDeletedSuccessfully: "הנתונים נמחקו בהצלחה",
    errorDeletingData: "שגיאה במחיקת נתונים",
    addInsuranceCategory: "הוסף קטגוריית ביטוח",
    editInsuranceCategory: "ערוך קטגוריית ביטוח",
    deleteInsuranceCategory: "מחק קטגוריית ביטוח",
    selectTimezone: "בחר אזור זמן",
    userManual: "מדריך למשתמש",
    deleteAllDataConfirmation: "האם אתה בטוח שברצונך למחוק את כל הנתונים שלך? לא ניתן לבטל פעולה זו."
  }
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState(null);
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [categories, setCategories] = useState([]);
  const [insuranceCategories, setInsuranceCategories] = useState([]);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedInsuranceCategory, setSelectedInsuranceCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('categories'); // Set default tab to categories
  const [categoriesSubTab, setCategoriesSubTab] = useState('regular');
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryNameHe, setNewSubcategoryNameHe] = useState('');
  const [showSidebarOrderDialog, setShowSidebarOrderDialog] = useState(false);
  const [editingSubcategoryIndex, setEditingSubcategoryIndex] = useState(null);
  
  // Get supported timezones
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Jerusalem',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  // Simple translation function
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  // Load settings and data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsData, categoriesData, insuranceCategoriesData] = await Promise.all([
        UserSettings.list(),
        Category.list(),
        InsuranceCategory.list()
      ]);

      if (settingsData.length > 0) {
        setUserSettings(settingsData[0]);
        if (settingsData[0].language) {
          setLanguage(settingsData[0].language);
          setIsRTL(settingsData[0].language === 'he');
        }
        
        // Initialize sidebar items from settings or default
        if (settingsData[0].sidebar_order && settingsData[0].sidebar_order.length > 0) {
          const orderedItems = settingsData[0].sidebar_order.map(name => {
            const defaultItem = defaultNavigation.find(item => item.name === name);
            return defaultItem ? { ...defaultItem, id: name } : null;
          }).filter(Boolean);
          
          // Add any missing items
          defaultNavigation.forEach(item => {
            if (!orderedItems.some(ordered => ordered.name === item.name)) {
              orderedItems.push({ ...item, id: item.name });
            }
          });
          
          setSidebarItems(orderedItems);
        } else {
          setSidebarItems(defaultNavigation.map(item => ({ ...item, id: item.name })));
        }
      } else {
        setSidebarItems(defaultNavigation.map(item => ({ ...item, id: item.name })));
      }

      setCategories(categoriesData);
      setInsuranceCategories(insuranceCategoriesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Update user settings
  const updateSettings = async (settings) => {
    try {
      if (userSettings) {
        await UserSettings.update(userSettings.id, settings);
      } else {
        await UserSettings.create(settings);
      }
      
      const updatedSettings = await UserSettings.list();
      if (updatedSettings.length > 0) {
        setUserSettings(updatedSettings[0]);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  // Handle language change
  const handleLanguageChange = async (value) => {
    setLanguage(value);
    setIsRTL(value === 'he');
    
    document.documentElement.dir = value === 'he' ? 'rtl' : 'ltr';
    document.documentElement.className = value === 'he' ? 'rtl' : 'ltr';
    
    await updateSettings({
      ...userSettings,
      language: value
    });
  };

  // Handle theme change
  const handleThemeChange = async (value) => {
    localStorage.setItem('theme', value);
    
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (value === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    await updateSettings({
      ...userSettings,
      theme: value
    });
  };

  // Handle currency change
  const handleCurrencyChange = async (value) => {
    await updateSettings({
      ...userSettings,
      default_currency: value
    });
  };
  
  // Handle timezone change
  const handleTimezoneChange = async (value) => {
    await updateSettings({
      ...userSettings,
      timezone: value
    });
  };

  // Category management functions
  const handleSelectCategory = (category, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedCategory(category);
  };

  const handleAddCategory = async () => {
    try {
      const newCategory = await Category.create({
        name: '',
        name_he: '',
        color: '#4f46e5',
        subcategories: []
      });
      await loadData(); // Reload all data
      setSelectedCategory(newCategory);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async (id, formData) => {
    try {
      const categoryData = {
        ...formData,
        subcategories: (formData.subcategories || []).map(sub => {
          if (typeof sub === 'object' && sub !== null && sub.name) {
            return {
              name: sub.name,
              name_he: sub.name_he || ''
            };
          }
          return {
            name: String(sub),
            name_he: ''
          };
        })
      };

      await Category.update(id, categoryData);
      await loadData(); // Reload all data
      
      // Find and select the updated category
      const updatedCategory = await Category.list().then(cats => 
        cats.find(cat => cat.id === id)
      );
      if (updatedCategory) {
        setSelectedCategory(updatedCategory);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await Category.delete(id);
      await loadData();
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };
  
  // Simplify the subcategory dialog logic completely 
  const openAddSubcategoryDialog = () => {
    console.log("Opening add subcategory dialog");
    setNewSubcategoryName('');
    setNewSubcategoryNameHe('');
    setEditingSubcategoryIndex(null);
    setShowSubcategoryDialog(true);
  };

  const openEditSubcategoryDialog = (index) => {
    console.log("Opening edit subcategory dialog for index:", index);
    if (!selectedCategory?.subcategories?.[index]) {
      console.error("No subcategory found at index:", index);
      return;
    }
    
    const subcategory = selectedCategory.subcategories[index];
    setNewSubcategoryName(subcategory.name || '');
    setNewSubcategoryNameHe(subcategory.name_he || '');
    setEditingSubcategoryIndex(index);
    setShowSubcategoryDialog(true);
  };

  const submitSubcategoryForm = (e) => {
    e.preventDefault();
    console.log("Submitting subcategory form, editing index:", editingSubcategoryIndex);
    
    if (editingSubcategoryIndex !== null) {
      updateExistingSubcategory();
    } else {
      addNewSubcategory();
    }
  };

  const addNewSubcategory = async () => {
    console.log("Adding new subcategory:", newSubcategoryName);
    if (!selectedCategory || !newSubcategoryName.trim()) return;

    try {
      const newSubcategory = {
        name: newSubcategoryName.trim(),
        name_he: newSubcategoryNameHe.trim()
      };

      const updatedSubcategories = [
        ...(Array.isArray(selectedCategory.subcategories) ? selectedCategory.subcategories : []),
        newSubcategory
      ];
      
      await Category.update(selectedCategory.id, {
        ...selectedCategory,
        subcategories: updatedSubcategories
      });

      await loadData();
      setShowSubcategoryDialog(false);
    } catch (error) {
      console.error('Error adding subcategory:', error);
      alert('Error adding subcategory: ' + error.message);
    }
  };

  const updateExistingSubcategory = async () => {
    console.log("Updating subcategory at index:", editingSubcategoryIndex);
    if (!selectedCategory || editingSubcategoryIndex === null) return;

    try {
      const updatedSubcategories = [
        ...(Array.isArray(selectedCategory.subcategories) ? selectedCategory.subcategories : [])
      ];
      
      updatedSubcategories[editingSubcategoryIndex] = {
        name: newSubcategoryName.trim(),
        name_he: newSubcategoryNameHe.trim()
      };

      await Category.update(selectedCategory.id, {
        ...selectedCategory,
        subcategories: updatedSubcategories
      });

      await loadData();
      setShowSubcategoryDialog(false);
      setEditingSubcategoryIndex(null);
    } catch (error) {
      console.error('Error updating subcategory:', error);
      alert('Error updating subcategory: ' + error.message);
    }
  };
  
  const handleDeleteSubcategory = (index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedCategory) return;

    try {
      const updatedSubcategories = selectedCategory.subcategories.filter((_, i) => i !== index);
      const updatedCategory = {
        ...selectedCategory,
        subcategories: updatedSubcategories
      };

      handleUpdateCategory(selectedCategory.id, updatedCategory);
    } catch (error) {
      console.error('Error deleting subcategory:', error);
    }
  };

  // Insurance category management functions
  const handleAddInsuranceCategory = async () => {
    try {
      const categoryData = {
        name: '',
        name_he: '',
        color: '#4f46e5',
        description: ''
      };
      
      const newCategory = await InsuranceCategory.create(categoryData);
      const updatedCategories = await InsuranceCategory.list();
      setInsuranceCategories(updatedCategories);
      setSelectedInsuranceCategory(newCategory);
    } catch (error) {
      console.error('Error adding insurance category:', error);
    }
  };

  const handleUpdateInsuranceCategory = async (id, formData) => {
    try {
      await InsuranceCategory.update(id, formData);
      const updatedCategories = await InsuranceCategory.list();
      setInsuranceCategories(updatedCategories);
    } catch (error) {
      console.error('Error updating insurance category:', error);
    }
  };

  const handleDeleteInsuranceCategory = async (id) => {
    try {
      await InsuranceCategory.delete(id);
      const updatedCategories = await InsuranceCategory.list();
      setInsuranceCategories(updatedCategories);
      
      if (selectedInsuranceCategory && selectedInsuranceCategory.id === id) {
        setSelectedInsuranceCategory(null);
      }
    } catch (error) {
      console.error('Error deleting insurance category:', error);
    }
  };

  // Sidebar order functions
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sidebarItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Dashboard should always be first, settings last
    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    
    // If first item is not Dashboard, swap it
    if (firstItem.name !== 'Dashboard') {
      const dashboardIndex = items.findIndex(item => item.name === 'Dashboard');
      if (dashboardIndex !== -1) {
        items[0] = items[dashboardIndex];
        items[dashboardIndex] = firstItem;
      }
    }
    
    // If last item is not Settings, swap it
    if (lastItem.name !== 'Settings') {
      const settingsIndex = items.findIndex(item => item.name === 'Settings');
      if (settingsIndex !== -1) {
        items[items.length - 1] = items[settingsIndex];
        items[settingsIndex] = lastItem;
      }
    }
    
    setSidebarItems(items);
  };

  const saveSidebarOrder = async () => {
    try {
      const orderNames = sidebarItems.map(item => item.name);
      
      await updateSettings({
        ...userSettings,
        sidebar_order: orderNames
      });
      
      setShowSidebarOrderDialog(false);
    } catch (error) {
      console.error('Error saving sidebar order:', error);
    }
  };

  // Data management functions
  const handleExportData = async () => {
    try {
      // Fetch all data from different entities
      const [
        accounts,
        cards,
        transactions,
        investments,
        categories,
        insuranceCategories,
        goals,
        loans,
        recurringTransactions,
        insurances,
        settings
      ] = await Promise.all([
        BankAccount.list(),
        CreditCard.list(),
        Transaction.list(),
        Investment.list(),
        Category.list(),
        InsuranceCategory.list(),
        Goal.list(),
        Loan.list(),
        RecurringTransaction.list(),
        Insurance.list(),
        UserSettings.list()
      ]);
      
      // Create a backup object with all data
      const backupData = {
        accounts,
        cards,
        transactions,
        investments,
        categories,
        insuranceCategories,
        goals,
        loans,
        recurringTransactions,
        insurances,
        settings: settings[0] || {}
      };
      
      // Convert to JSON and create a download link
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `budget_master_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      await Promise.all([
        BankAccount.list().then(accounts => 
          Promise.all(accounts.map(acc => BankAccount.delete(acc.id)))
        ),
        CreditCard.list().then(cards => 
          Promise.all(cards.map(card => CreditCard.delete(card.id)))
        ),
        Transaction.list().then(transactions => 
          Promise.all(transactions.map(tx => Transaction.delete(tx.id)))
        ),
        Investment.list().then(investments => 
          Promise.all(investments.map(inv => Investment.delete(inv.id)))
        ),
        Category.list().then(categories => 
          Promise.all(categories.map(cat => Category.delete(cat.id)))
        ),
        InsuranceCategory.list().then(categories => 
          Promise.all(categories.map(cat => InsuranceCategory.delete(cat.id)))
        ),
        Goal.list().then(goals => 
          Promise.all(goals.map(goal => Goal.delete(goal.id)))
        ),
        Loan.list().then(loans => 
          Promise.all(loans.map(loan => Loan.delete(loan.id)))
        ),
        RecurringTransaction.list().then(txs => 
          Promise.all(txs.map(tx => RecurringTransaction.delete(tx.id)))
        ),
        Insurance.list().then(insurances => 
          Promise.all(insurances.map(ins => Insurance.delete(ins.id)))
        )
        // Keep user settings
      ]);
      
      alert(t('dataDeletedSuccessfully'));
      window.location.reload();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert(t('errorDeletingData'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold text-white">{t('settings')}</h1>

      <div className="space-y-4">
        <div className="border-b border-gray-700">
          <nav className="flex -mb-px space-x-8">
            <a 
              href="#" 
              className={`py-2 border-b-2 ${activeTab === 'general' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('general')}
            >
              {t('generalSettings')}
            </a>
            <a 
              href="#" 
              className={`py-2 border-b-2 ${activeTab === 'categories' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('categories')}
            >
              {t('categories')}
            </a>
            <a 
              href="#" 
              className={`py-2 border-b-2 ${activeTab === 'data' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('data')}
            >
              {t('dataManagement')}
            </a>
            <a 
              href="#" 
              className={`py-2 border-b-2 ${activeTab === 'sidebar' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('sidebar')}
            >
              {t('sidebar')}
            </a>
            <a 
              href="#" 
              className={`py-2 border-b-2 ${activeTab === 'docs' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('docs')}
            >
              {t('documentation')}
            </a>
          </nav>
        </div>

        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button 
                className={`px-4 py-2 rounded ${categoriesSubTab === 'regular' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setCategoriesSubTab('regular')}
              >
                {t('manageCategories')}
              </button>
              <button 
                className={`px-4 py-2 rounded ${categoriesSubTab === 'insurance' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setCategoriesSubTab('insurance')}
              >
                {t('insuranceCategories')}
              </button>
            </div>

            {categoriesSubTab === 'regular' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Categories List */}
                    <div className="lg:col-span-1">
                      <h3 className="text-lg font-medium mb-3 text-white">{t('categories')}</h3>
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {categories.map(category => (
                          <div
                            key={category.id}
                            className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 cursor-pointer border border-gray-700 ${
                              selectedCategory?.id === category.id ? 'bg-gray-700' : 'bg-gray-800'
                            }`}
                            onClick={(e) => handleSelectCategory(category, e)}
                          >
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-3" 
                                style={{ backgroundColor: category.color || '#4f46e5' }}
                              ></div>
                              <div>
                                <div className="font-medium text-white">{category.name}</div>
                                {category.name_he && (
                                  <div className="text-sm text-gray-400" dir="rtl">{category.name_he}</div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {t('subcategories')}: {category.subcategories?.length || 0}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCategory(category);
                                }}
                                className="h-8 w-8 text-gray-400 hover:text-blue-400"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(t('deleteCategory') + '?')) {
                                    handleDeleteCategory(category.id, e);
                                  }
                                }}
                                className="h-8 w-8 text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {categories.length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            No categories yet
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={handleAddCategory}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addCategory')}
                      </Button>
                    </div>

                    {/* Category Edit Form */}
                    <div className="lg:col-span-2">
                      {selectedCategory ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium mb-3 text-white">
                            {selectedCategory.id ? t('editCategory') : t('addCategory')}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-white">{t('categoryName')}</label>
                              <Input
                                value={selectedCategory.name}
                                onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
                                className="w-full bg-gray-700 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-white">{t('categoryNameHebrew')}</label>
                              <Input
                                value={selectedCategory.name_he || ''}
                                onChange={(e) => setSelectedCategory({...selectedCategory, name_he: e.target.value})}
                                className="w-full bg-gray-700 border-gray-600 text-white"
                                dir="rtl"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1 text-white">{t('color')}</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={selectedCategory.color || '#4f46e5'}
                                onChange={(e) => setSelectedCategory({...selectedCategory, color: e.target.value})}
                                className="w-12 h-10 rounded border-0 bg-transparent cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={selectedCategory.color || '#4f46e5'}
                                onChange={(e) => setSelectedCategory({...selectedCategory, color: e.target.value})}
                                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                className="w-32 bg-gray-700 border-gray-600 text-white"
                              />
                            </div>
                          </div>

                          {/* Subcategories Section */}
                          <div className="mt-6">
                            <h4 className="text-md font-medium mb-3 text-white">{t('subcategories')}</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto mb-4 border border-gray-700 rounded-lg p-4 bg-gray-900">
                              {selectedCategory?.subcategories?.map((subcategory, index) => (
                                <div 
                                  key={index}
                                  className="flex items-center justify-between p-3 rounded bg-gray-800 border border-gray-700"
                                >
                                  <div className="flex-grow">
                                    <span className="text-white">{subcategory.name}</span>
                                    {subcategory.name_he && (
                                      <span className="text-gray-400 text-sm ml-2" dir="rtl">({subcategory.name_he})</span>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => openEditSubcategoryDialog(index)}
                                      className="h-8 w-8 text-gray-400 hover:text-blue-400"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      type="button"
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleDeleteSubcategory(index)}
                                      className="h-8 w-8 text-gray-400 hover:text-red-400"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              
                              {(!selectedCategory?.subcategories || selectedCategory.subcategories.length === 0) && (
                                <div className="text-center py-4 text-gray-500">
                                  No subcategories yet
                                </div>
                              )}
                            </div>

                            <Button 
                              onClick={openAddSubcategoryDialog}
                              variant="outline"
                              className="w-full bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t('addSubcategory')}
                            </Button>
                          </div>

                          <Button
                            onClick={() => handleUpdateCategory(selectedCategory.id, selectedCategory)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {t('save')}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center p-6 text-gray-500">
                            Select a category to edit or click "Add Category" to create a new one
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completely rewrite the dialog to be simpler */}
            <Dialog open={showSubcategoryDialog} onOpenChange={setShowSubcategoryDialog}>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>
                    {editingSubcategoryIndex !== null ? t('editSubcategory') : t('addSubcategory')}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={submitSubcategoryForm}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('categoryName')}</label>
                      <Input
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('categoryNameHebrew')}</label>
                      <Input
                        value={newSubcategoryNameHe}
                        onChange={(e) => setNewSubcategoryNameHe(e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 text-white"
                        dir="rtl"
                        placeholder="Enter Hebrew name (optional)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSubcategoryDialog(false)}
                      className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {t('save')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === 'general' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 text-white">{t('language')}</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant={language === 'en' ? 'default' : 'outline'}
                      onClick={() => handleLanguageChange('en')}
                      className={language === 'en' ? '' : 'bg-gray-700 text-white'}
                    >
                      English
                    </Button>
                    <Button
                      variant={language === 'he' ? 'default' : 'outline'}
                      onClick={() => handleLanguageChange('he')}
                      className={language === 'he' ? '' : 'bg-gray-700 text-white'}
                    >
                      עברית
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-white">{t('theme')}</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant={userSettings?.theme === 'light' ? 'default' : 'outline'}
                      onClick={() => handleThemeChange('light')}
                      className={userSettings?.theme === 'light' ? '' : 'bg-gray-700 text-white'}
                    >
                      {t('light')}
                    </Button>
                    <Button
                      variant={userSettings?.theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => handleThemeChange('dark')}
                      className={userSettings?.theme === 'dark' ? '' : 'bg-gray-700 text-white'}
                    >
                      {t('dark')}
                    </Button>
                    <Button
                      variant={(!userSettings?.theme || userSettings?.theme === 'system') ? 'default' : 'outline'}
                      onClick={() => handleThemeChange('system')}
                      className={(!userSettings?.theme || userSettings?.theme === 'system') ? '' : 'bg-gray-700 text-white'}
                    >
                      {t('system')}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-white">{t('defaultCurrency')}</h3>
                  <Select 
                    value={userSettings?.default_currency || 'USD'} 
                    onValueChange={handleCurrencyChange}
                    className="w-full sm:w-72"
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="USD" className="text-white">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR" className="text-white">EUR - Euro</SelectItem>
                      <SelectItem value="GBP" className="text-white">GBP - British Pound</SelectItem>
                      <SelectItem value="ILS" className="text-white">ILS - Israeli Shekel</SelectItem>
                      <SelectItem value="JPY" className="text-white">JPY - Japanese Yen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-white">{t('timezone')}</h3>
                  <Select 
                    value={userSettings?.timezone || 'UTC'} 
                    onValueChange={handleTimezoneChange}
                    className="w-full sm:w-72"
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder={t('selectTimezone')} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {timezones.map(zone => (
                        <SelectItem key={zone} value={zone} className="text-white">
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'data' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 text-white">{t('backupRestore')}</h3>
                  <div className="flex gap-4">
                    <Button onClick={handleExportData} className="bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4 mr-2" />
                      {t('downloadBackup')}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-white">{t('deleteUserData')}</h3>
                  <Button 
                    onClick={() => {
                      if (confirm(t('deleteAllDataConfirmation'))) {
                        handleDeleteAllData();
                      }
                    }} 
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    {t('deleteAllData')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'sidebar' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div>
                <h3 className="text-lg font-medium mb-3 text-white">{t('sidebarOrder')}</h3>
                <p className="text-gray-400 mb-4">{t('dragAndDrop')}</p>
                
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sidebar-items">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {sidebarItems.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                            isDragDisabled={item.name === 'Dashboard' || item.name === 'Settings'}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center p-3 rounded-lg bg-gray-700 ${
                                  item.name === 'Dashboard' || item.name === 'Settings' 
                                    ? 'border border-gray-500 opacity-75' 
                                    : 'border border-gray-600'
                                }`}
                              >
                                <div className="text-gray-400 mr-3">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="text-white">
                                  {item.name}
                                </div>
                                {(item.name === 'Dashboard' || item.name === 'Settings') && (
                                  <div className="ml-auto text-xs text-gray-400">
                                    {item.name === 'Dashboard' ? 'Always first' : 'Always last'}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <Button onClick={saveSidebarOrder} className="mt-4">
                  <Save className="w-4 h-4 mr-2" />
                  {t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'docs' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div>
                <h3 className="text-lg font-medium mb-3 text-white">{t('userManual')}</h3>
                <div className="prose prose-invert max-w-none">
                  <DocumentationContent language={language} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
