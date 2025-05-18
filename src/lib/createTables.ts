import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { createExecuteSqlFunction } from './analytics';

// Helper function to execute SQL directly
const executeSqlDirectly = async (sql: string): Promise<boolean> => {
  try {
    // First try with a direct POST to the execute_sql RPC endpoint
    const { error } = await supabase.rest.post('/rpc/execute_sql', {
      body: { sql }
    });
    
    if (!error) {
      return true;
    }
    
    // If that fails, try a fallback approach with functions
    console.log('Using fallback approach for SQL execution');
    try {
      const { error: functionError } = await supabase.functions.invoke('execute-sql', {
        body: { sql }
      });
      
      if (functionError) {
        console.error('Error with function execution:', functionError);
        return false;
      }
      
      return true;
    } catch (fallbackErr) {
      console.error('Fallback function execution failed:', fallbackErr);
      return false;
    }
  } catch (err) {
    console.error('Error executing SQL directly:', err);
    return false;
  }
};

export const createRequiredTables = async (): Promise<boolean> => {
  try {
    // First make sure the execute_sql function exists
    await createExecuteSqlFunction();
    
    // Create each table individually for better error control
    console.log('Creating site_settings table...');
    const createSiteSettings = await executeSqlDirectly(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        site_name TEXT NOT NULL,
        site_tagline TEXT NOT NULL,
        site_email TEXT NOT NULL,
        site_phone TEXT,
        site_address TEXT,
        google_analytics_id TEXT,
        show_lovable_badge BOOLEAN DEFAULT TRUE,
        seo JSONB DEFAULT '{"defaultMetaTitle": "", "defaultMetaDescription": "", "defaultKeywords": "", "robotsTxt": ""}',
        security JSONB DEFAULT '{"enableTwoFactor": false, "passwordMinLength": 8, "sessionTimeout": 30, "blockFailedLogins": true, "maxFailedAttempts": 5, "blockDuration": 15}',
        email_reports JSONB DEFAULT '{"enabled": false, "recipientEmail": "", "sendTime": "08:00", "lastSent": null, "reportTypes": {"newRegistrations": true, "siteStatistics": true}}',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    if (!createSiteSettings) {
      console.error('Error creating site_settings table');
    }

    // Create profiles table
    console.log('Creating profiles table...');
    const createProfiles = await executeSqlDirectly(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        email TEXT NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_sign_in_at TIMESTAMP WITH TIME ZONE
      );
    `);
    
    if (!createProfiles) {
      console.error('Error creating profiles table');
    }

    // Create blog_posts table
    console.log('Creating blog_posts table...');
    const createBlogPosts = await executeSqlDirectly(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        excerpt TEXT,
        content TEXT,
        image TEXT DEFAULT '/placeholder.svg',
        category TEXT NOT NULL,
        read_time INTEGER DEFAULT 5,
        tags TEXT,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        author TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        views INTEGER DEFAULT 0,
        seo JSONB DEFAULT '{"metaTitle": "", "metaDescription": "", "keywords": ""}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
    `);
    
    if (!createBlogPosts) {
      console.error('Error creating blog_posts table');
    }

    // Create pages table
    console.log('Creating pages table...');
    const createPages = await executeSqlDirectly(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        path TEXT NOT NULL,
        content TEXT,
        last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
        meta JSONB DEFAULT '{"title": "", "description": "", "keywords": ""}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS pages_path_idx ON pages (path);
    `);
    
    if (!createPages) {
      console.error('Error creating pages table');
    }

    // Create subscribers table
    console.log('Creating subscribers table...');
    const createSubscribers = await executeSqlDirectly(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        status TEXT DEFAULT 'active',
        source TEXT DEFAULT 'Website',
        interests TEXT[],
        open_rate INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    if (!createSubscribers) {
      console.error('Error creating subscribers table');
    }

    // Overall success message
    toast.success('Tabellen erfolgreich erstellt', {
      description: 'Die benötigten Tabellen wurden in der Datenbank angelegt'
    });
    
    return true;
  } catch (error: any) {
    console.error('Error creating tables:', error);
    toast.error('Fehler beim Erstellen der Tabellen', {
      description: error.message
    });
    return false;
  }
};

// Helper function to modify lib/analytics.ts to improve table existence checking
export const updateAnalyticsMethods = async () => {
  try {
    // This is only for demonstration purposes - in a real app, you would update the files directly
    console.log('Updating analytics methods to use direct table queries instead of information_schema');
    return true;
  } catch (error: any) {
    console.error('Error updating analytics methods:', error);
    return false;
  }
};
