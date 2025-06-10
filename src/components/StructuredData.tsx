
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'WebSite' | 'WebPage' | 'Article' | 'Organization' | 'Service';
  data: {
    name?: string;
    alternateName?: string;
    description?: string;
    url?: string;
    logo?: string;
    author?: string;
    datePublished?: string;
    dateModified?: string;
    headline?: string;
    image?: string;
    serviceType?: string;
    provider?: string;
    sameAs?: string[];
    potentialAction?: any;
    foundingDate?: string;
    founder?: string;
    areaServed?: any;
    hasOfferCatalog?: any;
    publisher?: any;
    mainEntityOfPage?: any;
    keywords?: string;
    articleSection?: string;
    inLanguage?: string;
  };
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type,
      ...data
    };

    switch (type) {
      case 'WebSite':
        return {
          ...baseData,
          potentialAction: data.potentialAction || {
            "@type": "SearchAction",
            target: `${data.url}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        };
      
      case 'Organization':
        return {
          ...baseData,
          sameAs: data.sameAs || [
            "https://www.facebook.com/rasenpilot",
            "https://www.instagram.com/rasenpilot"
          ]
        };
      
      case 'Service':
        return {
          ...baseData,
          serviceType: data.serviceType || "Rasenpflege-Beratung",
          provider: {
            "@type": "Organization",
            name: data.provider || "Rasenpilot"
          },
          areaServed: {
            "@type": "Country",
            name: "Deutschland"
          }
        };
      
      default:
        return baseData;
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(getStructuredData(), null, 2)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
