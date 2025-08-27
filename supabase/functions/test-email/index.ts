import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== EMAIL TEST FUNCTION ===");
    
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email parameter is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Check if API key exists
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey?.length || 0);
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY not configured",
          details: "Please add the RESEND_API_KEY secret in your Supabase project"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const resend = new Resend(apiKey);

    // Send test email with the verified sender from Resend
    console.log(`Attempting to send test email to: ${email}`);
    
    const emailResponse = await resend.emails.send({
      from: "Lovable <onboarding@resend.dev>", // Use Resend's verified domain for testing
      to: [email],
      subject: "Email Function Test - RasenPilot",
      html: `
        <h1>Email Test Successful! ✅</h1>
        <p>This test email confirms that:</p>
        <ul>
          <li>✅ RESEND_API_KEY is configured correctly</li>
          <li>✅ Supabase Edge Function is working</li>
          <li>✅ Email delivery is functional</li>
        </ul>
        <p><strong>Next steps:</strong></p>
        <ol>
          <li>Verify your domain in Resend: <a href="https://resend.com/domains">https://resend.com/domains</a></li>
          <li>Update the "from" address in your email functions to use your verified domain</li>
          <li>Test your actual email functions</li>
        </ol>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: "Test email sent successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in test-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check the function logs for more details"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});