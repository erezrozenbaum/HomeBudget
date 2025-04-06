import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClientForm({ client, businessId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    business_id: businessId,
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    payment_terms: client?.payment_terms || 'net_30',
    custom_payment_terms: client?.custom_payment_terms || '',
    currency: client?.currency || 'USD',
    notes: client?.notes || '',
    status: client?.status || 'active',
    website: client?.website || '',
    contact_person: client?.contact_person || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-white">Client Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="contact_person" className="text-white">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-white">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="website" className="text-white">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="currency" className="text-white">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="ILS">ILS</SelectItem>
              <SelectItem value="JPY">JPY</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="payment_terms" className="text-white">Payment Terms</Label>
          <Select
            value={formData.payment_terms}
            onValueChange={(value) => setFormData({ ...formData, payment_terms: value })}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select payment terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="net_7">Net 7</SelectItem>
              <SelectItem value="net_15">Net 15</SelectItem>
              <SelectItem value="net_30">Net 30</SelectItem>
              <SelectItem value="net_60">Net 60</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.payment_terms === 'custom' && (
          <div>
            <Label htmlFor="custom_payment_terms" className="text-white">Custom Payment Terms</Label>
            <Input
              id="custom_payment_terms"
              value={formData.custom_payment_terms}
              onChange={(e) => setFormData({ ...formData, custom_payment_terms: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="Describe custom payment terms"
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="address" className="text-white">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="bg-gray-900 border-gray-700 text-white"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-white">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="bg-gray-900 border-gray-700 text-white"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Client
        </Button>
      </div>
    </form>
  );
}