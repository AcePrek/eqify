import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { auth, setUser, setAuthError } = useStore();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary">EQify</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {auth.user ? (
                <>
                  <Link
                    to="/test"
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    Take Test
                  </Link>
                  <Link
                    to="/results"
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    Results
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/" className="btn btn-primary">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {auth.error && (
          <div className="mb-4 p-4 bg-error/10 text-error rounded-lg">
            {auth.error}
          </div>
        )}
        {children}
      </main>
    </div>
  );
} 