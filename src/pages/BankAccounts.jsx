import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, X, Trash } from "lucide-react";
import BankAccountForm from '../components/accounts/BankAccountForm';
import BankAccountCard from '../components/accounts/BankAccountCard';
import { BankAccount } from '@/api/entities';
import { apiClient } from '@/api/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [isClearingData, setIsClearingData] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await BankAccount.list();
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load bank accounts');
    }
  };

  const handleEdit = (account) => {
    console.log("Editing account:", account);
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleSave = async (accountData) => {
    try {
      if (editingAccount) {
        await BankAccount.update(editingAccount.id, accountData);
        toast.success('Bank account updated successfully');
      } else {
        await BankAccount.create(accountData);
        toast.success('Bank account created successfully');
      }
      setIsFormOpen(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error(error.message || 'Failed to save bank account');
    }
  };

  const handleDelete = async (accountId) => {
    try {
      const response = await BankAccount.delete(accountId);
      if (response && response.message) {
        toast.success(response.message);
        loadAccounts();
        setDeletingAccount(null);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete bank account');
      // Keep the dialog open if there's an error
      if (error.message === 'Cannot delete account with existing transactions') {
        toast.error('Cannot delete account with existing transactions. Please delete all transactions first.');
      }
    }
  };

  const handleClearAllData = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/accounts/clear-all-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear data');
      }

      const data = await response.json();
      toast.success(data.message);
      loadAccounts();
      setIsClearingData(false);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error(error.message || 'Failed to clear data');
      setIsClearingData(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Bank Accounts</h1>
          <p className="text-gray-400">Manage your bank accounts</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={() => setIsClearingData(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
          <Button onClick={() => {
            setEditingAccount(null);
            setIsFormOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Bank Account
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setIsFormOpen(false);
              setEditingAccount(null);
            }}
          />
          <div className="relative bg-gray-800 dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md overflow-auto p-6 z-50">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
              onClick={() => {
                setIsFormOpen(false);
                setEditingAccount(null);
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </h2>
            </div>
            <BankAccountForm
              account={editingAccount}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingAccount(null);
              }}
            />
          </div>
        </div>
      )}

      <AlertDialog open={!!deletingAccount} onOpenChange={(open) => !open && setDeletingAccount(null)}>
        <AlertDialogContent className="bg-gray-800 text-white border border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this account?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the bank account
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => handleDelete(deletingAccount.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isClearingData} onOpenChange={(open) => !open && setIsClearingData(false)}>
        <AlertDialogContent className="bg-gray-800 text-white border border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will delete all your bank accounts, transactions, and credit cards. This action cannot be undone.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleClearAllData}
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <BankAccountCard
            key={account.id}
            account={account}
            onEdit={() => handleEdit(account)}
            onDelete={() => setDeletingAccount(account)}
          />
        ))}
        
        {accounts.length === 0 && (
          <Card className="col-span-full bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Wallet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400">No bank accounts yet. Click "Add Bank Account" to create one.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
