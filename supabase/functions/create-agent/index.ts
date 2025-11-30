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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, full_name, agency_id }: CreateAgentRequest = await req.json()

    // Validate input
    if (!email || !full_name || !agency_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the redirect URL for password setup
    const origin = req.headers.get('origin') || Deno.env.get('SUPABASE_URL') || ''
    const redirectUrl = `${origin}/`

    console.log('Inviting user:', email, 'with redirect:', redirectUrl)

    // Invite user by email - this sends an invitation email automatically
    const { data: userData, error: userError } = await supabaseClient.auth.admin.inviteUserByEmail(
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
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User invited successfully:', userData.user.id)

    // Update profile with agency info
    const { error: profileError } = await supabaseClient
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
    const { error: roleError } = await supabaseClient
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
