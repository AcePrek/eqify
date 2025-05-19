import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useStore } from '../store';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const user = useStore(state => state.user);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-indigo-600">EQify</span>
              </Link>
            </div>
            <div className="flex items-center">
              {user ? (
                <>
                  <Link to="/profile" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                    Profile
                  </Link>
                  <Link to="/test" className="bg-indigo-600 text-white px-4 py-2 rounded-md ml-4">
                    Take Test
                  </Link>
                </>
              ) : (
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 