import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export default function EmergencyFundContributionForm({ accounts, currency, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date(),
        from_account_id: ''
    });
    
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.amount || !formData.from_account_id) {
            alert('Please fill in all required fields');
            return;
        }
        
        onSave(formData);
    };
    
    // Filter accounts to show only those with matching currency
    const compatibleAccounts = currency 
        ? accounts.filter(account => account.currency === currency)
        : accounts;
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Contribution Amount</Label>
                <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                />
                {currency && (
                    <p className="text-xs text-gray-400">
                        Amount in {currency}
                    </p>
                )}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="from_account_id">From Account</Label>
                <Select
                    value={formData.from_account_id}
                    onValueChange={(value) => setFormData({...formData, from_account_id: value})}
                >
                    <SelectTrigger id="from_account_id">
                        <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                        {compatibleAccounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.name} - {account.current_balance} {account.currency}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {currency && compatibleAccounts.length === 0 && (
                    <p className="text-xs text-red-400">
                        No accounts with {currency} currency found. Please create one first.
                    </p>
                )}
            </div>
            
            <div className="space-y-2">
                <Label>Contribution Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => setFormData({...formData, date})}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    Make Contribution
                </Button>
            </div>
        </form>
    );
}