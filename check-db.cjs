const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qgvloiecyvqbxeplfzwv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndmxvaWVjeXZxYnhlcGxmend2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDE2MjksImV4cCI6MjA3NzcxNzYyOX0.C6-xZMDe0w6KdlNWU5NSzi5MhkbArX3wZrbS8ElB_38';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: agencies } = await supabase.from('agencies').select('id, name, logo_url').limit(10);
  console.log('=== AGENCIES ===');
  console.log(JSON.stringify(agencies, null, 2));

  const { data: properties } = await supabase.from('properties').select('id, title, vendor_logo_url, user_id').eq('is_deleted', false).limit(5);
  console.log('\n=== PROPERTIES ===');
  console.log(JSON.stringify(properties, null, 2));

  const { data: profiles } = await supabase.from('profiles').select('id, full_name, agency_id').not('agency_id', 'is', null).limit(5);
  console.log('\n=== PROFILES WITH AGENCY ===');
  console.log(JSON.stringify(profiles, null, 2));
}

check();
