import React, { useState, useEffect } from 'react';
import { CalendarIcon, HelpCircle, Building2, X } from "lucide-react";

export default function AssetForm({ asset, onSave, onCancel }) {
  const [businesses, setBusinesses] = useState([]);
  const [formData, setFormData] = useState(asset || {
    name: "",
    type: "real_estate",
    purchase_value: "",
    current_value: "",
    currency: "ILS",
    description: "",
    location: "",
    purchase_date: "",
    is_business_asset: false,
    business_id: ""
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
      <div className="flex justify-between items-center p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Add Asset</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block mb-2 text-sm font-medium flex items-center gap-1">
            Asset Name <HelpCircle className="w-4 h-4 text-gray-400" />
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. My Apartment, Car, etc."
            className="w-full bg-[#131524] text-white p-2.5 rounded-md border border-gray-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium flex items-center gap-1">
              Asset Type <HelpCircle className="w-4 h-4 text-gray-400" />
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-[#131524] text-white p-2.5 rounded-md border border-gray-700"
            >
              <option value="real_estate">Real Estate</option>
              <option value="vehicle">Vehicle</option>
              <option value="art">Art</option>
              <option value="jewelry">Jewelry</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium flex items-center gap-1">
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
            <label className="block mb-2 text-sm font-medium flex items-center gap-1">
              Purchase Value <HelpCircle className="w-4 h-4 text-gray-400" />
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                {formData.currency === "ILS" ? "₪" : 
                 formData.currency === "USD" ? "$" : 
                 formData.currency === "EUR" ? "€" : 
                 formData.currency === "GBP" ? "£" : "¥"}
              </span>
              <input
                type="text"
                value={formData.purchase_value}
                onChange={(e) => setFormData({ ...formData, purchase_value: e.target.value })}
                placeholder="0"
                className="w-full bg-[#131524] text-white p-2.5 pl-7 rounded-md border border-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium flex items-center gap-1">
              Current Value <HelpCircle className="w-4 h-4 text-gray-400" />
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                {formData.currency === "ILS" ? "₪" : 
                 formData.currency === "USD" ? "$" : 
                 formData.currency === "EUR" ? "€" : 
                 formData.currency === "GBP" ? "£" : "¥"}
              </span>
              <input
                type="text"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                placeholder="0"
                className="w-full bg-[#131524] text-white p-2.5 pl-7 rounded-md border border-gray-700"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium flex items-center gap-1">
            Description <HelpCircle className="w-4 h-4 text-gray-400" />
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your asset..."
            className="w-full bg-[#131524] text-white p-2.5 rounded-md border border-gray-700 h-24"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium flex items-center gap-1">
            Location <HelpCircle className="w-4 h-4 text-gray-400" />
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Tel Aviv, Israel"
            className="w-full bg-[#131524] text-white p-2.5 rounded-md border border-gray-700"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium flex items-center gap-1">
            Purchase Date <HelpCircle className="w-4 h-4 text-gray-400" />
          </label>
          <div className="relative">
            <div className="flex items-center w-full bg-[#131524] text-gray-300 p-2.5 rounded-md border border-gray-700">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>mm/dd/yyyy</span>
            </div>
          </div>
        </div>

        <div className="bg-[#131524] p-4 rounded-md border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Business Asset</span>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-400 mb-3">Is this a business-related asset?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_business_asset: true })}
              className={`px-4 py-2 rounded-md ${
                formData.is_business_asset 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#1a1e2d] text-gray-300 hover:bg-gray-800'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_business_asset: false })}
              className={`px-4 py-2 rounded-md ${
                !formData.is_business_asset 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#1a1e2d] text-gray-300 hover:bg-gray-800'
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-700 bg-transparent text-white rounded-md hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Asset
          </button>
        </div>
      </form>
    </div>
  );
}