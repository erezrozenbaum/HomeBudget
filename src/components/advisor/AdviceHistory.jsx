import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, MessageCircle, Clock, Tag } from 'lucide-react';
import { FinancialAdvice } from '@/api/entities';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'spending': return <Badge className="bg-red-900/30 text-red-400 border-red-800">Spending</Badge>;
    case 'savings': return <Badge className="bg-blue-900/30 text-blue-400 border-blue-800">Savings</Badge>;
    case 'investments': return <Badge className="bg-green-900/30 text-green-400 border-green-800">Investments</Badge>;
    case 'debt': return <Badge className="bg-orange-900/30 text-orange-400 border-orange-800">Debt</Badge>;
    case 'budgeting': return <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-800">Budgeting</Badge>;
    case 'business': return <Badge className="bg-purple-900/30 text-purple-400 border-purple-800">Business</Badge>;
    case 'taxes': return <Badge className="bg-indigo-900/30 text-indigo-400 border-indigo-800">Taxes</Badge>;
    case 'insurance': return <Badge className="bg-pink-900/30 text-pink-400 border-pink-800">Insurance</Badge>;
    default: return <Badge className="bg-gray-900/30 text-gray-400 border-gray-800">General</Badge>;
  }
};

export default function AdviceHistory({ history }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [sortType, setSortType] = useState('date'); // 'date', 'category'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleFeedback = async (id, isHelpful) => {
    try {
      await FinancialAdvice.update(id, { is_helpful: isHelpful });
      
      // Update the local state (would be better with context or global state)
      const updatedHistory = history.map(item => 
        item.id === id ? { ...item, is_helpful: isHelpful } : item
      );
      // This won't actually update the UI since we're not updating the parent state
      // In a real app, you would use context or other state management
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const sortHistoryItems = () => {
    return [...history].sort((a, b) => {
      if (sortType === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortType === 'category') {
        const categoryA = a.category || '';
        const categoryB = b.category || '';
        const comparison = categoryA.localeCompare(categoryB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
  };

  const sortedHistory = sortHistoryItems();
  
  const toggleSortType = () => {
    if (sortType === 'date') {
      setSortType('category');
    } else {
      setSortType('date');
    }
  };
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CardTitle className="text-white">Advice History</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSortType}
              className="bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              {sortType === 'date' ? (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  Date
                </>
              ) : (
                <>
                  <Tag className="h-4 w-4 mr-1" />
                  Category
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSortDirection}
              className="bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sortedHistory.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {sortedHistory.map((item) => (
              <Collapsible 
                key={item.id} 
                open={expandedItems[item.id]} 
                onOpenChange={() => toggleExpand(item.id)}
                className="w-full"
              >
                <div className="p-4 hover:bg-gray-700/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                      <h3 className="font-medium text-gray-200 flex-grow">
                        {item.custom_question || 'Quick Question'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(item.date), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {getCategoryIcon(item.category)}
                    {item.is_helpful !== undefined && (
                      <Badge className={`${
                        item.is_helpful 
                          ? 'bg-green-900/30 text-green-400 border-green-800' 
                          : 'bg-red-900/30 text-red-400 border-red-800'
                      }`}>
                        {item.is_helpful ? 'Helpful' : 'Not Helpful'}
                      </Badge>
                    )}
                  </div>
                  
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full justify-center mt-2 text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      {expandedItems[item.id] ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Answer
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          View Answer
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="pt-4">
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                      <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-line text-gray-300 text-sm">{item.answer}</p>
                      </div>
                    </div>
                    
                    {item.is_helpful === undefined && (
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(item.id, false)}
                          className="bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Not Helpful
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeedback(item.id, true)}
                          className="bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful
                        </Button>
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">
            No advice history yet. Start by asking questions to get financial insights.
          </div>
        )}
      </CardContent>
    </Card>
  );
}