import React, { useState, useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Leaf, Image, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useLawn } from '@/context/LawnContext';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import ChatHistory from '@/components/ChatHistory';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Mock suggested questions
const suggestedQuestions = [
  "Wie oft sollte ich meinen Bermuda-Rasen gießen?",
  "Was ist der beste Weg, um Löwenzahn loszuwerden?",
  "Wann ist die beste Zeit zum Düngen?",
  "Wie kann ich kahle Stellen im Rasen reparieren?",
  "Welche Höhe sollte ich mein Gras schneiden?"
];

// Mock responses for demo (would use OpenAI in production)
const mockResponses: Record<string, string> = {
  "Wie oft sollte ich meinen Bermuda-Rasen gießen?": 
    "Für Bermuda-Rasen sollten Sie tief, aber nicht zu häufig gießen, um tiefes Wurzelwachstum zu fördern. Während der Sommermonate streben Sie etwa 2,5 bis 3 cm Wasser pro Woche an, entweder durch Niederschlag oder Bewässerung. In kühleren Monaten reduzieren Sie auf 1,5-2 cm pro Woche. Bewässern Sie immer früh morgens (zwischen 4-10 Uhr), um Verdunstung und Pilzwachstum zu minimieren.",
  
  "Was ist der beste Weg, um Löwenzahn loszuwerden?": 
    "Für eine effektive Löwenzahnkontrolle haben Sie mehrere Möglichkeiten:\n\n1. Manuelle Entfernung - Ziehen Sie Löwenzahn von Hand heraus und achten Sie darauf, die gesamte Pfahlwurzel zu entfernen\n2. Punktuelle Behandlung mit selektiven Herbiziden, die Breitblattunkräuter bekämpfen, ohne dem Gras zu schaden\n3. Verbessern Sie die allgemeine Rasengesundheit durch richtiges Mähen, Düngen und Bewässern, um neues Unkraut zu verhindern\n4. Verwenden Sie im Frühjahr Vorauflauf-Herbizide, um das Keimen von Löwenzahnsamen zu verhindern\n\nFür einen organischen Ansatz können Sie auf Essig basierende Herbizide oder Maisklebermehl als natürliches Vorauflaufmittel verwenden.",
  
  "Wann ist die beste Zeit zum Düngen?": 
    "Die beste Zeit zum Düngen hängt von Ihrer Grasart und dem Klima ab. Bei Warmjahreszeitgräsern wie Bermuda, St. Augustine und Zoysia bringen Sie den ersten Dünger im späten Frühling aus, wenn das Gras aktiv wächst. Bei Kaltjahreszeitgräsern wie Blaugras und Schwingel ist der frühe Herbst ideal für die Hauptanwendung. Düngen Sie immer, wenn das Gras trocken, der Boden aber feucht ist, und folgen Sie mit leichter Bewässerung, damit die Nährstoffe die Wurzeln erreichen, ohne das Gras zu verbrennen.",
  
  "Wie kann ich kahle Stellen im Rasen reparieren?": 
    "Um kahle Stellen in Ihrem Rasen zu reparieren:\n\n1. Entfernen Sie Schutt und lockern Sie die obersten 2-5 cm Erde\n2. Tragen Sie eine dünne Schicht Kompost oder Oberboden auf\n3. Streuen Sie Grassamen, die für Ihren Rasentyp geeignet sind, und sorgen Sie für guten Samen-Boden-Kontakt\n4. Rechen Sie die Samen leicht in den Boden ein\n5. Bewässern Sie leicht aber häufig, bis die Keimung erfolgt (normalerweise 7-21 Tage)\n6. Sobald etabliert, wechseln Sie zu tieferer, weniger häufiger Bewässerung\n\nFür schnellere Ergebnisse können Sie Rasensoden für sofortige Deckung verwenden. Die beste Zeit zum Reparieren ist während der Hauptwachstumszeit Ihrer Grasart - Frühling/Sommer für Warmjahreszeitgräser und Herbst für Kaltjahreszeitgräser.",
  
  "Welche Höhe sollte ich mein Gras schneiden?": 
    "Die optimale Schnitthöhe variiert je nach Grasart:\n\n• Bermuda: 2,5-5 cm\n• Kentucky Bluegrass: 6-9 cm\n• Schwingel: 7,5-10 cm\n• St. Augustine: 6-10 cm\n• Zoysia: 2,5-5 cm\n• Raigras: 4-6 cm\n\nBefolgen Sie die 1/3-Regel: Entfernen Sie nie mehr als ein Drittel der Grashalmhöhe bei einem Mähdurchgang. Bei Sommerhitze oder Trockenstress schneiden Sie am oberen Ende des empfohlenen Bereichs. Halten Sie die Klingen des Mähers scharf für sauberere Schnitte, die dazu beitragen, Krankheiten zu vermeiden."
};

