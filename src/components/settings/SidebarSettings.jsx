import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserSettings } from '@/api/entities';
import SidebarReorder from './SidebarReorder';

export default function SidebarSettings() {
  const [isReordering, setIsReordering] = useState(false);
  const [sidebarOrder, setSidebarOrder] = useState([]);
  const [userSettings, setUserSettings] = useState(null);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const settings = await UserSettings.list();
      if (settings && settings.length > 0) {
        setUserSettings(settings[0]);
        setSidebarOrder(settings[0].sidebar_order || []);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  const handleSaveOrder = async (newOrder) => {
    try {
      const orderNames = newOrder.map(item => typeof item === 'string' ? item : item.name);
      
      if (userSettings) {
        await UserSettings.update(userSettings.id, {
          ...userSettings,
          sidebar_order: orderNames
        });
      } else {
        await UserSettings.create({
          sidebar_order: orderNames,
          default_currency: 'USD',
          theme: 'dark'
        });
      }
      
      setSidebarOrder(orderNames);
      setIsReordering(false);
      await loadSettings();
      
      // Reload the page to apply new sidebar order
      window.location.reload();
    } catch (error) {
      console.error('Error saving sidebar order:', error);
    }
  };
  
  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Sidebar Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        {isReordering ? (
          <SidebarReorder 
            currentOrder={sidebarOrder}
            onSaveOrder={handleSaveOrder}
            onCancel={() => setIsReordering(false)}
          />
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400">
              Customize the order of navigation items in the sidebar.
            </p>
            <Button
              onClick={() => setIsReordering(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Customize Navigation Order
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}