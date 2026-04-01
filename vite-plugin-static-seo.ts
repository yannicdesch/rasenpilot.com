/**
 * Vite plugin that generates static HTML files with SEO content for key routes.
 * This ensures search engine crawlers can read page content even if JavaScript
 * hasn't executed yet. The SPA still works normally — these files just provide
 * a pre-rendered HTML fallback.
 */
import { Plugin } from 'vite';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

interface PageMeta {
  path: string;
  title: string;
  description: string;
  h1: string;
  content: string;
  canonical: string;
  keywords?: string;
  type?: 'article' | 'website';
  datePublished?: string;
}

// Static blog content extracted from blogPosts.ts for prerendering
const blogArticles: PageMeta[] = [
  {
    path: '/blog/perfekter-maehrhythmus-rasen',
    title: 'Der perfekte Mährhythmus für deinen Rasen | Rasenpilot',
    description: 'Erfahre, wie oft du deinen Rasen mähen solltest. Tipps für Schnittfrequenz je nach Jahreszeit, Rasentyp und Wetter.',
    h1: 'Der perfekte Mährhythmus für deinen Rasen: So oft solltest du mähen',
    content: 'Ein gesunder und schöner Rasen beginnt mit dem richtigen Mährhythmus. Die Häufigkeit des Mähens hat einen entscheidenden Einfluss auf die Dichte, Farbe und allgemeine Gesundheit deines Rasens. Als Faustregel gilt: Mähe regelmäßig, aber schneide nie mehr als ein Drittel der Halmlänge ab.',
    canonical: 'https://www.rasenpilot.com/blog/perfekter-maehrhythmus-rasen',
    keywords: 'Rasen mähen, Mährhythmus, Rasenpflege, Rasen Schnittfrequenz',
    type: 'article',
  },
  {
    path: '/blog/rasen-richtig-duengen',
    title: 'Rasen richtig düngen: Zeitpunkt, Menge und Düngerarten | Rasenpilot',
    description: 'Lerne, wann und wie du deinen Rasen am besten düngst. Vergleich von Langzeitdünger, organischem Dünger und mehr.',
    h1: 'Rasen richtig düngen: Zeitpunkt, Menge und die besten Düngerarten',
    content: 'Die richtige Düngung ist einer der wichtigsten Faktoren für einen gesunden, grünen Rasen. Ohne ausreichende Nährstoffe wird dein Rasen dünn, verliert seine satte Farbe und wird anfällig für Krankheiten und Unkraut.',
    canonical: 'https://www.rasenpilot.com/blog/rasen-richtig-duengen',
    keywords: 'Rasen düngen, Rasendünger, Langzeitdünger, organischer Dünger',
    type: 'article',
  },
  {
    path: '/blog/rasen-bewaesserung-guide',
    title: 'Rasen bewässern: Der ultimative Guide | Rasenpilot',
    description: 'Alles über die richtige Bewässerung deines Rasens — Zeitpunkt, Menge, Methoden und häufige Fehler vermeiden.',
    h1: 'Rasen bewässern: Der ultimative Guide für die richtige Bewässerung',
    content: 'Die richtige Bewässerung ist entscheidend für einen gesunden, grünen Rasen. Zu wenig Wasser lässt den Rasen vertrocknen, zu viel fördert Krankheiten und flache Wurzelbildung.',
    canonical: 'https://www.rasenpilot.com/blog/rasen-bewaesserung-guide',
    keywords: 'Rasen bewässern, Rasenbewässerung, Rasen gießen, Bewässerungstipps',
    type: 'article',
  },
  {
    path: '/blog/moos-im-rasen-bekaempfen',
    title: 'Moos im Rasen bekämpfen: Ursachen und Lösungen | Rasenpilot',
    description: 'Erfahre, warum Moos in deinem Rasen wächst und wie du es dauerhaft entfernst. Tipps zu Vertikutieren, pH-Wert und Vorbeugung.',
    h1: 'Moos im Rasen bekämpfen: Ursachen, Lösungen und Vorbeugung',
    content: 'Moos im Rasen ist eines der häufigsten Probleme, mit denen Gartenbesitzer zu kämpfen haben. Es verdrängt die Gräser und kann große Flächen des Rasens einnehmen.',
    canonical: 'https://www.rasenpilot.com/blog/moos-im-rasen-bekaempfen',
    keywords: 'Moos im Rasen, Moos entfernen, Rasen vertikutieren, Moos bekämpfen',
    type: 'article',
  },
  {
    path: '/blog/rasen-im-fruehling-pflegen',
    title: 'Rasen im Frühling pflegen: Tipps für den perfekten Start | Rasenpilot',
    description: 'So bereitest du deinen Rasen im Frühling optimal vor — Vertikutieren, Düngen, Nachsäen und erste Mahd.',
    h1: 'Rasen im Frühling pflegen: Tipps für den perfekten Start in die Saison',
    content: 'Der Frühling ist die wichtigste Jahreszeit für deinen Rasen. Die richtige Pflege in dieser Phase legt den Grundstein für einen gesunden, dichten Rasen im gesamten Jahr.',
    canonical: 'https://www.rasenpilot.com/blog/rasen-im-fruehling-pflegen',
    keywords: 'Rasen Frühling, Rasenpflege Frühling, Rasen vertikutieren, Rasen düngen Frühling',
    type: 'article',
  },
  {
    path: '/blog/kahle-stellen-im-rasen-reparieren',
    title: 'Kahle Stellen im Rasen reparieren | Rasenpilot',
    description: 'Schritt-für-Schritt Anleitung zum Reparieren kahler Stellen im Rasen — Ursachen erkennen und nachsäen.',
    h1: 'Kahle Stellen im Rasen reparieren: Ursachen erkennen und beheben',
    content: 'Kahle Stellen im Rasen sind nicht nur ein ästhetisches Problem, sondern können auch auf tieferliegende Ursachen hinweisen.',
    canonical: 'https://www.rasenpilot.com/blog/kahle-stellen-im-rasen-reparieren',
    keywords: 'kahle Stellen Rasen, Rasen nachsäen, Rasen reparieren, Rasen lücken',
    type: 'article',
  },
];

