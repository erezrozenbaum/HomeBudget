import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Home, 
  Car, 
  Watch, 
  Gem, 
  Paintbrush,
  Calendar,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Map
} from "lucide-react";

export default function AssetCard({ asset, onEdit, onDelete }) {
  const getAssetIcon = () => {
    switch (asset.type) {
      case 'real_estate':
        return <Home className="w-6 h-6" />;
      case 'vehicle':
        return <Car className="w-6 h-6" />;
      case 'jewelry':
        return <Gem className="w-6 h-6" />;
      case 'art':
        return <Paintbrush className="w-6 h-6" />;
      default:
        return <Watch className="w-6 h-6" />;
    }
  };

  const getAssetTypeLabel = () => {
    const types = {
      real_estate: 'Real Estate',
      vehicle: 'Vehicle',
      art: 'Art',
      jewelry: 'Jewelry',
      other: 'Other Asset'
    };
    return types[asset.type] || 'Asset';
  };
  
  // Calculate trend percentage
  const calculateTrend = () => {
    if (!asset.purchase_value || !asset.current_value) return 0;
    return ((asset.current_value - asset.purchase_value) / asset.purchase_value) * 100;
  };
  
  const trend = calculateTrend();
  const isPositive = trend >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{asset.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              {getAssetIcon()}
              <span className="ml-1">{getAssetTypeLabel()}</span>
            </CardDescription>
          </div>
          <Badge className={asset.type === 'real_estate' ? 'bg-blue-100 text-blue-800' : 
                           asset.type === 'vehicle' ? 'bg-green-100 text-green-800' : 
                           'bg-purple-100 text-purple-800'}>
            {getAssetTypeLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Current Value</span>
            <span className="text-xl font-semibold">
              {asset.currency} {asset.current_value?.toLocaleString() || 0}
            </span>
          </div>
          
          {asset.purchase_value > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Purchase Value</span>
              <div className="flex items-center gap-2">
                <span>{asset.currency} {asset.purchase_value?.toLocaleString() || 0}</span>
                {trend !== 0 && (
                  <Badge className={isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(trend).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            {asset.purchase_date && (
              <div>
                <span className="block text-muted-foreground">Purchase Date</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(asset.purchase_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            
            {asset.last_valuation_date && (
              <div>
                <span className="block text-muted-foreground">Last Valuation</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(asset.last_valuation_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
          
          {asset.location && (
            <div className="text-sm">
              <span className="block text-muted-foreground">Location</span>
              <span className="flex items-center gap-1">
                <Map className="w-3 h-3" />
                {asset.location}
              </span>
            </div>
          )}
          
          {asset.description && (
            <div className="text-sm">
              <span className="block text-muted-foreground">Notes</span>
              <p className="mt-1 text-sm">{asset.description}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}