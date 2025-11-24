import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, agency_name, token }: InvitationRequest = await req.json();

    const signupUrl = `${Deno.env.get("VITE_SUPABASE_URL")}/auth/v1/signup?token=${token}`;

    const emailResponse = await resend.emails.send({
      from: "BaraHem <onboarding@resend.dev>",
      to: [email],
      subject: `Inbjudan till ${agency_name} på BaraHem`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Välkommen till BaraHem!</h1>
          <p>Hej ${name},</p>
          <p>Du har blivit inbjuden att bli byrå-admin för <strong>${agency_name}</strong> på BaraHem.</p>
          <p>Som byrå-admin kan du:</p>
          <ul>
            <li>Bjuda in mäklare till din byrå</li>
            <li>Hantera alla objekt från din byrå</li>
            <li>Se statistik och rapporter</li>
          </ul>
          <p style="margin: 30px 0;">
            <a href="${signupUrl}" 
               style="background: linear-gradient(135deg, hsl(200 98% 35%), hsl(142 76% 30%)); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 6px;
                      display: inline-block;">
              Acceptera inbjudan och skapa konto
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Denna inbjudan är giltig i 7 dagar.
          </p>
          <p style="color: #666; font-size: 14px;">
            Om du inte begärt denna inbjudan kan du ignorera detta email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} BaraHem. Alla rättigheter förbehållna.
          </p>
        </div>
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
