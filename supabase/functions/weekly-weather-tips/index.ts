import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';
import { corsHeaders } from '../_shared/cors.ts';
import { emailLayout, greeting, paragraph, heading, infoCard, ctaButton, signoff, scoreDisplay } from '../_shared/email-template.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    const weatherKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
    const resendKey = Deno.env.get('RESEND_API_KEY');

    if (!openAIKey || !weatherKey) {
      throw new Error('Missing required API keys (OPENAI_API_KEY or OPENWEATHERMAP_API_KEY)');
    }

    console.log('Starting weekly weather tips job...');

    // Get all premium/pro subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('user_id, email')
      .eq('subscribed', true)
      .not('user_id', 'is', null);

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      return jsonResponse({ success: true, message: 'No premium users found', tipsSent: 0 });
    }

    const userIds = subscribers.map((s: any) => s.user_id).filter(Boolean);

    // Fetch profiles and lawn profiles for all premium users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, email_preferences')
      .in('id', userIds);

    const { data: lawnProfiles } = await supabase
      .from('lawn_profiles')
      .select('user_id, zip_code, grass_type, lawn_size, lawn_goal, soil_type')
      .in('user_id', userIds);

    // Fetch latest analysis for each user
    const { data: analyses } = await supabase
      .from('analyses')
      .select('user_id, score, summary_short, density_note, moisture_note, soil_note, sunlight_note, step_1, step_2, step_3, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });

    // Group data by user
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
    const lawnMap = new Map((lawnProfiles || []).map((l: any) => [l.user_id, l]));
    
    // Only keep latest analysis per user
    const analysisMap = new Map<string, any>();
    for (const a of (analyses || [])) {
      if (!analysisMap.has(a.user_id)) {
        analysisMap.set(a.user_id, a);
      }
    }

    let tipsSent = 0;
    const errors: string[] = [];

    for (const sub of subscribers) {
      try {
        const profile = profileMap.get(sub.user_id);
        const lawn = lawnMap.get(sub.user_id);
        if (!profile || !lawn || !lawn.zip_code) continue;

        // Check email preferences - respect opt-out
        if (profile.email_preferences) {
          const prefs = typeof profile.email_preferences === 'string' 
            ? JSON.parse(profile.email_preferences) 
            : profile.email_preferences;
          if (prefs.reminders === false) continue;
        }

        const analysis = analysisMap.get(sub.user_id);

        // Fetch weather for user's PLZ
        const weather = await fetchWeather(lawn.zip_code, weatherKey);
        if (!weather) {
          errors.push(`Weather fetch failed for PLZ ${lawn.zip_code}`);
          continue;
        }

        // Generate tips with GPT-4o
        const tips = await generateWeatherTips(openAIKey, analysis, weather, lawn);
        if (!tips) {
          errors.push(`GPT tips generation failed for user ${sub.user_id}`);
          continue;
        }

        // Send email
        if (resendKey) {
          const sent = await sendTipsEmail(
            resendKey,
            profile.email,
            profile.full_name || 'Rasenfreund',
            tips,
            weather,
            analysis
          );
          if (sent) tipsSent++;
          else errors.push(`Email send failed for ${profile.email}`);
        } else {
          console.log(`[DRY RUN] Would send tips to ${profile.email}`);
          tipsSent++;
        }
      } catch (err) {
        errors.push(`Error for user ${sub.user_id}: ${err.message}`);
      }
    }

    console.log(`Weekly tips job complete: ${tipsSent} sent, ${errors.length} errors`);
    return jsonResponse({ success: true, tipsSent, totalUsers: subscribers.length, errors: errors.length > 0 ? errors : undefined });

  } catch (error) {
    console.error('Error in weekly-weather-tips:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function jsonResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function fetchWeather(zip: string, apiKey: string): Promise<any | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},DE&appid=${apiKey}&lang=de&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      // Try AT and CH if DE fails
      for (const country of ['AT', 'CH']) {
        const altUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},${country}&appid=${apiKey}&lang=de&units=metric`;
        const altRes = await fetch(altUrl);
        if (altRes.ok) return await altRes.json();
        await altRes.text(); // consume body
      }
      console.error(`Weather API error for PLZ ${zip}: ${res.status}`);
      await res.text();
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Weather fetch error for PLZ ${zip}:`, err);
    return null;
  }
}

