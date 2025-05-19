
import React from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TaskPreview: React.FC = () => {
  return (
    <Alert className="bg-green-50 border-green-200 mb-4">
      <Info className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Erster Blick auf deinen Plan</AlertTitle>
      <AlertDescription className="text-green-700">
        Deine erste Aufgabe: Rasen auf optimale Höhe mähen (3-4cm)
      </AlertDescription>
    </Alert>
  );
};

export default TaskPreview;
