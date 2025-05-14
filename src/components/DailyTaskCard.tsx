
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Cloud, MessageSquare, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';

interface DailyTaskCardProps {
  day: number;
  date: string;
  title: string;
  description: string;
  weatherTip?: string;
  isToday?: boolean;
  completed?: boolean;
  onComplete?: () => void;
  onPhotoUpload?: () => void;
}

const DailyTaskCard: React.FC<DailyTaskCardProps> = ({
  day,
  date,
  title,
  description,
  weatherTip,
  isToday = false,
  completed = false,
  onComplete,
  onPhotoUpload
}) => {
  
  const handleLearnMore = () => {
    toast.info("Diese Funktion verbindet dich mit unserem AI Chatbot für weitere Informationen");
  };
  
  return (
    <Card className={`transition-all ${isToday ? 'border-green-400 shadow-md' : 'border-gray-200'} ${completed ? 'bg-green-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${isToday ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {day}
            </div>
            <CardTitle className="text-lg">
              {title}
              {isToday && <Badge className="ml-2 bg-green-500">Heute</Badge>}
            </CardTitle>
          </div>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-gray-700">{description}</p>
        
        {weatherTip && (
          <div className="mt-3 bg-blue-50 rounded-lg p-2 flex items-start">
            <Cloud className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-blue-800">{weatherTip}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex flex-wrap gap-2">
        {!completed ? (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-green-200 text-green-700 hover:bg-green-50"
              onClick={onComplete}
            >
              <CheckCircle className="mr-1 h-4 w-4" /> Erledigt
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={onPhotoUpload}
            >
              <Camera className="mr-1 h-4 w-4" /> Foto hochladen
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600"
              onClick={handleLearnMore}
            >
              <MessageSquare className="mr-1 h-4 w-4" /> Mehr erfahren
            </Button>
          </>
        ) : (
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" /> Aufgabe erledigt
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default DailyTaskCard;
