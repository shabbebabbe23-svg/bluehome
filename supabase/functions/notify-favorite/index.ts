import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyFavoriteRequest {
  property_id: string;
  property_title: string;
  property_address: string;
  agent_email: string;
  agent_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { property_id, property_title, property_address, agent_email, agent_name }: NotifyFavoriteRequest = await req.json();

    console.log("Sending favorite notification to:", agent_email);

    const emailResponse = await resend.emails.send({
      from: "BaraHem <onboarding@resend.dev>",
      to: [agent_email],
      subject: `🏠 Din bostad har sparats som favorit!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%)); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">BaraHem</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Hej ${agent_name}!</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Någon har just sparat din bostad som favorit! 🎉
            </p>
            
            <div style="background: white; border-left: 4px solid hsl(200 98% 35%); padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${property_title}</h3>
              <p style="margin: 0; color: #666;">${property_address}</p>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6;">
              Detta visar att din bostad väcker intresse hos potentiella köpare. Fortsätt det goda arbetet!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://barahem.se/fastighet/${property_id}" 
                 style="background: linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%)); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Se bostaden
              </a>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} BaraHem. Alla rättigheter förbehållna.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Favorite notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-favorite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
