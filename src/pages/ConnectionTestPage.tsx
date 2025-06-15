
import React from 'react';
import QuickConnectionTest from '@/components/admin/database/QuickConnectionTest';
import ConnectionChecker from '@/components/admin/database/ConnectionChecker';
import ComprehensiveConnectionTest from '@/components/admin/database/ComprehensiveConnectionTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ConnectionTestPage = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Supabase Verbindungstest</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Comprehensive test first */}
        <ComprehensiveConnectionTest />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickConnectionTest />
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
-- Create missing storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('lawn-images', 'lawn-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars
CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload avatar images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can update own avatar images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policies for lawn images  
CREATE POLICY IF NOT EXISTS "Lawn images are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'lawn-images');

CREATE POLICY IF NOT EXISTS "Users can upload lawn images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'lawn-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can update own lawn images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'lawn-images' AND auth.uid()::text = (storage.foldername(name))[1]);
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
