
# Database Schema for Rasenpilot Admin Panel

This document outlines the database schema required for the administration panel of the Rasenpilot application. To fully utilize the admin features, you'll need to create several tables in your Supabase database.

## Required Tables

### 1. `site_settings` Table

Stores global site configuration:

```sql
CREATE TABLE site_settings (
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `blog_posts` Table

Stores blog posts:

```sql
CREATE TABLE blog_posts (
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

-- Create an index on the slug for faster lookups
CREATE UNIQUE INDEX blog_posts_slug_idx ON blog_posts (slug);
```

### 3. `pages` Table

Stores site pages:

```sql
CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  path TEXT NOT NULL,
  content TEXT,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  meta JSONB DEFAULT '{"title": "", "description": "", "keywords": ""}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the path for faster lookups
CREATE UNIQUE INDEX pages_path_idx ON pages (path);
```

### 4. `page_views` Table

Tracks page view analytics:

```sql
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id)
);

-- Create indexes for analytics queries
CREATE INDEX page_views_path_idx ON page_views (path);
CREATE INDEX page_views_timestamp_idx ON page_views (timestamp);
CREATE INDEX page_views_user_id_idx ON page_views (user_id);
```

### 5. `events` Table

Tracks user events for analytics:

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  label TEXT,
  value INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create indexes for analytics queries
CREATE INDEX events_category_action_idx ON events (category, action);
CREATE INDEX events_timestamp_idx ON events (timestamp);
CREATE INDEX events_user_id_idx ON events (user_id);
```

## Setup Instructions

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Create a new query and paste the SQL statements above
4. Run the query to create all necessary tables
5. Set appropriate Row-Level Security (RLS) policies for these tables

## RLS Policies (Optional but Recommended)

For security, consider adding RLS policies to restrict access:

```sql
-- Example RLS for site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin read" ON site_settings FOR SELECT USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
CREATE POLICY "Allow admin write" ON site_settings FOR INSERT USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
CREATE POLICY "Allow admin update" ON site_settings FOR UPDATE USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Similar policies should be created for other admin tables
```

## Testing Your Setup

Once you've created these tables, the admin panel should automatically connect to them and start using real data instead of sample data. If the tables don't exist, the application will fall back to using sample data with appropriate warnings.
