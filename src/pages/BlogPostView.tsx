
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { formatDate } from '@/lib/blogUtils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: number;
  tags: string;
  date: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
};

// Sample blog posts for fallback
const sampleBlogPosts: { [key: string]: BlogPost } = {
  '1': {
    id: 1,
    title: 'Die beste Zeit zum Rasenmähen: Morgens oder abends?',
    excerpt: 'Erfahren Sie, wann die optimale Tageszeit für das Mähen Ihres Rasens ist und welche Faktoren Sie berücksichtigen sollten.',
    content: 'Das Mähen des Rasens ist eine wichtige Aufgabe für jeden Gartenbesitzer. Die Tageszeit, zu der Sie mähen, kann einen erheblichen Einfluss auf die Gesundheit Ihres Rasens haben.\n\nMorgens: Der frühe Morgen, nachdem der Tau getrocknet ist, aber bevor die Hitze des Tages einsetzt, ist oft eine ideale Zeit zum Mähen. Der Rasen hat sich über Nacht erholt und steht aufrecht, was einen sauberen Schnitt ermöglicht.\n\nMittags: Die Mittagszeit sollte vermieden werden, besonders an heißen Tagen. Das Mähen während der intensivsten Sonneneinstrahlung kann zusätzlichen Stress für den Rasen bedeuten und zu schnellerem Austrocknen führen.\n\nAbends: Der späte Nachmittag oder frühe Abend ist ebenfalls eine gute Zeit zum Mähen. Die Temperaturen sind kühler, und der Rasen hat Zeit, sich vor der Nacht zu erholen. Allerdings sollte man nicht zu spät mähen, da Feuchtigkeit über Nacht auf frisch geschnittenem Gras Krankheiten fördern kann.\n\nUnabhängig von der Tageszeit sollten Sie einige grundlegende Regeln beachten: Mähen Sie nicht mehr als ein Drittel der Grashöhe auf einmal, stellen Sie sicher, dass die Messer scharf sind, und variieren Sie das Mähmuster, um Bodenverdichtung zu vermeiden.\n\nDie beste Zeit zum Mähen hängt auch von Ihrem lokalen Klima und der Jahreszeit ab. Hören Sie auf Ihren Rasen und passen Sie Ihre Mähgewohnheiten entsprechend an.',
    image: '/placeholder.svg',
    category: 'Rasenpflege',
    readTime: 4,
    tags: 'Rasenmähen, Pflegetipps, Rasengesundheit',
    date: '2025-05-10'
  },
  '2': {
    id: 2,
    title: 'Natürliche Düngemittel für einen gesunden und umweltfreundlichen Rasen',
    excerpt: 'Entdecken Sie umweltfreundliche Alternativen zu chemischen Düngemitteln, die Ihren Rasen auf natürliche Weise nähren.',
    content: 'Die Verwendung natürlicher Düngemittel für Ihren Rasen bietet viele Vorteile - sie sind umweltfreundlicher, fördern langfristig die Bodengesundheit und sind oft sicherer für Haustiere und Kinder.\n\nKompost: Selbst hergestellter oder gekaufter Kompost ist eines der besten natürlichen Düngemittel. Er verbessert die Bodenstruktur, fördert nützliche Mikroorganismen und liefert eine breite Palette von Nährstoffen.\n\nGrasschnitt: Lassen Sie einen Teil Ihres Grasschnitts auf dem Rasen liegen. Diese Praxis, bekannt als "Grasscycling", führt dem Boden Stickstoff zu und reduziert den Bedarf an zusätzlichem Dünger.\n\nAlgenmehl: Dieses Meeresprodukt enthält über 60 Spurenelemente und Mineralien, die für das Pflanzenwachstum wichtig sind. Es stärkt die Widerstandsfähigkeit des Rasens gegen Krankheiten und Stress.\n\nKnochenmehl: Reich an Phosphor, fördert Knochenmehl ein starkes Wurzelwachstum und hilft bei der Etablierung neuer Rasenflächen.\n\nBiersteinmehl: Dieses Nebenprodukt der Bierherstellung enthält Stickstoff, Kalium und Phosphor sowie Spurenelemente. Es verbessert auch die Bodenstruktur.\n\nTiermist (kompostiert): Gut kompostierter Mist von Pferden, Kühen oder Hühnern ist ein ausgezeichneter Bodenverbesserer und Nährstofflieferant.\n\nFür die Anwendung natürlicher Düngemittel ist Geduld wichtig. Im Gegensatz zu synthetischen Düngern, die sofort wirken, setzen natürliche Alternativen ihre Nährstoffe langsamer frei, bieten dafür aber langanhaltende Vorteile für die Bodengesundheit.',
    image: '/placeholder.svg',
    category: 'Düngemittel',
    readTime: 6,
    tags: 'Naturdünger, Umweltfreundlich, Gesunder Rasen',
    date: '2025-05-05'
  },
  '3': {
    id: 3,
    title: 'Wie bekämpft man Moos im Rasen? Die 5 besten Methoden',
    excerpt: 'Moos kann ein hartnäckiges Problem sein. Hier sind die effektivsten Methoden, um es zu bekämpfen und einen gesunden Rasen zu fördern.',
    content: 'Moos im Rasen ist oft ein Zeichen für ungünstige Wachstumsbedingungen für Gras. Hier sind die fünf effektivsten Methoden zur Bekämpfung:\n\n1. pH-Wert korrigieren: Moos bevorzugt saure Böden. Lassen Sie Ihren Boden testen und wenden Sie bei Bedarf Kalk an, um den pH-Wert auf 6,0 bis 7,0 zu erhöhen.\n\n2. Drainage verbessern: Stehendes Wasser und feuchte Bedingungen begünstigen Mooswachstum. Aerifizieren Sie verdichtete Böden und verbessern Sie die Drainage durch Sandung oder Installation von Drainagesystemen in problematischen Bereichen.\n\n3. Mehr Licht schaffen: Moos gedeiht im Schatten. Schneiden Sie überhängende Äste zurück, um mehr Sonnenlicht auf den Rasen zu lassen, oder erwägen Sie die Umgestaltung stark beschatteter Bereiche mit schattentoleranten Bodendecker-Alternativen.\n\n4. Richtige Rasenpflege: Mähen Sie nicht zu kurz (mindestens 5-6 cm), düngen Sie regelmäßig und bewässern Sie tief, aber selten, um das Graswachstum zu fördern und Moos zu verdrängen.\n\n5. Direktes Entfernen: Vertikutieren Sie Ihren Rasen, um Moos zu entfernen, und säen Sie anschließend nach. Für hartnäckige Fälle gibt es umweltfreundliche Moosbekämpfungsmittel auf Eisensulfat-Basis.\n\nDie nachhaltigste Lösung gegen Moos ist die Verbesserung der grundlegenden Wachstumsbedingungen für Ihren Rasen. Bekämpfen Sie nicht nur das Symptom (Moos), sondern beheben Sie die Ursachen, um langfristigen Erfolg zu erzielen.',
    image: '/placeholder.svg',
    category: 'Probleme',
    readTime: 5,
    tags: 'Moosbekämpfung, Rasenprobleme, Rasenpflege',
    date: '2025-04-28'
  }
};

