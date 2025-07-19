
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
    type: 'WebSite' | 'WebPage' | 'Article' | 'Organization' | 'Service' | 'Product';
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

  // Enhanced title optimization - max 60 characters for Google
  const formattedTitle = title 
    ? (title.length > 60 ? `${title.substring(0, 55)}...` : title)
    : 'Rasenpilot - Intelligenter KI-Rasenberater | Kostenloser Pflegeplan in 30 Sekunden';

  // Enhanced description optimization - max 160 characters for Google
  const formattedDescription = description && description.length > 160 
    ? `${description.substring(0, 155)}...`
    : description || 'Erstelle kostenlos deinen personalisierten Rasenpflegeplan in nur 30 Sekunden. KI-gestützte Rasenanalyse basierend auf Standort, Rasentyp & Zielen. Sofort starten - ohne Anmeldung.';

  // Build canonical URL
  const siteUrl = 'https://rasenpilot.de';
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  // High-quality logo and images for better search results
  const logoUrl = `${siteUrl}/logo.png`;
  const ogImageUrl = ogImage || `${siteUrl}/og-image.jpg`;

  // Enhanced keywords for better search visibility
  const enhancedKeywords = keywords 
    ? `${keywords}, Rasenpflege, KI-Rasenberater, Rasen-Assistent, Rasen düngen, Rasen mähen, Rasenpilot, intelligenter Rasenberater, Rasenpflegeplan kostenlos, Rasenberatung Deutschland`
    : 'Rasenpflege Deutschland, KI-Rasenberater, intelligenter Rasen-Assistent, kostenloser Rasenpflegeplan, Rasen düngen, Rasen mähen, Rasenpilot, Rasenberatung, Rasen-Analyse kostenlos, Rasen-Probleme lösen, Rasen-Tipps, Gartenpflege, Rasensamen, Rasen vertikutieren';

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{formattedTitle}</title>
        <meta name="title" content={formattedTitle} />
        <meta name="description" content={formattedDescription} />
        <meta name="keywords" content={enhancedKeywords} />
        
        {/* Enhanced meta tags for better indexing */}
        <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"} />
        <meta name="googlebot" content={noindex ? "noindex,nofollow" : "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"} />
        <meta name="bingbot" content={noindex ? "noindex,nofollow" : "index,follow"} />
        
        {/* Geographic and language targeting */}
        <meta name="language" content="de" />
        <meta name="geo.region" content="DE" />
        <meta name="geo.country" content="Deutschland" />
        <meta name="geo.placename" content="Deutschland" />
        
        {/* Enhanced favicon and app icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="mask-icon" href="/logo.png" color="#4CAF50" />
        <meta name="application-name" content="Rasenpilot" />
        <meta name="msapplication-TileImage" content="/logo.png" />
        <meta name="msapplication-TileColor" content="#4CAF50" />
        <meta name="theme-color" content="#4CAF50" />
        
        {/* Author and publication data */}
        {author && <meta name="author" content={author} />}
        {datePublished && <meta name="article:published_time" content={datePublished} />}
        {dateModified && <meta name="article:modified_time" content={dateModified} />}
        
        {/* Open Graph / Facebook - Enhanced */}
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="Rasenpilot - Intelligenter KI-Rasenberater" />
        <meta property="og:title" content={formattedTitle} />
        <meta property="og:description" content={formattedDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Rasenpilot - Intelligenter KI-Rasenberater für kostenlosen Rasenpflegeplan" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:logo" content={logoUrl} />
        
        {/* Twitter Card - Enhanced */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@rasenpilot" />
        <meta name="twitter:creator" content="@rasenpilot" />
        <meta name="twitter:title" content={formattedTitle} />
        <meta name="twitter:description" content={formattedDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content="Rasenpilot - Intelligenter KI-Rasenberater" />
        
        {/* Additional Twitter tags */}
        <meta name="twitter:domain" content="rasenpilot.de" />
        <meta name="twitter:url" content={canonicalUrl} />
        
        {/* Canonical link - Always include */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Enhanced structured data hints */}
        <meta name="news_keywords" content="Rasenpflege, Garten, KI, Rasen, Deutschland" />
        <meta name="article:section" content="Garten & Rasenpflege" />
        <meta name="article:tag" content="Rasenpflege, KI-Beratung, Garten" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Analytics and verification tags */}
        <meta name="google-site-verification" content="" />
        <meta name="msvalidate.01" content="" />
        
        {/* Rich snippets hints */}
        <meta itemProp="name" content={formattedTitle} />
        <meta itemProp="description" content={formattedDescription} />
        <meta itemProp="image" content={ogImageUrl} />
      </Helmet>
      
      {/* Enhanced Structured Data */}
      {structuredData && (
        <StructuredData 
          type={structuredData.type} 
          data={structuredData.data} 
        />
      )}
      
      {/* Default enhanced website structured data */}
      {!structuredData && (
        <StructuredData 
          type="WebSite"
          data={{
            name: "Rasenpilot",
            alternateName: "Rasenpilot - Intelligenter KI-Rasenberater",
            description: formattedDescription,
            url: siteUrl,
            logo: logoUrl,
            sameAs: [
              "https://www.facebook.com/rasenpilot",
              "https://www.instagram.com/rasenpilot",
              "https://twitter.com/rasenpilot"
            ],
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl}/blog-overview?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          }}
        />
      )}
    </>
  );
};

export default SEO;
