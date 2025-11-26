import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PropertyStats {
  property_id: string;
  views_count: number;
  favorites_count: number;
  average_time_spent: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all properties with seller emails
    const { data: properties, error: propError } = await supabase
      .from("properties")
      .select("id, title, address, seller_email")
      .not("seller_email", "is", null)
      .eq("is_deleted", false);

    if (propError) throw propError;

    console.log(`Found ${properties.length} properties with seller emails`);

    // For each property, gather statistics and send email
    for (const property of properties) {
      try {
        // Get view statistics with timestamps for real-time analysis
        const { data: views, error: viewsError } = await supabase
          .from("property_views")
          .select("time_spent_seconds, view_started_at")
          .eq("property_id", property.id);

        if (viewsError) throw viewsError;

        const views_count = views.length;
        const average_time_spent = views_count > 0
          ? Math.round(views.reduce((sum, v) => sum + (v.time_spent_seconds || 0), 0) / views_count)
          : 0;

        // Calculate views in last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const recent_views = views.filter(v => v.view_started_at > last24Hours).length;

        // Get favorites with timestamps
        const { data: favorites, error: favError } = await supabase
          .from("favorites")
          .select("created_at")
          .eq("property_id", property.id);

        if (favError) throw favError;

        const favorites_count = favorites?.length || 0;
        const recent_favorites = favorites?.filter(f => f.created_at > last24Hours).length || 0;

        // Send statistics email
        const emailResponse = await resend.emails.send({
          from: "BaraHem Statistik <onboarding@resend.dev>",
          to: [property.seller_email],
          subject: `📊 Veckostatistik för ${property.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%)); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">BaraHem</h1>
                <p style="color: white; margin-top: 10px; opacity: 0.9;">📊 Utökad statistik i realtid</p>
              </div>
              
              <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333; margin-top: 0;">${property.title}</h2>
                <p style="color: #666; margin-bottom: 30px;">${property.address}</p>
                
                <!-- Real-time views section -->
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📈 Antal visningar i realtid</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="text-align: center; padding: 15px; background: #f0f9ff; border-radius: 8px;">
                      <div style="font-size: 32px; font-weight: bold; color: hsl(200 98% 35%);">${views_count}</div>
                      <div style="color: #666; margin-top: 5px; font-size: 14px;">Totalt antal visningar</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #e0f2fe; border-radius: 8px;">
                      <div style="font-size: 32px; font-weight: bold; color: hsl(200 98% 35%);">${recent_views}</div>
                      <div style="color: #666; margin-top: 5px; font-size: 14px;">Senaste 24h</div>
                    </div>
                  </div>
                </div>

                <!-- Time spent section -->
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">⏱️ Hur länge besökare tittar på annonsen</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="text-align: center; padding: 15px; background: #fef9e7; border-radius: 8px;">
                      <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${Math.floor(average_time_spent / 60)}:${String(average_time_spent % 60).padStart(2, '0')}</div>
                      <div style="color: #666; margin-top: 5px; font-size: 14px;">Genomsnittlig visningstid</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px;">
                      <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${Math.floor((average_time_spent * views_count) / 60)}</div>
                      <div style="color: #666; margin-top: 5px; font-size: 14px;">Total minuter</div>
                    </div>
                  </div>
                </div>

                <!-- Favorites section -->
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">❤️ Antal som sparat som favorit</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                      <div style="font-size: 32px; font-weight: bold; color: hsl(142 76% 30%);">${favorites_count}</div>
                      <div style="color: #666; margin-top: 5px; font-size: 14px;">Totalt antal favoriter</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #dcfce7; border-radius: 8px;">
                      <div style="font-size: 32px; font-weight: bold; color: hsl(142 76% 30%);">${recent_favorites}</div>
                      <div style="color: #666; margin-top: 5px; font-size: 14px;">Nya senaste 24h</div>
                    </div>
                  </div>
                </div>

                <!-- Image clicks section - coming soon -->
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; opacity: 0.6;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📸 Vilka bilder som klickas mest</h3>
                  <div style="text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">
                    <div style="color: #666; font-style: italic;">Bildinteraktionsdata kommer snart</div>
                  </div>
                </div>

                <!-- Geographic distribution - coming soon -->
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; opacity: 0.6;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">🌍 Geografisk fördelning av besökare</h3>
                  <div style="text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">
                    <div style="color: #666; font-style: italic;">Geografisk data kommer snart</div>
                  </div>
                </div>
                
                <div style="background: linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%)); padding: 20px; border-radius: 8px; text-align: center;">
                  <p style="color: white; margin: 0 0 15px 0; font-size: 16px;">
                    ${views_count > 0 
                      ? "Din bostad får bra uppmärksamhet! Fortsätt så." 
                      : "Förbättra dina bilder och beskrivning för att få fler visningar."}
                  </p>
                  <a href="https://barahem.se/fastighet/${property.id}" 
                     style="background: white; 
                            color: hsl(200 98% 35%); 
                            padding: 12px 30px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            display: inline-block;
                            font-weight: bold;">
                    Se din annons
                  </a>
                </div>
              </div>
              
              <div style="background: #333; padding: 20px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} BaraHem. Alla rättigheter förbehållna.
                </p>
                <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                  Du får detta mail eftersom din mäklare har registrerat din e-post för statistikrapporter.
                </p>
              </div>
            </div>
          `,
        });

        console.log(`Statistics email sent to ${property.seller_email} for property ${property.id}`);
      } catch (error) {
        console.error(`Error sending statistics for property ${property.id}:`, error);
        // Continue with next property
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        properties_processed: properties.length 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-property-statistics function:", error);
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
