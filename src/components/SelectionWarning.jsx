import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SelectionWarning = ({ selectedCount }) => {
  if (selectedCount <= 1) return null;
  
  return (
    <Alert className="mt-4 bg-amber-50 border-amber-200">
      <div className="flex gap-2">
        <AlertCircle className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Note: All selected memories will be downloaded as a flat list in your downloads folder. 
          Consider downloading one month at a time if you want to keep your memories organized by date.
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default SelectionWarning;