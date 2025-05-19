
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Parse the request JSON
    const { action } = await req.json()
    
    if (action === 'create_analytics_tables') {
      // SQL to create the analytics tables
      const createPageViewsTable = `
        CREATE TABLE IF NOT EXISTS page_views (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          path TEXT NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          referrer TEXT,
          user_agent TEXT
        );

        -- Set permissions
        ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
        
        -- Allow public insert access
        CREATE POLICY IF NOT EXISTS "Allow public inserts to page_views" 
          ON page_views FOR INSERT TO anon, authenticated
          WITH CHECK (true);
          
        -- Allow select access
        CREATE POLICY IF NOT EXISTS "Allow select access to page_views" 
          ON page_views FOR SELECT TO anon, authenticated
          USING (true);
      `
      
      const createEventsTable = `
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category TEXT NOT NULL,
          action TEXT NOT NULL, 
          label TEXT,
          value INTEGER,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Set permissions
        ALTER TABLE events ENABLE ROW LEVEL SECURITY;
        
        -- Allow public insert access
        CREATE POLICY IF NOT EXISTS "Allow public inserts to events" 
          ON events FOR INSERT TO anon, authenticated
          WITH CHECK (true);
          
        -- Allow select access
        CREATE POLICY IF NOT EXISTS "Allow select access to events" 
          ON events FOR SELECT TO anon, authenticated
          USING (true);
      `
      
      // Execute the SQL to create tables
      const { error: pvError } = await supabase.rpc('execute_sql', { 
        sql: createPageViewsTable 
      })
      
      const { error: evError } = await supabase.rpc('execute_sql', { 
        sql: createEventsTable 
      })
      
      // Check if tables exist now
      const { data: pvData, error: pvCheckError } = await supabase
        .from('page_views')
        .select('count(*)')
        .limit(1)
        
      const { data: evData, error: evCheckError } = await supabase
        .from('events')
        .select('count(*)')
        .limit(1)
        
      const result = {
        success: !pvCheckError && !evCheckError,
        pageViewsCreated: !pvError,
        eventsCreated: !evError,
        pageViewsExists: !pvCheckError,
        eventsExists: !evCheckError,
        errors: {
          pageViews: pvError ? pvError.message : null,
          events: evError ? evError.message : null
        }
      }
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
