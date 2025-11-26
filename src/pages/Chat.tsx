import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Chat = () => {
  const { isPremium } = useSubscription();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hallo! Ich bin Ihr KI-Rasenberater. Ich kann Ihnen bei allen Fragen rund um die Rasenpflege helfen. Was möchten Sie wissen?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!isPremium) {
      toast.error('KI-Chat ist nur für Premium-Mitglieder verfügbar. Bitte upgraden Sie Ihr Konto.');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call the chat-with-ai edge function
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: inputMessage,
          conversation_history: messages.filter(msg => msg.sender !== 'ai' || msg.content !== 'Hallo! Ich bin Ihr KI-Rasenberater. Ich kann Ihnen bei allen Fragen rund um die Rasenpflege helfen. Was möchten Sie wissen?')
        }
      });

      if (error) {
        console.error('Chat API error:', error);
        throw new Error(error.message);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling chat API:', error);
      toast.error('Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.');
      
      // Fallback to mock response if API fails
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('mähen') || input.includes('mähroboter') || input.includes('schnitt')) {
      return 'Beim Mähen sollten Sie beachten: Mähen Sie nie mehr als 1/3 der Grashalmlänge auf einmal. Die optimale Schnitthöhe liegt je nach Grasart zwischen 3-5 cm. Im Sommer sollten Sie etwas höher mähen (4-5 cm), um die Wurzeln vor Hitze zu schützen.';
    }
    
    if (input.includes('düngen') || input.includes('dünger') || input.includes('nährstoff')) {
      return 'Für die Düngung empfehle ich: Düngen Sie Ihren Rasen 2-3 mal pro Jahr - im Frühjahr (März/April), Sommer (Juni/Juli) und Herbst (September/Oktober). Verwenden Sie einen Langzeitdünger mit ausgewogenem NPK-Verhältnis. Nach dem Düngen sollten Sie den Rasen gut wässern.';
    }
    
    if (input.includes('wasser') || input.includes('gießen') || input.includes('bewässer')) {
      return 'Zur Bewässerung: Gießen Sie lieber seltener, aber dafür durchdringend (ca. 15-20 Liter pro m²). Die beste Zeit ist früh morgens zwischen 4-9 Uhr. Vermeiden Sie abendliches Gießen, da dies Pilzkrankheiten fördern kann.';
    }
    
    if (input.includes('unkraut') || input.includes('löwenzahn') || input.includes('klee')) {
      return 'Bei Unkraut helfen diese Maßnahmen: Regelmäßiges Mähen schwächt Unkraut. Für vereinzeltes Unkraut verwenden Sie einen Unkrautstecher. Bei starkem Befall können Sie selektive Unkrautvernichter einsetzen. Ein dichter, gesunder Rasen ist der beste Unkrautschutz.';
    }
    
    if (input.includes('kahl') || input.includes('löcher') || input.includes('nachsäen')) {
      return 'Für kahle Stellen: Lockern Sie die Erde mit einer Harke auf, säen Sie Rasensamen ein (20-25g pro m²), drücken Sie die Samen leicht an und halten Sie die Fläche 2-3 Wochen konstant feucht. Die beste Zeit für Nachsaat ist Frühjahr oder Herbst.';
    }
    
    if (input.includes('pilz') || input.includes('krankheit') || input.includes('flecken')) {
      return 'Bei Pilzkrankheiten: Reduzieren Sie die Bewässerung, verbessern Sie die Belüftung durch Vertikutieren, entfernen Sie Rasenfilz und mähen Sie nicht bei feuchtem Gras. In schweren Fällen können Fungizide nötig sein.';
    }
    
    // Default response
    return 'Das ist eine interessante Frage zur Rasenpflege! Können Sie mir etwas mehr Details geben? Zum Beispiel: Welche Art von Problem haben Sie mit Ihrem Rasen? Oder geht es um eine spezielle Pflegemaßnahme? Je mehr Informationen Sie mir geben, desto besser kann ich Ihnen helfen.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Wie oft sollte ich meinen Rasen mähen?",
    "Wann ist die beste Zeit zum Düngen?",
    "Wie erkenne ich Rasenkrankheiten?",
    "Was hilft gegen Unkraut im Rasen?",
    "Wie oft sollte ich den Rasen wässern?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  if (!isPremium) {
    return (
      <>
        <SEO 
          title="KI-Chat - Premium Feature | RasenPilot"
          description="Chatten Sie mit unserem KI-Rasenexperten - verfügbar für Premium-Mitglieder."
        />
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
          <MainNavigation />
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <MessageSquare className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">KI-Chat Premium Feature</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Der KI-Chat ist ein exklusives Feature für Premium-Mitglieder. 
                  Upgraden Sie jetzt, um unbegrenzt mit unserem Rasenexperten zu chatten!
                </p>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/subscription'}
                >
                  Jetzt Premium abonnieren
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="KI-Chat Rasenberater | RasenPilot"
        description="Chatten Sie mit unserem KI-Rasenexperten und erhalten Sie sofortige Antworten auf alle Ihre Rasenpflege-Fragen."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="h-8 w-8 text-green-600" />
                    <div>
                      <CardTitle className="text-2xl">KI-Rasenberater</CardTitle>
                      <p className="text-gray-600">Ihr persönlicher Experte für alle Rasenpflege-Fragen</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">Premium</Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Questions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Häufige Fragen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className="text-sm"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="h-[500px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Chat</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'user'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {message.sender === 'ai' ? (
                              <Bot className="h-4 w-4 mt-1 text-green-600" />
                            ) : (
                              <User className="h-4 w-4 mt-1" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString('de-DE', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-green-600" />
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            <span className="text-sm text-gray-500">Tippt...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Stellen Sie eine Frage zur Rasenpflege..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;