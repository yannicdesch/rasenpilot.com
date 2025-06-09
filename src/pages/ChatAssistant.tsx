
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Crown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import MainNavigation from '@/components/MainNavigation';
import { useSubscription } from '@/hooks/useSubscription';
import PremiumGate from '@/components/subscription/PremiumGate';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyQuestions, setDailyQuestions] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { isPremium } = useSubscription();

  const DAILY_LIMIT = 5;

  useEffect(() => {
    // Reset daily questions counter at midnight
    const lastReset = localStorage.getItem('lastQuestionReset');
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
      localStorage.setItem('lastQuestionReset', today);
      localStorage.setItem('dailyQuestions', '0');
      setDailyQuestions(0);
    } else {
      const saved = localStorage.getItem('dailyQuestions');
      setDailyQuestions(saved ? parseInt(saved) : 0);
    }

    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        content: `Hallo! Ich bin Ihr persönlicher Rasen-Experte. Ich helfe Ihnen gerne bei allen Fragen rund um die Rasenpflege. ${!isPremium ? `Als Free-User haben Sie ${DAILY_LIMIT} Fragen pro Tag.` : 'Als Premium-Mitglied können Sie unbegrenzt Fragen stellen!'}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const canAskQuestion = () => {
    return isPremium || dailyQuestions < DAILY_LIMIT;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    if (!canAskQuestion()) {
      toast.error('Tageslimit erreicht! Upgraden Sie auf Premium für unbegrenzte Fragen.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (!isPremium) {
      const newCount = dailyQuestions + 1;
      setDailyQuestions(newCount);
      localStorage.setItem('dailyQuestions', newCount.toString());
    }

    try {
      // Simulate AI response (replace with actual OpenAI API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Das ist eine hilfreiche Antwort zu Ihrer Frage: "${input.trim()}". Als Rasen-Experte empfehle ich Ihnen, regelmäßig zu mähen und zu düngen. Für spezifischere Beratung können Sie gerne weitere Fragen stellen!`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast.error('Fehler beim Senden der Nachricht');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPremium && dailyQuestions >= DAILY_LIMIT) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <MainNavigation />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <PremiumGate
            feature="Unbegrenzte KI-Fragen"
            description="Sie haben Ihr Tageslimit von 5 Fragen erreicht. Upgraden Sie auf Premium für unbegrenzte Fragen an unseren Rasen-Experten."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainNavigation />
      <div className="container max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">KI-Rasen Assistent</h1>
              <p className="text-gray-600">Fragen Sie unseren ChatGPT-Rasenexperten</p>
            </div>
            <div className="flex items-center gap-2">
              {!isPremium && (
                <Badge variant="outline" className="border-orange-300 text-orange-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {DAILY_LIMIT - dailyQuestions} Fragen übrig heute
                </Badge>
              )}
              {isPremium && (
                <Badge className="bg-yellow-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium - Unbegrenzt
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Card className="flex-1 flex flex-col border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Chat mit dem Rasen-Experten
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.isUser
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isUser ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={canAskQuestion() ? "Stellen Sie Ihre Frage..." : "Tageslimit erreicht"}
                  disabled={isLoading || !canAskQuestion()}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim() || !canAskQuestion()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatAssistant;
