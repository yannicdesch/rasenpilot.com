import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { PasswordResetEmail } from './_templates/password-reset.tsx'
import { MagicLinkEmail } from './_templates/magic-link.tsx'
import { EmailConfirmationEmail } from './_templates/email-confirmation.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

interface AuthEmailPayload {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

serve(async (req) => {
  console.log('[SEND-AUTH-EMAIL] Received request');

  if (req.method !== 'POST') {
    console.log('[SEND-AUTH-EMAIL] Invalid method:', req.method);
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  try {
    // Verify webhook signature
    const wh = new Webhook(hookSecret);
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as AuthEmailPayload;

    console.log('[SEND-AUTH-EMAIL] Processing email for:', user.email);
    console.log('[SEND-AUTH-EMAIL] Email action type:', email_action_type);
    console.log('[SEND-AUTH-EMAIL] Redirect to:', redirect_to);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    let html: string;
    let subject: string;

    // Select template based on email action type
    switch (email_action_type) {
      case 'recovery':
        console.log('[SEND-AUTH-EMAIL] Using password reset template');
        subject = 'Setze dein Rasenpilot-Passwort zurück';
        html = await renderAsync(
          React.createElement(PasswordResetEmail, {
            supabase_url: supabaseUrl,
            token_hash,
            redirect_to,
            email_action_type,
          })
        );
        break;

      case 'magiclink':
        console.log('[SEND-AUTH-EMAIL] Using magic link template');
        subject = 'Dein Rasenpilot Login-Link';
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            supabase_url: supabaseUrl,
            token,
            token_hash,
            redirect_to,
            email_action_type,
          })
        );
        break;

      case 'signup':
      case 'email_change':
      case 'invite':
        console.log('[SEND-AUTH-EMAIL] Using email confirmation template');
        subject = email_action_type === 'email_change' 
          ? 'Bestätige deine neue Rasenpilot E-Mail-Adresse'
          : 'Willkommen bei Rasenpilot - Bestätige deine E-Mail';
        html = await renderAsync(
          React.createElement(EmailConfirmationEmail, {
            supabase_url: supabaseUrl,
            token_hash,
            redirect_to,
            email_action_type,
          })
        );
        break;

      default:
        console.log('[SEND-AUTH-EMAIL] Unknown email action type:', email_action_type);
        // Fallback to email confirmation template
        subject = 'Rasenpilot - Aktion erforderlich';
        html = await renderAsync(
          React.createElement(EmailConfirmationEmail, {
            supabase_url: supabaseUrl,
            token_hash,
            redirect_to,
            email_action_type,
          })
        );
    }

    // Send email via Resend
    console.log('[SEND-AUTH-EMAIL] Sending email via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'Rasenpilot <noreply@rasenpilot.com>',
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error('[SEND-AUTH-EMAIL] Resend error:', error);
      throw error;
    }

    console.log('[SEND-AUTH-EMAIL] Email sent successfully:', data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[SEND-AUTH-EMAIL] Error:', error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message,
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
