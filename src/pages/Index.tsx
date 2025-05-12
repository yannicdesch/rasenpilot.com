
import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { ArrowRight, Check, Leaf, Cloud, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const grassTypes = [
  { value: 'bermuda', label: 'Bermuda' },
  { value: 'fescue', label: 'Fescue' },
  { value: 'kentucky', label: 'Kentucky Bluegrass' },
  { value: 'zoysia', label: 'Zoysia' },
  { value: 'st-augustine', label: 'St. Augustine' },
  { value: 'ryegrass', label: 'Ryegrass' },
  { value: 'bahia', label: 'Bahia' },
  { value: 'centipede', label: 'Centipede' },
  { value: 'buffalo', label: 'Buffalo' },
  { value: 'bent', label: 'Bentgrass' },
  { value: 'other', label: 'Other/Not Sure' }
];

const lawnGoals = [
  { value: 'greener', label: 'Greener Lawn' },
  { value: 'patches', label: 'Fix Bare Patches' },
  { value: 'weeds', label: 'Control Weeds' },
  { value: 'water', label: 'Reduce Water Usage' },
  { value: 'maintenance', label: 'Lower Maintenance' }
];

const features = [
  {
    title: 'AI-Powered Care Plans',
    description: 'Get a personalized 2-week lawn care plan based on your grass type, location, and goals',
    icon: <Leaf className="h-10 w-10 text-green-600"/>
  },
  {
    title: 'Weather-Aware Advice',
    description: 'Receive smart watering suggestions based on local weather forecasts',
    icon: <Cloud className="h-10 w-10 text-blue-500"/>
  },
  {
    title: 'LawnBuddy Chat Assistant',
    description: 'Ask questions and get expert lawn care guidance anytime',
    icon: <MessageSquare className="h-10 w-10 text-green-700"/>
  }
];

const Index = () => {
  const [step, setStep] = useState(1);
  
  const form = useForm({
    defaultValues: {
      zipCode: '',
      grassType: '',
      lawnSize: '',
      lawnGoal: '',
    }
  });
  
  const onSubmit = (data: any) => {
    toast({
      title: "Profile created!",
      description: "Your lawn care plan is being generated."
    });
    console.log(data);
    // In a real app, we would submit this data to an API
    // and redirect to the care plan page
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavigation />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-green-100 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-800 mb-4">
                  Your AI Lawn Care Assistant
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  Get personalized lawn care plans, expert advice, and weather-smart recommendations to achieve the perfect lawn with minimal effort.
                </p>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                  size="lg"
                  onClick={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Started
                </Button>
              </div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                <img
                  src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxhd24lMjBjYXJlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
                  alt="Perfect green lawn"
                  className="rounded-lg shadow-lg w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How LawnBuddy Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-green-100">
                  <CardHeader className="pb-2">
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl text-green-800">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Get Started Form */}
        <section id="get-started" className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Create Your Lawn Profile</h2>
            <p className="text-center text-gray-600 mb-8">We'll use this information to generate your personalized care plan</p>
            
            <Card className="border-green-100">
              <CardContent className="pt-6">
                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="bg-green-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold">1</div>
                      <h3 className="text-lg font-medium">Basic Lawn Information</h3>
                    </div>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(() => setStep(2))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your ZIP code" {...field} />
                                </FormControl>
                                <FormDescription>
                                  We'll use this for local weather and growing conditions
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lawnSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Approximate Lawn Size (sq ft)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="e.g. 5000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="grassType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grass Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your grass type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {grassTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Not sure? Select "Other/Not Sure" and our AI can help you identify it
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4 flex justify-end">
                          <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Continue <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="bg-green-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold">2</div>
                      <h3 className="text-lg font-medium">Your Lawn Care Goals</h3>
                    </div>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="lawnGoal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Goal</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="What's your main goal for your lawn?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {lawnGoals.map((goal) => (
                                    <SelectItem key={goal.value} value={goal.value}>{goal.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Upload a photo of your lawn (optional)</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                            <input type="file" className="hidden" id="lawn-photo" accept="image/*" />
                            <label htmlFor="lawn-photo" className="cursor-pointer">
                              <div className="space-y-1 text-gray-600">
                                <p className="text-sm">Drag and drop an image, or click to browse</p>
                                <p className="text-xs">JPG, PNG or GIF up to 10MB</p>
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        <div className="pt-4 flex justify-between items-center">
                          <Button type="button" variant="outline" onClick={() => setStep(1)}>
                            Back
                          </Button>
                          <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Generate My Care Plan
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">
                      {i === 1 && "LawnBuddy completely changed how I care for my lawn. The personalized plan is so easy to follow, and my lawn looks better than ever!"}
                      {i === 2 && "Being able to chat with the AI assistant whenever I have questions has been incredibly helpful. It's like having a lawn expert on call 24/7."}
                      {i === 3 && "The weather-based recommendations have saved me so much time and water. I no longer worry about watering on days when it's going to rain."}
                    </p>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {i === 1 && "Michael R."}
                          {i === 2 && "Sarah T."}
                          {i === 3 && "David M."}
                        </p>
                        <p className="text-xs text-gray-500">
                          {i === 1 && "Homeowner, Texas"}
                          {i === 2 && "First-time gardener, California"}
                          {i === 3 && "Lawn enthusiast, Florida"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LawnBuddy. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
