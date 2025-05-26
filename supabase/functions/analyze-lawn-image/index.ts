
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, grassType, lawnGoal } = await req.json()
    
    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Prepare the prompt for lawn analysis
    const prompt = `Analyze this lawn image and provide a detailed assessment. Consider the following context:
    - Grass type: ${grassType || 'Unknown'}
    - Lawn goal: ${lawnGoal || 'General health'}
    
    Please identify:
    1. Overall lawn health (scale 1-10)
    2. Visible problems (diseases, pests, nutrient deficiencies, weeds)
    3. Soil condition indicators
    4. Specific recommendations for improvement
    5. Confidence level for each diagnosis
    
    Return your analysis in this JSON format:
    {
      "overallHealth": number,
      "issues": [
        {
          "issue": "string",
          "confidence": number (0-1),
          "severity": "low|medium|high",
          "recommendations": ["string array"]
        }
      ],
      "generalRecommendations": ["string array"]
    }`

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert lawn care specialist with years of experience in diagnosing lawn problems from images. Provide detailed, actionable advice.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const analysisText = data.choices[0].message.content

    // Try to parse JSON response, fallback to text processing
    let analysisResult
    try {
      analysisResult = JSON.parse(analysisText)
    } catch {
      // Fallback: convert text response to structured format
      analysisResult = {
        overallHealth: 7,
        issues: [
          {
            issue: "AI Analysis Result",
            confidence: 0.8,
            severity: "medium",
            recommendations: analysisText.split('\n').filter(line => line.trim().length > 0).slice(0, 4)
          }
        ],
        generalRecommendations: ["Follow the detailed analysis provided above"]
      }
    }

    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error analyzing lawn image:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to analyze image' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
