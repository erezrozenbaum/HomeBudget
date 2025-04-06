import React from 'react';
import { Button } from "@/components/ui/button";
import { Building2, FileText, Users, Folder } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BusinessOverview({ business }) {
  if (!business) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <Link 
        to={`${createPageUrl('BusinessClients')}?business=${business.id}`}
        className="p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center text-center"
      >
        <Users className="w-8 h-8 text-blue-400 mb-3" />
        <h3 className="text-lg font-medium text-white">Clients</h3>
        <p className="text-gray-400">Manage your client relationships</p>
      </Link>
      
      <Link 
        to={`${createPageUrl('BusinessInvoices')}?business=${business.id}`}
        className="p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center text-center"
      >
        <FileText className="w-8 h-8 text-green-400 mb-3" />
        <h3 className="text-lg font-medium text-white">Invoices</h3>
        <p className="text-gray-400">Create and manage invoices</p>
      </Link>
      
      <Link 
        to={`${createPageUrl('BusinessProjects')}?business=${business.id}`}
        className="p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center text-center"
      >
        <Folder className="w-8 h-8 text-amber-400 mb-3" />
        <h3 className="text-lg font-medium text-white">Projects</h3>
        <p className="text-gray-400">Track project progress and revenue</p>
      </Link>
      
      <Link 
        to={`${createPageUrl('BusinessSettings')}?business=${business.id}`}
        className="p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center text-center"
      >
        <Building2 className="w-8 h-8 text-purple-400 mb-3" />
        <h3 className="text-lg font-medium text-white">Profile</h3>
        <p className="text-gray-400">Manage business profile and settings</p>
      </Link>
    </div>
  );
}