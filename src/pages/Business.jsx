import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Building2, Users, FileText, Folder, ArrowRight } from "lucide-react";
import { Business, BankAccount, CreditCard } from '@/api/entities';
import BusinessCard from "../components/business/BusinessCard";
import { createPageUrl } from "@/utils";
import BusinessOverview from '../components/business/BusinessOverview';
import BusinessForm from '../components/business/BusinessForm';

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [businessToEdit, setBusinessToEdit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all related data
        const [businessData, accountsData, cardsData] = await Promise.all([
          Business.list(),
          BankAccount.list(),
          CreditCard.list()
        ]);
        
        setBusinesses(businessData);
        setAccounts(accountsData);
        setCards(cardsData);
        
        // Select the first business by default if available
        if (businessData.length > 0) {
          setSelectedBusiness(businessData[0]);
        }
      } catch (error) {
        console.error("Error loading business data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getBusinessStats = (business) => {
    if (!business) return { accounts: 0, clients: 0, invoices: 0, projects: 0 };
    
    // Count related accounts
    const linkedAccounts = accounts.filter(account => 
      business.bank_accounts && business.bank_accounts.includes(account.id)
    ).length;
    
    // Count related cards
    const linkedCards = cards.filter(card => 
      business.credit_cards && business.credit_cards.includes(card.id)
    ).length;
    
    // For now just return placeholder counts
    // In real implementation, we would count clients, invoices, and projects
    return {
      accounts: linkedAccounts + linkedCards,
      clients: 0, // Will be implemented when we query for clients
      invoices: 0, // Will be implemented when we query for invoices
      projects: 0  // Will be implemented when we query for projects
    };
  };

  const handleEdit = (business) => {
    setBusinessToEdit(business);
    setShowEditForm(true);
  };

  const handleDelete = async (businessId) => {
    try {
      await Business.delete(businessId);
      
      // Refresh the businesses list
      const updatedBusinesses = await Business.list();
      setBusinesses(updatedBusinesses);
      
      // Reset selected business if it was deleted
      if (selectedBusiness?.id === businessId) {
        setSelectedBusiness(null);
      }
      
      setShowDeleteConfirm(false);
      setBusinessToDelete(null);
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  const handleSaveEdit = async (updatedBusiness) => {
    try {
      await Business.update(businessToEdit.id, updatedBusiness);
      
      // Refresh the businesses list
      const updatedBusinesses = await Business.list();
      setBusinesses(updatedBusinesses);
      
      // Update selected business if it was edited
      if (selectedBusiness?.id === businessToEdit.id) {
        setSelectedBusiness(updatedBusinesses.find(b => b.id === businessToEdit.id));
      }
      
      setShowEditForm(false);
      setBusinessToEdit(null);
    } catch (error) {
      console.error("Error updating business:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Business Management</h1>
          <p className="text-gray-400">Manage your entrepreneurial ventures</p>
        </div>
        
        <Button asChild>
          <Link to={createPageUrl('BusinessCreate')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Business
          </Link>
        </Button>
      </div>

      {loading ? (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      ) : businesses.length === 0 ? (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Businesses Yet</h3>
            <p className="text-gray-400 mb-6">Create your first business to start managing your entrepreneurial ventures.</p>
            <Button asChild>
              <Link to={createPageUrl('BusinessCreate')}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Your First Business
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => {
              const stats = getBusinessStats(business);
              return (
                <BusinessCard 
                  key={business.id}
                  business={business}
                  stats={stats}
                  isSelected={selectedBusiness?.id === business.id}
                  onClick={() => setSelectedBusiness(business)}
                  onEdit={handleEdit}
                  onDelete={(id) => {
                    setBusinessToDelete(business);
                    setShowDeleteConfirm(true);
                  }}
                />
              );
            })}
          </div>
          
          {/* Edit Form Dialog */}
          {showEditForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">Edit Business</h2>
                <BusinessForm
                  business={businessToEdit}
                  onSave={handleSaveEdit}
                  onCancel={() => {
                    setShowEditForm(false);
                    setBusinessToEdit(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">Delete Business</h2>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete "{businessToDelete.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setBusinessToDelete(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(businessToDelete.id)}
                  >
                    Delete Business
                  </Button>
                </div>
              </div>
            </div>
          )}

          {selectedBusiness && (
            <Card className="border-gray-700 bg-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{selectedBusiness.name} Dashboard</CardTitle>
                  <Button asChild variant="outline" size="sm" className="text-sm">
                    <Link to={`${createPageUrl('BusinessDetail')}?id=${selectedBusiness.id}`}>
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <BusinessOverview business={selectedBusiness} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}