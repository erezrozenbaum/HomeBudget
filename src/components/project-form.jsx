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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function ProjectForm({ businessId, clients, onSave, onCancel, project }) {
  const [formData, setFormData] = useState({
    business_id: businessId,
    client_id: project?.client_id || (clients.length > 0 ? clients[0].id : ''),
    name: project?.name || '',
    description: project?.description || '',
    start_date: project?.start_date ? new Date(project.start_date) : new Date(),
    end_date: project?.end_date ? new Date(project.end_date) : null,
    budget: project?.budget || 0,
    status: project?.status || 'planned',
    hourly_rate: project?.hourly_rate || 0,
    fixed_price: project?.fixed_price || false,
    currency: project?.currency || 'USD',
    color: project?.color || '#4f46e5',
    notes: project?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name" className="text-white">Project Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="client_id" className="text-white">Client</Label>
          <Select
            value={formData.client_id}
            onValueChange={(value) => setFormData({ ...formData, client_id: value })}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={null} disabled>
                  No clients available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status" className="text-white">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="start_date" className="text-white">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-900 border-gray-700 text-white",
                  !formData.start_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date ? (
                  format(formData.start_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.start_date}
                onSelect={(date) => setFormData({ ...formData, start_date: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="end_date" className="text-white">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-900 border-gray-700 text-white",
                  !formData.end_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date ? (
                  format(formData.end_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.end_date}
                onSelect={(date) => setFormData({ ...formData, end_date: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="fixed_price" className="text-white">Project Type</Label>
          </div>
          <Select
            value={formData.fixed_price ? "fixed" : "hourly"}
            onValueChange={(value) => 
              setFormData({ ...formData, fixed_price: value === "fixed" })
            }
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly Rate</SelectItem>
              <SelectItem value="fixed">Fixed Price</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.fixed_price ? (
          <div>
            <Label htmlFor="budget" className="text-white">Budget</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="hourly_rate" className="text-white">Hourly Rate</Label>
            <Input
              id="hourly_rate"
              type="number"
              min="0"
              step="0.01"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
        )}

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
          <Label htmlFor="color" className="text-white">Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-12 h-10 p-1 bg-gray-900 border-gray-700"
            />
            <Input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="flex-1 bg-gray-900 border-gray-700 text-white"
              placeholder="#RRGGBB"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-white">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          Save Project
        </Button>
      </div>
    </form>
  );
}