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

export default function ProjectForm({ project, businessId, clients = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    business_id: businessId,
    client_id: project?.client_id || '',
    name: project?.name || '',
    description: project?.description || '',
    start_date: project?.start_date ? new Date(project.start_date) : null,
    end_date: project?.end_date ? new Date(project.end_date) : null,
    budget: project?.budget || '',
    status: project?.status || 'planned',
    hourly_rate: project?.hourly_rate || '',
    fixed_price: project?.fixed_price || false,
    currency: project?.currency || 'USD',
    color: project?.color || '#4f46e5',
    notes: project?.notes || ''
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="client_id">Client</Label>
          <Select 
            value={formData.client_id} 
            onValueChange={(value) => handleChange('client_id', value)}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              {clients.length === 0 ? (
                <SelectItem value={null} disabled>No clients available</SelectItem>
              ) : (
                clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !formData.start_date && "text-muted-foreground"
                } bg-gray-900 border-gray-700 text-white`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date ? (
                  format(formData.start_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
              <Calendar
                mode="single"
                selected={formData.start_date}
                onSelect={(date) => handleChange('start_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !formData.end_date && "text-muted-foreground"
                } bg-gray-900 border-gray-700 text-white`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date ? (
                  format(formData.end_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
              <Calendar
                mode="single"
                selected={formData.end_date}
                onSelect={(date) => handleChange('end_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select 
            value={formData.currency} 
            onValueChange={(value) => handleChange('currency', value)}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="ILS">ILS - Israeli Shekel</SelectItem>
              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="fixed_price"
            checked={formData.fixed_price}
            onCheckedChange={(checked) => handleChange('fixed_price', checked)}
          />
          <label
            htmlFor="fixed_price"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
          >
            Fixed Price Project
          </label>
        </div>
        
        <div>
          {formData.fixed_price ? (
            <>
              <Label htmlFor="budget">Project Budget</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => handleChange('budget', parseFloat(e.target.value))}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </>
          ) : (
            <>
              <Label htmlFor="hourly_rate">Hourly Rate</Label>
              <Input
                id="hourly_rate"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => handleChange('hourly_rate', parseFloat(e.target.value))}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </>
          )}
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            rows={3}
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            rows={2}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {project ? 'Update Project' : 'Add Project'}
        </Button>
      </div>
    </form>
  );
}