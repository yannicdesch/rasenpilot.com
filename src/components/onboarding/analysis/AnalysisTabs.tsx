
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb } from 'lucide-react';
import ProblemsTab from './ProblemsTab';
import SolutionsTab from './SolutionsTab';
import ProductsTab from './ProductsTab';
import TimelineTab from './TimelineTab';

type Severity = 'high' | 'medium' | 'low';

interface MainIssue {
  title: string;
  severity: Severity;
  description: string;
  timeline: string;
  cost: string;
}

interface Solution {
  category: string;
  tasks: string[];
}

interface Product {
  name: string;
  price: string;
  category: string;
}

interface MonthlyTask {
  month: string;
  priority: string;
}

interface AnalysisTabsProps {
  mainIssues: MainIssue[];
  solutions: Solution[];
  products: Product[];
  monthlyTasks: MonthlyTask[];
}

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({
  mainIssues,
  solutions,
  products,
  monthlyTasks
}) => {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Detaillierte Analyse & Lösungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="problems" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="problems">Probleme</TabsTrigger>
            <TabsTrigger value="solutions">Lösungsplan</TabsTrigger>
            <TabsTrigger value="products">Produkte</TabsTrigger>
            <TabsTrigger value="timeline">Zeitplan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="problems">
            <ProblemsTab issues={mainIssues} />
          </TabsContent>

          <TabsContent value="solutions">
            <SolutionsTab solutions={solutions} />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab products={products} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab monthlyTasks={monthlyTasks} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalysisTabs;
