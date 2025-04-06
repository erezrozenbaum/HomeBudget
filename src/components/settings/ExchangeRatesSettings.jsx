import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ExchangeRatesSettings({ settings, onSave }) {
  const [rates, setRates] = useState(settings?.exchange_rates || {
    USD: 0.27,
    EUR: 0.25,
    GBP: 0.21,
    JPY: 40.4675
  });

  const [error, setError] = useState(null);

  const handleSave = async () => {
    try {
      // Validate rates
      for (const [currency, rate] of Object.entries(rates)) {
        if (!rate || rate <= 0) {
          setError(`Invalid rate for ${currency}`);
          return;
        }
      }

      await onSave({ ...settings, exchange_rates: rates });
      setError(null);
    } catch (err) {
      setError('Failed to save exchange rates');
    }
  };

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Exchange Rates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-700">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <p className="text-sm text-gray-400">
            Set exchange rates relative to your default currency (ILS).
            These rates will be used to calculate totals across different currencies.
          </p>

          {Object.entries(rates).map(([currency, rate]) => (
            currency !== settings?.default_currency && (
              <div key={currency} className="grid gap-2">
                <Label className="text-gray-300">1 {currency} = {(1/rate).toFixed(2)} ILS</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={rate}
                  onChange={(e) => setRates(prev => ({
                    ...prev,
                    [currency]: parseFloat(e.target.value)
                  }))}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
            )
          ))}

          <Button onClick={handleSave} className="mt-4 bg-blue-600 hover:bg-blue-700">
            Save Exchange Rates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}