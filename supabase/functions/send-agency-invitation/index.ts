import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  name: string;
  agency_name: string;
  token: string;
  role?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller's authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for database queries
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create a client with the user's JWT to get their identity
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { 
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Verify user has agency_admin or superadmin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("user_type")
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      console.error("Failed to fetch user role:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden - Unable to verify role" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const allowedRoles = ["agency_admin", "superadmin"];
    if (!roleData || !allowedRoles.includes(roleData.user_type)) {
      console.error("User role not authorized:", roleData?.user_type);
      return new Response(
        JSON.stringify({ error: "Forbidden - Insufficient permissions" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("User role verified:", roleData.user_type);

    const { email, name, agency_name, token, role = 'agency_admin' }: InvitationRequest = await req.json();

    // Basic input validation
    if (!email || !name || !agency_name || !token) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const signupUrl = `${Deno.env.get("SITE_URL") || "https://qgvloiecyvqbxeplfzwv.lovableproject.com"}/acceptera-inbjudan?token=${encodeURIComponent(token)}`;

    const roleText = role === 'maklare' ? 'mäklare' : 'byrå-administratör';
    
    // Logo URL - kan ersättas med en publikt hostad logo
    const logoUrl = "https://qgvloiecyvqbxeplfzwv.lovableproject.com/favicon.svg";

    const emailResponse = await resend.emails.send({
      from: "BaraHem <noreply@info.barahem.se>",
      to: [email],
      subject: `Välkommen till ${agency_name} – Din inbjudan till BaraHem`,
      html: `
        <!DOCTYPE html>
        <html lang="sv">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                  
                  <!-- Header med gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, hsl(200, 98%, 35%), hsl(142, 76%, 30%)); padding: 32px 40px; text-align: center;">
                      <table role="presentation" style="margin: 0 auto;">
                        <tr>
                          <td style="vertical-align: middle; padding-right: 10px;">
                            <img src="${logoUrl}" alt="BaraHem" width="36" height="36" style="display: block;" />
                          </td>
                          <td style="vertical-align: middle;">
                            <span style="color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">BaraHem</span>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                        Sveriges smartaste bostadsportal
                      </p>
                    </td>
                  </tr>

                  <!-- Huvudinnehåll -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 24px; font-weight: 600;">
                        Hej ${name}! 👋
                      </h2>
                      <p style="margin: 0 0 24px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                        Grattis! Du har blivit utvald att bli ${roleText} hos <strong style="color: #1e293b;">${agency_name}</strong>.
                      </p>

                      <div style="background: linear-gradient(135deg, hsl(200, 98%, 96%), hsl(142, 76%, 96%)); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                          Som ${roleText} på BaraHem kan du:
                        </h3>
                        <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 15px; line-height: 1.8;">
                          ${role === 'maklare' 
                            ? `
                              <li>Skapa och publicera bostadsannonser</li>
                              <li>Följa statistik och intresse för dina objekt</li>
                              <li>Hantera visningar och budgivning</li>
                              <li>Kommunicera direkt med intresserade köpare</li>
                            `
                            : `
                              <li>Bjuda in och hantera mäklare i din byrå</li>
                              <li>Få överblick över alla objekt och försäljningar</li>
                              <li>Se detaljerad statistik och rapporter</li>
                              <li>Administrera byråns profil och inställningar</li>
                            `
                          }
                        </ul>
                      </div>

                      <!-- Registreringslänk -->
                      <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; text-align: center;">
                        Klicka på länken nedan för att skapa ditt konto:
                      </p>
                      <p style="margin: 0 0 24px 0; text-align: center; word-break: break-all;">
                        <a href="${signupUrl}" 
                           style="color: hsl(200, 98%, 35%); 
                                  text-decoration: underline; 
                                  font-size: 14px;
                                  font-weight: 500;">
                          ${signupUrl}
                        </a>
                      </p>

                      <p style="margin: 0; color: #94a3b8; font-size: 14px; text-align: center;">
                        Länken är giltig i 7 dagar.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; text-align: center;">
                        Du får detta mail för att någon har bjudit in dig till BaraHem.<br>
                        Om du inte förväntat dig denna inbjudan kan du ignorera mailet.
                      </p>
                      <p style="margin: 0; color: #cbd5e1; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} BaraHem. Alla rättigheter förbehållna.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-agency-invitation function:", error);
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
