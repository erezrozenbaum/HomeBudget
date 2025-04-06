
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Shield, Calendar, BarChart3, X } from "lucide-react";
import { Insurance } from '@/api/entities';
import { BankAccount } from '@/api/entities';
import { Asset } from '@/api/entities';
import InsuranceForm from '../components/insurance/InsuranceForm';
import InsuranceCard from '../components/insurance/InsuranceCard';
import InsuranceAnalytics from '../components/insurance/InsuranceAnalytics';
import InsuranceReminders from '../components/insurance/InsuranceReminders';
import { UserSettings } from '@/api/entities';

export default function InsurancePage() {
  const [insurances, setInsurances] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [userSettings, setUserSettings] = useState({ default_currency: 'ILS' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [insurancesData, accountsData, assetsData, settingsData] = await Promise.all([
        Insurance.list(),
        BankAccount.list(),
        Asset.list(),
        UserSettings.list()
      ]);
      
      console.log("Loaded insurance data:", insurancesData);
      setInsurances(insurancesData);
      setAccounts(accountsData);
      setAssets(assetsData);
      
      if (settingsData.length > 0) {
        setUserSettings(settingsData[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSave = async (insuranceData) => {
    try {
      console.log("Saving insurance data:", insuranceData);
      
      if (editingInsurance) {
        await Insurance.update(editingInsurance.id, insuranceData);
      } else {
        await Insurance.create(insuranceData);
      }
      setIsFormOpen(false);
      setEditingInsurance(null);
      loadData();
    } catch (error) {
      console.error('Error saving insurance:', error);
    }
  };

  const handleDelete = async (insuranceId) => {
    try {
      await Insurance.delete(insuranceId);
      loadData();
    } catch (error) {
      console.error('Error deleting insurance:', error);
    }
  };

  const formatCurrency = (value, currency = 'ILS') => {
    if (value === undefined || value === null || value === 0) return `${currency} 0`;
    return `${currency} ${value.toLocaleString()}`;
  };

  // Calculate annual premiums from all insurances
  const calculateTotalPremiums = () => {
    let total = 0;
    insurances.forEach(insurance => {
      if (insurance.full_amount) {
        total += Number(insurance.full_amount);
      }
    });
    console.log("Total premiums calculated:", total);
    return total;
  };

  const calculateTotalCoverage = () => {
    let total = 0;
    insurances.forEach(insurance => {
      if (insurance.coverage_amount) {
        total += Number(insurance.coverage_amount);
      }
    });
    return total;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Insurance Policies</h1>
          <p className="text-muted-foreground">Manage all your insurance policies in one place</p>
        </div>
        
        <Button 
          onClick={() => {
            setEditingInsurance(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Insurance
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-[#1e1f2d] p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium text-gray-400 mb-1">Annual Premiums</h3>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(calculateTotalPremiums())}
          </div>
        </div>
        
        <div className="bg-[#1e1f2d] p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium text-gray-400 mb-1">Total Coverage</h3>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(calculateTotalCoverage())}
          </div>
        </div>
        
        <div className="bg-[#1e1f2d] p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium text-gray-400 mb-1">Active Policies</h3>
          <div className="text-3xl font-bold text-white">
            {insurances.filter(ins => ins.status === 'active').length}
          </div>
        </div>
      </div>

      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies">
            <Shield className="w-4 h-4 mr-2" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="reminders">
            <Calendar className="w-4 h-4 mr-2" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insurances.map(insurance => (
              <InsuranceCard
                key={insurance.id}
                insurance={insurance}
                onEdit={() => {
                  setEditingInsurance(insurance);
                  setIsFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
            
            {insurances.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No insurance policies found. Add your first policy to get started.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reminders">
          <InsuranceReminders
            insurances={insurances}
            onEdit={(insurance) => {
              setEditingInsurance(insurance);
              setIsFormOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <InsuranceAnalytics insurances={insurances} />
        </TabsContent>
      </Tabs>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <InsuranceForm
              insurance={editingInsurance}
              accounts={accounts}
              assets={assets}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingInsurance(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
