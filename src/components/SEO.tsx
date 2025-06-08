
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { initializeGA } from '@/lib/analytics';
import StructuredData from './StructuredData';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  keywords?: string;
  type?: 'website' | 'article';
  author?: string;
  datePublished?: string;
  dateModified?: string;
  structuredData?: {
    type: 'WebSite' | 'WebPage' | 'Article' | 'Organization' | 'Service';
    data: any;
  };
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description,
  canonical,
  noindex = false,
  ogImage,
  keywords,
  type = 'website',
  author,
  datePublished,
  dateModified,
  structuredData
}) => {
  // Initialize Google Analytics on component mount
  useEffect(() => {
    initializeGA();
  }, []);

  // Ensure title doesn't exceed 60 characters
  const formattedTitle = title 
    ? (title.length > 60 ? `${title.substring(0, 57)}...` : title) + ' | Rasenpilot'
    : 'Rasenpilot - Intelligenter KI-Rasenberater | Persönlicher Pflegeplan in 30 Sekunden';

  // Ensure description doesn't exceed 160 characters
  const formattedDescription = description && description.length > 160 
    ? `${description.substring(0, 157)}...`
    : description || 'Erstelle kostenlos deinen personalisierten Rasenpflegeplan in nur 30 Sekunden mit KI-gestützten Empfehlungen für einen perfekten Rasen.';

  // Build canonical URL if provided
  const siteUrl = 'https://rasenpilot.de';
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : undefined;

  // Default OG image
  const defaultOgImage = `${siteUrl}/logo.png`;
  const ogImageUrl = ogImage ? ogImage : defaultOgImage;

  // Enhanced keywords for lawn care
  const enhancedKeywords = keywords 
    ? `${keywords}, Rasenpflege, KI-Rasenberater, Rasen-Assistent, Rasen düngen, Rasen mähen, Rasenpilot, intelligenter Rasenberater, Rasenpflegeplan kostenlos, Rasenberatung`
    : 'Rasenpflege, KI-Rasenberater, Rasen-Assistent, Rasen düngen, Rasen mähen, Rasenpilot, Rasenpflegeplan kostenlos, Rasenberatung, intelligenter Rasenberater, Rasen-Analyse, Rasen-Probleme, Rasen-Tipps, Gartenpflege';

  return (
    <>
      <Helmet>
        <title>{formattedTitle}</title>
        <meta name="description" content={formattedDescription} />
        <meta name="keywords" content={enhancedKeywords} />
        
        {/* Enhanced meta tags */}
        <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
        <meta name="googlebot" content={noindex ? "noindex,nofollow" : "index,follow"} />
        <meta name="language" content="de" />
        <meta name="geo.region" content="DE" />
        <meta name="geo.country" content="Deutschland" />
        
        {author && <meta name="author" content={author} />}
        {datePublished && <meta name="article:published_time" content={datePublished} />}
        {dateModified && <meta name="article:modified_time" content={dateModified} />}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="Rasenpilot" />
        <meta property="og:title" content={formattedTitle} />
        <meta property="og:description" content={formattedDescription} />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="de_DE" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@rasenpilot" />
        <meta name="twitter:title" content={formattedTitle} />
        <meta name="twitter:description" content={formattedDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* Canonical link */}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Analytics tracking consent */}
        <script type="text/javascript">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'granted',
              'ad_storage': 'denied'
            });
          `}
        </script>
      </Helmet>
      
      {/* Structured Data */}
      {structuredData && (
        <StructuredData 
          type={structuredData.type} 
          data={structuredData.data} 
        />
      )}
      
      {/* Default website structured data if none provided */}
      {!structuredData && (
        <StructuredData 
          type="WebSite"
          data={{
            name: "Rasenpilot",
            description: formattedDescription,
            url: siteUrl,
            logo: `${siteUrl}/logo.png`
          }}
        />
      )}
    </>
  );
};

export default SEO;
