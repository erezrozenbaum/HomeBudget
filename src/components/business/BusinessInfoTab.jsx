
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Calendar,
  Globe,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Scale,
  FileText,
  User
} from "lucide-react";
import { format } from 'date-fns';

export default function BusinessInfoTab({ business }) {
  const InfoItem = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
        <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
        <div>
          <div className="text-sm text-gray-400">{label}</div>
          <div className="text-white">{value}</div>
        </div>
      </div>
    );
  };

  const MarketsList = ({ markets }) => {
    if (!markets || markets.length === 0) return null;
    
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
        <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
        <div>
          <div className="text-sm text-gray-400">Markets</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {markets.map((market, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-sm rounded-md bg-gray-700 text-gray-200"
              >
                {market}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TaxInfo = ({ tax_details }) => {
    if (!tax_details) return null;

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
        <Scale className="w-5 h-5 text-gray-400 mt-0.5" />
        <div>
          <div className="text-sm text-gray-400">Tax Information</div>
          <div className="space-y-2 mt-2">
            {tax_details.vat_number && (
              <div>
                <span className="text-gray-400">VAT/Tax Number:</span>{" "}
                <span className="text-white">{tax_details.vat_number}</span>
              </div>
            )}
            {tax_details.tax_year && (
              <div>
                <span className="text-gray-400">Tax Year:</span>{" "}
                <span className="text-white">{tax_details.tax_year}</span>
              </div>
            )}
            {tax_details.tax_filing_frequency && (
              <div>
                <span className="text-gray-400">Filing Frequency:</span>{" "}
                <span className="text-white">{tax_details.tax_filing_frequency}</span>
              </div>
            )}
            {tax_details.last_tax_filing && (
              <div>
                <span className="text-gray-400">Last Filing:</span>{" "}
                <span className="text-white">
                  {format(new Date(tax_details.last_tax_filing), 'PP')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CPAInfo = ({ cpa_info }) => {
    if (!cpa_info || !Object.values(cpa_info).some(val => val)) return null;

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
        <User className="w-5 h-5 text-gray-400 mt-0.5" />
        <div>
          <div className="text-sm text-gray-400">CPA Information</div>
          <div className="space-y-2 mt-2">
            {cpa_info.name && (
              <div>
                <span className="text-gray-400">Name:</span>{" "}
                <span className="text-white">{cpa_info.name}</span>
              </div>
            )}
            {cpa_info.company && (
              <div>
                <span className="text-gray-400">Company:</span>{" "}
                <span className="text-white">{cpa_info.company}</span>
              </div>
            )}
            {cpa_info.email && (
              <div>
                <span className="text-gray-400">Email:</span>{" "}
                <span className="text-white">{cpa_info.email}</span>
              </div>
            )}
            {cpa_info.phone && (
              <div>
                <span className="text-gray-400">Phone:</span>{" "}
                <span className="text-white">{cpa_info.phone}</span>
              </div>
            )}
            {cpa_info.address && (
              <div>
                <span className="text-gray-400">Address:</span>{" "}
                <span className="text-white">{cpa_info.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TrademarkInfo = ({ trademark }) => {
    if (!trademark || !trademark.has_trademark) return null;

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
        <div>
          <div className="text-sm text-gray-400">Trademark Information</div>
          <div className="space-y-4 mt-2">
            {trademark.countries?.map((country, index) => (
              <div key={index} className="p-3 rounded-lg bg-gray-800">
                <div className="text-white font-medium">{country}</div>
                {trademark.registration_numbers?.[index] && (
                  <div className="text-sm mt-1">
                    <span className="text-gray-400">Registration Number:</span>{" "}
                    <span className="text-gray-200">
                      {trademark.registration_numbers[index]}
                    </span>
                  </div>
                )}
                {trademark.registration_dates?.[index] && (
                  <div className="text-sm">
                    <span className="text-gray-400">Registration Date:</span>{" "}
                    <span className="text-gray-200">
                      {format(new Date(trademark.registration_dates[index]), 'PP')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {business.name && (
              <InfoItem 
                icon={Building2} 
                label="Business Name" 
                value={business.name} 
              />
            )}
            {business.type && (
              <InfoItem 
                icon={FileText} 
                label="Business Type" 
                value={formatBusinessType(business.type)} 
              />
            )}
            {business.industry && (
              <InfoItem 
                icon={Building2} 
                label="Industry" 
                value={business.industry} 
              />
            )}
            {business.start_date && (
              <InfoItem 
                icon={Calendar} 
                label="Start Date" 
                value={format(new Date(business.start_date), 'PP')} 
              />
            )}
            {business.email && (
              <InfoItem 
                icon={Mail} 
                label="Email" 
                value={business.email} 
              />
            )}
            {business.phone && (
              <InfoItem 
                icon={Phone} 
                label="Phone" 
                value={business.phone} 
              />
            )}
            {business.address && (
              <InfoItem 
                icon={MapPin} 
                label="Address" 
                value={business.address} 
              />
            )}
            {business.website && (
              <InfoItem 
                icon={LinkIcon} 
                label="Website" 
                value={business.website} 
              />
            )}
            {business.owner_location && (
              <InfoItem 
                icon={Globe} 
                label="Owner Location" 
                value={business.owner_location} 
              />
            )}
          </div>

          {/* Only show details if they exist */}
          {business.description && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-300 mb-2">Description</h3>
              <p className="text-white bg-gray-800/50 p-4 rounded-lg">{business.description}</p>
            </div>
          )}
          
          {business.markets && business.markets.length > 0 && (
            <div className="mt-6">
              <MarketsList markets={business.markets} />
            </div>
          )}
          
          {business.tax_details && Object.values(business.tax_details).some(Boolean) && (
            <div className="mt-6">
              <TaxInfo tax_details={business.tax_details} />
            </div>
          )}
          
          {business.cpa_info && Object.values(business.cpa_info).some(Boolean) && (
            <div className="mt-6">
              <CPAInfo cpa_info={business.cpa_info} />
            </div>
          )}
          
          {business.trademark && business.trademark.has_trademark && (
            <div className="mt-6">
              <TrademarkInfo trademark={business.trademark} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to format business type
function formatBusinessType(type) {
  switch (type) {
    case 'sole_proprietorship': return 'Sole Proprietorship';
    case 'llc': return 'LLC';
    case 'corporation': return 'Corporation';
    case 'partnership': return 'Partnership';
    default: return type;
  }
}
