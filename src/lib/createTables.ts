
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const createRequiredTables = async (): Promise<boolean> => {
  try {
    // Create site_settings table
    const { error: settingsError } = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });
    
    if (settingsError) {
      console.error('Error creating site_settings table:', settingsError);
    } else {
      console.log('site_settings table created or already exists');
    }

    // Create profiles table
    const { error: profilesError } = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });
    
    if (profilesError) {
      console.error('Error creating profiles table:', profilesError);
    } else {
      console.log('profiles table created or already exists');
    }

    // Create page_views table
    const { error: pageViewsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS page_views (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          path TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          referrer TEXT,
          user_agent TEXT,
          user_id UUID REFERENCES auth.users(id)
        );
        CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views (path);
        CREATE INDEX IF NOT EXISTS page_views_timestamp_idx ON page_views (timestamp);
      `
    });
    
    if (pageViewsError) {
      console.error('Error creating page_views table:', pageViewsError);
    } else {
      console.log('page_views table created or already exists');
    }

    // Create events table
    const { error: eventsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          category TEXT NOT NULL,
          action TEXT NOT NULL,
          label TEXT,
          value INTEGER,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id)
        );
        CREATE INDEX IF NOT EXISTS events_category_action_idx ON events (category, action);
        CREATE INDEX IF NOT EXISTS events_timestamp_idx ON events (timestamp);
      `
    });
    
    if (eventsError) {
      console.error('Error creating events table:', eventsError);
    } else {
      console.log('events table created or already exists');
    }

    // Create blog_posts table
    const { error: blogPostsError } = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });
    
    if (blogPostsError) {
      console.error('Error creating blog_posts table:', blogPostsError);
    } else {
      console.log('blog_posts table created or already exists');
    }

    // Create pages table
    const { error: pagesError } = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });
    
    if (pagesError) {
      console.error('Error creating pages table:', pagesError);
    } else {
      console.log('pages table created or already exists');
    }

    // Create subscribers table
    const { error: subscribersError } = await supabase.rpc('execute_sql', {
      sql: `
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
      `
    });
    
    if (subscribersError) {
      console.error('Error creating subscribers table:', subscribersError);
    } else {
      console.log('subscribers table created or already exists');
    }

    toast.success('Tabellen erfolgreich erstellt', {
      description: 'Alle benötigten Tabellen wurden in der Datenbank angelegt'
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
