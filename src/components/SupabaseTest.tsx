import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [dbStatus, setDbStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string | null>(null);
  const [envStatus, setEnvStatus] = useState<string>('Checking...');

  useEffect(() => {
    async function testConnection() {
      try {
        // Check environment variables
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!url || !key) {
          setEnvStatus(`❌ Environment variables missing: ${!url ? 'URL' : ''} ${!key ? 'ANON_KEY' : ''}`);
          throw new Error('Missing environment variables');
        }
        setEnvStatus('✅ Environment variables found');

        // Test basic connection
        const { data: connectionTest, error: connectionError } = await supabase
          .from('eq_questions')
          .select('count')
          .single();

        if (connectionError) {
          throw connectionError;
        }
        setConnectionStatus('✅ Connected to Supabase');

        // Test database query
        const { data: questions, error: dbError } = await supabase
          .from('eq_questions')
          .select('*')
          .limit(1);

        if (dbError) {
          throw dbError;
        }
        setDbStatus(`✅ Database accessible (${questions.length} questions found)`);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error('Supabase connection error:', err);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Status</h2>
      <div className="space-y-2">
        <p>Environment: {envStatus}</p>
        <p>Connection: {connectionStatus}</p>
        <p>Database: {dbStatus}</p>
        {error && (
          <p className="text-red-500">
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
} 