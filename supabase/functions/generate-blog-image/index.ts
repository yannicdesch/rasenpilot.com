import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, slug } = await req.json();
    console.log('[GENERATE-BLOG-IMAGE] Generating image for:', title);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate image using Lovable AI
    const prompt = `Create a high-quality, professional blog header image for an article about lawn care titled: "${title}". 
    The image should show a beautiful, healthy green lawn with professional photography style. 
    Use natural lighting, vibrant green colors, and a clean modern aesthetic. 
    The image should be suitable as a blog post header image. 16:9 aspect ratio.`;

    console.log('[GENERATE-BLOG-IMAGE] Calling Lovable AI with prompt:', prompt);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[GENERATE-BLOG-IMAGE] AI Error:', aiResponse.status, errorText);
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image URL in AI response");
    }

    console.log('[GENERATE-BLOG-IMAGE] Image generated successfully');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Convert base64 to blob
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Upload to Supabase Storage
    const fileName = `blog-${slug}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lawn-images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('[GENERATE-BLOG-IMAGE] Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('lawn-images')
      .getPublicUrl(fileName);

    console.log('[GENERATE-BLOG-IMAGE] Image uploaded to:', publicUrl);

    // Update blog post with image URL
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ image: publicUrl })
      .eq('slug', slug);

    if (updateError) {
      console.error('[GENERATE-BLOG-IMAGE] Update error:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: publicUrl 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[GENERATE-BLOG-IMAGE] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate blog image'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});