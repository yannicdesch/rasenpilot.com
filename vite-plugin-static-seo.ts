/**
 * Vite plugin that generates static HTML files with SEO content for key routes at build time.
 * Uses only Vite/Rollup APIs (no dynamic require of 'fs').
 */
import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

interface PageMeta {
  path: string;
  title: string;
  description: string;
  h1: string;
  content: string;
  canonical: string;
  keywords?: string;
  type?: 'article' | 'website';
}

const blogArticles: PageMeta[] = [
  {
    path: '/blog/perfekter-maehrhythmus-rasen',
    title: 'Der perfekte Mährhythmus für deinen Rasen | Rasenpilot',
    description: 'Erfahre, wie oft du deinen Rasen mähen solltest. Tipps für Schnittfrequenz je nach Jahreszeit, Rasentyp und Wetter.',
    h1: 'Der perfekte Mährhythmus für deinen Rasen: So oft solltest du mähen',
    content: 'Ein gesunder und schöner Rasen beginnt mit dem richtigen Mährhythmus.',
    canonical: 'https://www.rasenpilot.com/blog/perfekter-maehrhythmus-rasen',
    keywords: 'Rasen mähen, Mährhythmus, Rasenpflege',
    type: 'article',
  },
  {
    path: '/blog/rasen-richtig-duengen',
    title: 'Rasen richtig düngen: Zeitpunkt, Menge und Düngerarten | Rasenpilot',
    description: 'Lerne, wann und wie du deinen Rasen am besten düngst.',
    h1: 'Rasen richtig düngen: Zeitpunkt, Menge und die besten Düngerarten',
    content: 'Die richtige Düngung ist einer der wichtigsten Faktoren für einen gesunden, grünen Rasen.',
    canonical: 'https://www.rasenpilot.com/blog/rasen-richtig-duengen',
    keywords: 'Rasen düngen, Rasendünger, Langzeitdünger',
    type: 'article',
  },
  {
    path: '/blog/rasen-bewaesserung-guide',
    title: 'Rasen bewässern: Der ultimative Guide | Rasenpilot',
    description: 'Alles über die richtige Bewässerung deines Rasens.',
    h1: 'Rasen bewässern: Der ultimative Guide',
    content: 'Die richtige Bewässerung ist entscheidend für einen gesunden, grünen Rasen.',
    canonical: 'https://www.rasenpilot.com/blog/rasen-bewaesserung-guide',
    keywords: 'Rasen bewässern, Rasenbewässerung',
    type: 'article',
  },
  {
    path: '/blog/moos-im-rasen-bekaempfen',
    title: 'Moos im Rasen bekämpfen | Rasenpilot',
    description: 'Erfahre, warum Moos wächst und wie du es dauerhaft entfernst.',
    h1: 'Moos im Rasen bekämpfen: Ursachen und Lösungen',
    content: 'Moos im Rasen ist eines der häufigsten Probleme, mit denen Gartenbesitzer zu kämpfen haben.',
    canonical: 'https://www.rasenpilot.com/blog/moos-im-rasen-bekaempfen',
    keywords: 'Moos im Rasen, Moos entfernen, Rasen vertikutieren',
    type: 'article',
  },
  {
    path: '/blog/rasen-im-fruehling-pflegen',
    title: 'Rasen im Frühling pflegen | Rasenpilot',
    description: 'So bereitest du deinen Rasen im Frühling optimal vor.',
    h1: 'Rasen im Frühling pflegen: Tipps für den perfekten Start',
    content: 'Der Frühling ist die wichtigste Jahreszeit für deinen Rasen.',
    canonical: 'https://www.rasenpilot.com/blog/rasen-im-fruehling-pflegen',
    keywords: 'Rasen Frühling, Rasenpflege Frühling',
    type: 'article',
  },
  {
    path: '/blog/kahle-stellen-im-rasen-reparieren',
    title: 'Kahle Stellen im Rasen reparieren | Rasenpilot',
    description: 'Schritt-für-Schritt Anleitung zum Reparieren kahler Stellen.',
    h1: 'Kahle Stellen im Rasen reparieren',
    content: 'Kahle Stellen im Rasen sind nicht nur ein ästhetisches Problem.',
    canonical: 'https://www.rasenpilot.com/blog/kahle-stellen-im-rasen-reparieren',
    keywords: 'kahle Stellen Rasen, Rasen nachsäen',
    type: 'article',
  },
];

