
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, X } from "lucide-react";
import BankAccountForm from '../components/accounts/BankAccountForm';
import BankAccountCard from '../components/accounts/BankAccountCard';
import { BankAccount } from '@/api/entities';

export default function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const data = await BankAccount.list();
    setAccounts(data);
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
      } else {
        await BankAccount.create(accountData);
      }
      setIsFormOpen(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleDelete = async (accountId) => {
    await BankAccount.delete(accountId);
    loadAccounts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Bank Accounts</h1>
          <p className="text-gray-400">Manage your bank accounts</p>
        </div>
        
        <Button onClick={() => {
          setEditingAccount(null);
          setIsFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Bank Account
        </Button>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <BankAccountCard
            key={account.id}
            account={account}
            onEdit={() => handleEdit(account)}
            onDelete={() => handleDelete(account.id)}
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
