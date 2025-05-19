
import React from 'react';
import QuickConnectionTest from '@/components/admin/database/QuickConnectionTest';
import ConnectionChecker from '@/components/admin/database/ConnectionChecker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ConnectionTestPage = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Supabase Verbindungstest</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickConnectionTest />
        
        <div>
          <ConnectionChecker />
        </div>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Manuelle SQL-Ausführung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Falls Sie die Tabellen manuell erstellen möchten, können Sie folgenden SQL-Code in Supabase ausführen:
            </p>
            
            <div className="bg-gray-100 p-3 rounded-md font-mono text-xs overflow-auto max-h-96">
              <pre>{`
-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT
);

-- Enable RLS and set up policies
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts to page_views" 
  ON page_views FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Allow select access to page_views" 
  ON page_views FOR SELECT TO anon, authenticated
  USING (true);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  action TEXT NOT NULL, 
  label TEXT,
  value INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and set up policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts to events" 
  ON events FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Allow select access to events" 
  ON events FOR SELECT TO anon, authenticated
  USING (true);
              `}</pre>
            </div>
            
            <p className="text-sm mt-4">
              Um diesen Code auszuführen, navigieren Sie zu Ihrer Supabase-Konsole, öffnen den SQL-Editor und fügen Sie den Code dort ein.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectionTestPage;
