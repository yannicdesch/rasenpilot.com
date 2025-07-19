
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'WebSite' | 'WebPage' | 'Article' | 'Organization' | 'Service' | 'Product';
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
    offers?: any;
    review?: any;
    aggregateRating?: any;
    brand?: string;
    category?: string;
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
      
      case 'Product':
        return {
          ...baseData,
          brand: data.brand || "Rasenpilot",
          category: data.category || "Gartenberatung",
          offers: data.offers || {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            validFrom: new Date().toISOString(),
            seller: {
              "@type": "Organization",
              name: "Rasenpilot"
            }
          },
          aggregateRating: data.aggregateRating || {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "150",
            bestRating: "5",
            worstRating: "1"
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
