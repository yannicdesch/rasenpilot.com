// Shared email template for consistent, premium email design across all Rasenpilot emails

export function emailLayout(content: string, preheader: string = ''): string {
  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Rasenpilot</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    img { border: 0; display: block; outline: none; text-decoration: none; }
    a { color: inherit; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; padding: 16px !important; }
      .content-block { padding: 24px 20px !important; }
      .hero-title { font-size: 22px !important; }
      .cta-button { width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f0;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}
  
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        
        <!-- Email container -->
        <table role="presentation" class="email-container" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#166534 0%,#15803d 50%,#16a34a 100%);padding:32px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 12px;margin-bottom:12px;">
                      <span style="font-size:28px;line-height:1;">🌱</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;margin:0;">Rasenpilot</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td class="content-block" style="padding:32px 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #e5e7eb;padding-top:24px;text-align:center;">
                    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#9ca3af;line-height:1.6;margin:0;">
                      © ${new Date().getFullYear()} Rasenpilot · Dein intelligenter Rasenberater
                    </p>
                    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#9ca3af;line-height:1.6;margin:4px 0 0;">
                      <a href="https://www.rasenpilot.com/account-settings" style="color:#16a34a;text-decoration:underline;">E-Mail-Einstellungen</a>
                       · 
                      <a href="https://www.rasenpilot.com/datenschutz" style="color:#16a34a;text-decoration:underline;">Datenschutz</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function greeting(name: string): string {
  return `<p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:16px;color:#1f2937;line-height:1.6;margin:0 0 16px;">
    Hallo <strong>${name}</strong>,
  </p>`;
}

export function paragraph(text: string): string {
  return `<p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#4b5563;line-height:1.7;margin:0 0 16px;">${text}</p>`;
}

export function heading(text: string): string {
  return `<h2 style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:700;color:#166534;margin:24px 0 16px;letter-spacing:-0.3px;">${text}</h2>`;
}

export function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);border-radius:10px;padding:0;">
        <a href="${url}" class="cta-button" style="display:inline-block;font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;padding:14px 32px;letter-spacing:0.2px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

export function infoCard(title: string, content: string, emoji: string = '💡', bgColor: string = '#f0fdf4', borderColor: string = '#bbf7d0'): string {
  return `<div style="background:${bgColor};border:1px solid ${borderColor};border-radius:12px;padding:20px;margin:20px 0;">
    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;color:#166534;margin:0 0 6px;">${emoji} ${title}</p>
    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#4b5563;line-height:1.6;margin:0;">${content}</p>
  </div>`;
}

export function taskCard(title: string, description: string, icon: string = '✅'): string {
  return `<div style="background:#ffffff;border:1px solid #e5e7eb;border-left:4px solid #16a34a;border-radius:8px;padding:16px 20px;margin:10px 0;">
    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:600;color:#1f2937;margin:0 0 4px;">${icon} ${title}</p>
    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#6b7280;line-height:1.5;margin:0;">${description}</p>
  </div>`;
}

export function warningCard(title: string, items: string[]): string {
  const listItems = items.map(item => `<li style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#7f1d1d;line-height:1.8;margin:2px 0;">${item}</li>`).join('');
  return `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin:20px 0;">
    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;color:#991b1b;margin:0 0 10px;">${title}</p>
    <ul style="padding-left:20px;margin:0;">${listItems}</ul>
  </div>`;
}

export function featureList(features: Array<{icon: string, text: string}>): string {
  const items = features.map(f => `
    <tr>
      <td style="padding:8px 0;vertical-align:top;width:28px;">
        <span style="font-size:16px;">${f.icon}</span>
      </td>
      <td style="padding:8px 0 8px 8px;vertical-align:top;">
        <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#374151;line-height:1.5;margin:0;">${f.text}</p>
      </td>
    </tr>
  `).join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">${items}</table>`;
}

export function scoreDisplay(score: number, summary?: string): string {
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626';
  const bg = score >= 70 ? '#f0fdf4' : score >= 40 ? '#fffbeb' : '#fef2f2';
  const border = score >= 70 ? '#bbf7d0' : score >= 40 ? '#fde68a' : '#fecaca';
  return `<div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Dein Rasen-Score</p>
    <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:42px;font-weight:700;color:${color};margin:0;line-height:1;">${score}<span style="font-size:18px;color:#9ca3af;">/100</span></p>
    ${summary ? `<p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#6b7280;margin:10px 0 0;line-height:1.5;">${summary}</p>` : ''}
  </div>`;
}

export function signoff(): string {
  return `<p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#6b7280;margin:24px 0 0;line-height:1.6;">
    Viele Grüße,<br/><strong style="color:#166534;">Dein Rasenpilot-Team</strong> 🌿
  </p>`;
}
