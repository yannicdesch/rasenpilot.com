
import { createClient } from '@supabase/supabase-js';

// Use the provided URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                   'https://ugaxwcslhoppflrbuwxv.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true; // Since we're now using fixed values, we can return true
};

// Email template configuration - these need to be set in the Supabase Dashboard
// This serves as documentation for what the templates should look like
export const emailTemplates = {
  // Template for email confirmation
  confirmSignUp: {
    subject: 'Willkommen bei Rasenpilot: Bitte bestätigen Sie Ihre E-Mail',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #2E7D32; border: 1px solid #8BC34A; border-radius: 8px; background-color: #FAFAFA;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://rasenpilot.com/logo.png" alt="Rasenpilot Logo" style="max-width: 150px;">
        </div>
        
        <h1 style="color: #2E7D32; text-align: center; font-size: 24px;">Willkommen bei Rasenpilot!</h1>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse, um Zugriff auf alle Funktionen zu erhalten:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ .ConfirmationURL }}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">E-Mail-Adresse bestätigen</a>
        </div>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Mit Rasenpilot erhalten Sie:</p>
        <ul style="color: #333; line-height: 1.6; font-size: 16px;">
          <li>Personalisierte Pflegepläne für Ihren Rasen</li>
          <li>Echtzeit-Wetteranalysen und Bewässerungsempfehlungen</li>
          <li>Expertentipps für einen gesunden, grünen Rasen</li>
        </ul>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Falls Sie den Link nicht angeklickt haben, ignorieren Sie diese E-Mail einfach.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #8BC34A; color: #666; font-size: 14px; text-align: center;">
          <p>© 2025 Rasenpilot. Alle Rechte vorbehalten.</p>
          <p>Sie haben diese E-Mail erhalten, weil Sie sich bei Rasenpilot registriert haben.</p>
        </div>
      </div>
    `,
  },
  
  // Template for magic link login
  magicLink: {
    subject: 'Ihr Login-Link für Rasenpilot',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #2E7D32; border: 1px solid #8BC34A; border-radius: 8px; background-color: #FAFAFA;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://rasenpilot.com/logo.png" alt="Rasenpilot Logo" style="max-width: 150px;">
        </div>
        
        <h1 style="color: #2E7D32; text-align: center; font-size: 24px;">Ihr Login-Link für Rasenpilot</h1>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Sie haben einen Link zum Einloggen angefordert. Klicken Sie bitte auf den Button unten, um sich in Ihr Konto einzuloggen:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ .ConfirmationURL }}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Bei Rasenpilot einloggen</a>
        </div>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Dieser Link ist 24 Stunden gültig und kann nur einmal verwendet werden.</p>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Falls Sie diesen Login-Link nicht angefordert haben, können Sie ihn ignorieren.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #8BC34A; color: #666; font-size: 14px; text-align: center;">
          <p>© 2025 Rasenpilot. Alle Rechte vorbehalten.</p>
          <p>Sie haben diese E-Mail erhalten, weil Sie sich bei Rasenpilot anmelden möchten.</p>
        </div>
      </div>
    `,
  },
  
  // Template for reset password
  resetPassword: {
    subject: 'Passwort bei Rasenpilot zurücksetzen',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #2E7D32; border: 1px solid #8BC34A; border-radius: 8px; background-color: #FAFAFA;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://rasenpilot.com/logo.png" alt="Rasenpilot Logo" style="max-width: 150px;">
        </div>
        
        <h1 style="color: #2E7D32; text-align: center; font-size: 24px;">Passwort zurücksetzen</h1>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Bitte klicken Sie auf den Button unten, um ein neues Passwort festzulegen:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ .ConfirmationURL }}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Neues Passwort festlegen</a>
        </div>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Dieser Link ist 24 Stunden gültig und kann nur einmal verwendet werden.</p>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Falls Sie kein neues Passwort angefordert haben, ignorieren Sie diese E-Mail bitte.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #8BC34A; color: #666; font-size: 14px; text-align: center;">
          <p>© 2025 Rasenpilot. Alle Rechte vorbehalten.</p>
          <p>Sie haben diese E-Mail erhalten, weil jemand versucht hat, das Passwort für Ihr Rasenpilot-Konto zurückzusetzen.</p>
        </div>
      </div>
    `,
  },
  
  // Template for email change
  changeEmail: {
    subject: 'Bestätigen Sie Ihre neue E-Mail-Adresse bei Rasenpilot',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #2E7D32; border: 1px solid #8BC34A; border-radius: 8px; background-color: #FAFAFA;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://rasenpilot.com/logo.png" alt="Rasenpilot Logo" style="max-width: 150px;">
        </div>
        
        <h1 style="color: #2E7D32; text-align: center; font-size: 24px;">E-Mail-Adresse ändern</h1>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Sie haben eine Anfrage gestellt, Ihre E-Mail-Adresse bei Rasenpilot zu ändern. Bitte bestätigen Sie Ihre neue E-Mail-Adresse, indem Sie auf den Button unten klicken:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ .ConfirmationURL }}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">E-Mail-Adresse bestätigen</a>
        </div>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Dieser Link ist 24 Stunden gültig und kann nur einmal verwendet werden.</p>
        
        <p style="color: #333; line-height: 1.6; font-size: 16px;">Falls Sie diese Änderung nicht vorgenommen haben, kontaktieren Sie uns bitte umgehend.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #8BC34A; color: #666; font-size: 14px; text-align: center;">
          <p>© 2025 Rasenpilot. Alle Rechte vorbehalten.</p>
          <p>Sie haben diese E-Mail erhalten, weil Sie Ihre E-Mail-Adresse bei Rasenpilot ändern möchten.</p>
        </div>
      </div>
    `,
  }
};
