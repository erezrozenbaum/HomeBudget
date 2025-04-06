import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, ExternalLink } from "lucide-react";
import { BusinessClient } from '@/api/entities';
import ClientForm from './client/ClientForm';

export default function BusinessClientsTab({ business }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadClients();
  }, [business.id]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientsData = await BusinessClient.list();
      const businessClients = clientsData.filter(c => c.business_id === business.id);
      setClients(businessClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Clients</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Clients Yet</h3>
            <p className="text-gray-400 mb-4">Start adding clients to manage your business relationships.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map(client => (
            <Card key={client.id} className="border-gray-700 bg-gray-800">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-white">{client.name}</h3>
                    {client.contact_person && (
                      <p className="text-gray-400 text-sm">Contact: {client.contact_person}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {client.website && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => window.open(client.website, '_blank')}
                        className="text-gray-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {client.email && (
                    <div>
                      <span className="text-gray-400">Email:</span>{" "}
                      <span className="text-white">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div>
                      <span className="text-gray-400">Phone:</span>{" "}
                      <span className="text-white">{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="md:col-span-2">
                      <span className="text-gray-400">Address:</span>{" "}
                      <span className="text-white">{client.address}</span>
                    </div>
                  )}
                  {client.payment_terms && (
                    <div>
                      <span className="text-gray-400">Payment Terms:</span>{" "}
                      <span className="text-white">
                        {client.payment_terms === 'custom' 
                          ? client.custom_payment_terms 
                          : client.payment_terms.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  )}
                  {client.currency && (
                    <div>
                      <span className="text-gray-400">Currency:</span>{" "}
                      <span className="text-white">{client.currency}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
                  loadClients();
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
    </div>
  );
}