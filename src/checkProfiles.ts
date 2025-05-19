import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajyezufpemjpmrjkqest.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeWV6dWZwZW1qcG1yamtxZXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzY0MzMsImV4cCI6MjA2MzI1MjQzM30.ChsAcGOvJ0XI4-_QKVfd64lChAgunNnRne_Z6dS1d-M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfiles() {
  console.log('Checking profiles table...');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching profiles:', error.message);
      return;
    }
    
    console.log('Found profiles:', profiles);
    console.log('Total profiles:', profiles.length);
    
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : 'Unknown error');
  }
}

checkProfiles(); 