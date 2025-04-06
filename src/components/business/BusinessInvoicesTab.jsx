import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, ExternalLink } from "lucide-react";
import { BusinessInvoice, BusinessClient, Project } from '@/api/entities';
import InvoiceForm from './invoice/InvoiceForm';

export default function BusinessInvoicesTab({ business }) {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [business.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, clientsData, projectsData] = await Promise.all([
        BusinessInvoice.list(),
        BusinessClient.list(),
        Project.list()
      ]);
      
      const businessInvoices = invoicesData.filter(i => i.business_id === business.id);
      const businessClients = clientsData.filter(c => c.business_id === business.id);
      const businessProjects = projectsData.filter(p => p.business_id === business.id);
      
      setInvoices(businessInvoices);
      setClients(businessClients);
      setProjects(businessProjects);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Invoices</h2>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>

        {showForm && (
          <InvoiceForm
            businessId={business.id}
            clients={clients}
            projects={projects}
            onSave={() => {
              loadData();
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No invoices found. Create your first invoice to get started.
            </div>
          ) : (
            invoices.map(invoice => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div>
                  <div className="font-medium text-white">Invoice #{invoice.invoice_number}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(invoice.issue_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-medium text-white">
                      ${invoice.subtotal.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">{invoice.status}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/invoices/${invoice.id}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 