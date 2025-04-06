
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

// Simplified Tooltip Component
const TooltipComponent = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-10 bg-gray-800 text-white text-sm py-1 px-2 rounded shadow-lg left-1/2 -translate-x-1/2 bottom-full mb-2">
          {content}
        </div>
      )}
    </div>
  );
};

export default function BusinessForm({ business, onSave, onCancel }) {
  // Initialize with default values for all nested objects
  const defaultFormData = {
    name: '',
    type: 'sole_proprietorship',
    industry: '',
    tax_id: '',
    start_date: null,
    description: '',
    color: '#4f46e5',
    status: 'active',
    default_currency: 'USD',
    email: '',
    phone: '',
    address: '',
    website: '',
    owner_location: '',
    markets: [],
    tax_details: {
      vat_number: '',
      tax_year: new Date().getFullYear().toString(),
      tax_filing_frequency: 'monthly',
      last_tax_filing: null
    },
    cpa_info: {
      name: '',
      company: '',
      email: '',
      phone: '',
      address: ''
    },
    trademark: {
      has_trademark: false,
      description: '',
      countries: [],
      registration_numbers: [],
      registration_dates: []
    }
  };

  // Initialize form data with provided business or defaults, ensuring all nested objects exist
  const [formData, setFormData] = useState(() => {
    if (!business) return defaultFormData;
    
    return {
      ...defaultFormData,
      ...business,
      // Ensure nested objects exist with defaults
      tax_details: {
        ...defaultFormData.tax_details,
        ...(business.tax_details || {})
      },
      cpa_info: {
        ...defaultFormData.cpa_info,
        ...(business.cpa_info || {})
      },
      trademark: {
        ...defaultFormData.trademark,
        ...(business.trademark || {}),
        // Ensure arrays exist
        countries: (business.trademark?.countries || []),
        registration_numbers: (business.trademark?.registration_numbers || []),
        registration_dates: (business.trademark?.registration_dates || [])
      },
      markets: business.markets || []
    };
  });

  const [newMarket, setNewMarket] = useState('');
  const [newTrademarkCountry, setNewTrademarkCountry] = useState('');
  const [newRegistrationNumber, setNewRegistrationNumber] = useState('');
  const [newRegistrationDate, setNewRegistrationDate] = useState(null);

  // Popover state for date pickers
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [lastTaxFilingOpen, setLastTaxFilingOpen] = useState(false);
  const [trademarkDateOpen, setTrademarkDateOpen] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addMarket = () => {
    if (newMarket) {
      setFormData(prev => ({
        ...prev,
        markets: [...prev.markets, newMarket]
      }));
      setNewMarket('');
    }
  };

  const removeMarket = (marketToRemove) => {
    setFormData(prev => ({
      ...prev,
      markets: prev.markets.filter(market => market !== marketToRemove)
    }));
  };

  const addTrademarkInfo = () => {
    if (newTrademarkCountry && newRegistrationNumber && newRegistrationDate) {
      setFormData(prev => ({
        ...prev,
        trademark: {
          ...prev.trademark,
          has_trademark: true,
          countries: [...prev.trademark.countries, newTrademarkCountry],
          registration_numbers: [...prev.trademark.registration_numbers, newRegistrationNumber],
          registration_dates: [...prev.trademark.registration_dates, format(newRegistrationDate, 'yyyy-MM-dd')]
        }
      }));
      setNewTrademarkCountry('');
      setNewRegistrationNumber('');
      setNewRegistrationDate(null);
    }
  };

  const removeTrademarkInfo = (index) => {
    setFormData(prev => {
      const newCountries = [...prev.trademark.countries];
      const newNumbers = [...prev.trademark.registration_numbers];
      const newDates = [...prev.trademark.registration_dates];
      
      newCountries.splice(index, 1);
      newNumbers.splice(index, 1);
      newDates.splice(index, 1);
      
      return {
        ...prev,
        trademark: {
          ...prev.trademark,
          countries: newCountries,
          registration_numbers: newNumbers,
          registration_dates: newDates,
          has_trademark: newCountries.length > 0
        }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format dates before saving
    const formattedData = {
      ...formData,
      start_date: formData.start_date ? format(new Date(formData.start_date), 'yyyy-MM-dd') : null,
      tax_details: {
        ...formData.tax_details,
        last_tax_filing: formData.tax_details.last_tax_filing ? 
          format(new Date(formData.tax_details.last_tax_filing), 'yyyy-MM-dd') : null
      },
      trademark: {
        ...formData.trademark,
        registration_dates: formData.trademark.registration_dates.map(date => 
          date ? (typeof date === 'string' ? date : format(new Date(date), 'yyyy-MM-dd')) : null
        )
      }
    };
    
    onSave(formattedData);
  };

  // Update the LabelWithTooltip component to use our simplified tooltip
  const LabelWithTooltip = ({ label, tooltip, htmlFor }) => (
    <div className="flex items-center gap-2">
      <Label htmlFor={htmlFor} className="text-white">{label}</Label>
      <TooltipComponent content={tooltip}>
        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
      </TooltipComponent>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <LabelWithTooltip
              label="Business Name"
              tooltip="The official registered name of your business"
              htmlFor="business-name"
            />
            <Input
              id="business-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
              required
            />
          </div>

          <div>
            <LabelWithTooltip
              label="Business Type"
              tooltip="The legal structure of your business"
              htmlFor="business-type"
            />
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                <SelectItem value="llc">LLC</SelectItem>
                <SelectItem value="corporation">Corporation</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <LabelWithTooltip
              label="Industry"
              tooltip="The main sector or industry your business operates in"
              htmlFor="industry"
            />
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          <div>
            <LabelWithTooltip
              label="Start Date"
              tooltip="The date when your business officially started operating"
              htmlFor="start-date"
            />
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-start text-left font-normal bg-gray-900 border-gray-700 text-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.start_date ? format(new Date(formData.start_date), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" side="bottom" align="start">
                <Calendar
                  mode="single"
                  selected={formData.start_date ? new Date(formData.start_date) : undefined}
                  onSelect={(date) => {
                    handleChange('start_date', date);
                    setStartDateOpen(false);
                  }}
                  initialFocus
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <LabelWithTooltip
            label="Description"
            tooltip="A brief description of your business activities and services"
            htmlFor="description"
          />
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            rows={3}
          />
        </div>
      </div>

      {/* Location & Markets */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Location & Markets</h3>
        
        <div>
          <LabelWithTooltip
            label="Owner Location (Country)"
            tooltip="The country where the business owner is legally residing"
            htmlFor="owner-location"
          />
          <Input
            id="owner-location"
            value={formData.owner_location}
            onChange={(e) => handleChange('owner_location', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <LabelWithTooltip
            label="Markets"
            tooltip="Countries where your products or services are sold"
            htmlFor="markets"
          />
          <div className="flex gap-2 mb-2">
            <Input
              value={newMarket}
              onChange={(e) => setNewMarket(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="Enter country name"
            />
            <Button type="button" onClick={addMarket}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.markets.map((market, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-1">
                <span className="text-white">{market}</span>
                <button
                  type="button"
                  onClick={() => removeMarket(market)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Tax Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <LabelWithTooltip
              label="Tax ID / VAT Number"
              tooltip="Your business tax identification number. In the US this would be your EIN, in the EU your VAT number, etc."
              htmlFor="tax-id"
            />
            <Input
              id="tax-id"
              value={formData.tax_details.vat_number}
              onChange={(e) => handleNestedChange('tax_details', 'vat_number', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="e.g., EIN, VAT number, etc."
            />
          </div>

          <div>
            <LabelWithTooltip
              label="Tax Year"
              tooltip="The fiscal year your business operates under"
              htmlFor="tax-year"
            />
            <Input
              value={formData.tax_details.tax_year}
              onChange={(e) => handleNestedChange('tax_details', 'tax_year', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          <div>
            <LabelWithTooltip
              label="Tax Filing Frequency"
              tooltip="How often your business files its taxes"
              htmlFor="tax-filing-frequency"
            />
            <Select
              value={formData.tax_details.tax_filing_frequency}
              onValueChange={(value) => handleNestedChange('tax_details', 'tax_filing_frequency', value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <LabelWithTooltip
              label="Last Tax Filing Date"
              tooltip="The date your business last submitted its tax return"
              htmlFor="last-tax-filing-date"
            />
            <Popover open={lastTaxFilingOpen} onOpenChange={setLastTaxFilingOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-start text-left font-normal bg-gray-900 border-gray-700 text-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.tax_details.last_tax_filing ? 
                   format(new Date(formData.tax_details.last_tax_filing), 'PPP') : 
                   <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" side="bottom" align="start">
                <Calendar
                  mode="single"
                  selected={formData.tax_details.last_tax_filing ? 
                           new Date(formData.tax_details.last_tax_filing) : 
                           undefined}
                  onSelect={(date) => {
                    handleNestedChange('tax_details', 'last_tax_filing', date);
                    setLastTaxFilingOpen(false);
                  }}
                  initialFocus
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* CPA Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">CPA Information</h3>
        <p className="text-sm text-gray-400 mb-4">Details of your Certified Public Accountant or tax advisor</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <LabelWithTooltip
              label="CPA Name"
              tooltip="Name of your CPA or tax advisor"
              htmlFor="cpa-name"
            />
            <Input
              value={formData.cpa_info.name}
              onChange={(e) => handleNestedChange('cpa_info', 'name', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          <div>
            <LabelWithTooltip
              label="CPA Company"
              tooltip="Company or firm your CPA works for"
              htmlFor="cpa-company"
            />
            <Input
              value={formData.cpa_info.company}
              onChange={(e) => handleNestedChange('cpa_info', 'company', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          <div>
            <LabelWithTooltip
              label="CPA Email"
              tooltip="Email address of your CPA"
              htmlFor="cpa-email"
            />
            <Input
              type="email"
              value={formData.cpa_info.email}
              onChange={(e) => handleNestedChange('cpa_info', 'email', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          <div>
            <LabelWithTooltip
              label="CPA Phone"
              tooltip="Phone number of your CPA"
              htmlFor="cpa-phone"
            />
            <Input
              value={formData.cpa_info.phone}
              onChange={(e) => handleNestedChange('cpa_info', 'phone', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          <div className="col-span-2">
            <LabelWithTooltip
              label="CPA Address"
              tooltip="Business address of your CPA"
              htmlFor="cpa-address"
            />
            <Textarea
              value={formData.cpa_info.address}
              onChange={(e) => handleNestedChange('cpa_info', 'address', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
        </div>
      </div>

      {/* Trademark Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Trademark Information</h3>
        
        <div>
          <LabelWithTooltip
            label="Trademark Status"
            tooltip="Indicate whether your business name or products are trademarked"
            htmlFor="has-trademark"
          />
          <Select
            value={formData.trademark.has_trademark ? "yes" : "no"}
            onValueChange={(value) => handleNestedChange('trademark', 'has_trademark', value === "yes")}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Does your business have trademarks?" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.trademark.has_trademark && (
          <>
            <div>
              <LabelWithTooltip
                label="Trademark Description"
                tooltip="Describe what is trademarked (e.g., business name, logo, specific products)"
                htmlFor="trademark-description"
              />
              <Textarea
                id="trademark-description"
                value={formData.trademark.description || ''}
                onChange={(e) => handleNestedChange('trademark', 'description', e.target.value)}
                className="bg-gray-900 border-gray-700 text-white mb-4"
                placeholder="Describe what aspects of your business are trademarked..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <LabelWithTooltip
                  label="Country"
                  tooltip="Country where the trademark is registered"
                  htmlFor="trademark-country"
                />
                <Input
                  id="trademark-country"
                  value={newTrademarkCountry}
                  onChange={(e) => setNewTrademarkCountry(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="Enter country name"
                />
              </div>
              
              <div>
                <LabelWithTooltip
                  label="Registration Number"
                  tooltip="Official trademark registration number"
                  htmlFor="registration-number"
                />
                <Input
                  id="registration-number"
                  value={newRegistrationNumber}
                  onChange={(e) => setNewRegistrationNumber(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="Enter registration number"
                />
              </div>
              
              <div>
                <LabelWithTooltip
                  label="Registration Date"
                  tooltip="Date when the trademark was officially registered"
                  htmlFor="registration-date"
                />
                <Popover open={trademarkDateOpen} onOpenChange={setTrademarkDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-start text-left font-normal bg-gray-900 border-gray-700 text-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newRegistrationDate ? 
                       format(new Date(newRegistrationDate), 'PPP') : 
                       <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" side="bottom" align="start">
                    <Calendar
                      mode="single"
                      selected={newRegistrationDate ? new Date(newRegistrationDate) : undefined}
                      onSelect={(date) => {
                        setNewRegistrationDate(date);
                        setTrademarkDateOpen(false);
                      }}
                      initialFocus
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button type="button" onClick={addTrademarkInfo} className="mt-2">
              Add Trademark Registration
            </Button>

            <div className="space-y-2">
              {formData.trademark.countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    <span className="text-white">{country}</span>
                    <span className="text-white">{formData.trademark.registration_numbers[index]}</span>
                    <span className="text-white">
                      {formData.trademark.registration_dates[index] ? 
                       format(new Date(formData.trademark.registration_dates[index]), 'PPP') : 
                       'N/A'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTrademarkInfo(index)}
                    className="text-gray-400 hover:text-white ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <LabelWithTooltip
              label="Email"
              tooltip="Official business email address"
              htmlFor="email"
            />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          <div>
            <LabelWithTooltip
              label="Phone"
              tooltip="Business phone number"
              htmlFor="phone"
            />
            <Input
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          <div>
            <LabelWithTooltip
              label="Website"
              tooltip="Official business website URL"
              htmlFor="website"
            />
            <Input
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          <div>
            <LabelWithTooltip
              label="Status"
              tooltip="Current operational status of the business"
              htmlFor="status"
            />
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <LabelWithTooltip
              label="Address"
              tooltip="Official business address"
              htmlFor="address"
            />
            <Textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} className="bg-gray-900 border-gray-700 text-white">
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {business ? 'Update Business' : 'Create Business'}
        </Button>
      </div>
    </form>
  );
}
