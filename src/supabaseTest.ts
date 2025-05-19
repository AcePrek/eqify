import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajyezufpemjpmrjkqest.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeWV6dWZwZW1qcG1yamtxZXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzY0MzMsImV4cCI6MjA2MzI1MjQzM30.ChsAcGOvJ0XI4-_QKVfd64lChAgunNnRne_Z6dS1d-M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test credentials
const testEmail = 'testuser@eqify.com';
const testPassword = 'Test123!@#';
const testName = 'Test User';

async function verifyTestUser() {
  console.log('🔄 Verifying test user credentials...');

  try {
    // First try to sign in with the test credentials
    console.log('Attempting to sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.log('Sign in failed, user might not exist. Creating new test user...');
      // Create the user
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: testName,
          },
        },
      });

      if (userError) {
        console.error('❌ User Creation Error:', userError.message);
        return;
      }
      console.log('✅ User created:', userData.user?.id);

      // Create profile for the user
      if (userData.user) {
        console.log('\nCreating profile...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userData.user.id,
            email: testEmail,
            full_name: testName
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ Profile Creation Error:', profileError.message);
        } else {
          console.log('✅ Profile created:', profile);
        }
      }
    } else {
      console.log('✅ Successfully signed in with test user!');
      console.log('User ID:', signInData.user?.id);
    }

    console.log('\nTest user credentials for sign in:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);

  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : 'Unknown error occurred');
  }
}

async function checkExistingUsers() {
  console.log('🔄 Checking for existing users in the profiles table...');

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching profiles:', error.message);
      return;
    }

    if (profiles && profiles.length > 0) {
      console.log('✅ Found existing profiles:');
      profiles.forEach(profile => {
        console.log('\nProfile:', {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name
        });
      });
    } else {
      console.log('No existing profiles found.');
    }

  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : 'Unknown error occurred');
  }
}

// Verify/create the test user
verifyTestUser();

// Check existing users
checkExistingUsers(); 