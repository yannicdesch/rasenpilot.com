import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
];

const LOCAL_PAGES = [
  "berlin", "hamburg", "munich", "cologne", "frankfurt", "stuttgart",
  "dusseldorf", "dortmund", "essen", "leipzig", "bremen", "dresden",
  "hannover", "nuremberg", "bonn",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const today = new Date().toISOString().split("T")[0];

    // Fetch only published posts (excludes 'redirect' and 'draft')
    const allPosts: { slug: string; updated_at: string | null; date: string }[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, updated_at, date")
        .eq("status", "published")
        .is("redirect_to", null)
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;
      allPosts.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of STATIC_PAGES) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Local pages
    for (const city of LOCAL_PAGES) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/local/${city}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    // Blog posts (only published, non-redirected)
    for (const post of allPosts) {
      const lastmod = post.updated_at
        ? post.updated_at.split("T")[0]
        : post.date;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(`<!-- Error generating sitemap: ${error.message} -->`, {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
});
