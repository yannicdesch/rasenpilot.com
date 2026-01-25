import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const BaseLayout = ({ preview, children }: BaseLayoutProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Logo Header */}
        <Section style={logoSection}>
          <Img
            src="https://rasenpilot.lovable.app/logo.png"
            width="180"
            height="auto"
            alt="Rasenpilot"
            style={logo}
          />
        </Section>

        {/* Main Content */}
        <Section style={contentSection}>
          {children}
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} Rasenpilot - Dein KI-Rasenberater
          </Text>
          <Text style={footerLinks}>
            <a href="https://www.rasenpilot.com/datenschutz" style={footerLink}>Datenschutz</a>
            {' · '}
            <a href="https://www.rasenpilot.com/impressum" style={footerLink}>Impressum</a>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default BaseLayout

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '12px',
  maxWidth: '560px',
}

const logoSection = {
  padding: '32px 40px 24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const contentSection = {
  padding: '0 40px',
}

const footer = {
  backgroundColor: '#f0fdf4',
  borderRadius: '0 0 12px 12px',
  padding: '24px 40px',
  marginTop: '32px',
}

const footerText = {
  color: '#16a34a',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
}

const footerLinks = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '0',
}

const footerLink = {
  color: '#16a34a',
  textDecoration: 'none',
}
