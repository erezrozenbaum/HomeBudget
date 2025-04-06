import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from 'react-router-dom';
import { Business } from '@/api/entities';
import BusinessInfoTab from '../components/business/BusinessInfoTab';

export default function BusinessSettings() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
      } catch (error) {
        console.error("Error loading business data:", error);
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
          <h1 className="text-3xl font-bold text-white">Business Profile</h1>
          {business && (
            <p className="text-gray-400">Manage profile settings for {business.name}</p>
          )}
        </div>
      </div>
      
      {loading ? (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      ) : business ? (
        <BusinessInfoTab business={business} />
      ) : (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-6 text-center text-gray-400">
            Business not found
          </CardContent>
        </Card>
      )}
    </div>
  );
}