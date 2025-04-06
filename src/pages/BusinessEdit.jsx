import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Business } from '@/api/entities';
import { createPageUrl } from "@/utils";
import BusinessForm from '../components/business/BusinessForm';

export default function BusinessEdit() {
  const navigate = useNavigate();
  const [business, setBusiness] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const businessId = urlParams.get('id');

  React.useEffect(() => {
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

  const handleSave = async (updatedData) => {
    try {
      await Business.update(businessId, updatedData);
      navigate(`${createPageUrl('BusinessDetail')}?id=${businessId}`);
    } catch (error) {
      console.error('Error updating business:', error);
      setError('Failed to update business');
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
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate(`${createPageUrl('BusinessDetail')}?id=${businessId}`)}
          className="border-gray-700 bg-gray-800 hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-white">Edit {business.name}</h1>
      </div>

      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessForm 
            business={business}
            onSave={handleSave}
            onCancel={() => navigate(`${createPageUrl('BusinessDetail')}?id=${businessId}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}