
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { 
  PiggyBank, 
  TrendingUp, 
  Calendar, 
  CircleDollarSign,
  Pencil, 
  Trash2 
} from "lucide-react";
import { Investment } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";

export default function InvestmentCard({ investment, showActions = true, onEdit, onDelete }) {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [businessData, setBusinessData] = useState(null);

  useEffect(() => {
    if (investment.type === 'crypto' && investment.units) {
      fetchCryptoPrice();
    }
    
    // Load business data if this is a business investment
    if (investment.is_business_investment && investment.business_id) {
      loadBusinessData();
    }
  }, [investment]);

  const loadBusinessData = async () => {
    try {
      const { Business } = await import('@/api/entities');
      const businessesData = await Business.list();
      const business = businessesData.find(b => b.id === investment.business_id);
      setBusinessData(business);
    } catch (error) {
      console.error("Error loading business data:", error);
    }
  };

  const fetchCryptoPrice = async () => {
    if (!investment.name || !investment.currency) return;
    
    setLoading(true);
    setError(null);

    try {
      // Try to get crypto symbol from investment name
      const nameMatch = investment.name.match(/(\w+)(?:\s*-\s*(\w+))?/);
      const cryptoSymbol = nameMatch?.[2] || nameMatch?.[1] || '';

      if (!cryptoSymbol) {
        console.log("Could not extract crypto symbol from name:", investment.name);
        return;
      }

      // Use a more reliable approach with error handling
      try {
        const result = await InvokeLLM({
          prompt: `What is the current price of ${cryptoSymbol} cryptocurrency in ${investment.currency}? Please return only the numeric value.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              price: { type: "number" }
            }
          }
        });
        
        if (result && typeof result.price === 'number') {
          setCurrentPrice(result.price);
          
          // Update the investment with the current price
          try {
            await Investment.update(investment.id, {
              current_price_per_unit: result.price,
              current_amount: result.price * investment.units
            });
          } catch (updateError) {
            console.error("Error updating investment with new price:", updateError);
          }
        }
      } catch (llmError) {
        console.error("Error fetching crypto price with LLM:", llmError);
        setError("Could not fetch current price");
        // Fall back to current_price_per_unit if available
        if (investment.current_price_per_unit) {
          setCurrentPrice(investment.current_price_per_unit);
        }
      }
    } catch (e) {
      console.error("Error fetching crypto price:", e);
      setError("Could not fetch current price");
      // Fall back to current_price_per_unit if available
      if (investment.current_price_per_unit) {
        setCurrentPrice(investment.current_price_per_unit);
      }
    } finally {
      setLoading(false);
    }
  };

  const account = {
    color: investment.color,
    currency: investment.currency
  };

  const cardColor = account?.color || investment.color;
  const currency = account?.currency || investment.currency;

  const isStockOrCrypto = ['stock', 'crypto'].includes(investment.type);
  const currentAmount = isStockOrCrypto 
    ? (investment.units * (currentPrice !== null ? currentPrice : (investment.current_price_per_unit || investment.price_per_unit)))
    : (investment.current_amount || investment.initial_amount);

  const getProgress = () => {
    if (!investment.initial_amount) return 0;
    const progress = ((currentAmount - investment.initial_amount) / investment.initial_amount) * 100;
    return Math.max(-100, Math.min(100, progress));
  };

  const progress = getProgress();
  const isPositive = progress >= 0;

  const formatCurrency = (amount) => {
    return amount?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0.00';
  };

  const formatUnits = (units) => {
    return units?.toLocaleString(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    }) || '0.000000';
  };

  const getReturnAmount = () => {
    if (!currentAmount || !investment.initial_amount) return 0;
    return currentAmount - investment.initial_amount;
  };

  return (
    <Card className="overflow-hidden">
      <div 
        className="h-2"
        style={{ backgroundColor: cardColor }}
      />
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${cardColor}20`, color: cardColor }}
          >
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{investment.name}</h3>
            
            {/* Display business badge if applicable */}
            {investment.is_business_investment && (
              <div className="flex items-center gap-1 mt-1">
                {businessData ? (
                  <span 
                    className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ 
                      backgroundColor: `${businessData.color}20`,
                      color: businessData.color
                    }}
                  >
                    {businessData.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
                    Business
                  </span>
                )}
                
                {investment.business_category && (
                  <span className="text-xs text-gray-500">
                    {investment.business_category}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-2xl font-bold">
              {currency} {formatCurrency(currentAmount)}
            </p>
            {investment.initial_amount !== currentAmount && (
              <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : '-'}{currency} {formatCurrency(Math.abs(getReturnAmount()))}
              </p>
            )}
          </div>

          {currentAmount && investment.initial_amount && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Return</span>
                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{progress.toFixed(2)}%
                </span>
              </div>
              <Progress 
                value={Math.abs(progress)} 
                className={isPositive ? "bg-green-100" : "bg-red-100"}
                indicatorClassName={isPositive ? "bg-green-600" : "bg-red-600"}
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium capitalize">
                {investment.type.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Initial Investment</p>
              <p className="font-medium">
                {currency} {formatCurrency(investment.initial_amount)}
              </p>
            </div>
          </div>

          {isStockOrCrypto && investment.units && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Units</p>
                <p className="font-medium">{formatUnits(investment.units)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Price</p>
                {loading ? (
                  <p className="font-medium">Loading...</p>
                ) : error ? (
                  <p className="font-medium text-red-500">{error}</p>
                ) : currentPrice !== null ? (
                  <>
                    <p className="font-medium">
                      {currency} {formatCurrency(currentPrice)}
                    </p>
                    {investment.price_per_unit !== currentPrice && (
                      <p className={`text-xs ${
                        currentPrice > investment.price_per_unit 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        Initial: {currency} {formatCurrency(investment.price_per_unit)}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-medium">
                      {currency} {formatCurrency(investment.current_price_per_unit || investment.price_per_unit)}
                    </p>
                    {investment.price_per_unit !== investment.current_price_per_unit && (
                      <p className={`text-xs ${
                        (investment.current_price_per_unit || investment.price_per_unit) > investment.price_per_unit
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        Initial: {currency} {formatCurrency(investment.price_per_unit)}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {investment.recurring_contribution > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>
                Contributing {currency} {formatCurrency(investment.recurring_contribution)} monthly
              </span>
            </div>
          )}

          {investment.description && (
            <p className="text-sm text-muted-foreground">
              {investment.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Started: {format(new Date(investment.start_date), 'MMM d, yyyy')}</span>
            {investment.end_date && (
              <span>Ends: {format(new Date(investment.end_date), 'MMM d, yyyy')}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
