
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, PiggyBank, X } from "lucide-react";
import { Investment, BankAccount } from '@/api/entities';
import InvestmentForm from '../components/investments/InvestmentForm';
import InvestmentCard from '../components/investments/InvestmentCard';

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [investmentsData, accountsData] = await Promise.all([
      Investment.list(),
      BankAccount.list()
    ]);
    setInvestments(investmentsData);
    setAccounts(accountsData);
  };

  const handleEdit = (investment) => {
    console.log("Editing investment:", investment);
    setEditingInvestment(investment);
    setIsFormOpen(true);
  };

  const handleSave = async (investmentData) => {
    try {
      if (editingInvestment) {
        await Investment.update(editingInvestment.id, investmentData);
      } else {
        await Investment.create(investmentData);
      }
      setIsFormOpen(false);
      setEditingInvestment(null);
      loadData();
    } catch (error) {
      console.error('Error saving investment:', error);
    }
  };

  const handleDelete = async (investmentId) => {
    await Investment.delete(investmentId);
    loadData();
  };

  const groupedInvestments = investments.reduce((acc, investment) => {
    if (!acc[investment.type]) {
      acc[investment.type] = [];
    }
    acc[investment.type].push(investment);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Investments</h1>
          <p className="text-muted-foreground">Manage your investment portfolio</p>
        </div>
        
        <Button onClick={() => {
          setEditingInvestment(null);
          setIsFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Investment
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setIsFormOpen(false);
              setEditingInvestment(null);
            }}
          />
          <div className="relative bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl overflow-auto p-6 z-50">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
              onClick={() => {
                setIsFormOpen(false);
                setEditingInvestment(null);
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">
                {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
              </h2>
            </div>
            <InvestmentForm
              investment={editingInvestment}
              accounts={accounts}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingInvestment(null);
              }}
            />
          </div>
        </div>
      )}

      {Object.keys(groupedInvestments).length > 0 ? (
        Object.entries(groupedInvestments).map(([type, typeInvestments]) => (
          <div key={type}>
            <h2 className="text-xl font-semibold capitalize mb-4">
              {type.replace('_', ' ')} Investments
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {typeInvestments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  account={accounts.find(a => a.id === investment.bank_account_id)}
                  onEdit={() => {
                    handleEdit(investment);
                  }}
                  onDelete={() => handleDelete(investment.id)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <PiggyBank className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No investments yet. Click "Add Investment" to create one.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