function summarizeWeather(weatherData: any): string {
  if (!weatherData?.list) return 'Keine Wetterdaten verfügbar';
  
  const forecasts = weatherData.list.slice(0, 16); // ~2 days in 3h intervals
  const temps = forecasts.map((f: any) => f.main.temp);
  const minTemp = Math.round(Math.min(...temps));
  const maxTemp = Math.round(Math.max(...temps));
  const avgTemp = Math.round(temps.reduce((a: number, b: number) => a + b, 0) / forecasts.length);
  
  const rainForecasts = forecasts.filter((f: any) => 
    f.weather?.[0]?.main === 'Rain' || f.weather?.[0]?.main === 'Drizzle'
  );
  const hasRain = rainForecasts.length > 0;
  const rainChance = Math.round((rainForecasts.length / forecasts.length) * 100);
  
  const descriptions = [...new Set(forecasts.map((f: any) => f.weather?.[0]?.description).filter(Boolean))];
  
  const humidity = Math.round(forecasts.reduce((a: number, f: any) => a + f.main.humidity, 0) / forecasts.length);
  const windSpeed = Math.round(forecasts.reduce((a: number, f: any) => a + f.wind.speed, 0) / forecasts.length * 10) / 10;

  return `Temperatur: ${minTemp}°C bis ${maxTemp}°C (Ø ${avgTemp}°C). Luftfeuchtigkeit: Ø ${humidity}%. Wind: Ø ${windSpeed} m/s. Regen: ${hasRain ? `Ja (${rainChance}% der Vorhersagen)` : 'Nein'}. Wetter: ${descriptions.slice(0, 3).join(', ')}.`;
}

async function generateWeatherTips(
  apiKey: string,
  analysis: any | undefined,
  weather: any,
  lawn: any
): Promise<string | null> {
  try {
    const weatherSummary = summarizeWeather(weather);
    
    let analysisContext = 'Keine vorherige Analyse vorhanden.';
    if (analysis) {
      const problems = [analysis.density_note, analysis.moisture_note, analysis.soil_note, analysis.sunlight_note]
        .filter(Boolean).join(', ');
      const steps = [analysis.step_1, analysis.step_2, analysis.step_3].filter(Boolean).join('; ');
      analysisContext = `Score: ${analysis.score}/100. Probleme: ${problems || 'Keine'}. Pflegeplan: ${steps || 'Keiner'}. Zusammenfassung: ${analysis.summary_short || 'Keine'}.`;
    }

    const prompt = `Based on this lawn analysis: ${analysisContext}
And this week's weather forecast: ${weatherSummary}
Lawn info: Grasart: ${lawn.grass_type}, Größe: ${lawn.lawn_size}, Ziel: ${lawn.lawn_goal}, Boden: ${lawn.soil_type || 'unbekannt'}.

Give 3 specific lawn care tips for this week in German. Be very specific about timing and quantities. Format each tip with an emoji and a title on the first line, then the detail. Keep it under 100 words total.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Du bist ein deutscher Rasenexperte. Gib präzise, wetterbezogene Pflegetipps. Antworte nur auf Deutsch.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      console.error('OpenAI error:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('GPT tips generation error:', err);
    return null;
  }
}

function formatTipsAsHtml(tipsText: string): string {
  // Split tips by newlines and format them as info cards
  const lines = tipsText.split('\n').filter(l => l.trim());
  let html = '';
  let currentTitle = '';
  let currentBody = '';

  for (const line of lines) {
    const trimmed = line.trim();
    // Detect tip headers (usually start with emoji or number)
    if (/^[\d️⃣🌱🌿💧☀️✂️🧪🌦️❄️🍂🔥💡⚡🌡️]/.test(trimmed) || /^\d+[\.\)]/.test(trimmed)) {
      if (currentTitle) {
        html += infoCard(currentTitle, currentBody, '🌱', '#f0fdf4', '#bbf7d0');
      }
      currentTitle = trimmed;
      currentBody = '';
    } else if (currentTitle) {
      currentBody += (currentBody ? ' ' : '') + trimmed;
    } else {
      currentTitle = trimmed;
    }
  }
  if (currentTitle) {
    html += infoCard(currentTitle, currentBody, '🌱', '#f0fdf4', '#bbf7d0');
  }

  return html || paragraph(tipsText);
}

async function sendTipsEmail(
  resendKey: string,
  email: string,
  name: string,
  tips: string,
  weather: any,
  analysis: any | undefined
): Promise<boolean> {
  try {
    const weatherSummary = summarizeWeather(weather);
    const tipsHtml = formatTipsAsHtml(tips);
    
    const content = `
      ${greeting(name)}
      ${paragraph('Hier sind deine <strong>personalisierten Rasen-Tipps</strong> für diese Woche — basierend auf deinem Wetter und deiner letzten Analyse.')}
      
      ${heading('🌦️ Dein Wetter diese Woche')}
      ${infoCard('Wetterbericht', weatherSummary, '🌤️', '#eff6ff', '#bfdbfe')}
      
      ${analysis ? scoreDisplay(analysis.score, analysis.summary_short || undefined) : ''}
      
      ${heading('🌱 Deine 3 Tipps für diese Woche')}
      ${tipsHtml}
      
      ${ctaButton('Zum Dashboard →', 'https://www.rasenpilot.com/premium-dashboard')}
      ${paragraph('Diese Tipps basieren auf deinem Standort, aktuellen Wetterdaten und deiner letzten Rasen-Analyse. Je regelmäßiger du analysierst, desto besser werden die Empfehlungen!')}
      ${signoff()}
    `;

    const emailHtml = emailLayout(content, `Deine 3 Rasen-Tipps für diese Woche`);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'Rasenpilot <noreply@rasenpilot.com>',
        to: [email],
        subject: `🌱 Dein Rasen-Tipp für diese Woche, ${name}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text());
      return false;
    }
    await res.text();
    console.log(`Tips email sent to ${email}`);
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}
