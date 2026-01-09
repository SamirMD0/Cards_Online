import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-3 py-2 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <span className="text-lg md:text-2xl font-poppins font-extrabold text-white">
                Cards Online
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-uno-red via-uno-blue to-uno-green rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/lobby" className="text-gray-300 hover:text-white font-medium transition-colors">
                  Lobby
                </Link>
                <Link to="/friends" className="text-gray-300 hover:text-white font-medium transition-colors">
                  Friends
                </Link>
                <span className="text-gray-300 font-medium">
                  👤 {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-2.5 bg-gradient-to-r from-uno-red to-uno-yellow text-white font-semibold rounded-lg hover:shadow-glow-red transition-all duration-300">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-dark-700 pt-4">
            {user ? (
              <>
                <Link
                  to="/lobby"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Lobby
                </Link>
                <Link
                  to="/friends"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Friends
                </Link>
                <div className="text-gray-300 font-medium">
                  👤 {user.username}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 bg-gradient-to-r from-uno-red to-uno-yellow text-white font-semibold rounded-lg hover:shadow-glow-red transition-all duration-300 text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}