
import React from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsHeaderProps {
  timeFrame: string;
  setTimeFrame: (value: string) => void;
  refreshAnalytics: () => void;
  isLoading: boolean;
}

const AnalyticsHeader = ({ timeFrame, setTimeFrame, refreshAnalytics, isLoading }: AnalyticsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        Websiteanalysen
      </h2>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshAnalytics}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zeitraum wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Täglich (letzte 7 Tage)</SelectItem>
            <SelectItem value="weekly">Wöchentlich (letzte 4 Wochen)</SelectItem>
            <SelectItem value="monthly">Monatlich (letztes halbes Jahr)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
