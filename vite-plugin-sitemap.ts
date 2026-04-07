import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { Plugin } from "vite";

interface SitemapPluginOptions {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

interface SitemapPost {
  slug: string;
  updated_at: string | null;
  date: string;
}

const BASE_URL = "https://www.rasenpilot.com";
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/lawn-analysis", priority: "0.9", changefreq: "weekly" },
  { path: "/blog-overview", priority: "0.9", changefreq: "daily" },
  { path: "/subscription", priority: "0.8", changefreq: "weekly" },
  { path: "/highscore", priority: "0.7", changefreq: "daily" },
  { path: "/weather-advice", priority: "0.7", changefreq: "daily" },
  { path: "/season-guide", priority: "0.7", changefreq: "monthly" },
  { path: "/ueber-uns", priority: "0.5", changefreq: "monthly" },
  { path: "/kontakt", priority: "0.5", changefreq: "monthly" },
  { path: "/rasenpflege-oesterreich", priority: "0.8", changefreq: "monthly" },
  { path: "/rasenpflege-schweiz", priority: "0.8", changefreq: "monthly" },
] as const;

const LOCAL_PAGES = [
  "berlin",
  "hamburg",
  "munich",
  "cologne",
  "frankfurt",
  "stuttgart",
  "dusseldorf",
  "dortmund",
  "essen",
  "leipzig",
  "bremen",
  "dresden",
  "hannover",
  "nuremberg",
  "bonn",
] as const;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const formatUrlEntry = ({
  loc,
  lastmod,
  changefreq,
  priority,
}: {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

async function fetchPublishedBlogPosts(supabaseUrl: string, supabaseAnonKey: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, date")
    .eq("status", "published")
    .order("date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch published blog posts: ${error.message}`);
  }

  return (data ?? []) as SitemapPost[];
}

function generateSitemapXml(posts: SitemapPost[]) {
  const today = new Date().toISOString().split("T")[0];
  const entries: string[] = [];

  for (const page of STATIC_PAGES) {
    entries.push(
      formatUrlEntry({
        loc: `${BASE_URL}${page.path}`,
        lastmod: today,
        changefreq: page.changefreq,
        priority: page.priority,
      }),
    );
  }

  for (const city of LOCAL_PAGES) {
    entries.push(
      formatUrlEntry({
        loc: `${BASE_URL}/local/${city}`,
        lastmod: today,
        changefreq: "monthly",
        priority: "0.6",
      }),
    );
  }

  for (const post of posts) {
    const lastmod = (post.updated_at ?? post.date ?? today).split("T")[0];

    entries.push(
      formatUrlEntry({
        loc: `${BASE_URL}/blog/${post.slug}`,
        lastmod,
        changefreq: "monthly",
        priority: "0.7",
      }),
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;
}

export function sitemapPlugin({ supabaseUrl, supabaseAnonKey }: SitemapPluginOptions): Plugin {
  return {
    name: "vite-plugin-sitemap",
    apply: "build",
    async closeBundle() {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("[sitemap] Missing Supabase env vars, skipping sitemap generation.");
        return;
      }

      try {
        const posts = await fetchPublishedBlogPosts(supabaseUrl, supabaseAnonKey);
        const xml = generateSitemapXml(posts);
        const outputPath = path.resolve(process.cwd(), "dist", "sitemap.xml");

        fs.writeFileSync(outputPath, xml, "utf-8");

        console.log(
          `[sitemap] Generated ${outputPath} with ${STATIC_PAGES.length + LOCAL_PAGES.length + posts.length} URLs (${posts.length} blog posts).`,
        );
      } catch (error) {
        console.error("[sitemap] Failed to generate sitemap:", error);
        throw error;
      }
    },
  };
}
