
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Users, Upload } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from 'react-router-dom';
import { BusinessClient, Business } from '@/api/entities';
import ClientForm from '@/components/business/client/ClientForm'; // Fixed import path
import ClientBulkImport from '@/components/business/client/ClientBulkImport';

export default function BusinessClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get business ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const businessId = urlParams.get('business');
        
        if (!businessId) {
          navigate(createPageUrl('Business'));
          return;
        }
        
        // Load business data
        const businessData = await Business.list();
        const currentBusiness = businessData.find(b => b.id === businessId);
        
        if (!currentBusiness) {
          navigate(createPageUrl('Business'));
          return;
        }
        
        setBusiness(currentBusiness);
        
        // Load clients for this business
        const clientsData = await BusinessClient.list();
        const businessClients = clientsData.filter(c => c.business_id === businessId);
        setClients(businessClients);
      } catch (error) {
        console.error("Error loading clients data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate(createPageUrl('Business'))}
          className="border-gray-700 bg-gray-800 hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Clients</h1>
          {business && (
            <p className="text-gray-400">Manage clients for {business.name}</p>
          )}
        </div>
      </div>
      
      {loading ? (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-white">Client List</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBulkImport(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import Clients
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Clients Yet</h3>
                <p className="text-gray-400 mb-6">Add your first client to start managing client relationships.</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              </div>
            ) : (
              <div>
                {/* Client list will go here */}
                <div className="text-center py-8 text-gray-400">
                  Client management functionality is coming soon
                </div>
              </div>
            )}
          </CardContent>
          {showBulkImport && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <ClientBulkImport
                  businessId={business.id}
                  onImportComplete={async () => {
                    setShowBulkImport(false);
                    // Reload clients
                    const clientsData = await BusinessClient.list();
                    const businessClients = clientsData.filter(c => c.business_id === business.id);
                    setClients(businessClients);
                  }}
                  onCancel={() => setShowBulkImport(false)}
                />
              </div>
            </div>
          )}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">Add New Client</h2>
                <ClientForm 
                  businessId={business.id}
                  onSave={async (formData) => {
                    try {
                      await BusinessClient.create(formData);
                      setShowForm(false);
                      // Reload clients
                      const clientsData = await BusinessClient.list();
                      const businessClients = clientsData.filter(c => c.business_id === business.id);
                      setClients(businessClients);
                    } catch (error) {
                      console.error("Error creating client:", error);
                      alert("Failed to create client. Please try again.");
                    }
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
