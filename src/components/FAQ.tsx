import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  faqs?: FAQItem[];
  title?: string;
  description?: string;
  showTitle?: boolean;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "Wie funktioniert die KI-Rasenanalyse?",
    answer: "Unsere KI analysiert Ihr Rasenfoto und identifiziert über 200 verschiedene Parameter wie Grassorten, Krankheiten, Nährstoffmängel und Wachstumsmuster. Basierend auf diesen Daten erstellt sie einen personalisierten Pflegeplan mit wissenschaftlich fundierten Empfehlungen.",
    category: "Technologie"
  },
  {
    question: "Ist die Rasenanalyse wirklich kostenlos?",
    answer: "Ja, unsere Basis-Rasenanalyse ist vollständig kostenlos. Sie erhalten eine detaillierte Bewertung Ihres Rasens mit Pflegeempfehlungen ohne versteckte Kosten oder Verpflichtungen.",
    category: "Kosten"
  },
  {
    question: "Wie genau ist die KI-Analyse?",
    answer: "Unsere KI erreicht eine Genauigkeit von 98,3% bei der Rasenbewertung. Sie wurde mit über 100.000 Rasenbildern trainiert und wird kontinuierlich von Rasenexperten überwacht und verbessert.",
    category: "Genauigkeit"
  },
  {
    question: "Welche Informationen benötige ich für die Analyse?",
    answer: "Sie benötigen lediglich ein klares Foto Ihres Rasens bei Tageslicht. Optional können Sie Ihren Rasentyp und Ihre Pflegeziele angeben, um noch präzisere Empfehlungen zu erhalten.",
    category: "Nutzung"
  },
  {
    question: "Funktioniert die Analyse auch bei schlechten Lichtverhältnissen?",
    answer: "Für optimale Ergebnisse empfehlen wir Fotos bei Tageslicht. Die KI kann auch bei bewölktem Himmel gute Ergebnisse liefern, jedoch sollten Sie direkte Schatten oder Kunstlicht vermeiden.",
    category: "Fotografie"
  },
  {
    question: "Wie oft sollte ich meinen Rasen analysieren lassen?",
    answer: "Eine neue Analyse ist nach größeren Pflegemaßnahmen oder bei Veränderungen des Rasenzustands sinnvoll. Wir empfehlen eine Analyse alle 3-6 Monate für optimale Ergebnisse.",
    category: "Häufigkeit"
  },
  {
    question: "Kann ich die Analyse auch für verschiedene Rasenflächen nutzen?",
    answer: "Ja, Sie können verschiedene Bereiche Ihres Gartens separat analysieren lassen. Jede Fläche wird individuell bewertet und erhält passende Pflegeempfehlungen.",
    category: "Nutzung"
  },
  {
    question: "Was passiert mit meinen Daten und Fotos?",
    answer: "Ihre Daten werden nach DSGVO-Standards verarbeitet. Fotos werden nur für die Analyse verwendet und nach 30 Tagen automatisch gelöscht. Weitere Informationen finden Sie in unserer Datenschutzerklärung.",
    category: "Datenschutz"
  }
];

const FAQ: React.FC<FAQProps> = ({ 
  faqs = defaultFAQs, 
  title = "Häufig gestellte Fragen",
  description = "Antworten auf die wichtigsten Fragen zur KI-Rasenanalyse",
  showTitle = true
}) => {
  // Generate structured data for FAQ
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <Card className="w-full max-w-4xl mx-auto">
        {showTitle && (
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-green-800">
              <HelpCircle className="h-6 w-6" />
              {title}
            </CardTitle>
            <p className="text-gray-600 mt-2">{description}</p>
          </CardHeader>
        )}
        
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <Collapsible key={index} className="border rounded-lg">
              <CollapsibleTrigger className="w-full p-4 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown className="h-5 w-5 text-gray-500 transform transition-transform data-[state=open]:rotate-180" />
                </div>
                {faq.category && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {faq.category}
                  </span>
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-4 pb-4">
                <div className="pt-2 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </>
  );
};

export default FAQ;