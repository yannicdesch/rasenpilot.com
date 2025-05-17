
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description,
  canonical,
  noindex = false 
}) => {
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

  return (
    <Helmet>
      <title>{formattedTitle}</title>
      <meta name="description" content={formattedDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={formattedDescription} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={formattedDescription} />
      
      {/* Canonical link */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Noindex directive if specified */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
};

export default SEO;
