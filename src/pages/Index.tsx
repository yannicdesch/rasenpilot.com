
import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import WeatherWidget from '@/components/WeatherWidget';
import SeasonalTips from '@/components/SeasonalTips';
import TaskTimeline from '@/components/TaskTimeline';
import ContentCard from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Mock content for featured articles
const featuredContent = [
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
                  Your Personal Lawn Care Assistant
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  Get seasonal tips, track maintenance tasks, and access expert advice for a perfect lawn all year round.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    className="bg-lawn-green hover:bg-lawn-green-dark text-white px-6"
                    size="lg"
                    asChild
                  >
                    <Link to="/dashboard">View Dashboard</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-lawn-green text-lawn-green hover:bg-lawn-green/10"
                    size="lg"
                    asChild
                  >
                    <Link to="/content">Browse Guides</Link>
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                <img
                  src="https://images.unsplash.com/photo-1501854140801-50d01698950b"
                  alt="Lush green lawn"
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
                <h2 className="text-2xl font-bold mb-6">Your Lawn Today</h2>
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
              <h2 className="text-2xl font-bold">Featured Guides</h2>
              <Button variant="link" className="text-lawn-green" asChild>
                <Link to="/content">View All</Link>
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
      
      {/* Simple Footer */}
      <footer className="bg-white py-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-lawn-green rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold">L</span>
                </div>
                <span className="text-xl font-bold text-lawn-green-dark">LawnRadar</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Your personal lawn care assistant</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/dashboard" className="text-gray-600 hover:text-lawn-green-dark">Dashboard</Link>
              <Link to="/content" className="text-gray-600 hover:text-lawn-green-dark">Content Library</Link>
              <Link to="/season-guide" className="text-gray-600 hover:text-lawn-green-dark">Season Guide</Link>
              <a href="#" className="text-gray-600 hover:text-lawn-green-dark">About</a>
              <a href="#" className="text-gray-600 hover:text-lawn-green-dark">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} LawnRadar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
