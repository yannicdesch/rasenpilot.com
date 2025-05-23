
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { initializeGA } from '@/lib/analytics';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description,
  canonical,
  noindex = false,
  ogImage,
  keywords
}) => {
  // Initialize Google Analytics on component mount
  useEffect(() => {
    initializeGA();
  }, []);

  // Ensure title doesn't exceed 60 characters
  const formattedTitle = title 
    ? (title.length > 60 ? `${title.substring(0, 57)}...` : title) + ' | Rasenpilot'
    : 'Rasenpilot - Intelligenter KI-Rasenberater';

  // Ensure description doesn't exceed 160 characters
  const formattedDescription = description && description.length > 160 
    ? `${description.substring(0, 157)}...`
    : description || 'Erstelle kostenlos deinen personalisierten Rasenpflegeplan in nur 30 Sekunden mit KI-gestützten Empfehlungen.';

  // Build canonical URL if provided
  const siteUrl = 'https://rasenpilot.de';
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : undefined;

  // Default OG image
  const defaultOgImage = `${siteUrl}/logo.png`;
  const ogImageUrl = ogImage ? ogImage : defaultOgImage;

  return (
    <Helmet>
      <title>{formattedTitle}</title>
      <meta name="description" content={formattedDescription} />
      
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={formattedDescription} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImageUrl} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={formattedDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      
      {/* Canonical link */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Noindex directive if specified */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Google Site Verification - add if you have a verification code */}
      {/* <meta name="google-site-verification" content="your-verification-code" /> */}
      
      {/* Analytics tracking consent */}
      <script type="text/javascript">
        {`
          // This helps Google Analytics know when a user has given consent
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'analytics_storage': 'granted'
          });
        `}
      </script>
    </Helmet>
  );
};

export default SEO;
