
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Download,
  Upload,
  Search,
  Filter,
  X,
  ChevronRight
} from "lucide-react";
import { Transaction, BankAccount, CreditCard, Category } from '@/api/entities';
import { ExtractDataFromUploadedFile, UploadFile } from '@/api/integrations';
import { UserSettings } from '@/api/entities';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionCard from '../components/transactions/TransactionCard';
import TransactionFilters from '../components/transactions/TransactionFilters';

// Hebrew translations for Transactions page
const translations = {
  en: {
    transactions: "Transactions",
    addTransaction: "Add Transaction",
    importData: "Import",
    downloading: "Downloading...",
    downloadTemplate: "Download Template",
    importing: "Importing...",
    searchTransactions: "Search transactions...",
    resetFilters: "Reset Filters",
    loading: "Loading...",
    noData: "No transactions found",
    editTransaction: "Edit Transaction"
  },
  he: {
    transactions: "עסקאות",
    addTransaction: "הוסף עסקה",
    importData: "ייבוא",
    downloading: "מוריד...",
    downloadTemplate: "הורד תבנית",
    importing: "מייבא...",
    searchTransactions: "חפש עסקאות...",
    resetFilters: "אפס סינון",
    loading: "טוען...",
    noData: "לא נמצאו עסקאות",
    editTransaction: "עריכת עסקה"
  }
};

export default function TransactionsPage() {
  const [language, setLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    startDate: null,
    endDate: null
  });
  const [isImporting, setIsImporting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);

  // Load language settings
  useEffect(() => {
    const loadLanguageSettings = async () => {
      try {
        const settings = await UserSettings.list();
        if (settings && settings.length > 0 && settings[0].language) {
          setLanguage(settings[0].language);
          setIsRTL(settings[0].language === 'he');
        }
      } catch (error) {
        console.error('Error loading language settings:', error);
      }
    };
    loadLanguageSettings();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData, accountsData, cardsData] = await Promise.all([
        Transaction.list('-date'),
        Category.list(),
        BankAccount.list(),
        CreditCard.list()
      ]);
      
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      setCategories(categoriesData);
      setAccounts(accountsData);
      setCards(cardsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Translation helper function
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    applyFilters(query, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(searchQuery, newFilters);
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      type: 'all',
      startDate: null,
      endDate: null
    });
    setSearchQuery('');
    setFilteredTransactions(transactions);
  };

  const applyFilters = (query, filterOptions) => {
    let filtered = [...transactions];
    
    // Apply search query
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.description?.toLowerCase().includes(lowercaseQuery) ||
        transaction.category?.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Apply category filter
    if (filterOptions.category && filterOptions.category !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.category === filterOptions.category
      );
    }
    
    // Apply type filter
    if (filterOptions.type && filterOptions.type !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.type === filterOptions.type
      );
    }
    
    // Apply date filters
    if (filterOptions.startDate) {
      const startDate = new Date(filterOptions.startDate);
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= startDate
      );
    }
    
    if (filterOptions.endDate) {
      const endDate = new Date(filterOptions.endDate);
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) <= endDate
      );
    }
    
    setFilteredTransactions(filtered);
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      if (editingTransaction) {
        await Transaction.update(editingTransaction.id, transactionData);
      } else {
        await Transaction.create(transactionData);
      }
      
      setIsFormOpen(false);
      setEditingTransaction(null);
      loadData();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await Transaction.delete(transactionId);
      loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const downloadTemplate = () => {
    // This would generate a template CSV file for users to download
    // For now, we'll create a simple one with the expected columns
    const csvContent = "date,amount,currency,type,category,description\n2023-01-01,100.00,USD,expense,Food,Grocery shopping";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transaction_template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    try {
      // First upload the file
      const { file_url } = await UploadFile({ file });
      
      // Then extract data using schema
      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string", format: "date" },
              amount: { type: "number" },
              currency: { type: "string" },
              type: { type: "string", enum: ["income", "expense"] },
              category: { type: "string" },
              description: { type: "string" }
            },
            required: ["date", "amount", "type", "category"]
          }
        }
      });
      
      if (result.status === "success" && result.output) {
        // Create transactions from the extracted data
        await Promise.all(
          result.output.map(item => Transaction.create(item))
        );
        
        // Reload data
        loadData();
      } else {
        console.error("Failed to extract data:", result.details);
      }
    } catch (error) {
      console.error("Error processing file upload:", error);
    } finally {
      setIsImporting(false);
      // Reset file input
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {t('transactions')}
        </h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            id="transaction-import"
            onChange={handleFileUpload}
          />
          <div className="flex sm:hidden w-full">
            <Button 
              onClick={() => {
                setEditingTransaction(null);
                setIsFormOpen(true);
              }} 
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>{t('addTransaction')}</span>
            </Button>
          </div>
          <div className="hidden sm:flex gap-2">
            <Button 
              variant="outline" 
              className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700" 
              onClick={downloadTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              <span>{t('downloadTemplate')}</span>
            </Button>
            <label htmlFor="transaction-import">
              <Button 
                variant="outline" 
                disabled={isImporting} 
                className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700" 
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  <span>{isImporting ? t('importing') : t('importData')}</span>
                </span>
              </Button>
            </label>
            <Button 
              onClick={() => {
                setEditingTransaction(null);
                setIsFormOpen(true);
              }} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>{t('addTransaction')}</span>
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-gray-500`} />
              <Input
                type="text"
                placeholder={t('searchTransactions')}
                className={`${isRTL ? 'pr-10' : 'pl-10'} bg-gray-900 border-gray-700 text-white placeholder-gray-500`}
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                >
                  <X className="w-4 h-4 mr-1" />
                  {t('resetFilters')}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <TransactionFilters 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                  categories={categories}
                  isRTL={isRTL}
                  t={t}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredTransactions.length > 0 ? (
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={() => handleEditTransaction(transaction)}
              onDelete={() => handleDeleteTransaction(transaction.id)}
              isRTL={isRTL}
              t={t}
            />
          ))}
        </div>
      ) : (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">{t('noData')}</p>
          </CardContent>
        </Card>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <h2 className="text-xl font-bold mb-4 text-white">
              {editingTransaction ? t('editTransaction') : t('addTransaction')}
            </h2>
            <TransactionForm
              transaction={editingTransaction}
              onSave={handleSaveTransaction}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingTransaction(null);
              }}
              categories={categories}
              accounts={accounts}
              cards={cards}
              isRTL={isRTL}
              t={t}
            />
          </div>
        </div>
      )}
    </div>
  );
}
