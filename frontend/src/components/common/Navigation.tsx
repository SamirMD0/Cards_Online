import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <span className="text-3xl font-poppins font-extrabold text-white">
                Cards Online
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-uno-red via-uno-blue to-uno-green rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/lobby"
                  className="text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Lobby
                </Link>
                {/* ADD THIS LINK */}
                <Link
                  to="/friends"
                  className="text-gray-300 hover:text-white font-medium transition-colors"
                >
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
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-uno-red to-uno-yellow text-white font-semibold rounded-lg hover:shadow-glow-red transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}