
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, X } from "lucide-react";
import CreditCardForm from '../components/cards/CreditCardForm';
import CreditCardCard from '../components/cards/CreditCardCard';
import { CreditCard as CreditCardEntity, BankAccount } from '@/api/entities';

export default function CreditCards() {
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cardsData, accountsData] = await Promise.all([
      CreditCardEntity.list(),
      BankAccount.list()
    ]);
    setCards(cardsData);
    setAccounts(accountsData);
  };

  const handleEdit = (card) => {
    console.log("Editing card:", card);
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleSave = async (cardData) => {
    try {
      // Ensure the card inherits the linked bank account's color
      if (cardData.bank_account_id) {
        const linkedAccount = accounts.find(a => a.id === cardData.bank_account_id);
        if (linkedAccount) {
          cardData.color = linkedAccount.color || cardData.color;
        }
      }
      
      if (editingCard) {
        await CreditCardEntity.update(editingCard.id, cardData);
      } else {
        await CreditCardEntity.create(cardData);
      }
      setIsFormOpen(false);
      setEditingCard(null);
      loadData();
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleDelete = async (cardId) => {
    await CreditCardEntity.delete(cardId);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Credit Cards</h1>
          <p className="text-muted-foreground">Manage your credit cards</p>
        </div>
        
        <Button onClick={() => {
          setEditingCard(null);
          setIsFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Credit Card
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setIsFormOpen(false);
              setEditingCard(null);
            }}
          />
          <div className="relative w-full max-w-md p-6 rounded-lg shadow-lg z-50" style={{ backgroundColor: '#0f172a' }}>
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
              onClick={() => {
                setIsFormOpen(false);
                setEditingCard(null);
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">
                {editingCard ? 'Edit Credit Card' : 'Add New Credit Card'}
              </h2>
            </div>
            <CreditCardForm
              card={editingCard}
              accounts={accounts}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingCard(null);
              }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <CreditCardCard
            key={card.id}
            card={card}
            account={accounts.find(a => a.id === card.bank_account_id)}
            onEdit={() => handleEdit(card)}
            onDelete={() => handleDelete(card.id)}
          />
        ))}
        
        {cards.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No credit cards yet. Click "Add Credit Card" to create one.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
