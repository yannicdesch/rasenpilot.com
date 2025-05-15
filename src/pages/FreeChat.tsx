
import React, { useState, useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Leaf } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useLawn } from '@/context/LawnContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeatureCallToAction from '@/components/FeatureCallToAction';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Mock suggested questions
const suggestedQuestions = [
  "Wie oft sollte ich meinen Rasen gießen?",
  "Was ist der beste Weg, um Unkraut loszuwerden?",
  "Wann ist die beste Zeit zum Düngen?",
  "Wie kann ich kahle Stellen reparieren?",
  "Welche Höhe sollte ich mein Gras schneiden?"
];

// Mock responses for demo
const mockResponses: Record<string, string> = {
  "Wie oft sollte ich meinen Rasen gießen?": 
    "Für die meisten Rasenarten sollten Sie tief, aber nicht zu häufig gießen, um tiefes Wurzelwachstum zu fördern. Während der Sommermonate streben Sie etwa 2,5 bis 3 cm Wasser pro Woche an, entweder durch Niederschlag oder Bewässerung. In kühleren Monaten reduzieren Sie auf 1,5-2 cm pro Woche. Bewässern Sie immer früh morgens (zwischen 4-10 Uhr), um Verdunstung und Pilzwachstum zu minimieren.",
  
  "Was ist der beste Weg, um Unkraut loszuwerden?": 
    "Für eine effektive Unkrautbekämpfung haben Sie mehrere Möglichkeiten:\n\n1. Manuelle Entfernung - Ziehen Sie Unkraut von Hand heraus und achten Sie darauf, die gesamte Wurzel zu entfernen\n2. Punktuelle Behandlung mit selektiven Herbiziden, die Breitblattunkräuter bekämpfen, ohne dem Gras zu schaden\n3. Verbessern Sie die allgemeine Rasengesundheit durch richtiges Mähen, Düngen und Bewässern, um neues Unkraut zu verhindern\n4. Verwenden Sie im Frühjahr Vorauflauf-Herbizide, um das Keimen von Unkrautsamen zu verhindern\n\nFür einen organischen Ansatz können Sie auf Essig basierende Herbizide oder Maisklebermehl als natürliches Vorauflaufmittel verwenden.",
  
  "Wann ist die beste Zeit zum Düngen?": 
    "Die beste Zeit zum Düngen hängt von Ihrer Grasart und dem Klima ab. Bei Warmjahreszeitgräsern wie Bermuda, St. Augustine und Zoysia bringen Sie den ersten Dünger im späten Frühling aus, wenn das Gras aktiv wächst. Bei Kaltjahreszeitgräsern wie Blaugras und Schwingel ist der frühe Herbst ideal für die Hauptanwendung. Düngen Sie immer, wenn das Gras trocken, der Boden aber feucht ist, und folgen Sie mit leichter Bewässerung, damit die Nährstoffe die Wurzeln erreichen, ohne das Gras zu verbrennen.",
  
  "Wie kann ich kahle Stellen reparieren?": 
    "Um kahle Stellen in Ihrem Rasen zu reparieren:\n\n1. Entfernen Sie Schutt und lockern Sie die obersten 2-5 cm Erde\n2. Tragen Sie eine dünne Schicht Kompost oder Oberboden auf\n3. Streuen Sie Grassamen, die für Ihren Rasentyp geeignet sind, und sorgen Sie für guten Samen-Boden-Kontakt\n4. Rechen Sie die Samen leicht in den Boden ein\n5. Bewässern Sie leicht aber häufig, bis die Keimung erfolgt (normalerweise 7-21 Tage)\n6. Sobald etabliert, wechseln Sie zu tieferer, weniger häufiger Bewässerung\n\nFür schnellere Ergebnisse können Sie Rasensoden für sofortige Deckung verwenden. Die beste Zeit zum Reparieren ist während der Hauptwachstumszeit Ihrer Grasart - Frühling/Sommer für Warmjahreszeitgräser und Herbst für Kaltjahreszeitgräser.",
  
  "Welche Höhe sollte ich mein Gras schneiden?": 
    "Die optimale Schnitthöhe variiert je nach Grasart:\n\n• Bermuda: 2,5-5 cm\n• Kentucky Bluegrass: 6-9 cm\n• Schwingel: 7,5-10 cm\n• St. Augustine: 6-10 cm\n• Zoysia: 2,5-5 cm\n• Raigras: 4-6 cm\n\nBefolgen Sie die 1/3-Regel: Entfernen Sie nie mehr als ein Drittel der Grashalmhöhe bei einem Mähdurchgang. Bei Sommerhitze oder Trockenstress schneiden Sie am oberen Ende des empfohlenen Bereichs. Halten Sie die Klingen des Mähers scharf für sauberere Schnitte, die dazu beitragen, Krankheiten zu vermeiden."
};

