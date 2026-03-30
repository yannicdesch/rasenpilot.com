import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ExternalLink } from 'lucide-react';

interface Product {
  keywords: string[];
  name: string;
  description: string;
  url: string;
}

const PRODUCTS: Product[] = [
  {
    keywords: ['moos', 'moss', 'vermoost', 'unkraut'],
    name: 'COMPO Rasendünger gegen Unkraut + Moos',
    description: '3 Monate Langzeitwirkung, bekämpft Moos & Unkraut gleichzeitig, 9 kg für 300 m²',
    url: 'https://www.amazon.de/dp/B00UT2LM2O?tag=rasenpilot21-21',
  },
  {
    keywords: ['moos', 'filz', 'vertikutieren', 'verfilzt'],
    name: 'Gardena Elektro-Vertikutierer EVC 1000',
    description: 'Entfernt Moos und Rasenfilz effektiv, 1000W, für Flächen bis 1000 m²',
    url: 'https://www.amazon.de/dp/B0007TYDB6?tag=rasenpilot21-21',
  },
  {
    keywords: ['stickstoff', 'gelb', 'dünn', 'blass', 'klee', 'düngen', 'nährstoff'],
    name: 'Turbogrün Extra-Power Rasendünger 10kg',
    description: 'Stickstoffreicher Rasendünger für Frühjahr & Sommer, staubarmes Granulat',
    url: 'https://www.amazon.de/dp/B0CHN4LSWQ?tag=rasenpilot21-21',
  },
  {
    keywords: ['lücken', 'kahl', 'nachsaat', 'dünn', 'lückig', 'nachsäen'],
    name: 'Rasensamen Nachsaat schnellkeimend',
    description: 'Schnellkeimende Nachsaat für kahle Stellen, ideal für Frühjahr & Herbst',
    url: 'https://www.amazon.de/dp/B00IUPTZVC?tag=rasenpilot21-21',
  },
  {
    keywords: ['trocken', 'braun', 'wassermangel', 'dürre', 'bewässer', 'gießen'],
    name: 'Gardena Bewässerungscomputer flex',
    description: 'Automatische Bewässerung nach Zeitplan, einfache Montage, spart Wasser',
    url: 'https://www.amazon.de/dp/B0749P42HT?tag=rasenpilot21-21',
  },
  {
    keywords: ['unkraut', 'löwenzahn', 'klee', 'wildkraut'],
    name: 'COMPO FLORANID Rasendünger plus Unkrautvernichter',
    description: '3 Monate Langzeitwirkung, bekämpft Löwenzahn, Klee und Unkräuter, 12 kg für 400 m²',
    url: 'https://www.amazon.de/dp/B00FDFI4Z2?tag=rasenpilot21-21',
  },
  {
    keywords: ['vertikutieren', 'filz', 'lüften', 'belüften'],
    name: 'Gardena combisystem Rasenlüfter',
    description: 'Manueller Vertikutierer, 35 cm Arbeitsbreite, entfernt Moos und Rasenfilz',
    url: 'https://www.amazon.de/dp/B0001E3W7S?tag=rasenpilot21-21',
  },
  {
    keywords: ['pilz', 'rostpilz', 'schneeschimmel', 'fungizid', 'pilzbefall'],
    name: 'Fungizid Rasen-Pilzfrei Saprol',
    description: 'Systemisches Fungizid gegen Rasenkrankheiten wie Rost, Schneeschimmel und Rotspitzigkeit',
    url: 'https://www.amazon.de/dp/B00FDFI4Z2?tag=rasenpilot21-21',
  },
];

interface ProductRecommendationsProps {
  analysisResult: any;
}

const matchProducts = (result: any): Product[] => {
  if (!result) return [];

  const searchText = [
    result.grass_condition,
    result.summary_short,
    result.density_note,
    result.moisture_note,
    result.soil_note,
    result.sunlight_note,
    result.step_1,
    result.step_2,
    result.step_3,
    result.timeline,
    ...(result.recommendations || []),
    ...(result.issues || []).map((i: any) => `${i.type} ${i.description}`),
    ...(result.identified_problems || []).map((p: any) => typeof p === 'string' ? p : `${p.type} ${p.description}`),
    ...(result.problems || []).map((p: any) => typeof p === 'string' ? p : `${p.type} ${p.description}`),
  ].filter(Boolean).join(' ').toLowerCase();

  // Score each product by number of keyword matches
  const scored = PRODUCTS.map(product => ({
    product,
    score: product.keywords.filter(kw => searchText.includes(kw)).length,
  })).filter(item => item.score > 0);

  // Sort by score descending, take top 3
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(s => s.product);
};

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ analysisResult }) => {
  const recommended = matchProducts(analysisResult);

  if (recommended.length === 0) return null;

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-green-600" />
          Empfohlene Produkte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommended.map((product, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🌿</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm">{product.name}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{product.description}</p>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="flex-shrink-0 border-green-300 text-green-700 hover:bg-green-50"
              >
                <a href={product.url} target="_blank" rel="noopener noreferrer nofollow">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ansehen
                </a>
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * Affiliate-Link – wir erhalten eine kleine Provision beim Kauf, für dich entstehen keine Mehrkosten.
        </p>
      </CardContent>
    </Card>
  );
};

export default ProductRecommendations;
