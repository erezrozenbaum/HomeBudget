import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/button';
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';

export default function Dashboard() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSeedData = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.request('/auth/seed-sample-data', {
        method: 'POST'
      });
      window.location.reload(); // Reload to see the new data
    } catch (error) {
      console.error('Error seeding data:', error);
      setError(error.message || 'Error seeding sample data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button 
          onClick={handleSeedData} 
          variant="outline"
          disabled={loading}
        >
          {loading ? 'Adding Sample Data...' : 'Add Sample Data'}
        </Button>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <DashboardWidgets />
    </div>
  );
}
