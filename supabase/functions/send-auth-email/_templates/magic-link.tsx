import {
  Button,
  Heading,
  Hr,
  Link,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'
import { BaseLayout } from './base-layout.tsx'

interface MagicLinkEmailProps {
  supabase_url: string;
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
}

export const MagicLinkEmail = ({
  supabase_url,
  token,
  token_hash,
  redirect_to,
  email_action_type,
}: MagicLinkEmailProps) => {
  const loginUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

  return (
    <BaseLayout preview="Dein Rasenpilot Login-Link">
      <Heading style={heading}>
        Willkommen bei Rasenpilot! 🌱
      </Heading>
      
      <Text style={paragraph}>
        Klicke auf den Button unten, um dich bei Rasenpilot anzumelden:
      </Text>

      <Button style={button} href={loginUrl}>
        Jetzt anmelden
      </Button>

      <Text style={paragraph}>
        Oder kopiere diesen Link in deinen Browser:
      </Text>
      
      <Text style={linkText}>
        <Link href={loginUrl} style={link}>
          {loginUrl.length > 60 ? loginUrl.substring(0, 60) + '...' : loginUrl}
        </Link>
      </Text>

      {token && (
        <>
          <Hr style={hr} />
          <Text style={paragraph}>
            Alternativ kannst du diesen Einmal-Code verwenden:
          </Text>
          <Text style={codeBox}>{token}</Text>
        </>
      )}

      <Hr style={hr} />

      <Text style={warningText}>
        ⚠️ Dieser Link ist 1 Stunde gültig. Falls du keinen Login-Link angefordert hast, 
        kannst du diese E-Mail ignorieren.
      </Text>

      <Text style={signatureText}>
        Dein Rasenpilot-Team 🌱
      </Text>
    </BaseLayout>
  )
}

export default MagicLinkEmail

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

const codeBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  color: '#16a34a',
  display: 'inline-block',
  fontFamily: 'monospace',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  padding: '16px 24px',
  textAlign: 'center' as const,
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
