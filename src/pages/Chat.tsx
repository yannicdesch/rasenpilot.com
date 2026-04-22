import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, Loader2, Lock, Crown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { useSubscription } from '@/hooks/useSubscription';
import { useChatContext, buildSystemPrompt } from '@/hooks/useChatContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const FREE_MESSAGE_LIMIT = 3;

const Chat = () => {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const chatContext = useChatContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set initial greeting based on context
  useEffect(() => {
    if (chatContext.loading) return;
    
    let greeting = 'Hallo! Ich bin Ihr KI-Rasenberater. ';
    if (chatContext.analysis) {
      greeting += `Ich sehe, Ihr letzter Rasen-Score war **${chatContext.analysis.score}/100**. `;
      if (chatContext.analysis.problems.length > 0) {
        greeting += `Dabei wurden folgende Punkte erkannt: ${chatContext.analysis.problems.slice(0, 2).join(', ')}. `;
      }
      greeting += 'Wie kann ich Ihnen heute weiterhelfen?';
    } else {
      greeting += 'Ich kann Ihnen bei allen Fragen rund um die Rasenpflege helfen. Was möchten Sie wissen?';
    }

    setMessages([{
      id: '1',
      content: greeting,
      sender: 'ai',
      timestamp: new Date()
    }]);
  }, [chatContext.loading, chatContext.analysis]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check free user limit
    if (!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT) {
      setLimitReached(true);
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
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: inputMessage,
          conversation_history: messages.filter(m => m.id !== '1'),
          analysis_context: chatContext.analysis,
          profile_context: chatContext.profile,
        }
      });

      if (error) throw new Error(error.message);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Show limit warning after response if approaching limit
      if (!isPremium && newCount >= FREE_MESSAGE_LIMIT) {
        setLimitReached(true);
      }
    } catch (error) {
      console.error('Error calling chat API:', error);
      toast.error('Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.');
    } finally {
      setIsTyping(false);
    }
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
                    <Bot className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">KI-Rasenberater</CardTitle>
                      <p className="text-muted-foreground">
                        {chatContext.analysis 
                          ? `Ihr Rasen-Score: ${chatContext.analysis.score}/100 • Personalisierte Beratung`
                          : 'Ihr persönlicher Experte für alle Rasenpflege-Fragen'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isPremium && (
                      <Badge variant="outline" className="text-xs">
                        {FREE_MESSAGE_LIMIT - userMessageCount > 0 
                          ? `${FREE_MESSAGE_LIMIT - userMessageCount} Nachrichten übrig` 
                          : 'Limit erreicht'}
                      </Badge>
                    )}
                    <Badge className={isPremium ? "bg-primary" : "bg-muted text-muted-foreground"}>
                      {isPremium ? 'Premium' : 'Kostenlos'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Context Banner for Pro users */}
            {isPremium && chatContext.analysis && (
              <Card className="mb-4 border-primary/20 bg-primary/5">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Crown className="h-4 w-4" />
                    <span className="font-medium">
                      Personalisiert: Der KI-Berater kennt Ihren Rasen-Score ({chatContext.analysis.score}/100), 
                      Ihre Grasart{chatContext.profile ? ` und PLZ ${chatContext.profile.zipCode}` : ''}.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      onClick={() => setInputMessage(question)}
                      className="text-sm"
                      disabled={limitReached}
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
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {message.sender === 'ai' ? (
                              <Bot className="h-4 w-4 mt-1 text-primary" />
                            ) : (
                              <User className="h-4 w-4 mt-1" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p className={`text-xs mt-1 opacity-60`}>
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
                        <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Tippt...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upgrade prompt when limit reached */}
                    {limitReached && !isPremium && (
                      <div className="flex justify-center my-4">
                        <Card className="border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 max-w-md">
                          <CardContent className="py-6 text-center">
                            <Lock className="h-10 w-10 text-amber-600 mx-auto mb-3" />
                            <h3 className="font-bold text-lg text-amber-900 mb-2">
                              Kostenlose Nachrichten aufgebraucht
                            </h3>
                            <p className="text-amber-800 text-sm mb-4">
                              Für unbegrenzte Beratung mit personalisierten Tipps basierend auf Ihrem Rasen-Score — upgraden Sie auf Premium oder Pro.
                            </p>
                            <div className="flex flex-col gap-2">
                              <Button 
                                onClick={() => navigate('/subscription')}
                                className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 text-white"
                              >
                                <Crown className="h-4 w-4 mr-2" />
                                Premium ab 9,99€/Monat
                              </Button>
                              <p className="text-xs text-amber-700">7 Tage kostenlos testen • Jederzeit kündbar</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t p-4">
                  {limitReached && !isPremium ? (
                    <div className="text-center text-sm text-muted-foreground">
                      <Button variant="link" onClick={() => navigate('/subscription')}>
                        Für unbegrenzte Beratung → Premium oder Pro
                      </Button>
                    </div>
                  ) : (
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
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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
