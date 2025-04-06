import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  ArrowLeft,
  Trash2,
  Edit,
  Users,
  FileText,
  Briefcase,
  Settings,
  Globe,
  Scale,
  User
} from "lucide-react";
import { Business } from '@/api/entities';
import { createPageUrl } from "@/utils";
import BusinessInfoTab from '../components/business/BusinessInfoTab';
import BusinessClientsTab from '../components/business/BusinessClientsTab';
import BusinessInvoicesTab from '../components/business/BusinessInvoicesTab';
import BusinessProjectsTab from '../components/business/BusinessProjectsTab';

export default function BusinessDetail() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const businessId = urlParams.get('id');

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!businessId) {
        setError('Business ID is required');
        return;
      }

      const businesses = await Business.list();
      const business = businesses.find(b => b.id === businessId);
      
      if (!business) {
        setError('Business not found');
        return;
      }

      setBusiness(business);
    } catch (err) {
      console.error('Error loading business:', err);
      setError('Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this business?')) {
      return;
    }

    try {
      await Business.delete(businessId);
      navigate(createPageUrl('Business'));
    } catch (error) {
      console.error('Error deleting business:', error);
      setError('Failed to delete business');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl text-red-400 mb-4">{error || 'Business not found'}</h2>
        <Button
          onClick={() => navigate(createPageUrl('Business'))}
          variant="outline"
          className="bg-gray-800 border-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Businesses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
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
            <h1 className="text-3xl font-bold text-white">{business.name}</h1>
            <p className="text-gray-400">{business.industry || 'No industry specified'}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`${createPageUrl('BusinessEdit')}?id=${business.id}`)}
            className="border-gray-700 bg-gray-800 hover:bg-gray-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">
            <Building2 className="w-4 h-4 mr-2" />
            Business Info
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="w-4 h-4 mr-2" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="w-4 h-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Briefcase className="w-4 h-4 mr-2" />
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <BusinessInfoTab business={business} onUpdate={loadBusiness} />
        </TabsContent>
        
        <TabsContent value="clients">
          <BusinessClientsTab business={business} />
        </TabsContent>
        
        <TabsContent value="invoices">
          <BusinessInvoicesTab business={business} />
        </TabsContent>
        
        <TabsContent value="projects">
          <BusinessProjectsTab business={business} />
        </TabsContent>
      </Tabs>
    </div>
  );
}