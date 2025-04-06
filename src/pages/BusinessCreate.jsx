import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Business } from '@/api/entities';
import { createPageUrl } from "@/utils";
import BusinessForm from '../components/business/BusinessForm';

export default function BusinessCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (businessData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create the business
      await Business.create(businessData);
      
      // Navigate back to the business list
      navigate(createPageUrl('Business'));
    } catch (err) {
      console.error('Error creating business:', err);
      setError('An error occurred while creating the business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-white">Create New Business</h1>
      </div>

      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 bg-red-900/40 border border-red-700 rounded-lg text-red-200 text-sm mb-6">
              {error}
            </div>
          )}
          
          <BusinessForm 
            onSave={handleSave}
            onCancel={() => navigate(createPageUrl('Business'))}
          />
          
          {loading && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}