import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';
import SupabaseTest from '../components/SupabaseTest';

export default function Home() {
  const navigate = useNavigate();
  const { auth, setUser, setAuthError } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        console.log('Attempting signup...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        
        if (error) throw error;
        console.log('User created:', data.user);
        
        if (data.user) {
          // Create profile
          console.log('Creating profile...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: fullName
            });
            
          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw profileError;
          }
          
          console.log('Profile created successfully');
          
          setUser({
            id: data.user.id,
            email: data.user.email!,
            fullName: fullName,
            avatarUrl: data.user.user_metadata.avatar_url,
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            fullName: data.user.user_metadata.full_name || 'Anonymous User',
            avatarUrl: data.user.user_metadata.avatar_url,
          });
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  if (auth.user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold mb-6">Welcome, {auth.user.fullName}!</h1>
          <p className="text-gray-600 mb-8">
            Ready to discover your emotional intelligence? Take our comprehensive EQ test
            based on Daniel Goleman's model to understand your emotional strengths and
            areas for growth.
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/test')} className="btn btn-primary">
              Take EQ Test
            </button>
            <button onClick={() => navigate('/results')} className="btn btn-secondary">
              View Past Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <SupabaseTest />
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input mt-1 bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mt-1 bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-1 bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:text-primary/90"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
} 