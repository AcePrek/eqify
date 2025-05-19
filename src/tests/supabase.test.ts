import { supabase } from '../lib/supabase';

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('eq_questions').select('count');
    
    if (error) {
      console.error('❌ Connection Error:', error.message);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('📊 Database is accessible');
    
    // Test auth configuration
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Auth Error:', authError.message);
    } else {
      console.log('✅ Auth is properly configured');
    }
    
  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : 'Unknown error occurred');
  }
}

// Run the test
testSupabaseConnection(); 