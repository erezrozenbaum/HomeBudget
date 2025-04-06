import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CreditCard, Building2, Calendar, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
}

export default function CreditCardCard({ card, account, onEdit, onDelete }) {
  const [businessData, setBusinessData] = useState(null);
  
  useEffect(() => {
    // If this is a business card, load the business data
    if (card.account_type !== 'personal' && card.business_id) {
      loadBusinessData();
    }
  }, [card]);
  
  const loadBusinessData = async () => {
    try {
      const { Business } = await import('@/api/entities');
      const businessesData = await Business.list();
      const business = businessesData.find(b => b.id === card.business_id);
      setBusinessData(business);
    } catch (error) {
      console.error("Error loading business data:", error);
    }
  };

  if (!account) return null;

  return (
    <Card className="overflow-hidden bg-gray-800 border-gray-700">
      <div className="flex items-center p-4 gap-3">
        <div 
          className="w-2 h-12 rounded-full" 
          style={{ backgroundColor: card.color || account.color || '#ef4444' }}
        />
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white">
                {card.name}
                
                {/* Display business badge if applicable */}
                {card.account_type !== 'personal' && (
                  <span className="ml-2">
                    {card.account_type === 'business' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Business
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Mixed ({card.business_use_percentage}% business)
                      </span>
                    )}
                  </span>
                )}
                
                {/* Display business name if available */}
                {businessData && (
                  <span 
                    className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${businessData.color}30`,
                      color: businessData.color
                    }}
                  >
                    {businessData.name}
                  </span>
                )}
              </h3>
              
              <div className="text-sm text-gray-400 flex items-center gap-1">
                <span>•••• {card.last_four_digits}</span>
                
                {account && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{account.name}</span>
                  </>
                )}
              </div>
            </div>
            
            {!card.is_active && (
              <Badge className="bg-gray-700 text-gray-300">Inactive</Badge>
            )}
          </div>
          
          {card.spending_limit && (
            <div className="mt-2">
              <div className="text-sm text-gray-400">
                Limit: {formatCurrency(card.spending_limit, account.currency)}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex divide-x divide-gray-700 border-t border-gray-700">
        <Button 
          variant="ghost" 
          className="flex-1 rounded-none h-10 text-gray-300 hover:text-white hover:bg-gray-700"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button 
          variant="ghost" 
          className="flex-1 rounded-none h-10 text-gray-300 hover:text-white hover:bg-gray-700"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </Card>
  );
}