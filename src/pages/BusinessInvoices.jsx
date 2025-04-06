
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, FileText, Upload } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from 'react-router-dom';
import { Invoice, Business, BusinessClient, Project } from '@/api/entities';
import InvoiceForm from '@/components/business/invoice/InvoiceForm';
import InvoiceUploader from '@/components/business/invoice/InvoiceUploader';

export default function BusinessInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  
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
        
        // Load business, clients, projects and invoices
        const [businessData, clientsData, projectsData, invoicesData] = await Promise.all([
          Business.list(),
          BusinessClient.list(),
          Project.list(),
          Invoice.list()
        ]);
        
        const currentBusiness = businessData.find(b => b.id === businessId);
        
        if (!currentBusiness) {
          navigate(createPageUrl('Business'));
          return;
        }
        
        setBusiness(currentBusiness);
        
        // Filter related data
        const businessClients = clientsData.filter(c => c.business_id === businessId);
        const businessProjects = projectsData.filter(p => p.business_id === businessId);
        const businessInvoices = invoicesData.filter(i => i.business_id === businessId);
        
        setClients(businessClients);
        setProjects(businessProjects);
        setInvoices(businessInvoices);
      } catch (error) {
        console.error("Error loading invoices data:", error);
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
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          {business && (
            <p className="text-gray-400">Manage invoices for {business.name}</p>
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
            <CardTitle className="text-white">Invoice List</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUploader(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Invoice
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </CardHeader>

          
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Invoices Yet</h3>
                <p className="text-gray-400 mb-6">Create your first invoice to start tracking payments.</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Invoice
                </Button>
              </div>
            ) : (
              <div>
                {/* Invoice list will go here */}
                <div className="text-center py-8 text-gray-400">
                  Invoice management functionality is coming soon
                </div>
              </div>
            )}
          </CardContent>
          
          {showUploader && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">Upload Invoice</h2>
                <InvoiceUploader 
                  onDataExtracted={async (data) => {
                    try {
                      // Create a new client if we got client details and they don't exist
                      let clientId = null;
                      if (data.client_name) {
                        const existingClient = clients.find(c => 
                          c.name.toLowerCase() === data.client_name.toLowerCase()
                        );
                        
                        if (existingClient) {
                          clientId = existingClient.id;
                        } else if (data.client_details) {
                          const newClient = await BusinessClient.create({
                            business_id: business.id,
                            name: data.client_name,
                            email: data.client_details.email,
                            phone: data.client_details.phone,
                            address: data.client_details.address
                          });
                          clientId = newClient.id;
                        }
                      }

                      // Create the invoice
                      await Invoice.create({
                        business_id: business.id,
                        client_id: clientId,
                        invoice_number: data.invoice_number,
                        issue_date: data.issue_date,
                        due_date: data.due_date,
                        items: data.items,
                        subtotal: data.subtotal,
                        tax_rate: data.tax_rate,
                        tax_amount: data.tax_amount,
                        total: data.total,
                        notes: data.notes,
                        currency: data.currency,
                        receipt_url: data.receipt_url,
                        status: 'draft'
                      });

                      setShowUploader(false);
                      
                      // Reload invoices
                      const invoicesData = await Invoice.list();
                      const businessInvoices = invoicesData.filter(i => i.business_id === business.id);
                      setInvoices(businessInvoices);
                    } catch (error) {
                      console.error("Error creating invoice:", error);
                      alert("Failed to create invoice. Please try again.");
                    }
                  }}
                  onCancel={() => setShowUploader(false)}
                />
              </div>
            </div>
          )}
          
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">Create New Invoice</h2>
                <InvoiceForm 
                  businessId={business.id}
                  clients={clients}
                  projects={projects}
                  onSave={async (formData) => {
                    try {
                      await Invoice.create(formData);
                      setShowForm(false);
                      // Reload invoices
                      const invoicesData = await Invoice.list();
                      const businessInvoices = invoicesData.filter(i => i.business_id === business.id);
                      setInvoices(businessInvoices);
                    } catch (error) {
                      console.error("Error creating invoice:", error);
                      alert("Failed to create invoice. Please try again.");
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
