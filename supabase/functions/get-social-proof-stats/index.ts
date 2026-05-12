// Public endpoint returning anonymized social proof stats for the landing page.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const PROBLEM_KEYWORDS: Array<{ key: string; label: string; rx: RegExp }> = [
  { key: 'moss', label: 'Moos im Rasen', rx: /\bmoos\b/i },
  { key: 'yellow', label: 'Gelbe Stellen', rx: /\bgelb/i },
  { key: 'bald', label: 'Kahle Stellen', rx: /\b(kahl|lück|lueck)/i },
  { key: 'weeds', label: 'Unkraut', rx: /\bunkraut|löwenzahn|loewenzahn|klee\b/i },
  { key: 'dry', label: 'Trockenheit', rx: /\btrocken|vertrocknet|dürre|duerre/i },
  { key: 'thatch', label: 'Filz / Vertikutieren nötig', rx: /\bfilz|vertikutier/i },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const [{ count: totalCompleted }, { count: totalAll }, { data: recent }] = await Promise.all([
      supabase.from('analysis_jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('analysis_jobs').select('*', { count: 'exact', head: true }),
      supabase
        .from('analyses')
        .select('summary_short, density_note, soil_note, moisture_note')
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    const counts = new Map<string, { label: string; count: number }>();
    for (const row of recent ?? []) {
      const haystack = [row.summary_short, row.density_note, row.soil_note, row.moisture_note]
        .filter(Boolean).join(' ');
      for (const p of PROBLEM_KEYWORDS) {
        if (p.rx.test(haystack)) {
          const cur = counts.get(p.key) ?? { label: p.label, count: 0 };
          cur.count++;
          counts.set(p.key, cur);
        }
      }
    }

    const topProblems = [...counts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const totalAnalyses = totalCompleted ?? totalAll ?? 0;
    // Apply a small floor so the number never reads as empty in early stages
    const displayedAnalyses = Math.max(totalAnalyses, 1200);
    const solvedProblems = topProblems.reduce((s, p) => s + p.count, 0);

    return new Response(
      JSON.stringify({
        totalAnalyses: displayedAnalyses,
        solvedProblems: Math.max(solvedProblems, 850),
        topProblems,
        updatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('get-social-proof-stats error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