const FreeChat = () => {
  const { temporaryProfile } = useLawn();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const maxQuestions = 3; // Maximale Anzahl der Fragen in der kostenlosen Version

  useEffect(() => {
    // Initialisieren Sie den Chat mit einer Willkommensnachricht
    const initialMessage: Message = {
      id: 1,
      content: "👋 Hallo! Ich bin der Rasenpilot-KI Assistent. Sie können mir bis zu drei Fragen zur Rasenpflege stellen. Wie kann ich Ihnen helfen?",
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
  }, []);

  const handleSend = () => {
    if (input.trim() === '') return;
    
    // Überprüfen Sie, ob das Limit erreicht wurde
    if (questionCount >= maxQuestions) {
      toast({
        title: "Limit erreicht",
        description: "Sie haben das Limit von drei Fragen erreicht. Registrieren Sie sich für unbegrenzten Zugang."
      });
      return;
    }
    
    // Erstellen Sie eine neue Benutzernachricht
    const newUserMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, newUserMessage]);
    setInput('');
    setIsLoading(true);
    setQuestionCount(prevCount => prevCount + 1);
    
    // Simulieren Sie eine AI-Antwort (würde in der Produktion mit OpenAI API erfolgen)
    setTimeout(() => {
      let responseText = "Ich muss diese Frage genauer recherchieren. Für speziellere Beratung zu Ihrer Situation empfehle ich, einen lokalen Rasenexperten zu konsultieren.";
      
      // Überprüfen Sie, ob wir eine Mock-Antwort für diese Frage haben
      for (const question in mockResponses) {
        if (input.toLowerCase().includes(question.toLowerCase().slice(0, 10))) {
          responseText = mockResponses[question];
          break;
        }
      }
      
      // Personalisieren Sie die Antwort, wenn wir Profildaten haben
      if (temporaryProfile && temporaryProfile.grassType) {
        responseText = responseText.replace(/Bermuda/g, temporaryProfile.grassType);
      }
      
      const newAiMessage: Message = {
        id: messages.length + 2,
        content: responseText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, newAiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    
    // Überprüfen Sie, ob das Limit erreicht wurde
    if (questionCount >= maxQuestions) {
      toast({
        title: "Limit erreicht",
        description: "Sie haben das Limit von drei Fragen erreicht. Registrieren Sie sich für unbegrenzten Zugang."
      });
      return;
    }
    
    setMessages([...messages, {
      id: messages.length + 1,
      content: question,
      sender: 'user',
      timestamp: new Date()
    }]);
    
    setIsLoading(true);
    setQuestionCount(prevCount => prevCount + 1);
    
    // Simulieren Sie eine AI-Antwort
    setTimeout(() => {
      let responseText = mockResponses[question] || "Ich muss das genauer recherchieren.";
      
      // Personalisieren Sie die Antwort, wenn wir Profildaten haben
      if (temporaryProfile && temporaryProfile.grassType) {
        responseText = responseText.replace(/Bermuda/g, temporaryProfile.grassType);
      }
      
      const newAiMessage: Message = {
        id: messages.length + 2,
        content: responseText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, newAiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Rasenpilot-KI (Vorschau)</h1>
          
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Kostenlose Vorschau</AlertTitle>
            <AlertDescription className="text-amber-700">
              In der kostenlosen Version können Sie bis zu drei Fragen stellen. Registrieren Sie sich für unbegrenzten Zugang.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar mit vorgeschlagenen Fragen */}
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
                        disabled={questionCount >= maxQuestions}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Fragenlimit</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Verbleibende Fragen</span>
                      <span className="text-sm font-semibold">{Math.max(0, maxQuestions - questionCount)}/{maxQuestions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(1 - questionCount / maxQuestions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Registrieren Sie sich für unbegrenzten Zugang zu unserem KI-Assistenten.</p>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    onClick={() => navigate('/auth')}
                  >
                    <UserRound className="mr-2 h-4 w-4" />
                    Kostenlos anmelden
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Chat-Schnittstelle */}
            <div className="md:col-span-3">
              <Card className="h-[500px] flex flex-col">
                <CardHeader className="bg-green-50 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="text-green-600" size={20} />
                    Rasenpilot-KI Assistent (Vorschau)
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
                  <div className="w-full flex space-x-2">
                    <Input 
                      className="flex-grow"
                      placeholder={questionCount >= maxQuestions ? "Limit erreicht. Bitte registrieren Sie sich für mehr." : "Stellen Sie Ihre Frage..."} 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={questionCount >= maxQuestions}
                    />
                    
                    <Button 
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                      onClick={handleSend}
                      disabled={input.trim() === '' || questionCount >= maxQuestions}
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              <div className="mt-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Vollzugriff mit Registrierung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Registrieren Sie sich kostenlos, um unbegrenzten Zugriff auf den Rasenpilot-KI Assistenten zu erhalten, Ihre Chatverläufe zu speichern und personalisierte Beratung zu bekommen.
                    </p>
                    <FeatureCallToAction variant="minimal" />
                  </CardContent>
                </Card>
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

export default FreeChat;