const ChatAssistant = () => {
  const { profile } = useLawn();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageAttachment, setImageAttachment] = useState<File | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };

    checkAuth();

    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      const welcomeMessage = profile 
        ? `👋 Hallo! Ich bin Ihr Rasenpilot-KI Assistent. Ich sehe, dass Sie einen ${profile.grassType}-Rasen haben. Wie kann ich Ihnen heute bei der Rasenpflege helfen?` 
        : "👋 Hallo! Ich bin Ihr Rasenpilot-KI Assistent. Wie kann ich Ihnen heute bei der Rasenpflege helfen?";
      
      const initialMessage = {
        id: 1,
        content: welcomeMessage,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
      
      // Create a new chat session if authenticated
      if (isAuthenticated) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const sessionId = uuidv4();
            setCurrentSessionId(sessionId);
            
            // Create chat session in database
            await supabase.from('chat_sessions').insert({
              id: sessionId,
              user_id: session.user.id,
              title: 'Neue Chat-Session',
            });
            
            // Save initial AI message
            await supabase.from('chat_messages').insert({
              chat_session_id: sessionId,
              content: welcomeMessage,
              sender: 'ai',
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Error creating chat session:', error);
        }
      }
    };
    
    initChat();
  }, [profile, isAuthenticated]);

  const saveMessage = async (content: string, sender: 'user' | 'ai') => {
    if (!isAuthenticated || !currentSessionId) return;
    
    try {
      await supabase.from('chat_messages').insert({
        chat_session_id: currentSessionId,
        content,
        sender,
        timestamp: new Date().toISOString(),
      });
      
      // Update session title based on first user question
      if (sender === 'user' && messages.length <= 1) {
        await supabase.from('chat_sessions').update({
          title: content.length > 50 ? content.substring(0, 50) + '...' : content,
        }).eq('id', currentSessionId);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSend = () => {
    if (input.trim() === '' && !imageAttachment) return;
    
    // Create new user message
    const newUserMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, newUserMessage]);
    
    // Save user message if authenticated
    if (isAuthenticated) {
      saveMessage(input, 'user');
    }
    
    setInput('');
    setIsLoading(true);
    
    if (imageAttachment) {
      // Handle image upload logic here
      toast({
        title: "Bild empfangen",
        description: "Unsere KI analysiert Ihr Rasenfoto."
      });
      setImageAttachment(null);
    }

    // Simulate AI response delay (would use OpenAI API in production)
    setTimeout(() => {
      let responseText = "Ich muss diese Frage genauer recherchieren. Für speziellere Beratung zu Ihrer Situation empfehle ich, einen lokalen Rasenexperten zu konsultieren.";
      
      // Check if we have a mock response for this question
      for (const question in mockResponses) {
        if (input.toLowerCase().includes(question.toLowerCase().slice(0, 10))) {
          responseText = mockResponses[question];
          break;
        }
      }
      
      // Personalize response if we have profile data
      if (profile && profile.grassType) {
        responseText = responseText.replace(/Bermuda/g, profile.grassType);
      }
      
      const newAiMessage: Message = {
        id: messages.length + 2,
        content: responseText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, newAiMessage]);
      
      // Save AI response if authenticated
      if (isAuthenticated) {
        saveMessage(responseText, 'ai');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageAttachment(e.target.files[0]);
      toast({
        title: "Bild angehängt",
        description: "Senden Sie Ihre Nachricht, um das Rasenfoto zu analysieren."
      });
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setMessages([...messages, {
      id: messages.length + 1,
      content: question,
      sender: 'user',
      timestamp: new Date()
    }]);
    
    // Save user message if authenticated
    if (isAuthenticated) {
      saveMessage(question, 'user');
    }
    
    setIsLoading(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      let responseText = mockResponses[question] || "Ich muss das genauer recherchieren.";
      
      // Personalize response if we have profile data
      if (profile && profile.grassType) {
        responseText = responseText.replace(/Bermuda/g, profile.grassType);
      }
      
      const newAiMessage: Message = {
        id: messages.length + 2,
        content: responseText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, newAiMessage]);
      
      // Save AI response if authenticated
      if (isAuthenticated) {
        saveMessage(responseText, 'ai');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-6">Fragen an Rasenpilot-KI</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar with suggested questions */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare size={18} />
                    Vorgeschlagene Fragen
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="space-y-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button 
                        key={index}
                        variant="ghost" 
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {isAuthenticated && (
                <div className="mt-6">
                  <ChatHistory />
                </div>
              )}
            </div>
            
            {/* Chat interface */}
            <div className="md:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="bg-green-50 dark:bg-green-900/30 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="text-green-600 dark:text-green-500" size={20} />
                    Rasenpilot-KI Assistent
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow overflow-y-auto pt-4 pb-0">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.sender === 'user' 
                              ? 'bg-green-600 text-white dark:bg-green-700' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          <div className="whitespace-pre-line">{message.content}</div>
                          <div 
                            className={`text-xs mt-1 ${
                              message.sender === 'user' ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4 pb-4">
                  <div className="w-full space-y-2">
                    {imageAttachment && (
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded p-2">
                        <div className="flex-grow truncate text-sm">
                          {imageAttachment.name}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setImageAttachment(null)}
                          className="h-6 w-6"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        asChild
                      >
                        <label>
                          <Image size={20} />
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </Button>
                      
                      <Input 
                        className="flex-grow"
                        placeholder="Stellen Sie Ihre Frage..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      
                      <Button 
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                        onClick={handleSend}
                        disabled={input.trim() === '' && !imageAttachment}
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                Rasenpilot-KI ist entwickelt, um allgemeine Rasenberatung zu bieten, berücksichtigt jedoch möglicherweise nicht alle lokalen Bedingungen. Ziehen Sie bei speziellen Problemen immer lokale Experten hinzu.
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default ChatAssistant;
