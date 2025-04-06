import React, { useState, useEffect } from 'react';
import { CalendarIcon, HelpCircle, Building2, X } from "lucide-react";

export default function InsuranceForm({ insurance, onSave, onCancel }) {
  const [businesses, setBusinesses] = useState([]);
  const [formData, setFormData] = useState(insurance || {
    name: "",
    type: "health",
    provider: "",
    policy_number: "",
    premium_amount: "",
    premium_frequency: "monthly",
    currency: "ILS",
    start_date: "",
    renewal_date: "",
    coverage_amount: "",
    deductible: "",
    linked_asset_id: "",
    linked_account_id: "",
    status: "active",
    payment_type: "one-time",
    full_amount: "",
    installments_total: 1,
    installment_amount: "",
    is_business_insurance: false,
    business_id: "",
    business_purpose: ""
  });

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const { Business } = await import('@/api/entities');
      const businessesData = await Business.list();
      setBusinesses(businessesData);
    } catch (error) {
      console.error("Error loading businesses:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-[#1e1f2d] text-white rounded-lg">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Add Insurance Policy</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="flex items-center gap-1 text-white">
            Policy Name <HelpCircle className="w-4 h-4 text-gray-400" />
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Health Insurance, Car Insurance"
            className="w-full bg-[#131524] text-white p-2.5 rounded-md border border-gray-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1 text-white">
              Insurance Type <HelpCircle className="w-4 h-4 text-gray-400" />
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-[#131524] text-white p-2.5 rounded-md border border-gray-700"
            >
              <option value="health">Health Insurance</option>
              <option value="auto">Auto Insurance</option>
              <option value="home">Home Insurance</option>
              <option value="life">Life Insurance</option>
              <option value="pet">Pet Insurance</option>
              <option value="travel">Travel Insurance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-white">
              Provider <HelpCircle className="w-4 h-4 text-gray-400" />
            </label>
            <input
              type="text"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              placeholder="Insurance provider name"
              className="w-full bg-[#131524] text-white p-2.5 rounded-md border border-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1 text-white">
              Policy Number <HelpCircle className="w-4 h-4 text-gray-400" />
            </label>
            <input
              type="text"
              value={formData.policy_number}
              onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
              placeholder="Policy number"
              className="w-full bg-[#131524] text-white p-2.5 rounded-md border border-gray-700"
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-white">
              Currency <HelpCircle className="w-4 h-4 text-gray-400" />
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full bg-[#131524] text-white p-2.5 rounded-md border border-gray-700"
            >
              <option value="ILS">ILS - Israeli Shekel</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1 text-white">
              Start Date <HelpCircle className="w-4 h-4 text-gray-400" />
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                placeholder="mm/dd/yyyy"
                className="w-full bg-[#131524] text-white p-2.5 pl-10 rounded-md border border-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-white">
              Renewal Date <HelpCircle className="w-4 h-4 text-gray-400" />
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.renewal_date}
                onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                placeholder="mm/dd/yyyy"
                className="w-full bg-[#131524] text-white p-2.5 pl-10 rounded-md border border-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Business Integration Section */}
        <div className="bg-[#131524] rounded-md p-4">
          <div className="flex items-center gap-1 mb-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="text-white">Business Insurance</span>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-sm text-gray-400 mb-2">Is this a business insurance policy?</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_business_insurance: true })}
              className={`px-4 py-2 rounded-md ${
                formData.is_business_insurance 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#1a1e2d] text-gray-300 hover:bg-gray-800'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_business_insurance: false })}
              className={`px-4 py-2 rounded-md ${
                !formData.is_business_insurance 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#1a1e2d] text-gray-300 hover:bg-gray-800'
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#131524] text-white rounded-md hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Insurance
          </button>
        </div>
      </form>
    </div>
  );
}