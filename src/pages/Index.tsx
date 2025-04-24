import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import WeatherWidget from '@/components/WeatherWidget';
import SeasonalTips from '@/components/SeasonalTips';
import TaskTimeline from '@/components/TaskTimeline';
import ContentCard from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Updated mock content for featured articles in German
const featuredContent = [
  {
    id: 1,
    title: "Vollständige Anleitung zur Rasenvorbereitung im Frühling",
    excerpt: "Bereiten Sie Ihren Rasen für die Wachstumsperiode vor mit diesen wesentlichen Frühlingsvorbereitung-Schritten, die einen üppigen, gesunden Rasen den ganzen Sommer über sicherstellen.",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    category: "Jahreszeiten-Anleitung",
    readTime: 8,
    tags: ["Frühlingsvorbereitung", "Dünger", "Unkrautkontrolle"]
  },
  {
    id: 2,
    title: "Wie man häufige Rasenschädlinge identifiziert und behandelt",
    excerpt: "Lernen Sie, Anzeichen von Schädlingsschäden zu erkennen und effektive Behandlungen anzuwenden, um Ihren Rasen vor häufigen Eindringlingen wie Engerlingen und Wanzen zu schützen.",
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843",
    category: "Schädlingskontrolle",
    readTime: 6,
    tags: ["Schädlinge", "Behandlung", "Rasengesundheit"]
  },
  {
    id: 3,
    title: "Wassersparende Strategien für Sommerra sen",
    excerpt: "Erhalten Sie einen grünen Rasen auch während heißer, trockener Monate mit intelligenten Bewässerungspraktiken, die Wasser sparen und gleichzeitig Ihren Rasen gesund halten.",
    image: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3",
    category: "Wassermanagement",
    readTime: 5,
    tags: ["Dürretipps", "Bewässerung", "Sommer"]
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-lawn-green-light/20 to-lawn-blue-light/20 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-lawn-green-dark mb-4">
                  Ihr persönlicher Rasen-Assistent
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  Erhalten Sie Jahreszeiten-Tipps, verfolgen Sie Wartungsaufgaben und greifen Sie auf Expertenratschläge für einen perfekten Rasen das ganze Jahr über zu.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    className="bg-lawn-green hover:bg-lawn-green-dark text-white px-6"
                    size="lg"
                    asChild
                  >
                    <Link to="/dashboard">Dashboard anzeigen</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-lawn-green text-lawn-green hover:bg-lawn-green/10"
                    size="lg"
                    asChild
                  >
                    <Link to="/content">Anleitungen durchsuchen</Link>
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                <img
                  src="https://images.unsplash.com/photo-1501854140801-50d01698950b"
                  alt="Üppiger grüner Rasen"
                  className="rounded-lg shadow-lg w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Weather and Tasks Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Ihr Rasen heute</h2>
                <WeatherWidget />
                <div className="mt-8">
                  <SeasonalTips />
                </div>
              </div>
              <div className="lg:col-span-1">
                <TaskTimeline />
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Content */}
        <section className="py-12 bg-lawn-earth-light/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Empfohlene Anleitungen</h2>
              <Button variant="link" className="text-lawn-green" asChild>
                <Link to="/content">Alle anzeigen</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredContent.map((content) => (
                <ContentCard key={content.id} {...content} />
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LawnRadar. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default Index;
