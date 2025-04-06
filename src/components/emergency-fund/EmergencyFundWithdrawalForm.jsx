import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export default function EmergencyFundWithdrawalForm({ accounts, currency, maxAmount, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date(),
        to_account_id: '',
        reason: '',
        unplanned_category: 'other'
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
        if (!formData.amount || !formData.to_account_id || !formData.reason) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (formData.amount > maxAmount) {
            alert(`Withdrawal amount cannot exceed your current emergency fund balance of ${currency} ${maxAmount}`);
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
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    max={maxAmount}
                    step="0.01"
                    required
                />
                {currency && (
                    <p className="text-xs text-gray-400">
                        Maximum: {currency} {maxAmount}
                    </p>
                )}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="to_account_id">To Account</Label>
                <Select
                    value={formData.to_account_id}
                    onValueChange={(value) => setFormData({...formData, to_account_id: value})}
                >
                    <SelectTrigger id="to_account_id">
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
            </div>
            
            <div className="space-y-2">
                <Label>Withdrawal Date</Label>
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
            
            <div className="space-y-2">
                <Label htmlFor="unplanned_category">Category</Label>
                <Select
                    value={formData.unplanned_category}
                    onValueChange={(value) => setFormData({...formData, unplanned_category: value})}
                >
                    <SelectTrigger id="unplanned_category">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="car_repairs">Car Repairs</SelectItem>
                        <SelectItem value="home_repairs">Home Repairs</SelectItem>
                        <SelectItem value="travel_emergencies">Travel Emergencies</SelectItem>
                        <SelectItem value="unexpected_bills">Unexpected Bills</SelectItem>
                        <SelectItem value="emergency_purchases">Emergency Purchases</SelectItem>
                        <SelectItem value="family_emergency">Family Emergency</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="reason">Reason for Withdrawal</Label>
                <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Explain why you need to withdraw from your emergency fund"
                    required
                />
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    Make Withdrawal
                </Button>
            </div>
        </form>
    );
}