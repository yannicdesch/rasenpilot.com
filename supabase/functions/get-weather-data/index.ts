import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== WEATHER DATA FETCH START ===');
    
    const { zipCode, countryCode = 'DE' } = await req.json();
    console.log('Fetching weather for:', zipCode, countryCode);

    const openWeatherMapApiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
    if (!openWeatherMapApiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    // Current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&appid=${openWeatherMapApiKey}&units=metric&lang=de`;
    
    const currentResponse = await fetch(currentWeatherUrl);
    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }
    const currentData = await currentResponse.json();

    // 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},${countryCode}&appid=${openWeatherMapApiKey}&units=metric&lang=de`;
    
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }
    const forecastData = await forecastResponse.json();

    // Process forecast to get daily data
    const dailyForecast = [];
    const processedDates = new Set();
    
    for (const item of forecastData.list.slice(0, 15)) { // Take first 15 entries (5 days * 3 entries per day)
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      
      if (!processedDates.has(dayKey) && dailyForecast.length < 5) {
        processedDates.add(dayKey);
        dailyForecast.push({
          day: date.toLocaleDateString('de-DE', { weekday: 'short' }),
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: item.weather[0].description,
          icon: item.weather[0].icon,
          chanceOfRain: item.pop * 100,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6) // Convert m/s to km/h
        });
      }
    }

    // Calculate additional lawn care parameters
    const soilTemp = Math.round(currentData.main.temp - 2); // Approximate soil temperature
    const dewPoint = Math.round(currentData.main.temp - ((100 - currentData.main.humidity) / 5));
    const isGoodMowingCondition = currentData.main.humidity < 70 && currentData.wind.speed < 4;
    const isGoodFertilizingCondition = currentData.main.humidity > 50 && currentData.main.humidity < 85;
    
    // Calculate watering needs based on weather
    const evapotranspiration = Math.max(0, (currentData.main.temp - 5) * 0.5 + (currentData.wind.speed * 0.3) - (currentData.main.humidity * 0.02));
    
    const weatherData = {
      location: currentData.name + ', ' + currentData.sys.country,
      current: {
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        icon: currentData.weather[0].icon,
        pressure: currentData.main.pressure,
        uvIndex: Math.min(11, Math.max(0, Math.round((currentData.main.temp - 10) / 5))), // Estimate UV index
        soilTemp: soilTemp,
        dewPoint: dewPoint,
        evapotranspiration: Math.round(evapotranspiration * 10) / 10,
        lawnCareConditions: {
          mowing: isGoodMowingCondition,
          fertilizing: isGoodFertilizingCondition,
          watering: evapotranspiration > 2,
          seeding: currentData.main.temp >= 8 && currentData.main.temp <= 25
        }
      },
      forecast: dailyForecast.map(day => ({
        ...day,
        soilTemp: Math.round(day.high - 3),
        evapotranspiration: Math.max(0, Math.round(((day.high - 5) * 0.4 + (day.windSpeed * 0.2) - (day.humidity * 0.015)) * 10) / 10)
      }))
    };

    console.log('Weather data processed successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: weatherData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Weather fetch error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});