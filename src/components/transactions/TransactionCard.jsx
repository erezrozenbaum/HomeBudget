import React from 'react';
import { Card } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Edit 
} from "lucide-react";
import { format } from "date-fns";

export default function TransactionCard({ 
  transaction, 
  onEdit, 
  onDelete,
  isRTL = false,
  t
}) {
  // Default translation function if not provided
  const translate = t || ((key) => key);

  // Helper function to format the category and subcategory
  const formatCategory = (category, subcategory) => {
    const translatedCategory = translate(category.toLowerCase().replace(/[& ]/g, ''));
    const translatedSubcategory = subcategory ? translate(subcategory.toLowerCase().replace(/[& ]/g, '')) : '';
    
    return translatedSubcategory 
      ? `${translatedCategory} • ${translatedSubcategory}`
      : translatedCategory;
  };

  // Format the date in the correct language
  const formatDate = (date) => {
    const d = new Date(date);
    const month = translate(format(d, 'MMM').toLowerCase());
    const day = format(d, 'd');
    const year = format(d, 'yyyy');
    
    return `${month} ${day}, ${year}`;
  };

  return (
    <Card 
      className="p-4 border-l-4 bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors"
      style={{
        borderLeftWidth: isRTL ? 0 : 4,
        borderRightWidth: isRTL ? 4 : 0,
        borderLeftColor: isRTL ? 'transparent' : transaction.type === 'income' ? '#22c55e' : '#ef4444',
        borderRightColor: isRTL ? transaction.type === 'income' ? '#22c55e' : '#ef4444' : 'transparent',
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${
            transaction.type === 'income' 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-red-500/20 text-red-500'
          }`}>
            {transaction.type === 'income' ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <ArrowDownRight className="h-5 w-5" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-white">
              {transaction.description || formatCategory(transaction.category, transaction.subcategory)}
            </h3>
            <div className="flex items-center text-sm text-gray-400">
              <span>
                {formatCategory(transaction.category, transaction.subcategory)} • {formatDate(transaction.date)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`font-medium ${
            transaction.type === 'income' 
              ? 'text-green-500' 
              : 'text-red-500'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}
            {transaction.currency} {transaction.amount.toLocaleString()}
          </span>
          
          <div className="flex items-center">
            <button 
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              aria-label={translate('edit')}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              aria-label={translate('delete')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}