import {
  Button,
  Heading,
  Hr,
  Link,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { BaseLayout } from './base-layout.tsx'

interface PasswordResetEmailProps {
  supabase_url: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
}

export const PasswordResetEmail = ({
  supabase_url,
  token_hash,
  redirect_to,
  email_action_type,
}: PasswordResetEmailProps) => {
  const resetUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

  return (
    <BaseLayout preview="Setze dein Rasenpilot-Passwort zurück">
      <Heading style={heading}>
        Passwort zurücksetzen
      </Heading>
      
      <Text style={paragraph}>
        Du hast angefordert, dein Passwort für deinen Rasenpilot-Account zurückzusetzen.
        Klicke auf den Button unten, um ein neues Passwort zu erstellen:
      </Text>

      <Button style={button} href={resetUrl}>
        Neues Passwort erstellen
      </Button>

      <Text style={paragraph}>
        Oder kopiere diesen Link in deinen Browser:
      </Text>
      
      <Text style={linkText}>
        <Link href={resetUrl} style={link}>
          {resetUrl.length > 60 ? resetUrl.substring(0, 60) + '...' : resetUrl}
        </Link>
      </Text>

      <Hr style={hr} />

      <Text style={warningText}>
        ⚠️ Dieser Link ist 24 Stunden gültig. Falls du kein Passwort-Reset angefordert hast, 
        kannst du diese E-Mail ignorieren.
      </Text>

      <Text style={signatureText}>
        Dein Rasenpilot-Team 🌱
      </Text>
    </BaseLayout>
  )
}

export default PasswordResetEmail

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