const mainPages: PageMeta[] = [
  {
    path: '/',
    title: 'Rasenpilot — KI-Rasenanalyse kostenlos | Lawn Score in 30 Sekunden',
    description: 'Lade ein Foto deines Rasens hoch und erhalte sofort deine persönliche KI-Diagnose mit Lawn Score und Pflegeplan. Kostenlos & ohne Anmeldung.',
    h1: 'Dein Rasen verdient das Beste — KI-Analyse in 30 Sekunden',
    content: 'Rasenpilot analysiert deinen Rasen mit künstlicher Intelligenz.',
    canonical: 'https://www.rasenpilot.com/',
    keywords: 'rasen analyse, rasen ki, rasenpflege app, lawn score',
  },
  {
    path: '/lawn-analysis',
    title: 'Kostenlose KI-Rasenanalyse | Rasenpilot',
    description: 'Starte jetzt deine kostenlose KI-Rasenanalyse. Foto hochladen und Lawn Score erhalten.',
    h1: 'Kostenlose KI-Rasenanalyse starten',
    content: 'Lade ein Foto deines Rasens hoch und unsere KI analysiert den Zustand.',
    canonical: 'https://www.rasenpilot.com/lawn-analysis',
    keywords: 'Rasenanalyse, KI Rasen, Lawn Score',
  },
  {
    path: '/subscription',
    title: 'Rasenpilot Premium — 9,99€/Monat | 7 Tage kostenlos testen',
    description: 'Unbegrenzte KI-Rasenanalysen, Pflegekalender, Krankheitserkennung. 7 Tage kostenlos testen.',
    h1: 'Rasenpilot Premium',
    content: 'Unbegrenzte KI-Rasenanalysen, persönlicher Pflegekalender und Wetter-Tipps.',
    canonical: 'https://www.rasenpilot.com/subscription',
    keywords: 'Rasenpilot Premium, Rasen Abo',
  },
  {
    path: '/blog-overview',
    title: 'Rasenpflege Ratgeber — Tipps & Tricks | Rasenpilot',
    description: 'Experten-Ratgeber zu Rasenpflege, Mähen, Düngen, Bewässerung und Rasenprobleme.',
    h1: 'Rasenpflege Ratgeber',
    content: 'Entdecke unsere Experten-Ratgeber zu allen Themen rund um die Rasenpflege.',
    canonical: 'https://www.rasenpilot.com/blog-overview',
    keywords: 'Rasenpflege Tipps, Rasen Ratgeber',
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
        "publisher": { "@type": "Organization", "name": "Rasenpilot", "url": "https://www.rasenpilot.com" },
        "inLanguage": "de",
      })
    : JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": page.title,
        "description": page.description,
        "url": page.canonical,
      });

  let html = templateHtml;
  html = html.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`);

  if (html.includes('<meta name="description"')) {
    html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${page.description}">`);
  } else {
    html = html.replace('</head>', `<meta name="description" content="${page.description}">\n</head>`);
  }

  html = html.replace('</head>', `<link rel="canonical" href="${page.canonical}">\n</head>`);
  if (page.keywords) {
    html = html.replace('</head>', `<meta name="keywords" content="${page.keywords}">\n</head>`);
  }
  html = html.replace('</head>', `<meta property="og:title" content="${page.title}">\n<meta property="og:description" content="${page.description}">\n<meta property="og:url" content="${page.canonical}">\n</head>`);

  const seoContent = `<div id="root"><div id="seo-content" style="position:absolute;left:-9999px"><h1>${page.h1}</h1><p>${page.content}</p></div>`;
  html = html.replace('<div id="root"></div>', `${seoContent}</div>`);
  html = html.replace('</head>', `<script type="application/ld+json">${structuredData}</script>\n</head>`);

  return html;
}

export function staticSeoPlugin(): Plugin {
  return {
    name: 'vite-plugin-static-seo',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');

      let templateHtml: string;
      try {
        templateHtml = fs.readFileSync(path.resolve(distDir, 'index.html'), 'utf-8');
      } catch {
        console.warn('[static-seo] Could not read dist/index.html, skipping');
        return;
      }

      const allPages = [...mainPages, ...blogArticles];

      for (const page of allPages) {
        const pagePath = page.path === '/' ? '/index' : page.path;
        const filePath = path.resolve(distDir, `${pagePath.slice(1)}/index.html`);

        try {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, generateStaticHtml(page, templateHtml), 'utf-8');
          console.log(`[static-seo] Generated: ${pagePath}`);
        } catch (err) {
          console.warn(`[static-seo] Failed: ${pagePath}`, err);
        }
      }

      console.log(`[static-seo] Generated ${allPages.length} static HTML pages`);
    }
  };
}
