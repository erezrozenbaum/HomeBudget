
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import {
  Plus,
  Landmark,
  Calculator,
  Calendar,
  X
} from "lucide-react";
import { Loan } from '@/api/entities';
import { BankAccount } from '@/api/entities';
import LoanCard from '../components/loans/LoanCard';
import LoanForm from '../components/loans/LoanForm';
import LoanCalculator from '../components/loans/LoanCalculator';
import AmortizationSchedule from '../components/loans/AmortizationSchedule';
import { UserSettings } from '@/api/entities';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSettings, setUserSettings] = useState({ default_currency: 'ILS' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loansData, accountsData, settingsData] = await Promise.all([
        Loan.list(),
        BankAccount.list(),
        UserSettings.list()
      ]);
      
      setLoans(loansData);
      setAccounts(accountsData);
      
      // Get user settings for default currency
      if (settingsData.length > 0) {
        setUserSettings(settingsData[0]);
      }
      
      // Select the first loan by default if available
      if (loansData.length > 0 && !selectedLoan) {
        setSelectedLoan(loansData[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setIsFormOpen(true);
  };

  const handleSave = async (loanData) => {
    try {
      if (editingLoan) {
        await Loan.update(editingLoan.id, loanData);
      } else {
        await Loan.create(loanData);
      }
      setIsFormOpen(false);
      setEditingLoan(null);
      loadData();
    } catch (error) {
      console.error('Error saving loan:', error);
    }
  };

  const handleDelete = async (loanId) => {
    try {
      await Loan.delete(loanId);
      if (selectedLoan && selectedLoan.id === loanId) {
        setSelectedLoan(null);
      }
      loadData();
    } catch (error) {
      console.error('Error deleting loan:', error);
    }
  };

  const calculateTotalDebt = () => {
    return loans.reduce((total, loan) => total + (loan.current_balance || 0), 0);
  };

  const calculateMonthlyPayments = () => {
    return loans.reduce((total, loan) => total + (loan.payment_amount || 0), 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userSettings.default_currency || 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const openAddLoanModal = () => {
    setEditingLoan(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Debt Management</h1>
          <p className="text-gray-400">Track and manage all your loans</p>
        </div>
        
        <Button onClick={openAddLoanModal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Loan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-700 bg-gray-800/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(calculateTotalDebt())}</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-700 bg-gray-800/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Monthly Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(calculateMonthlyPayments())}</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-700 bg-gray-800/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{loans.filter(l => l.status === 'active').length}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            <Landmark className="w-4 h-4 mr-2" />
            Loans Overview
          </TabsTrigger>
          <TabsTrigger value="calculator" className="data-[state=active]:bg-blue-600">
            <Calculator className="w-4 h-4 mr-2" />
            Loan Calculator
          </TabsTrigger>
          {selectedLoan && (
            <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-600">
              <Calendar className="w-4 h-4 mr-2" />
              Amortization Schedule
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          {loans.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  account={accounts.find(a => a.id === loan.linked_account_id)}
                  onEdit={() => handleEdit(loan)}
                  onDelete={() => handleDelete(loan.id)}
                  isSelected={selectedLoan?.id === loan.id}
                  onSelect={() => setSelectedLoan(loan)}
                />
              ))}
            </div>
          ) : (
            <Card className="col-span-full border-gray-700 bg-gray-800/90">
              <CardContent className="p-6 text-center">
                <Landmark className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-300">No loans yet. Click "Add Loan" to add one.</p>
                <Button 
                  onClick={openAddLoanModal} 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Loan
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="calculator" className="pt-4">
          <LoanCalculator />
        </TabsContent>
        
        <TabsContent value="schedule" className="pt-4">
          {selectedLoan ? (
            <AmortizationSchedule loan={selectedLoan} />
          ) : (
            <Card className="border-gray-700 bg-gray-800">
              <CardContent className="p-6 text-center">
                <p className="text-gray-400">Select a loan to view its amortization schedule</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal for Add/Edit Loan */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsFormOpen(false)}
          />
          <div className="relative bg-[#0f172a] rounded-lg shadow-lg w-full max-w-xl overflow-auto max-h-[90vh] z-50">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {editingLoan ? 'Edit Loan' : 'New Loan'}
                </h2>
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X size={18} />
                </Button>
              </div>
              <LoanForm
                loan={editingLoan}
                accounts={accounts}
                onSave={handleSave}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingLoan(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
