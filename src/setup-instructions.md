
# Einrichtungsanleitung für Rasenpilot Admin Panel

## Übersicht der Probleme und Lösungen

Wenn Ihre Tabellen nicht erstellt werden können oder Sie Probleme mit dem Adminbereich haben, folgen Sie dieser Checkliste:

1. **Prüfen der Supabase-Verbindung**
   - Haben Sie Supabase erfolgreich mit dem Projekt verbunden?
   - Sind die Umgebungsvariablen korrekt gesetzt? (VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY)

2. **Berechtigungen**
   - Haben Sie Admin-Berechtigungen in Ihrem Supabase-Projekt?
   - Wurden die erforderlichen RLS-Richtlinien eingerichtet?

3. **SQL-Funktion**
   - Die Anwendung benötigt die `execute_sql` Funktion, um Tabellen zu erstellen.
   - Wenn der automatische Prozess fehlschlägt, können Sie diese manuell erstellen.

## Manuelle Erstellung der Tabellen

Wenn die automatische Tabellenerstellung fehlschlägt, können Sie die Tabellen manuell erstellen:

1. Öffnen Sie den SQL-Editor in Ihrem Supabase-Projekt
2. Führen Sie diese SQL-Befehle aus:

```sql
-- Execute SQL Funktion erstellen (wird für Tabellenerstellung benötigt)
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
  RETURN;
END;
$$;

-- Berechtigungen gewähren
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO anon;

-- Analytiktabellen erstellen
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  action TEXT NOT NULL, 
  label TEXT,
  value INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Sicherheitseinstellungen
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Öffentliche Insert-Berechtigungen
CREATE POLICY "Allow public inserts to page_views" 
  ON public.page_views FOR INSERT TO anon, authenticated
  WITH CHECK (true);
  
CREATE POLICY "Allow public inserts to events" 
  ON public.events FOR INSERT TO anon, authenticated
  WITH CHECK (true);
  
-- Select-Berechtigungen
CREATE POLICY "Allow select access to page_views" 
  ON public.page_views FOR SELECT TO anon, authenticated
  USING (true);
  
CREATE POLICY "Allow select access to events" 
  ON public.events FOR SELECT TO anon, authenticated
  USING (true);

-- Weitere Admin-Tabellen erstellen
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Rasenpilot',
  site_tagline TEXT NOT NULL DEFAULT 'Ihr intelligenter Rasenberater',
  site_email TEXT NOT NULL DEFAULT 'info@rasenpilot.de',
  site_phone TEXT,
  site_address TEXT,
  google_analytics_id TEXT DEFAULT 'G-7F24N28JNH',
  show_lovable_badge BOOLEAN DEFAULT TRUE,
  seo JSONB DEFAULT '{"defaultMetaTitle": "Rasenpilot", "defaultMetaDescription": "Ihr intelligenter Rasenberater", "defaultKeywords": "Rasen, Garten", "robotsTxt": "User-agent: *\nAllow: /\nDisallow: /admin"}',
  security JSONB DEFAULT '{"enableTwoFactor": false, "passwordMinLength": 8, "sessionTimeout": 30, "blockFailedLogins": true, "maxFailedAttempts": 5, "blockDuration": 15}',
  email_reports JSONB DEFAULT '{"enabled": false, "recipientEmail": "", "sendTime": "08:00", "lastSent": null, "reportTypes": {"newRegistrations": true, "siteStatistics": true}}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow any user to select site_settings" 
  ON site_settings FOR SELECT TO anon, authenticated
  USING (true);
  
CREATE POLICY "Allow authenticated users to insert site_settings" 
  ON site_settings FOR INSERT TO authenticated
  WITH CHECK (true);
  
CREATE POLICY "Allow authenticated users to update site_settings" 
  ON site_settings FOR UPDATE TO authenticated
  USING (true);
```

## Debugging-Tipps

Wenn Sie weiterhin Probleme haben:

1. **Überprüfen der Konsolenausgabe**:
   - Öffnen Sie die Browser-Konsole (F12)
   - Suchen Sie nach Fehlermeldungen im Zusammenhang mit Supabase oder SQL

2. **Berechtigungsprobleme**:
   - Überprüfen Sie, ob Sie als Administrator angemeldet sind
   - Stellen Sie sicher, dass Ihr Benutzer die entsprechenden Berechtigungen hat

3. **Supabase Edge Functions**:
   - Wenn Sie Edge Functions verwenden möchten, müssen diese bereitgestellt sein
   - Überprüfen Sie die Logs in Ihrem Supabase-Dashboard

4. **Direkte Tabellenerstellung**:
   - Verwenden Sie die SQL-Konsole in Supabase, um die Tabellen manuell zu erstellen
   - Überprüfen Sie anschließend, ob die Anwendung korrekt funktioniert

5. **RLS-Richtlinien**:
   - Stellen Sie sicher, dass die Row Level Security (RLS) korrekt eingerichtet ist
   - Die Anwendung benötigt Lese- und Schreibzugriff auf die Tabellen

