
import { blogPosts } from '../data/blogPosts';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    loc: string;
    caption?: string;
    title?: string;
  }>;
}

export const generateSitemap = (urls: SitemapUrl[]): string => {
  const siteUrl = 'https://rasenpilot.com';
  
  const urlsXml = urls.map(url => {
    const images = url.images?.map(img => `
    <image:image>
      <image:loc>${img.loc}</image:loc>
      ${img.caption ? `<image:caption><![CDATA[${img.caption}]]></image:caption>` : ''}
      ${img.title ? `<image:title><![CDATA[${img.title}]]></image:title>` : ''}
    </image:image>`).join('') || '';
    
    return `
  <url>
    <loc>${siteUrl}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}${images}
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">${urlsXml}
</urlset>`;
};

export const generateSitemapUrls = (): SitemapUrl[] => {
  const today = new Date().toISOString().split('T')[0];
  
  const staticUrls: SitemapUrl[] = [
    // High priority pages
    {
      loc: '/',
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0,
      images: [{
        loc: 'https://rasenpilot.com/logo.png',
        caption: 'Rasenpilot - Intelligenter KI-Rasenberater'
      }]
    },
    
    // Free tools (high SEO value)
    {
      loc: '/lawn-analysis',
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.9,
      images: [{
        loc: 'https://rasenpilot.com/free-analysis-preview.jpg',
        caption: 'Kostenlose KI-Rasenanalyse'
      }]
    },
    
    {
      loc: '/care-plan',
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.9,
      images: [{
        loc: 'https://rasenpilot.com/free-care-plan-preview.jpg',
        caption: 'Kostenloser 14-Tage Rasenpflegeplan'
      }]
    },
    
    {
      loc: '/highscore',
      lastmod: today,
      changefreq: 'daily',
      priority: 0.8,
      images: [{
        loc: 'https://rasenpilot.com/og-image.jpg',
        caption: 'Rasen Highscore - Die besten Rasenflächen'
      }]
    },
    
    // Content pages
    {
      loc: '/blog-overview',
      lastmod: today,
      changefreq: 'daily',
      priority: 0.8
    },
    
    {
      loc: '/weather-advice',
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.7
    },
    
    {
      loc: '/season-guide',
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7
    },
    
    {
      loc: '/chat-assistant',
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.6
    },
    
    {
      loc: '/subscription',
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.6
    },
    
    // Legal pages
    {
      loc: '/datenschutz',
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.3
    },
    
    {
      loc: '/terms-of-use',
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.3
    },
    
    {
      loc: '/impressum',
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.3
    },
    
    // Local SEO Pages (High Priority)
    {
      loc: '/local/munich',
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7,
      images: [{
        loc: 'https://rasenpilot.com/og-image.jpg',
        caption: 'Rasenpflege München - KI-Rasenanalyse'
      }]
    },
    
    {
      loc: '/local/berlin',
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7,
      images: [{
        loc: 'https://rasenpilot.com/og-image.jpg',
        caption: 'Rasenpflege Berlin - KI-Rasenanalyse'
      }]
    },
    
    {
      loc: '/local/hamburg',
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7,
      images: [{
        loc: 'https://rasenpilot.com/og-image.jpg',
        caption: 'Rasenpflege Hamburg - KI-Rasenanalyse'
      }]
    }
  ];

  const blogPostUrls: SitemapUrl[] = blogPosts.map(post => {
    const postDate = new Date(post.date);
    const lastmod = !isNaN(postDate.getTime()) ? postDate.toISOString().split('T')[0] : today;

    return {
      loc: `/blog/${post.slug}`,
      lastmod,
      changefreq: 'monthly',
      priority: 0.85,
      images: undefined
    };
  });

  return [...staticUrls, ...blogPostUrls];
};
