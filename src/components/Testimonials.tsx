import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  lawnType?: string;
  improvement?: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  title?: string;
  showTitle?: boolean;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Michael K.",
    location: "München",
    rating: 5,
    text: "Endlich verstehe ich, warum mein Rasen immer braun wurde! Der KI-Plan hat mir geholfen, meinen Rasen in nur 6 Wochen zu retten. Die täglichen Aufgaben sind super einfach zu befolgen.",
    lawnType: "Zierrasen",
    improvement: "Von 45 auf 89 Punkte"
  },
  {
    id: 2,
    name: "Sarah M.",
    location: "Berlin",
    rating: 5,
    text: "Als Anfängerin war ich völlig überfordert. Rasenpilot hat mir Schritt für Schritt erklärt, was zu tun ist. Mein Rasen sieht jetzt aus wie im Katalog!",
    lawnType: "Spielrasen",
    improvement: "Von 32 auf 84 Punkte"
  },
  {
    id: 3,
    name: "Thomas L.",
    location: "Hamburg",
    rating: 5,
    text: "Die Wetteranpassung ist genial! Ich bekomme immer genau die richtigen Tipps zur richtigen Zeit. Meine Nachbarn fragen schon, wie ich das gemacht habe.",
    lawnType: "Gebrauchsrasen",
    improvement: "Von 67 auf 92 Punkte"
  },
  {
    id: 4,
    name: "Andrea H.",
    location: "Köln",
    rating: 5,
    text: "Kostenlos und so professionell! Ich hätte nie gedacht, dass eine App mir so gut bei der Rasenpflege helfen kann. Absolute Empfehlung!",
    lawnType: "Zierrasen",
    improvement: "Von 38 auf 86 Punkte"
  },
  {
    id: 5,
    name: "Robert S.",
    location: "Stuttgart",
    rating: 5,
    text: "Der KI-Chat ist fantastisch. Egal welche Frage ich habe, ich bekomme sofort eine hilfreiche Antwort. Das spart mir viel Zeit und Geld für Beratung.",
    lawnType: "Gebrauchsrasen",
    improvement: "Von 51 auf 88 Punkte"
  },
  {
    id: 6,
    name: "Julia F.",
    location: "Frankfurt",
    rating: 5,
    text: "Die Foto-Analyse hat sofort erkannt, dass mein Rasen einen Pilzbefall hatte. Dank der schnellen Diagnose konnte ich rechtzeitig handeln. Vielen Dank!",
    lawnType: "Spielrasen",
    improvement: "Von 29 auf 81 Punkte"
  }
];

const Testimonials: React.FC<TestimonialsProps> = ({ 
  testimonials = defaultTestimonials,
  title = "Das sagen unsere zufriedenen Nutzer",
  showTitle = true
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-green-50">
      <div className="container mx-auto px-4">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Über 1.000 zufriedene Rasenbesitzer vertrauen bereits auf Rasenpilot
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(testimonial.rating)}
                  </div>
                  <Quote className="h-5 w-5 text-green-600 opacity-60" />
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                      {testimonial.lawnType && (
                        <p className="text-xs text-green-600 mt-1">{testimonial.lawnType}</p>
                      )}
                    </div>
                    {testimonial.improvement && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-700">
                          {testimonial.improvement}
                        </p>
                        <p className="text-xs text-gray-500">Verbesserung</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 bg-white rounded-full px-6 py-3 shadow-md">
            <div className="flex items-center space-x-1">
              {renderStars(5)}
            </div>
            <span className="text-gray-600">•</span>
            <span className="font-semibold text-gray-900">4.9/5</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-600">1.000+ Bewertungen</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;