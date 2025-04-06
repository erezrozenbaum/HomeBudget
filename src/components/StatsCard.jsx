import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function StatsCard({ 
  title, 
  value, 
  trend = 0,
  trendType = '',  // Add this new prop to explain the trend type
  currencySymbol, 
  description, 
  icon: Icon, 
  color 
}) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    amber: "text-amber-600"
  };

  const isPositiveTrend = trend >= 0;

  const getTrendExplanation = () => {
    switch (trendType) {
      case 'balance':
        return 'Change from start of month';
      case 'income':
        return 'Compared to previous month';
      case 'expenses':
        return 'Compared to previous month';
      case 'investments':
        return 'Return from initial investment';
      default:
        return 'Change';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex items-center gap-1 ${isPositiveTrend ? 'text-green-600' : 'text-red-600'} cursor-help`}>
                    {isPositiveTrend ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span className="text-sm">{Math.abs(trend).toFixed(1)}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getTrendExplanation()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="mt-4">
          <span className="text-sm text-muted-foreground">{title}</span>
          <h3 className="text-2xl font-bold mt-1">{currencySymbol}{value.toLocaleString()}</h3>
          <span className="text-sm text-muted-foreground mt-1">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}