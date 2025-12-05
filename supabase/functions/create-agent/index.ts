import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateAgentRequest {
  email: string;
  full_name: string;
  agency_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create client with anon key first to verify the user's JWT
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - no authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the JWT and get the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Authenticated user:', user.id)

    // Create admin client to check roles and perform privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if user has agency_admin or superadmin role
    const { data: roleData, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('user_type')
      .eq('user_id', user.id)
      .single()

    if (roleCheckError || !roleData) {
      console.error('Role check error:', roleCheckError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - could not verify user role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userRole = roleData.user_type
    const isAuthorized = userRole === 'agency_admin' || userRole === 'superadmin'

    if (!isAuthorized) {
      console.error('User not authorized. Role:', userRole)
      return new Response(
        JSON.stringify({ error: 'Forbidden - only agency admins and superadmins can create agents' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, full_name, agency_id }: CreateAgentRequest = await req.json()

    console.log('Received request:', { email, full_name, agency_id, requestedBy: user.id })

    // Validate input
    if (!email || !full_name || !agency_id) {
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!full_name) missingFields.push('full_name');
      if (!agency_id) missingFields.push('agency_id');
      
      console.error('Missing fields:', missingFields)
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          missing: missingFields 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For agency_admin, verify they belong to the agency they're creating an agent for
    if (userRole === 'agency_admin') {
      const { data: profileData, error: profileCheckError } = await supabaseAdmin
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single()

      if (profileCheckError || !profileData) {
        console.error('Profile check error:', profileCheckError)
        return new Response(
          JSON.stringify({ error: 'Could not verify agency membership' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (profileData.agency_id !== agency_id) {
        console.error('Agency mismatch. User agency:', profileData.agency_id, 'Requested agency:', agency_id)
        return new Response(
          JSON.stringify({ error: 'Forbidden - you can only create agents for your own agency' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get the redirect URL for password setup
    const siteUrl = Deno.env.get('SITE_URL') || req.headers.get('origin') || Deno.env.get('SUPABASE_URL') || ''
    const redirectUrl = `${siteUrl}/`

    console.log('Inviting user:', email, 'with redirect:', redirectUrl)

    // Invite user by email - this sends an invitation email automatically
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name,
          agency_id
        },
        redirectTo: redirectUrl
      }
    )

    if (userError) {
      console.error('Error inviting user:', userError)
      
      // Check if user already exists
      if (userError.message?.includes('already been registered') || userError.code === 'email_exists') {
        return new Response(
          JSON.stringify({ 
            error: 'En användare med denna email är redan registrerad',
            errorCode: 'email_exists',
            suggestion: 'Användaren kanske redan är inbjuden eller har ett konto. Kontrollera med användaren eller använd en annan email.'
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User invited successfully:', userData.user.id)

    // Update profile with agency info
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        agency_id,
        full_name,
      })
      .eq('id', userData.user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      // Don't fail the request if profile update fails, user can update later
    }

    // Set user role to maklare
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .update({ user_type: 'maklare' })
      .eq('user_id', userData.user.id)

    if (roleError) {
      console.error('Error setting role:', roleError)
      // Don't fail the request if role setting fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData.user,
        message: 'Inbjudan skickad! Mäklaren får ett mail för att välja lösenord.' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
