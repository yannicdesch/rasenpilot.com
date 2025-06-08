
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: {
    secureFileName: string;
    fileSize: number;
    mimeType: string;
    dimensions?: { width: number; height: number };
  };
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSIONS = 4096;

async function validateImage(imageData: Uint8Array, originalFileName: string): Promise<ImageValidationResult> {
  const errors: string[] = [];
  
  // Check file size
  if (imageData.length > MAX_FILE_SIZE) {
    errors.push(`File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  // Check file signature (magic bytes)
  const signature = Array.from(imageData.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  let mimeType = '';
  if (signature.startsWith('ffd8ff')) {
    mimeType = 'image/jpeg';
  } else if (signature.startsWith('89504e47')) {
    mimeType = 'image/png';
  } else if (signature.startsWith('52494646') && signature.includes('57454250')) {
    mimeType = 'image/webp';
  } else {
    errors.push('Invalid image format. Only JPEG, PNG, and WebP are allowed.');
  }
  
  if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
    errors.push(`Unsupported image type: ${mimeType}`);
  }
  
  // Generate secure filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  const secureFileName = `${timestamp}_${randomString}.${extension}`;
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? {
      secureFileName,
      fileSize: imageData.length,
      mimeType,
    } : undefined
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const originalFileName = formData.get('originalFileName') as string;

      if (!file || !originalFileName) {
        return new Response(
          JSON.stringify({ error: 'File and originalFileName are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Convert file to Uint8Array
      const imageData = new Uint8Array(await file.arrayBuffer());

      // Validate image
      const validation = await validateImage(imageData, originalFileName);

      if (!validation.isValid) {
        return new Response(
          JSON.stringify({ 
            error: 'Image validation failed', 
            details: validation.errors 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log security event
      await supabaseClient.from('events').insert({
        category: 'security',
        action: 'secure_image_upload',
        label: user.email || user.id,
        value: JSON.stringify({
          originalFileName,
          secureFileName: validation.sanitizedData?.secureFileName,
          fileSize: validation.sanitizedData?.fileSize,
          mimeType: validation.sanitizedData?.mimeType
        })
      });

      return new Response(
        JSON.stringify({
          success: true,
          secureFileName: validation.sanitizedData?.secureFileName,
          fileSize: validation.sanitizedData?.fileSize,
          mimeType: validation.sanitizedData?.mimeType
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Secure image upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
