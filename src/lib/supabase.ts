import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? '✓' : '✗',
    key: supabaseAnonKey ? '✓' : '✗'
  });
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          full_name: string;
          avatar_url?: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          avatar_url?: string;
        };
      };
      eq_test_sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          completed_at?: string;
        };
        Insert: {
          user_id: string;
        };
        Update: {
          completed_at?: string;
        };
      };
      eq_responses: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          response: number;
          created_at: string;
        };
        Insert: {
          session_id: string;
          question_id: string;
          response: number;
        };
        Update: {
          response?: number;
        };
      };
    };
  };
}; 