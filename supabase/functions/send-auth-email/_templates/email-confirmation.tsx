import {
  Button,
  Heading,
  Hr,
  Link,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { BaseLayout } from './base-layout.tsx'

interface EmailConfirmationProps {
  supabase_url: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
}

export const EmailConfirmationEmail = ({
  supabase_url,
  token_hash,
  redirect_to,
  email_action_type,
}: EmailConfirmationProps) => {
  const confirmUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

  return (
    <BaseLayout preview="Bestätige deine Rasenpilot E-Mail-Adresse">
      <Heading style={heading}>
        Willkommen bei Rasenpilot! 🌱
      </Heading>
      
      <Text style={paragraph}>
        Vielen Dank für deine Registrierung! Bitte bestätige deine E-Mail-Adresse, 
        um deinen Account zu aktivieren und Zugang zu allen Funktionen zu erhalten.
      </Text>

      <Button style={button} href={confirmUrl}>
        E-Mail-Adresse bestätigen
      </Button>

      <Text style={paragraph}>
        Oder kopiere diesen Link in deinen Browser:
      </Text>
      
      <Text style={linkText}>
        <Link href={confirmUrl} style={link}>
          {confirmUrl.length > 60 ? confirmUrl.substring(0, 60) + '...' : confirmUrl}
        </Link>
      </Text>

      <Hr style={hr} />

      <Text style={featureBox}>
        <strong>Was dich erwartet:</strong><br />
        🔍 KI-gestützte Rasenanalyse<br />
        📋 Personalisierte Pflegetipps<br />
        🌡️ Wetterbasierte Empfehlungen<br />
        📊 Fortschritts-Tracking
      </Text>

      <Hr style={hr} />

      <Text style={warningText}>
        ⚠️ Dieser Link ist 24 Stunden gültig. Falls du dich nicht bei Rasenpilot 
        registriert hast, kannst du diese E-Mail ignorieren.
      </Text>

      <Text style={signatureText}>
        Dein Rasenpilot-Team 🌱
      </Text>
    </BaseLayout>
  )
}

export default EmailConfirmationEmail

const heading = {
  color: '#16a34a',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const button = {
  backgroundColor: '#16a34a',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '14px 24px',
  margin: '24px 0',
}

const linkText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 16px',
  wordBreak: 'break-all' as const,
}

const link = {
  color: '#16a34a',
  textDecoration: 'underline',
}

const featureBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  color: '#374151',
  fontSize: '15px',
  lineHeight: '28px',
  padding: '16px 20px',
  margin: '0 0 16px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const warningText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const signatureText = {
  color: '#16a34a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
}
