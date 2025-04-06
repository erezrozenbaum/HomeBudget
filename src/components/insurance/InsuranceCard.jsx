import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { 
  Shield, 
  Home, 
  Car, 
  HeartPulse, 
  UserRound,
  Dog,
  Plane,
  Calendar,
  Pencil,
  Trash2,
  CreditCard
} from "lucide-react";

export default function InsuranceCard({ insurance, onEdit, onDelete }) {
  const getInsuranceIcon = () => {
    switch (insurance.type) {
      case 'health': return <HeartPulse className="w-5 h-5" />;
      case 'auto': return <Car className="w-5 h-5" />;
      case 'home': return <Home className="w-5 h-5" />;
      case 'life': return <UserRound className="w-5 h-5" />;
      case 'pet': return <Dog className="w-5 h-5" />;
      case 'travel': return <Plane className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getInsuranceTypeLabel = () => {
    const types = {
      health: 'Health Insurance',
      auto: 'Auto Insurance',
      home: 'Home Insurance',
      life: 'Life Insurance',
      pet: 'Pet Insurance',
      travel: 'Travel Insurance',
      other: 'Insurance'
    };
    return types[insurance.type] || 'Insurance';
  };

  const getStatusColor = () => {
    switch (insurance.status) {
      case 'active': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'expired': return 'bg-red-500 text-white';
      case 'canceled': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getRenewalBadge = () => {
    if (!insurance.renewal_date) return null;
    
    const renewalDate = new Date(insurance.renewal_date);
    const today = new Date();
    const daysUntilRenewal = differenceInDays(renewalDate, today);
    
    return (
      <div className="text-xs inline-flex items-center font-medium rounded-md px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        {daysUntilRenewal < 0 
          ? "Expired" 
          : daysUntilRenewal <= 30 
            ? `Renews in ${daysUntilRenewal} days`
            : `Renews in ${daysUntilRenewal} days`}
      </div>
    );
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: insurance.currency || 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace(/[USD|ILS|EUR|GBP|JPY]/, insurance.currency || 'ILS');
  };

  return (
    <div className="bg-[#1e1f2d] rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">{insurance.name}</h3>
          <Badge className={getStatusColor()}>
            {insurance.status.charAt(0).toUpperCase() + insurance.status.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 text-gray-300 mb-4">
          {getInsuranceIcon()}
          <span>{getInsuranceTypeLabel()}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400">Provider</div>
            <div className="text-white">{insurance.provider}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">Total Cost</div>
            <div className="font-semibold text-white">{formatCurrency(insurance.full_amount)}</div>
          </div>
          
          {insurance.payment_type === 'installments' && (
            <>
              <div>
                <div className="text-sm text-gray-400">Payment Plan</div>
                <div className="flex items-center text-white">
                  <CreditCard className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{insurance.installments_total} payments</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Per Payment</div>
                <div className="text-white">{formatCurrency(insurance.installment_amount || (insurance.full_amount / insurance.installments_total))}</div>
              </div>
            </>
          )}
          
          <div>
            <div className="text-sm text-gray-400">Start Date</div>
            <div className="text-white">{insurance.start_date ? format(new Date(insurance.start_date), 'MMM d, yyyy') : '-'}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">Renewal Date</div>
            <div className="text-white">{insurance.renewal_date ? format(new Date(insurance.renewal_date), 'MMM d, yyyy') : '-'}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">Policy Number</div>
            <div className="text-white">{insurance.policy_number || '-'}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">Deductible</div>
            <div className="text-white">{insurance.deductible ? formatCurrency(insurance.deductible) : '-'}</div>
          </div>
        </div>
        
        {insurance.renewal_date && (
          <div className="flex justify-center mt-2">
            {getRenewalBadge()}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 border-t border-gray-700 p-4">
        <button 
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-700 bg-gray-800 text-white rounded hover:bg-gray-700"
          onClick={() => onEdit(insurance)}
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>
        <button 
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-900/50 text-red-200 border border-red-800/50 rounded hover:bg-red-800/50"
          onClick={() => onDelete(insurance.id)}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}