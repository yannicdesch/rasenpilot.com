import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function fixContent(content: string): string {
  if (!content) return content;

  let fixed = content;

  // 1. Sie → du replacements (careful ordering to avoid double-replacements)
  const replacements: [RegExp, string][] = [
    // Possessive forms first (longer matches)
    [/\bIhres\b/g, "deines"],
    [/\bIhrem\b/g, "deinem"],
    [/\bIhren\b/g, "deinen"],
    [/\bIhrer\b/g, "deiner"],
    [/\bIhre\b/g, "deine"],
    [/\bIhr\b/g, "dein"],
    [/\bIhnen\b/g, "dir"],
    // Verbs with Sie
    [/\bSie haben\b/g, "du hast"],
    [/\bSie sind\b/g, "du bist"],
    [/\bSie werden\b/g, "du wirst"],
    [/\bSie können\b/g, "du kannst"],
    [/\bSie sollten\b/g, "du solltest"],
    [/\bSie müssen\b/g, "du musst"],
    [/\bSie wollen\b/g, "du willst"],
    [/\bSie möchten\b/g, "du möchtest"],
    [/\bSie wissen\b/g, "du weißt"],
    [/\bSie kennen\b/g, "du kennst"],
    [/\bSie brauchen\b/g, "du brauchst"],
    [/\bSie sehen\b/g, "du siehst"],
    [/\bSie finden\b/g, "du findest"],
    [/\bSie machen\b/g, "du machst"],
    [/\bSie geben\b/g, "du gibst"],
    [/\bSie nehmen\b/g, "du nimmst"],
    [/\bSie lesen\b/g, "du liest"],
    [/\bSie erhalten\b/g, "du erhältst"],
    [/\bSie erreichen\b/g, "du erreichst"],
    [/\bSie vermeiden\b/g, "du vermeidest"],
    [/\bSie nutzen\b/g, "du nutzt"],
    [/\bSie verwenden\b/g, "du verwendest"],
    [/\bSie achten\b/g, "du achtest"],
    [/\bSie sorgen\b/g, "du sorgst"],
    [/\bSie pflegen\b/g, "du pflegst"],
    [/\bSie gießen\b/g, "du gießt"],
    [/\bSie düngen\b/g, "du düngst"],
    [/\bSie mähen\b/g, "du mähst"],
    [/\bSie schneiden\b/g, "du schneidest"],
    [/\bSie planen\b/g, "du planst"],
    [/\bSie starten\b/g, "du startest"],
    [/\bSie beginnen\b/g, "du beginnst"],
    // Imperative/generic "Sie" at sentence positions
    [/\berfahren Sie\b/gi, "erfährst du"],
    [/\bEntdecken Sie\b/gi, "Entdecke"],
    [/\bLesen Sie\b/gi, "Lies"],
    [/\bSchauen Sie\b/gi, "Schau"],
    [/\bProbieren Sie\b/gi, "Probiere"],
    [/\bNutzen Sie\b/gi, "Nutze"],
    [/\bVerwenden Sie\b/gi, "Verwende"],
    [/\bAchten Sie\b/gi, "Achte"],
    [/\bSorgen Sie\b/gi, "Sorge"],
    [/\bBeachten Sie\b/gi, "Beachte"],
    [/\bStellen Sie\b/gi, "Stelle"],
    [/\bMachen Sie\b/gi, "Mach"],
    [/\bGeben Sie\b/gi, "Gib"],
    [/\bNehmen Sie\b/gi, "Nimm"],
    [/\bLassen Sie\b/gi, "Lass"],
    [/\bVersuchen Sie\b/gi, "Versuch"],
    [/\bWählen Sie\b/gi, "Wähle"],
    [/\bPrüfen Sie\b/gi, "Prüfe"],
    [/\bTragen Sie\b/gi, "Trag"],
    [/\bBringen Sie\b/gi, "Bring"],
    [/\bHolen Sie\b/gi, "Hol"],
    [/\bStarten Sie\b/gi, "Starte"],
    [/\bBeginnen Sie\b/gi, "Beginne"],
    [/\bVermeiden Sie\b/gi, "Vermeide"],
    [/\bFragen Sie\b/gi, "Frag"],
    [/\bHalten Sie\b/gi, "Halte"],
    [/\bÜberprüfen Sie\b/gi, "Überprüfe"],
    [/\bInformieren Sie sich\b/gi, "Informiere dich"],
    // Remaining standalone Sie (only mid-sentence, lowercase context likely formal)
    [/\b([a-zäöü]) Sie\b/g, "$1 du"],
  ];

  for (const [pattern, replacement] of replacements) {
    fixed = fixed.replace(pattern, replacement);
  }

  // 2. Remove markdown bold markers ** but keep text
  fixed = fixed.replace(/\*\*([^*]+)\*\*/g, "$1");

  // 3. Remove broken link syntax [text](#) or [text](url)
  fixed = fixed.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // 4. Remove "Interne Verlinkungen" lines
  fixed = fixed.replace(/^.*Interne Verlinkungen?\s*[-–:].*/gm, "");

  // 5. Remove raw --- horizontal rules
  fixed = fixed.replace(/^-{3,}$/gm, "<hr>");

  // 6. Fix the broken CTA at the end
  fixed = fixed.replace(
    /Machen Sie jetzt den ersten Schritt.*?(?:Rasenanalyse.*?starten!?\s*\(#\)|starten!\s*$)/gis,
    "<p>Mach jetzt den ersten Schritt zu einem perfekten Rasen:</p>\n<a href='/lawn-analysis'>Kostenlose Rasenanalyse starten →</a>"
  );

  // Also fix du-form CTA if partially converted
  fixed = fixed.replace(
    /Mach jetzt den ersten Schritt.*?Rasenanalyse.*?starten!?\s*\(#\)/gis,
    "<p>Mach jetzt den ersten Schritt zu einem perfekten Rasen:</p>\n<a href='/lawn-analysis'>Kostenlose Rasenanalyse starten →</a>"
  );

  // 7. Clean up extra blank lines
  fixed = fixed.replace(/\n{4,}/g, "\n\n\n");

  return fixed.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let totalFixed = 0;
    let offset = 0;
    const batchSize = 50;

    while (true) {
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("id, content, author, image, title")
        .eq("status", "published")
        .order("id", { ascending: true })
        .range(offset, offset + batchSize - 1);

      if (error) throw error;
      if (!posts || posts.length === 0) break;

      for (const post of posts) {
        const fixedContent = fixContent(post.content || "");
        const needsUpdate =
          fixedContent !== post.content ||
          post.author !== "Rasenpilot Team" ||
          !post.image ||
          post.image === "/placeholder.svg" ||
          post.image?.includes("lovable-uploads/2d49b520");

        if (needsUpdate) {
          const keyword = extractKeyword(post.title);
          const topicImage = getTopicImage(keyword);

          const updateData: Record<string, unknown> = {
            content: fixedContent,
            author: "Rasenpilot Team",
            updated_at: new Date().toISOString(),
          };

          if (
            !post.image ||
            post.image === "/placeholder.svg" ||
            post.image?.includes("lovable-uploads/2d49b520")
          ) {
            updateData.image = topicImage;
          }

          const { error: updateError } = await supabase
            .from("blog_posts")
            .update(updateData)
            .eq("id", post.id);

          if (updateError) {
            console.error(`Error updating post ${post.id}:`, updateError);
          } else {
            totalFixed++;
          }
        }
      }

      offset += batchSize;
      console.log(`Processed ${offset} posts, fixed ${totalFixed} so far...`);
    }

    return new Response(
      JSON.stringify({ success: true, total_fixed: totalFixed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fixing blog articles:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractKeyword(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("moos")) return "moss";
  if (lower.includes("bewässer") || lower.includes("giess") || lower.includes("gieß")) return "watering";
  if (lower.includes("düng")) return "fertilizer";
  if (lower.includes("mäh") || lower.includes("schnitt")) return "mowing";
  if (lower.includes("frühling") || lower.includes("frühjahr")) return "spring";
  if (lower.includes("sommer") || lower.includes("hitze") || lower.includes("trocken")) return "summer";
  if (lower.includes("herbst")) return "autumn";
  if (lower.includes("winter") || lower.includes("frost")) return "winter";
  if (lower.includes("unkraut")) return "weeds";
  if (lower.includes("vertikut")) return "scarify";
  if (lower.includes("kahl") || lower.includes("nachsä") || lower.includes("lück")) return "patchy";
  if (lower.includes("roboter") || lower.includes("mähroboter")) return "robot";
  if (lower.includes("krankheit") || lower.includes("pilz")) return "disease";
  if (lower.includes("boden") || lower.includes("erde")) return "soil";
  if (lower.includes("kalk")) return "lime";
  if (lower.includes("schatten")) return "shade";
  if (lower.includes("samen") || lower.includes("saat")) return "seeds";
  if (lower.includes("rollrasen")) return "sod";
  if (lower.includes("kante")) return "edge";
  return "lawn";
}

function getTopicImage(keyword: string): string {
  const images: Record<string, string> = {
    moss: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=400&fit=crop",
    watering: "https://images.unsplash.com/photo-1563404361-baf8a07a9e44?w=800&h=400&fit=crop",
    fertilizer: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop",
    mowing: "https://images.unsplash.com/photo-1558635924-f03b6c476571?w=800&h=400&fit=crop",
    spring: "https://images.unsplash.com/photo-1462275646964-a0e3c11f18a6?w=800&h=400&fit=crop",
    summer: "https://images.unsplash.com/photo-1501004318855-e7dea0d5a5dc?w=800&h=400&fit=crop",
    autumn: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    winter: "https://images.unsplash.com/photo-1457269449834-928af64c684d?w=800&h=400&fit=crop",
    weeds: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800&h=400&fit=crop",
    scarify: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&h=400&fit=crop",
    patchy: "https://images.unsplash.com/photo-1558635924-f03b6c476571?w=800&h=400&fit=crop",
    robot: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&h=400&fit=crop",
    disease: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=400&fit=crop",
    soil: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop",
    lime: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop",
    shade: "https://images.unsplash.com/photo-1462275646964-a0e3c11f18a6?w=800&h=400&fit=crop",
    seeds: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop",
    sod: "https://images.unsplash.com/photo-1558635924-f03b6c476571?w=800&h=400&fit=crop",
    edge: "https://images.unsplash.com/photo-1558635924-f03b6c476571?w=800&h=400&fit=crop",
    lawn: "https://images.unsplash.com/photo-1558635924-f03b6c476571?w=800&h=400&fit=crop",
  };
  return images[keyword] || images.lawn;
}