const mainPages: PageMeta[] = [
  {
    path: '/',
    title: 'Rasenpilot — KI-Rasenanalyse kostenlos | Lawn Score in 30 Sekunden',
    description: 'Lade ein Foto deines Rasens hoch und erhalte sofort deine persönliche KI-Diagnose mit Lawn Score, Pflegekalender und Produktempfehlungen. Kostenlos & ohne Anmeldung.',
    h1: 'Dein Rasen verdient das Beste — KI-Analyse in 30 Sekunden',
    content: 'Rasenpilot analysiert deinen Rasen mit künstlicher Intelligenz. Lade einfach ein Foto hoch und erhalte sofort deinen persönlichen Lawn Score, einen maßgeschneiderten Pflegekalender und Produktempfehlungen.',
    canonical: 'https://www.rasenpilot.com/',
    keywords: 'rasen analyse, rasen ki, rasenpflege app, lawn score, kostenlose rasenanalyse',
  },
  {
    path: '/lawn-analysis',
    title: 'Kostenlose KI-Rasenanalyse | Rasenpilot',
    description: 'Starte jetzt deine kostenlose KI-Rasenanalyse. Foto hochladen, Lawn Score erhalten und persönliche Pflegetipps bekommen.',
    h1: 'Kostenlose KI-Rasenanalyse starten',
    content: 'Lade ein Foto deines Rasens hoch und unsere KI analysiert den Zustand. Du erhältst einen Lawn Score, Handlungsempfehlungen und einen persönlichen Pflegeplan.',
    canonical: 'https://www.rasenpilot.com/lawn-analysis',
    keywords: 'Rasenanalyse, KI Rasen, Rasen Foto analysieren, Lawn Score',
  },
  {
    path: '/subscription',
    title: 'Rasenpilot Premium — 9,99€/Monat | 7 Tage kostenlos testen',
    description: 'Unbegrenzte KI-Rasenanalysen, persönlicher Pflegekalender, Krankheitserkennung und Wetter-Tipps. 7 Tage kostenlos testen.',
    h1: 'Rasenpilot Premium',
    content: 'Unbegrenzte KI-Rasenanalysen, persönlicher Pflegekalender, Krankheitserkennung und Wetter-basierte Pflegetipps. 7 Tage kostenlos testen, dann 9,99€/Monat.',
    canonical: 'https://www.rasenpilot.com/subscription',
    keywords: 'Rasenpilot Premium, Rasen Abo, Rasenpflege Premium',
  },
  {
    path: '/blog-overview',
    title: 'Rasenpflege Ratgeber — Tipps & Tricks | Rasenpilot',
    description: 'Experten-Ratgeber zu Rasenpflege, Mähen, Düngen, Bewässerung und Rasenprobleme lösen. Kostenlose Tipps von Rasenpilot.',
    h1: 'Rasenpflege Ratgeber',
    content: 'Entdecke unsere Experten-Ratgeber zu allen Themen rund um die Rasenpflege — von der richtigen Mähfrequenz über Düngung bis zur Bekämpfung von Rasenproblomen.',
    canonical: 'https://www.rasenpilot.com/blog-overview',
    keywords: 'Rasenpflege Tipps, Rasen Ratgeber, Gartenpflege, Rasen Hilfe',
  },
];

