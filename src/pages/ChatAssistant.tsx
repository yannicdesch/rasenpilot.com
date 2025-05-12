
import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { MessageSquare, Send, Leaf, ArrowUp, Image, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Mock suggested questions
const suggestedQuestions = [
  "How often should I water my Bermuda grass?",
  "What's the best way to get rid of dandelions?",
  "When is the best time to apply fertilizer?",
  "How can I fix bare patches in my lawn?",
  "What height should I cut my grass?"
];

// Mock responses for demo (would use OpenAI in production)
const mockResponses: Record<string, string> = {
  "How often should I water my Bermuda grass?": 
    "For Bermuda grass, water deeply but infrequently to encourage deep root growth. During summer months, aim for about 1 to 1.25 inches of water per week, either from rainfall or irrigation. In cooler months, reduce to 0.5-0.75 inches per week. Always water in the early morning (between 4-10am) to minimize evaporation and fungal growth.",
  
  "What's the best way to get rid of dandelions?": 
    "For effective dandelion control, you have several options:\n\n1. Manual removal - Pull dandelions by hand, making sure to remove the entire taproot\n2. Spot treatment with selective herbicides containing 2,4-D, dicamba, or MCPP that target broadleaf weeds without harming grass\n3. Improve overall lawn health with proper mowing, fertilization and watering to prevent new weeds\n4. Apply pre-emergent herbicides in early spring to prevent dandelion seeds from germinating\n\nFor an organic approach, you can use vinegar-based herbicides or corn gluten meal as a natural pre-emergent.",
  
  "When is the best time to apply fertilizer?": 
    "The best time to apply fertilizer depends on your grass type and climate. For warm-season grasses like Bermuda, St. Augustine, and Zoysia, apply the first fertilizer in late spring when the grass is actively growing. For cool-season grasses like Kentucky bluegrass and fescue, early fall is ideal for the main application. Always fertilize when grass is dry but the soil is moist, and follow with light watering to help nutrients reach the roots without burning the grass.",
  
  "How can I fix bare patches in my lawn?": 
    "To repair bare patches in your lawn:\n\n1. Clear the area of debris and loosen the top 1-2 inches of soil\n2. Apply a thin layer of compost or topsoil\n3. Spread grass seed appropriate for your lawn type, ensuring good seed-to-soil contact\n4. Lightly rake the seeds into the soil\n5. Water lightly but frequently until germination occurs (usually 7-21 days)\n6. Once established, transition to deeper, less frequent watering\n\nFor faster results, consider using sod for immediate coverage. The best time to patch is during your grass type's primary growing season - spring/summer for warm-season grasses and fall for cool-season varieties.",
  
  "What height should I cut my grass?": 
    "Optimal cutting height varies by grass type:\n\n• Bermuda: 1-2 inches\n• Kentucky Bluegrass: 2.5-3.5 inches\n• Fescue: 3-4 inches\n• St. Augustine: 2.5-4 inches\n• Zoysia: 1-2 inches\n• Ryegrass: 1.5-2.5 inches\n\nFollow the 1/3 rule: never remove more than one-third of the grass blade in a single mowing. During summer heat or drought stress, cut at the higher end of the recommended range. Keep mower blades sharp for cleaner cuts that help prevent disease."
};

const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "👋 Hello! I'm your LawnBuddy AI assistant. How can I help with your lawn care questions today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageAttachment, setImageAttachment] = useState<File | null>(null);
  const { toast } = useToast();

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
    setInput('');
    setIsLoading(true);
    
    if (imageAttachment) {
      // Handle image upload logic here
      toast({
        title: "Image received",
        description: "Our AI is analyzing your lawn photo."
      });
      setImageAttachment(null);
    }

    // Simulate AI response delay (would use OpenAI API in production)
    setTimeout(() => {
      let responseText = "I'll need to research that question further. For now, I recommend checking with a local lawn care professional for advice specific to your situation.";
      
      // Check if we have a mock response for this question
      for (const question in mockResponses) {
        if (input.toLowerCase().includes(question.toLowerCase().slice(0, 10))) {
          responseText = mockResponses[question];
          break;
        }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageAttachment(e.target.files[0]);
      toast({
        title: "Image attached",
        description: "Send your message to analyze the lawn photo."
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
    
    setIsLoading(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      const responseText = mockResponses[question] || "I'll need to research that further.";
      
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
          <h1 className="text-3xl font-bold text-green-800 mb-6">Ask LawnBuddy</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar with suggested questions */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare size={18} />
                    Suggested Questions
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
            </div>
            
            {/* Chat interface */}
            <div className="md:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="bg-green-50 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="text-green-600" size={20} />
                    LawnBuddy Assistant
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
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="whitespace-pre-line">{message.content}</div>
                          <div 
                            className={`text-xs mt-1 ${
                              message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100">
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
                      <div className="flex items-center bg-gray-100 rounded p-2">
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
                        placeholder="Type your question..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleSend}
                        disabled={input.trim() === '' && !imageAttachment}
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              
              <div className="text-center text-xs text-gray-500 mt-2">
                LawnBuddy AI is designed to provide general lawn care guidance but may not account for all local conditions. Always consider consulting with local experts for specific issues.
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LawnBuddy. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ChatAssistant;