const BlogPostView = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/blog');
      return;
    }

    // First try to load from localStorage
    const savedPosts = localStorage.getItem('blogPosts');
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts);
        const foundPost = parsedPosts.find((p: BlogPost) => p.id === parseInt(id));
        
        if (foundPost) {
          setPost(foundPost);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing saved blog posts:', e);
      }
    }

    // Fall back to sample posts if available
    if (sampleBlogPosts[id]) {
      setPost(sampleBlogPosts[id]);
    } else {
      console.error('Blog post not found');
    }
    
    setLoading(false);
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <p className="text-gray-500">Lade Blogbeitrag...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Blogbeitrag nicht gefunden</h1>
            <p className="text-gray-600 mb-6">Der gesuchte Blogbeitrag existiert nicht oder wurde entfernt.</p>
            <Button onClick={() => navigate('/blog')}>Zurück zur Blogübersicht</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blog')} 
            className="mb-6 text-gray-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-green-800 mb-3">{post.title}</h1>
            
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.date)}
              </span>
              
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime} Min. Lesezeit
              </span>
              
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {post.category}
              </span>
            </div>
            
            <div className="mb-8">
              <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-lg overflow-hidden mb-6">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover" 
                />
              </AspectRatio>
            </div>
            
            <div className="prose max-w-none mb-10">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            {post.tags && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {typeof post.tags === 'string' && 
                    post.tags.split(',').map((tag, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {tag.trim()}
                      </span>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPostView;
