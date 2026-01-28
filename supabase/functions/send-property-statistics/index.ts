import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const body = await req.json().catch(() => ({}));
    
    // Security: Validate authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - missing authorization" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // Check if it's a service role request (from internal triggers)
    const isServiceRole = token === serviceRoleKey;
    
    let userId: string | null = null;
    
    if (!isServiceRole) {
      // Verify JWT token by decoding and checking with Supabase
      // Use the admin client to verify the user exists
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error("Unauthorized request rejected - invalid token", authError);
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      userId = user.id;
      
      // Check if user has maklare or admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_type")
        .eq("user_id", user.id)
        .single();
      
      const allowedRoles = ["maklare", "agency_admin", "superadmin"];
      if (!roles || !allowedRoles.includes(roles.user_type)) {
        console.error("Unauthorized request - insufficient permissions");
        return new Response(
          JSON.stringify({ error: "Forbidden - insufficient permissions" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Check if this is a "sold" notification for a specific property
    if (body.property_id && body.is_sold) {
      console.log(`Sending sold notification for property ${body.property_id}`);
      
      // Security: Validate property exists and is actually sold
      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id, title, address, seller_email, sold_price, sold_date, is_sold")
        .eq("id", body.property_id)
        .single();

      if (propError || !property) {
        console.error("Property not found:", propError);
        return new Response(
          JSON.stringify({ error: "Property not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      // Verify property is actually sold (prevents unauthorized email triggers)
      if (!property.is_sold) {
        console.error("Security: Attempted to send sold notification for non-sold property");
        return new Response(
          JSON.stringify({ error: "Property is not marked as sold" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      if (!property.seller_email) {
        console.log("No seller email for property, skipping notification");
        return new Response(
          JSON.stringify({ success: true, message: "No seller email configured" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get final statistics for sold property
      const { data: views } = await supabase
        .from("property_views")
        .select("time_spent_seconds, view_started_at")
        .eq("property_id", property.id);

      const views_count = views?.length || 0;
      const average_time_spent = views_count > 0 && views
        ? Math.round(views.reduce((sum, v) => sum + (v.time_spent_seconds || 0), 0) / views_count)
        : 0;

      const { data: favorites } = await supabase
        .from("favorites")
        .select("created_at")
        .eq("property_id", property.id);

      const favorites_count = favorites?.length || 0;

      // Send "property sold" email
      await resend.emails.send({
        from: "BaraHem <noreply@info.barahem.se>",
        to: [property.seller_email],
        subject: `🎉 Grattis! ${property.title} är såld!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%)); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 36px;">🎉 Grattis!</h1>
              <p style="color: white; margin-top: 15px; font-size: 18px; opacity: 0.95;">Din bostad är såld</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">${property.title}</h2>
              <p style="color: #666; margin-bottom: 30px;">${property.address}</p>
              
              ${property.sold_price ? `
                <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; padding: 25px; margin-bottom: 30px; text-align: center;">
                  <div style="color: white; font-size: 16px; opacity: 0.9; margin-bottom: 10px;">Slutpris</div>
                  <div style="color: white; font-size: 42px; font-weight: bold;">${property.sold_price.toLocaleString('sv-SE')} kr</div>
                </div>
              ` : ''}
              
              <div style="background: white; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; text-align: center;">📊 Slutlig statistik för din annons</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                  <div style="text-align: center; padding: 20px; background: #f0f9ff; border-radius: 8px;">
                    <div style="font-size: 36px; font-weight: bold; color: hsl(200 98% 35%);">${views_count}</div>
                    <div style="color: #666; margin-top: 5px;">Totalt visningar</div>
                  </div>
                  
                  <div style="text-align: center; padding: 20px; background: #f0fdf4; border-radius: 8px;">
                    <div style="font-size: 36px; font-weight: bold; color: hsl(142 76% 30%);">${favorites_count}</div>
                    <div style="color: #666; margin-top: 5px;">Favoriter</div>
                  </div>
                </div>
                
                <div style="text-align: center; padding: 20px; background: #fef9e7; border-radius: 8px;">
                  <div style="font-size: 36px; font-weight: bold; color: #f59e0b;">${Math.floor(average_time_spent / 60)}:${String(average_time_spent % 60).padStart(2, '0')}</div>
                  <div style="color: #666; margin-top: 5px;">Genomsnittlig visningstid</div>
                </div>
              </div>
              
              <div style="background: linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%)); padding: 25px; border-radius: 8px; text-align: center;">
                <p style="color: white; margin: 0; font-size: 16px; line-height: 1.6;">
                  Tack för att du valde BaraHem för att sälja din bostad! 
                  Vi hoppas att du är nöjd med resultatet och önskar dig lycka till i ditt nya hem.
                </p>
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

      console.log(`Sold notification sent to ${property.seller_email}`);
      
      return new Response(
        JSON.stringify({ success: true, type: "sold_notification" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if this is a single property statistics request (agent sending to seller)
    if (body.property_id && !body.is_sold) {
      console.log(`Sending statistics email for property ${body.property_id}`);
      
      const { data: property, error: propError } = await supabase
        .from("properties")
        .select("id, title, address, seller_email, image_url, additional_images")
        .eq("id", body.property_id)
        .single();

      if (propError || !property) {
        console.error("Property not found:", propError);
        return new Response(
          JSON.stringify({ error: "Property not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      if (!property.seller_email) {
        console.log("No seller email for property, skipping notification");
        return new Response(
          JSON.stringify({ success: false, message: "No seller email configured" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get view statistics
      const { data: views } = await supabase
        .from("property_views")
        .select("time_spent_seconds, view_started_at")
        .eq("property_id", property.id);

      const views_count = views?.length || 0;
      const average_time_spent = views_count > 0 && views
        ? Math.round(views.reduce((sum, v) => sum + (v.time_spent_seconds || 0), 0) / views_count)
        : 0;

      // Calculate views in last 24 hours
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recent_views = views?.filter(v => v.view_started_at > last24Hours).length || 0;

      // Get favorites
      const { data: favorites } = await supabase
        .from("favorites")
        .select("created_at")
        .eq("property_id", property.id);

      const favorites_count = favorites?.length || 0;
      const recent_favorites = favorites?.filter(f => f.created_at > last24Hours).length || 0;

      // Get image view statistics
      const { data: imageViews } = await supabase
        .from("image_views")
        .select("image_index, image_url")
        .eq("property_id", property.id);

      const total_image_clicks = imageViews?.length || 0;
      
      // Calculate most viewed image
      const imageViewCounts: { [key: number]: { count: number; url: string | null } } = {};
      imageViews?.forEach(iv => {
        if (!imageViewCounts[iv.image_index]) {
          imageViewCounts[iv.image_index] = { count: 0, url: iv.image_url };
        }
        imageViewCounts[iv.image_index].count++;
      });

      // Find the most viewed image
      let mostViewedImageIndex = -1;
      let mostViewedImageCount = 0;
      let mostViewedImageUrl = '';
      
      Object.entries(imageViewCounts).forEach(([index, data]) => {
        if (data.count > mostViewedImageCount) {
          mostViewedImageIndex = parseInt(index);
          mostViewedImageCount = data.count;
          mostViewedImageUrl = data.url || '';
        }
      });

      // Get top 3 most viewed images
      const topImages = Object.entries(imageViewCounts)
        .map(([index, data]) => ({
          index: parseInt(index),
          count: data.count,
          url: data.url || ''
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Get all images for display
      const allImages = [property.image_url, ...(property.additional_images || [])].filter(Boolean);
      const mostViewedImageLabel = mostViewedImageIndex === 0 ? 'Huvudbilden' : `Bild ${mostViewedImageIndex + 1}`;
      
      // Generate HTML for top images
      const topImagesHtml = topImages.length > 0 ? topImages.map((img, rank) => {
        const label = img.index === 0 ? 'Huvudbilden' : `Bild ${img.index + 1}`;
        const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉';
        return `
          <tr>
            ${img.url ? `
            <td style="padding: 8px 15px 8px 0; vertical-align: middle;">
              <img src="${img.url}" alt="${label}" width="60" height="45" style="width: 60px; height: 45px; object-fit: cover; border-radius: 4px; display: block;" />
            </td>
            ` : ''}
            <td style="vertical-align: middle; padding: 8px 0;">
              <div style="color: #333; font-size: 14px;">${medal} ${label}</div>
            </td>
            <td style="vertical-align: middle; text-align: right; padding: 8px 0;">
              <div style="color: #9333ea; font-weight: bold;">${img.count} visningar</div>
            </td>
          </tr>
        `;
      }).join('') : '';

      // Send statistics email
      await resend.emails.send({
        from: "BaraHem <noreply@info.barahem.se>",
        to: [property.seller_email],
        subject: `📊 Statistik för ${property.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%)); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">BaraHem</h1>
              <p style="color: white; margin-top: 10px; opacity: 0.9;">📊 Statistik för ditt objekt</p>
            </div>
            
            ${property.image_url ? `
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding: 0;">
                  <img src="${property.image_url}" alt="${property.title}" width="600" style="width: 100%; height: auto; display: block; border: 0;" />
                </td>
              </tr>
            </table>
            ` : ''}
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">${property.title}</h2>
              <p style="color: #666; margin-bottom: 30px;">${property.address}</p>
              
              <!-- Views section -->
              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📈 Antal visningar</h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="50%" style="padding: 0 7px 0 0;">
                      <div style="text-align: center; padding: 15px; background: #f0f9ff; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0369a1;">${views_count}</div>
                        <div style="color: #666; margin-top: 5px; font-size: 14px;">Totalt antal visningar</div>
                      </div>
                    </td>
                    <td width="50%" style="padding: 0 0 0 7px;">
                      <div style="text-align: center; padding: 15px; background: #e0f2fe; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #0369a1;">${recent_views}</div>
                        <div style="color: #666; margin-top: 5px; font-size: 14px;">Senaste 24h</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Time spent section -->
              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">⏱️ Hur länge besökare tittar på annonsen</h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="50%" style="padding: 0 7px 0 0;">
                      <div style="text-align: center; padding: 15px; background: #fef9e7; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${Math.floor(average_time_spent / 60)}:${String(average_time_spent % 60).padStart(2, '0')}</div>
                        <div style="color: #666; margin-top: 5px; font-size: 14px;">Genomsnittlig visningstid</div>
                      </div>
                    </td>
                    <td width="50%" style="padding: 0 0 0 7px;">
                      <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${Math.floor((average_time_spent * views_count) / 60)}</div>
                        <div style="color: #666; margin-top: 5px; font-size: 14px;">Total minuter</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Favorites section -->
              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">❤️ Antal som sparat som favorit</h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="50%" style="padding: 0 7px 0 0;">
                      <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #15803d;">${favorites_count}</div>
                        <div style="color: #666; margin-top: 5px; font-size: 14px;">Totalt antal favoriter</div>
                      </div>
                    </td>
                    <td width="50%" style="padding: 0 0 0 7px;">
                      <div style="text-align: center; padding: 15px; background: #dcfce7; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #15803d;">${recent_favorites}</div>
                        <div style="color: #666; margin-top: 5px; font-size: 14px;">Nya senaste 24h</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Image clicks section -->
              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📸 Bildstatistik</h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
                  <tr>
                    <td width="50%" style="padding: 0 7px 0 0;">
                      <div style="text-align: center; padding: 15px; background: #faf5ff; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #9333ea;">${total_image_clicks}</div>
                        <div style="color: #666; margin-top: 5px; font-size: 14px;">Totalt bildklick</div>
                      </div>
                    </td>
                    <td width="50%" style="padding: 0 0 0 7px;">
                      <div style="text-align: center; padding: 15px; background: #f3e8ff; border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #9333ea;">${allImages.length}</div>
                        <div style="color: #666; margin-top: 5px; font-size: 14px;">Antal bilder</div>
                      </div>
                    </td>
                  </tr>
                </table>
                ${topImages.length > 0 ? `
                <div style="background: #f8fafc; border-radius: 8px; padding: 15px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 14px; color: #64748b; margin-bottom: 10px;">🏆 Mest visade bilderna</div>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    ${topImagesHtml}
                  </table>
                </div>
                ` : `
                <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; color: #64748b;">
                  Inga bildklick registrerade ännu
                </div>
                `}
              </div>
              
              <div style="background: linear-gradient(135deg, #0369a1, #15803d); padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: white; margin: 0 0 15px 0; font-size: 16px;">
                  ${views_count > 0 
                    ? "Din bostad får bra uppmärksamhet! Fortsätt så." 
                    : "Förbättra dina bilder och beskrivning för att få fler visningar."}
                </p>
                <a href="https://barahem.se/fastighet/${property.id}" 
                   style="background: white; 
                          color: #0369a1; 
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
                Du får detta mail eftersom din mäklare har skickat statistikrapporten till dig.
              </p>
            </div>
          </div>
        `,
      });

      console.log(`Statistics email sent to ${property.seller_email}`);
      
      return new Response(
        JSON.stringify({ success: true, type: "statistics_email", email: property.seller_email }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Otherwise, this is a monthly scheduled statistics email
    console.log("Sending monthly statistics emails to all properties");

    // Fetch all active properties with seller emails
    const { data: properties, error: propError } = await supabase
      .from("properties")
      .select("id, title, address, seller_email, image_url, additional_images")
      .not("seller_email", "is", null)
      .eq("is_deleted", false)
      .eq("is_sold", false);

    if (propError) throw propError;

    console.log(`Found ${properties.length} active properties with seller emails`);

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

        // Get image view statistics
        const { data: imageViews } = await supabase
          .from("image_views")
          .select("image_index, image_url")
          .eq("property_id", property.id);

        const total_image_clicks = imageViews?.length || 0;
        
        // Calculate most viewed image
        const imageViewCounts: { [key: number]: { count: number; url: string | null } } = {};
        imageViews?.forEach(iv => {
          if (!imageViewCounts[iv.image_index]) {
            imageViewCounts[iv.image_index] = { count: 0, url: iv.image_url };
          }
          imageViewCounts[iv.image_index].count++;
        });

        // Find the most viewed image
        let mostViewedImageIndex = -1;
        let mostViewedImageCount = 0;
        let mostViewedImageUrl = '';
        
        Object.entries(imageViewCounts).forEach(([index, data]) => {
          if (data.count > mostViewedImageCount) {
            mostViewedImageIndex = parseInt(index);
            mostViewedImageCount = data.count;
            mostViewedImageUrl = data.url || '';
          }
        });

        // Get all images for display
        const allImages = [property.image_url, ...(property.additional_images || [])].filter(Boolean);
        const mostViewedImageLabel = mostViewedImageIndex === 0 ? 'Huvudbilden' : `Bild ${mostViewedImageIndex + 1}`;

        // Send statistics email
        const emailResponse = await resend.emails.send({
          from: "BaraHem <noreply@info.barahem.se>",
          to: [property.seller_email],
          subject: `📊 Månadsstatistik för ${property.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0369a1, #15803d); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">BaraHem</h1>
                <p style="color: white; margin-top: 10px; opacity: 0.9;">📊 Månadsstatistik för ditt objekt</p>
              </div>
              
              ${property.image_url ? `
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0;">
                    <img src="${property.image_url}" alt="${property.title}" width="600" style="width: 100%; height: auto; display: block; border: 0;" />
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333; margin-top: 0;">${property.title}</h2>
                <p style="color: #666; margin-bottom: 30px;">${property.address}</p>
                
                <!-- Real-time views section -->
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📈 Antal visningar</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="50%" style="padding: 0 7px 0 0;">
                        <div style="text-align: center; padding: 15px; background: #f0f9ff; border-radius: 8px;">
                          <div style="font-size: 32px; font-weight: bold; color: #0369a1;">${views_count}</div>
                          <div style="color: #666; margin-top: 5px; font-size: 14px;">Totalt antal visningar</div>
                        </div>
                      </td>
                      <td width="50%" style="padding: 0 0 0 7px;">
                        <div style="text-align: center; padding: 15px; background: #e0f2fe; border-radius: 8px;">
                          <div style="font-size: 32px; font-weight: bold; color: #0369a1;">${recent_views}</div>
                          <div style="color: #666; margin-top: 5px; font-size: 14px;">Senaste 24h</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Time spent section -->
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">⏱️ Hur länge besökare tittar på annonsen</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="50%" style="padding: 0 7px 0 0;">
                        <div style="text-align: center; padding: 15px; background: #fef9e7; border-radius: 8px;">
                          <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${Math.floor(average_time_spent / 60)}:${String(average_time_spent % 60).padStart(2, '0')}</div>
                          <div style="color: #666; margin-top: 5px; font-size: 14px;">Genomsnittlig visningstid</div>
                        </div>
                      </td>
                      <td width="50%" style="padding: 0 0 0 7px;">
                        <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px;">
                          <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${Math.floor((average_time_spent * views_count) / 60)}</div>
                          <div style="color: #666; margin-top: 5px; font-size: 14px;">Total minuter</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Favorites section -->
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">❤️ Antal som sparat som favorit</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="50%" style="padding: 0 7px 0 0;">
                        <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                          <div style="font-size: 32px; font-weight: bold; color: #15803d;">${favorites_count}</div>
                          <div style="color: #666; margin-top: 5px; font-size: 14px;">Totalt antal favoriter</div>
                        </div>
                      </td>
                      <td width="50%" style="padding: 0 0 0 7px;">
                        <div style="text-align: center; padding: 15px; background: #dcfce7; border-radius: 8px;">
                          <div style="font-size: 32px; font-weight: bold; color: #15803d;">${recent_favorites}</div>
                          <div style="color: #666; margin-top: 5px; font-size: 14px;">Nya senaste 24h</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Image clicks section -->
                <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📸 Bildstatistik</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
                    <tr>
                      <td width="50%" style="padding: 0 7px 0 0;">
                        <div style="text-align: center; padding: 15px; background: #faf5ff; border-radius: 8px;">
                          <div style="font-size: 32px; font-weight: bold; color: #9333ea;">${total_image_clicks}</div>
                          <div style="color: #666; margin-top: 5px; font-size: 14px;">Totalt bildklick</div>
                        </div>
                      </td>
                      <td width="50%" style="padding: 0 0 0 7px;">
                        <div style="text-align: center; padding: 15px; background: #f3e8ff; border-radius: 8px;">
                          <div style="font-size: 32px; font-weight: bold; color: #9333ea;">${allImages.length}</div>
                          <div style="color: #666; margin-top: 5px; font-size: 14px;">Antal bilder</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                  ${mostViewedImageCount > 0 ? `
                  <div style="background: #f8fafc; border-radius: 8px; padding: 15px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 14px; color: #64748b; margin-bottom: 10px;">🏆 Mest visade bilden</div>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        ${mostViewedImageUrl ? `
                        <td style="padding-right: 15px; vertical-align: middle;">
                          <img src="${mostViewedImageUrl}" alt="Mest visade bilden" width="80" height="60" style="width: 80px; height: 60px; object-fit: cover; border-radius: 6px; display: block;" />
                        </td>
                        ` : ''}
                        <td style="vertical-align: middle;">
                          <div style="font-weight: bold; color: #333;">${mostViewedImageLabel}</div>
                          <div style="color: #9333ea; font-weight: bold;">${mostViewedImageCount} visningar</div>
                        </td>
                      </tr>
                    </table>
                  </div>
                  ` : `
                  <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; color: #64748b;">
                    Inga bildklick registrerade ännu
                  </div>
                  `}
                </div>
                
                <div style="background: linear-gradient(135deg, #0369a1, #15803d); padding: 20px; border-radius: 8px; text-align: center;">
                  <p style="color: white; margin: 0 0 15px 0; font-size: 16px;">
                    ${views_count > 0 
                      ? "Din bostad får bra uppmärksamhet! Fortsätt så." 
                      : "Förbättra dina bilder och beskrivning för att få fler visningar."}
                  </p>
                  <a href="https://barahem.se/fastighet/${property.id}" 
                     style="background: white; 
                            color: #0369a1; 
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
        type: "monthly_statistics", 
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
