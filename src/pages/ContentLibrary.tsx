
import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import ContentCard from '@/components/ContentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

// Mock content library
const mockContent = [
  {
    id: 1,
    title: "Complete Guide to Spring Lawn Preparation",
    excerpt: "Get your lawn ready for the growing season with these essential spring preparation steps that ensure a lush, healthy yard all summer long.",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    category: "Seasonal Guide",
    readTime: 8,
    tags: ["spring prep", "fertilizer", "weed control"]
  },
  {
    id: 2,
    title: "How to Identify and Treat Common Lawn Pests",
    excerpt: "Learn to spot the signs of pest damage and apply effective treatments to protect your lawn from common invaders like grubs and chinch bugs.",
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843",
    category: "Pest Control",
    readTime: 6,
    tags: ["pests", "treatment", "lawn health"]
  },
  {
    id: 3,
    title: "Water-Saving Strategies for Summer Lawns",
    excerpt: "Maintain a green lawn even during hot, dry months with smart irrigation practices that conserve water while keeping your grass healthy.",
    image: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3",
    category: "Water Management",
    readTime: 5,
    tags: ["drought tips", "watering", "summer"]
  },
  {
    id: 4,
    title: "Choosing the Right Grass for Your Region",
    excerpt: "Find the perfect grass variety for your climate, soil type, and sun exposure to ensure a beautiful, sustainable lawn that thrives year after year.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9",
    category: "Grass Types",
    readTime: 7,
    tags: ["grass selection", "warm season", "cool season"]
  },
  {
    id: 5,
    title: "DIY Lawn Aeration: When and How to Do It",
    excerpt: "Learn when and how to aerate your lawn to reduce soil compaction, improve root growth, and enhance nutrient absorption for healthier grass.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    category: "Maintenance",
    readTime: 9,
    tags: ["aeration", "soil health", "DIY"]
  },
  {
    id: 6,
    title: "Natural Weed Control Methods That Actually Work",
    excerpt: "Discover effective, chemical-free approaches to managing weeds in your lawn and garden while maintaining a healthy, eco-friendly outdoor space.",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    category: "Organic Care",
    readTime: 6,
    tags: ["organic", "weed control", "eco-friendly"]
  },
];

// Available tags for filtering
const allTags = [...new Set(mockContent.flatMap(content => content.tags))].sort();

// Available categories for filtering
const categories = [...new Set(mockContent.map(content => content.category))].sort();

const ContentLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  
  const toggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter(t => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };
  
  // Filter content based on search, category, and tags
  const filteredContent = mockContent.filter(content => {
    const matchesSearch = searchQuery === "" || 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      content.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = activeCategory === "all" || content.category === activeCategory;
    
    const matchesTags = activeTags.length === 0 || 
      activeTags.every(tag => content.tags.includes(tag));
      
    return matchesSearch && matchesCategory && matchesTags;
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-lawn-green-dark mb-6">Lawn Care Content Library</h1>
          
          {/* Search and filter bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-10" 
                  placeholder="Search articles..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex-grow">
                <h3 className="text-sm font-medium mb-2">Popular Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 8).map(tag => (
                    <Button
                      key={tag}
                      variant={activeTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      className={activeTags.includes(tag) ? "bg-lawn-green hover:bg-lawn-green-dark" : ""}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Content tabs and grid */}
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
            <TabsList className="w-full bg-white border mb-6">
              <TabsTrigger value="all" className="flex-1">All Content</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="flex-1 hidden md:flex">
                  {category}
                </TabsTrigger>
              ))}
              <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.length > 0 ? (
                  filteredContent.map((content) => (
                    <ContentCard key={content.id} {...content} />
                  ))
                ) : (
                  <div className="col-span-3 py-16 text-center">
                    <h3 className="text-xl font-medium mb-2">No matching articles found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockContent
                    .filter(content => content.category === category)
                    .map((content) => (
                      <ContentCard key={content.id} {...content} />
                    ))}
                </div>
              </TabsContent>
            ))}
            
            <TabsContent value="saved" className="mt-0">
              <div className="py-16 text-center">
                <h3 className="text-xl font-medium mb-2">No saved articles yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your saved articles will appear here once you save them
                </p>
                <Button className="bg-lawn-green hover:bg-lawn-green-dark">
                  Browse Articles
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LawnRadar. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ContentLibrary;
