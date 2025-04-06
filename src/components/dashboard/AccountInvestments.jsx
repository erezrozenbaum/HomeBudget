import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InvestmentCard from '../investments/InvestmentCard';

export default function AccountInvestments({ investments, defaultCurrency }) {
  if (!investments?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Linked Investments</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          No investments linked to this account
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Investments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              showActions={false}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}