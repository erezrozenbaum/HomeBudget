import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Category } from '@/api/entities';

export default function AccountTransactions({ transactions = [], defaultCurrency, t = key => key, isRTL = false }) {
  const [categories, setCategories] = React.useState([]);
  const recentTransactions = transactions.slice(0, 10);

  // Load categories to get Hebrew translations
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await Category.list();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  // Helper function to get the Hebrew category name if available
  const getTranslatedCategory = (categoryName) => {
    if (!categoryName) return 'General';
    
    // Find the matching category
    const category = categories.find(c => 
      c.name?.toLowerCase() === categoryName?.toLowerCase()
    );
    
    if (category && isRTL && category.name_he) {
      return category.name_he;
    }
    
    return categoryName;
  };

  // Helper function to get the Hebrew subcategory name if available
  const getTranslatedSubcategory = (categoryName, subcategoryName) => {
    if (!categoryName || !subcategoryName) return 'General';
    
    // Find the matching category
    const category = categories.find(c => 
      c.name?.toLowerCase() === categoryName?.toLowerCase()
    );
    
    if (category?.subcategories && isRTL) {
      const subcategory = category.subcategories.find(s => 
        s.name?.toLowerCase() === subcategoryName?.toLowerCase()
      );
      
      if (subcategory?.name_he) {
        return subcategory.name_he;
      }
    }
    
    return subcategoryName;
  };

  return (
    <div className="divide-y divide-gray-700">
      {recentTransactions.map((transaction) => (
        <div 
          key={transaction.id}
          className="flex items-center p-4 hover:bg-gray-700/50 transition-colors"
        >
          <div className={`p-2 rounded-lg ${isRTL ? 'ml-4' : 'mr-4'} ${
            transaction.type === 'income' 
              ? 'bg-green-900/50 text-green-400' 
              : 'bg-red-900/50 text-red-400'
          }`}>
            {transaction.type === 'income' ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {transaction.description || getTranslatedCategory(transaction.category)}
            </p>
            <p className="text-sm text-gray-400">
              {getTranslatedCategory(transaction.category)} • {getTranslatedSubcategory(transaction.category, transaction.subcategory)}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(transaction.date), 'MMM d, yyyy')}
            </p>
          </div>
          
          <div className={`text-sm font-medium ${
            transaction.type === 'income' 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}
            {transaction.currency} {transaction.amount.toLocaleString()}
          </div>
        </div>
      ))}
      
      {recentTransactions.length === 0 && (
        <div className="py-8 text-center text-gray-400">
          {t('noTransactions')}
        </div>
      )}
    </div>
  );
}