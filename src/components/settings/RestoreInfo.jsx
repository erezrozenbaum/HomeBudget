import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function RestoreInfo() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Restore Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="warning" className="bg-amber-900/30 border-amber-700">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Warning</AlertTitle>
          <AlertDescription className="text-gray-300">
            Rolling back will revert all changes made since the rollback point. Make sure you understand which changes will be lost.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 text-white">
          <h3 className="font-medium">Option 1: Contact Base44 Support</h3>
          <p className="text-gray-300">
            The Base44 team can restore your app to a specific version from their backups. This is the safest option as they can roll back just the specific changes that caused issues while preserving working functionality.
          </p>
          <p className="text-gray-300">
            Use the feedback button in the sidebar to contact support and request a rollback to before the Hebrew implementation.
          </p>
          
          <h3 className="font-medium mt-6">Option 2: Manually Fix Specific Issues</h3>
          <p className="text-gray-300">
            I can help you fix specific issues one by one without a complete rollback. This preserves working functionality while addressing only the broken parts.
          </p>
          <p className="text-gray-300">
            Let me know which specific features are most important to fix first, and I'll address them individually.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}