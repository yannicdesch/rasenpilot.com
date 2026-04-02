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
      throw new Error('Missing required API keys');
    }

    console.log('Starting weekly weather tips job...');

    // Get premium subscribers
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

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, email_preferences')
      .in('id', userIds);

    const { data: lawnProfiles } = await supabase
      .from('lawn_profiles')
      .select('user_id, zip_code, grass_type, lawn_size, lawn_goal, soil_type')
      .in('user_id', userIds);

    const { data: analyses } = await supabase
      .from('analyses')
      .select('user_id, score, summary_short, density_note, moisture_note, soil_note, sunlight_note, step_1, step_2, step_3, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
    const lawnMap = new Map((lawnProfiles || []).map((l: any) => [l.user_id, l]));
    const analysisMap = new Map<string, any>();
    for (const a of (analyses || [])) {
      if (!analysisMap.has(a.user_id)) analysisMap.set(a.user_id, a);
    }

    let tipsSent = 0;
    const errors: string[] = [];

    for (const sub of subscribers) {
      try {
        const profile = profileMap.get(sub.user_id);
        const lawn = lawnMap.get(sub.user_id);
        if (!profile || !lawn || !lawn.zip_code) continue;

        if (profile.email_preferences) {
          const prefs = typeof profile.email_preferences === 'string'
            ? JSON.parse(profile.email_preferences)
            : profile.email_preferences;
          if (prefs.reminders === false) continue;
        }

        const analysis = analysisMap.get(sub.user_id);
        const weather = await fetchWeather(lawn.zip_code, weatherKey);
        if (!weather) { errors.push(`Weather failed for PLZ ${lawn.zip_code}`); continue; }

        const dailyForecast = buildDailyForecast(weather);
        const tips = await generateTips(openAIKey, weather, analysis, lawn);
        if (!tips) { errors.push(`GPT failed for ${sub.user_id}`); continue; }

        if (resendKey) {
          const sent = await sendEmail(
            resendKey, profile.email, profile.full_name || 'Rasenfreund',
            lawn.zip_code, dailyForecast, tips, analysis
          );
          if (sent) tipsSent++; else errors.push(`Email failed for ${profile.email}`);
        } else {
          console.log(`[DRY RUN] Would send to ${profile.email}`);
          tipsSent++;
        }
      } catch (err) {
        errors.push(`Error for ${sub.user_id}: ${err.message}`);
      }
    }

    console.log(`Weekly tips done: ${tipsSent} sent, ${errors.length} errors`);
    return jsonResponse({ success: true, tipsSent, totalUsers: subscribers.length, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('Error in weekly-weather-tips:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function jsonResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// --- Weather ---

async function fetchWeather(zip: string, apiKey: string): Promise<any | null> {
  try {
    for (const country of ['DE', 'AT', 'CH']) {
      const url = `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},${country}&appid=${apiKey}&lang=de&units=metric`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
      await res.text();
    }
    return null;
  } catch (err) {
    console.error(`Weather fetch error for PLZ ${zip}:`, err);
    return null;
  }
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

interface DayForecast {
  label: string;
  date: string;
  temp: number;
  condition: string;
  rain: boolean;
  humidity: number;
}

function buildDailyForecast(weather: any): DayForecast[] {
  if (!weather?.list) return [];
  const dayMap = new Map<string, any[]>();
  for (const entry of weather.list) {
    const d = new Date(entry.dt * 1000);
    const key = d.toISOString().slice(0, 10);
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push(entry);
  }

  const days: DayForecast[] = [];
  for (const [dateStr, entries] of dayMap) {
    if (days.length >= 5) break;
    const d = new Date(dateStr);
    const temps = entries.map((e: any) => e.main.temp);
    const maxTemp = Math.round(Math.max(...temps));
    const descriptions = entries.map((e: any) => e.weather?.[0]?.description).filter(Boolean);
    const hasRain = entries.some((e: any) => ['Rain', 'Drizzle'].includes(e.weather?.[0]?.main));
    const avgHumidity = Math.round(entries.reduce((s: number, e: any) => s + e.main.humidity, 0) / entries.length);
    const mostCommon = mode(descriptions) || 'bewölkt';

    days.push({
      label: WEEKDAYS[d.getDay()],
      date: `${d.getDate()}.${d.getMonth() + 1}.`,
      temp: maxTemp,
      condition: mostCommon,
      rain: hasRain,
      humidity: avgHumidity,
    });
  }
  return days;
}

function mode(arr: string[]): string | null {
  const freq = new Map<string, number>();
  for (const v of arr) freq.set(v, (freq.get(v) || 0) + 1);
  let max = 0, result: string | null = null;
  for (const [k, c] of freq) { if (c > max) { max = c; result = k; } }
  return result;
}

// --- GPT Tips ---

async function generateTips(
  apiKey: string, weather: any, analysis: any | undefined, lawn: any
): Promise<{ watering: string; mowing: string; topTip: string } | null> {
  try {
    const weatherSummary = JSON.stringify(buildDailyForecast(weather));

    let analysisJson = 'Keine Analyse vorhanden.';
    if (analysis) {
      analysisJson = JSON.stringify({
        score: analysis.score,
        density: analysis.density_note,
        moisture: analysis.moisture_note,
        soil: analysis.soil_note,
        sunlight: analysis.sunlight_note,
        step_1: analysis.step_1,
        step_2: analysis.step_2,
        step_3: analysis.step_3,
        summary: analysis.summary_short,
      });
    }

    const prompt = `Based on this week weather forecast: ${weatherSummary} and this lawn analysis: ${analysisJson}, generate 3 specific lawn care tips in German using du-form. Keep each tip under 2 sentences. Be specific about timing (Montag früh, Mittwoch abend etc.).

Lawn info: Grasart: ${lawn.grass_type}, Größe: ${lawn.lawn_size}, Ziel: ${lawn.lawn_goal}, Boden: ${lawn.soil_type || 'unbekannt'}.

Return ONLY valid JSON with this exact structure:
{"watering": "...", "mowing": "...", "topTip": "..."}

watering = Bewässerungstipp basierend auf Verdunstung + Regenvorhersage
mowing = Mähtipp basierend auf Feuchtigkeit + Temperatur
topTip = Wichtigster Tipp aus letzter Analyse kombiniert mit Wetter`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Du bist ein deutscher Rasenexperte. Antworte NUR mit validem JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

    if (!res.ok) { console.error('OpenAI error:', res.status); return null; }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    const cleaned = content.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('GPT tips error:', err);
    return null;
  }
}

// --- Email ---

function formatAnalysisDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

async function sendEmail(
  resendKey: string, email: string, name: string, zip: string,
  forecast: DayForecast[], tips: { watering: string; mowing: string; topTip: string },
  analysis: any | undefined
): Promise<boolean> {
  try {
    // Build weather table
    const weatherRows = forecast.map(d =>
      `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${d.label} ${d.date}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${d.temp}°C</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${d.rain ? '🌧️' : '☀️'} ${d.condition}</td>
      </tr>`
    ).join('');

    const weatherTable = `
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
        <thead><tr style="background:#f0fdf4">
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #bbf7d0">Tag</th>
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #bbf7d0">Temp</th>
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #bbf7d0">Wetter</th>
        </tr></thead>
        <tbody>${weatherRows}</tbody>
      </table>`;

    const scoreSection = analysis
      ? `${scoreDisplay(analysis.score, `Score vom ${formatAnalysisDate(analysis.created_at)}`)}`
      : '';

    const content = `
      ${greeting(name)}
      ${paragraph(`Diese Woche in PLZ <strong>${zip}</strong>:`)}
      ${weatherTable}

      ${heading('🌱 Dein persönlicher Rasen-Plan')}

      ${infoCard('💧 Bewässerung', tips.watering, '💧', '#eff6ff', '#bfdbfe')}
      ${infoCard('✂️ Mähen', tips.mowing, '✂️', '#f0fdf4', '#bbf7d0')}
      ${infoCard('🌱 Diese Woche besonders wichtig', tips.topTip, '⭐', '#fffbeb', '#fde68a')}

      ${scoreSection}

      ${ctaButton('Rasen neu analysieren →', 'https://www.rasenpilot.com/lawn-analysis')}
      ${signoff('Das Rasenpilot Team')}
    `;

    const emailHtml = emailLayout(content, `Dein Rasen-Plan für diese Woche`);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: 'Rasenpilot <noreply@rasenpilot.com>',
        to: [email],
        subject: `☀️ Dein Rasen-Plan für diese Woche, ${name}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) { console.error('Resend error:', res.status, await res.text()); return false; }
    await res.text();
    console.log(`Weekly tips sent to ${email}`);
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}
