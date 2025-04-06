import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';

export default function EmergencyFundForm({ emergencyFund, accounts, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        target_amount: emergencyFund?.target_amount || '',
        current_amount: emergencyFund?.current_amount || '',
        currency: emergencyFund?.currency || 'USD',
        target_months: emergencyFund?.target_months || 3,
        bank_account_id: emergencyFund?.bank_account_id || '',
        created_date: emergencyFund?.created_date || format(new Date(), 'yyyy-MM-dd'),
        contributions: emergencyFund?.contributions || [],
        withdrawals: emergencyFund?.withdrawals || [],
        auto_contribution: emergencyFund?.auto_contribution || false,
        auto_contribution_amount: emergencyFund?.auto_contribution_amount || '',
        auto_contribution_frequency: emergencyFund?.auto_contribution_frequency || 'monthly'
    });
    
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        });
    };
    
    const handleSelectChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.target_amount || !formData.current_amount || !formData.currency || !formData.bank_account_id) {
            alert('Please fill in all required fields');
            return;
        }
        
        onSave(formData);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="target_amount">Target Amount</Label>
                    <Input
                        id="target_amount"
                        name="target_amount"
                        type="number"
                        value={formData.target_amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="current_amount">Current Amount</Label>
                    <Input
                        id="current_amount"
                        name="current_amount"
                        type="number"
                        value={formData.current_amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                        value={formData.currency}
                        onValueChange={(value) => handleSelectChange('currency', value)}
                    >
                        <SelectTrigger id="currency">
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
                
                <div className="space-y-2">
                    <Label htmlFor="target_months">Target Months of Expenses</Label>
                    <Select
                        value={formData.target_months.toString()}
                        onValueChange={(value) => handleSelectChange('target_months', parseInt(value))}
                    >
                        <SelectTrigger id="target_months">
                            <SelectValue placeholder="Select months" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 month</SelectItem>
                            <SelectItem value="2">2 months</SelectItem>
                            <SelectItem value="3">3 months</SelectItem>
                            <SelectItem value="4">4 months</SelectItem>
                            <SelectItem value="5">5 months</SelectItem>
                            <SelectItem value="6">6 months</SelectItem>
                            <SelectItem value="9">9 months</SelectItem>
                            <SelectItem value="12">12 months</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="bank_account_id">Linked Bank Account</Label>
                <Select
                    value={formData.bank_account_id}
                    onValueChange={(value) => handleSelectChange('bank_account_id', value)}
                >
                    <SelectTrigger id="bank_account_id">
                        <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.name} ({account.currency})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">
                    This is where your emergency fund is kept
                </p>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {emergencyFund ? 'Update' : 'Create'} Emergency Fund
                </Button>
            </div>
        </form>
    );
}