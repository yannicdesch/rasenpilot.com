INSERT INTO site_settings (site_name, site_tagline, site_email, seo, security, email_reports)
VALUES (
  'Rasenpilot',
  'Ihr intelligenter Rasen-Assistent',
  'info@rasenpilot.com',
  '{"robotsTxt": "", "defaultKeywords": "Rasenpflege, Rasen, Garten", "defaultMetaTitle": "Rasenpilot - Intelligente Rasenpflege", "defaultMetaDescription": "Professionelle Rasenpflege-Tipps und personalisierte Pflegepläne für den perfekten Rasen"}'::jsonb,
  '{"blockDuration": 15, "sessionTimeout": 30, "enableTwoFactor": false, "blockFailedLogins": true, "maxFailedAttempts": 5, "passwordMinLength": 8}'::jsonb,
  '{"enabled": false, "lastSent": null, "sendTime": "08:00", "reportTypes": {"siteStatistics": true, "newRegistrations": true}, "recipientEmail": ""}'::jsonb
) ON CONFLICT (id) DO NOTHING;