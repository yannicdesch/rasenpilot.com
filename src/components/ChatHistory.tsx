
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MessageSquare, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

interface ChatSession {
  id: string;
  created_at: string;
  title: string;
  user_id: string;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  chat_session_id: string;
}

const ChatHistory = () => {
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const fetchChatHistory = async (): Promise<ChatSession[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*, messages(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  };
  
  const { data: chatSessions = [], isLoading, refetch } = useQuery({
    queryKey: ['chat-history'],
    queryFn: fetchChatHistory
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (chatId: string) => {
      // First delete all messages in the chat
      await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_session_id', chatId);
      
      // Then delete the chat session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatId);
      
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success('Chatverlauf gelöscht');
      setIsDialogOpen(false);
      setSelectedChat(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });
  
  const handleDeleteChat = (chatId: string) => {
    deleteMutation.mutate(chatId);
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Meine Chat-Geschichte</h3>
      
      {isLoading ? (
        <div className="text-center py-12">Lade Chatverlauf...</div>
      ) : chatSessions.length === 0 ? (
        <Card className="bg-gray-50 dark:bg-gray-800 border-dashed">
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Chat-Geschichte vorhanden</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Stellen Sie Ihre erste Frage im Chat-Assistenten, um Ihren Chatverlauf zu speichern
            </p>
            <Button onClick={() => window.location.href = '/chat'}>
              Chat-Assistent öffnen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {chatSessions.map((chat) => (
            <Card 
              key={chat.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedChat(chat);
                setIsDialogOpen(true);
              }}
            >
              <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg truncate">{chat.title || 'Chat-Session'}</CardTitle>
                  <span className="text-xs text-gray-500 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" /> 
                    {formatDate(chat.created_at).split(',')[0]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {chat.messages && chat.messages.length > 0 
                    ? chat.messages[0].content.substring(0, 60) + "..." 
                    : 'Keine Nachrichten'
                  }
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {selectedChat && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedChat.title || 'Chat-Session'}</DialogTitle>
              <DialogDescription>
                {formatDate(selectedChat.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {selectedChat.messages && selectedChat.messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'user' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-line">{message.content}</div>
                      <div 
                        className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!selectedChat.messages || selectedChat.messages.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    Diese Chat-Session enthält keine Nachrichten
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <Button 
                variant="destructive"
                onClick={() => handleDeleteChat(selectedChat.id)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Chat löschen</span>
              </Button>
              <Button 
                variant="default"
                onClick={() => window.location.href = '/chat'}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Im Chat fortfahren</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ChatHistory;
