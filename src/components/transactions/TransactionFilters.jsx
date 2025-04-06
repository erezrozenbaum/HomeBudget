
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function TransactionFilters({ filters, onFiltersChange, categories }) {
  const [businesses, setBusinesses] = useState([]);
  const [businessLoaded, setBusinessLoaded] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const { Business } = await import('@/api/entities');
      const businessesData = await Business.list();
      setBusinesses(businessesData);
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setBusinessLoaded(true);
    }
  };

  const handleChange = (field, value) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  return (
    <div className="space-y-3">
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10 bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500 w-full"
        />
      </div>

      <div className="md:hidden w-full">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex justify-between items-center w-full bg-gray-800 border-gray-700 text-gray-100">
              <span className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                Filters
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Select
                  value={filters.type}
                  onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-100">
                    <SelectValue placeholder="All Types" className="text-gray-100" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-gray-100">
                    <SelectItem value="all" className="text-gray-100">All Types</SelectItem>
                    <SelectItem value="income" className="text-gray-100">Income</SelectItem>
                    <SelectItem value="expense" className="text-gray-100">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={filters.category}
                  onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-100">
                    <SelectValue placeholder="All Categories" className="text-gray-100" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-gray-100">
                    <SelectItem value="all" className="text-gray-100">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name} className="text-gray-100">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                  className="bg-gray-900 border-gray-700 text-gray-100 w-full"
                  placeholder="From date"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                  className="bg-gray-900 border-gray-700 text-gray-100 w-full"
                  placeholder="To date"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => onFiltersChange({
                dateFrom: null,
                dateTo: null,
                type: 'all',
                category: 'all',
                search: ''
              })}
              className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700 w-full"
            >
              Reset Filters
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="hidden md:block space-y-4">
        <div className="flex gap-4">
          <div className="w-[200px]">
            <Select
              value={filters.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-100">
                <SelectValue placeholder="All Types" className="text-gray-100" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-gray-100">
                <SelectItem value="all" className="text-gray-100">All Types</SelectItem>
                <SelectItem value="income" className="text-gray-100">Income</SelectItem>
                <SelectItem value="expense" className="text-gray-100">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[200px]">
            <Select
              value={filters.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-100">
                <SelectValue placeholder="All Categories" className="text-gray-100" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-gray-100">
                <SelectItem value="all" className="text-gray-100">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.name} value={category.name} className="text-gray-100">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
           {/* Business Filter */}
          <div className="w-[200px]">
            <Select
              value={filters.business_id || 'all'}
              onValueChange={(value) => handleChange('business_id', value === 'all' ? null : value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-100">
                <SelectValue placeholder="All Transactions" className="text-gray-100"/>
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-gray-100">
                <SelectItem value="all" className="text-gray-100">All Transactions</SelectItem>
                {businessLoaded && businesses.map(business => (
                  <SelectItem key={business.id} value={business.id} className="text-gray-100">
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
              className="bg-gray-900 border-gray-700 text-gray-100"
            />
          </div>
          <div className="flex-1">
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
              className="bg-gray-900 border-gray-700 text-gray-100"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => onFiltersChange({
              dateFrom: null,
              dateTo: null,
              type: 'all',
              category: 'all',
              search: ''
            })}
            className="border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
