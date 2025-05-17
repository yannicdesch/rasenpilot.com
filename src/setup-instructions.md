
# Einrichtungsanleitung für E-Mail-Berichte

Um die E-Mail-Berichte zum Laufen zu bringen, müssen Sie die folgenden Schritte ausführen:

## 1. Erstellen Sie die erforderliche Tabelle in Supabase

Öffnen Sie Ihr Supabase-Projekt und führen Sie den folgenden SQL-Code im SQL-Editor aus:

```sql
-- Erstellen der site_settings-Tabelle, falls sie noch nicht existiert
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

-- Optionale Tabellen für die vollständige Funktionalität der Berichte
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Seitenaufrufe-Analytik
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id)
);
```

## 2. Stellen Sie sicher, dass die Edge Function bereitgestellt ist

Die Edge Function `send-email-report` muss auf Ihrem Supabase-Projekt bereitgestellt sein. Die Funktion befindet sich in der Datei `supabase/functions/send-email-report/index.ts`.

Um die Funktion bereitzustellen, können Sie die Supabase CLI verwenden:

```bash
supabase functions deploy send-email-report
```

## 3. Setzen Sie den API-Schlüssel für den E-Mail-Dienst

Sie müssen einen API-Schlüssel für Ihren E-Mail-Dienst (z. B. Resend.com) in den Supabase-Secrets hinzufügen:

```bash
supabase secrets set RESEND_API_KEY=ihr_api_schlüssel
# ODER
supabase secrets set EMAIL_API_KEY=ihr_api_schlüssel
```

## 4. Testen Sie die Funktion

Nachdem Sie alle Einrichtungsschritte abgeschlossen haben, können Sie die E-Mail-Berichtsfunktion im Admin-Panel testen:

1. Gehen Sie zum Admin-Panel.
2. Klicken Sie auf den Tab "Einstellungen".
3. Wählen Sie den Unterreiter "E-Mail Berichte".
4. Konfigurieren Sie die Einstellungen und speichern Sie sie.
5. Klicken Sie auf "Test-E-Mail senden".

Wenn alles richtig eingerichtet ist, sollten Sie eine Test-E-Mail erhalten.

## 5. Einrichtung eines täglichen Cron Jobs (optional)

Um die E-Mail-Berichte automatisch zu versenden, können Sie einen Cron Job in Ihrer Supabase-Datenbank erstellen:

```sql
-- Erstellen Sie einen Cron Job, der die Edge Function täglich zu einer bestimmten Zeit aufruft
-- In diesem Beispiel um 8:00 Uhr morgens
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule('daily-email-report', '0 8 * * *', $$
  SELECT http((
    'POST',
    'https://[IHRE_PROJEKT_ID].supabase.co/functions/v1/send-email-report',
    ARRAY[('Authorization', 'Bearer [ANON_KEY]')],
    'application/json',
    '{"isTest": false}'
  )::http_request);
$$);
```

Ersetzen Sie `[IHRE_PROJEKT_ID]` und `[ANON_KEY]` durch Ihre tatsächlichen Werte.

## Fehlerbehebung

Wenn Sie Probleme haben:

1. Überprüfen Sie die Konsolenausgaben auf Fehler.
2. Vergewissern Sie sich, dass die Tabellen korrekt erstellt wurden.
3. Stellen Sie sicher, dass die Edge Function erfolgreich bereitgestellt wurde.
4. Überprüfen Sie, ob der API-Schlüssel für den E-Mail-Dienst korrekt gesetzt ist.
