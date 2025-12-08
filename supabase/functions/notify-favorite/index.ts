import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInput(data: unknown): { valid: boolean; error?: string; data?: NotifyFavoriteRequest } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Request body must be a valid JSON object" };
  }

  const { property_id, property_title, property_address, agent_email, agent_name } = data as Record<string, unknown>;

  // Validate property_id
  if (!property_id || typeof property_id !== 'string') {
    return { valid: false, error: "property_id is required and must be a string" };
  }
  if (!UUID_REGEX.test(property_id)) {
    return { valid: false, error: "property_id must be a valid UUID" };
  }

  // Validate property_title
  if (!property_title || typeof property_title !== 'string') {
    return { valid: false, error: "property_title is required and must be a string" };
  }
  if (property_title.length > 500) {
    return { valid: false, error: "property_title must be less than 500 characters" };
  }

  // Validate property_address
  if (!property_address || typeof property_address !== 'string') {
    return { valid: false, error: "property_address is required and must be a string" };
  }
  if (property_address.length > 500) {
    return { valid: false, error: "property_address must be less than 500 characters" };
  }

  // Validate agent_email
  if (!agent_email || typeof agent_email !== 'string') {
    return { valid: false, error: "agent_email is required and must be a string" };
  }
  if (!EMAIL_REGEX.test(agent_email)) {
    return { valid: false, error: "agent_email must be a valid email address" };
  }

  // Validate agent_name
  if (!agent_name || typeof agent_name !== 'string') {
    return { valid: false, error: "agent_name is required and must be a string" };
  }
  if (agent_name.length > 200) {
    return { valid: false, error: "agent_name must be less than 200 characters" };
  }

  return {
    valid: true,
    data: {
      property_id: property_id as string,
      property_title: property_title as string,
      property_address: property_address as string,
      agent_email: agent_email as string,
      agent_name: agent_name as string,
    }
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with the user's auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse and validate input
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const validation = validateInput(requestBody);
    if (!validation.valid || !validation.data) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { property_id, property_title, property_address, agent_email, agent_name } = validation.data;

    // Verify the user actually has this property favorited
    const { data: favorite, error: favoriteError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", property_id)
      .maybeSingle();

    if (favoriteError) {
      console.error("Error checking favorite:", favoriteError);
      return new Response(
        JSON.stringify({ error: "Failed to verify favorite" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!favorite) {
      return new Response(
        JSON.stringify({ error: "You have not favorited this property" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Favorite notification logged for:", agent_email, property_title, "by user:", user.id);
    
    // Note: Email functionality removed - notifications are now manual
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-favorite function:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
