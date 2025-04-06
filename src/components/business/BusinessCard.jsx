import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Wallet, Users, FileText, Folder, Pencil, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";

export default function BusinessCard({ business, stats, isSelected, onClick, onEdit, onDelete }) {
  const getBusinessTypeLabel = (type) => {
    switch (type) {
      case 'sole_proprietorship': return 'Sole Proprietorship';
      case 'llc': return 'LLC';
      case 'corporation': return 'Corporation';
      case 'partnership': return 'Partnership';
      case 'other': return 'Other';
      default: return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'planning': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card 
      className={`border-2 ${isSelected ? `border-blue-500` : 'border-gray-700'} bg-gray-800 hover:bg-gray-750 cursor-pointer transition-all`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: business.color || '#4f46e5' }}
          >
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white truncate">{business.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(business.status)} text-white`}>
                {business.status}
              </span>
            </div>
            <p className="text-sm text-gray-400">{getBusinessTypeLabel(business.type)}</p>
          </div>
        </div>
        
        {business.description && (
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">{business.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-xs text-gray-400">
            <span className="block">Industry</span>
            <span className="font-medium text-gray-300">{business.industry || 'Not specified'}</span>
          </div>
          {business.start_date && (
            <div className="text-xs text-gray-400">
              <span className="block">Started</span>
              <span className="font-medium text-gray-300">{format(new Date(business.start_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Wallet className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-gray-300">{stats.accounts}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-gray-300">{stats.clients}</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-gray-300">{stats.invoices}</span>
            </div>
            <div className="flex items-center">
              <Folder className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-gray-300">{stats.projects}</span>
            </div>
          </div>
        </div>

        <div className="flex divide-x divide-gray-700 border-t border-gray-700 mt-4 -mx-4 -mb-4">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none h-10 text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(business);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none h-10 text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(business.id);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}