function generateStaticHtml(page: PageMeta, templateHtml: string): string {
  const structuredData = page.type === 'article' 
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": page.h1,
        "description": page.description,
        "url": page.canonical,
        "publisher": {
          "@type": "Organization",
          "name": "Rasenpilot",
          "url": "https://www.rasenpilot.com"
        },
        "inLanguage": "de",
        "mainEntityOfPage": page.canonical,
      })
    : JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": page.title,
        "description": page.description,
        "url": page.canonical,
      });

  // Inject meta tags and content into the HTML template
  let html = templateHtml;
  
  // Replace title
  html = html.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`);
  
  // Add meta description if not present, or replace
  if (html.includes('<meta name="description"')) {
    html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${page.description}">`);
  } else {
    html = html.replace('</head>', `  <meta name="description" content="${page.description}">\n  </head>`);
  }

  // Add canonical
  html = html.replace('</head>', `  <link rel="canonical" href="${page.canonical}">\n  </head>`);

  // Add keywords
  if (page.keywords) {
    html = html.replace('</head>', `  <meta name="keywords" content="${page.keywords}">\n  </head>`);
  }

  // Add OG tags
  html = html.replace('</head>', `  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${page.canonical}">
  <meta property="og:type" content="${page.type === 'article' ? 'article' : 'website'}">
  <meta property="og:locale" content="de_DE">
  </head>`);

  // Add structured data and visible content for crawlers inside <div id="root">
  const seoContent = `<div id="root"><div id="seo-content" style="position:absolute;left:-9999px"><h1>${page.h1}</h1><p>${page.content}</p></div>`;
  html = html.replace('<div id="root"></div>', `${seoContent}</div>`);

  // Add page-specific structured data
  html = html.replace('</head>', `  <script type="application/ld+json">${structuredData}</script>\n  </head>`);

  return html;
}

export function staticSeoPlugin(): Plugin {
  return {
    name: 'vite-plugin-static-seo',
    apply: 'build',
    closeBundle() {
      const { readFileSync } = require('fs');
      const distDir = resolve(process.cwd(), 'dist');
      
      let templateHtml: string;
      try {
        templateHtml = readFileSync(resolve(distDir, 'index.html'), 'utf-8');
      } catch {
        console.warn('[static-seo] Could not read dist/index.html, skipping prerender');
        return;
      }

      const allPages = [...mainPages, ...blogArticles];
      
      for (const page of allPages) {
        const pagePath = page.path === '/' ? '/index' : page.path;
        const filePath = resolve(distDir, `${pagePath.slice(1)}/index.html`);
        
        try {
          mkdirSync(dirname(filePath), { recursive: true });
          const html = generateStaticHtml(page, templateHtml);
          writeFileSync(filePath, html, 'utf-8');
          console.log(`[static-seo] Generated: ${pagePath}`);
        } catch (err) {
          console.warn(`[static-seo] Failed to generate ${pagePath}:`, err);
        }
      }
      
      console.log(`[static-seo] Generated ${allPages.length} static HTML pages`);
    }
  };
}
