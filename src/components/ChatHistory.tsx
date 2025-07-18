
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MessageSquare, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Simplified component that doesn't depend on missing database tables
const ChatHistory = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Meine Chat-Geschichte</h3>
      
      <Card className="bg-gray-50 dark:bg-gray-800 border-dashed">
        <CardContent className="py-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Chat-Geschichte nicht verfügbar</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Diese Funktion ist derzeit nicht verfügbar, da die entsprechenden Datenbanktabellen noch nicht eingerichtet sind.
          </p>
          <Button onClick={() => navigate('/chat')}>
            Zum KI-Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatHistory;
