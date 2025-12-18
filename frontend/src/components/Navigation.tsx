import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <span className="text-3xl font-poppins font-extrabold text-white">
                UNO
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-uno-red via-uno-blue to-uno-green rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <a
              href="#contact"
              className="text-gray-300 hover:text-white font-medium transition-all duration-200 hover:text-glow relative group"
            >
              Contact
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-uno-blue to-uno-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </a>
            <a
              href="#download"
              className="px-6 py-2.5 bg-gradient-to-r from-uno-red to-uno-yellow text-white font-semibold rounded-lg hover:shadow-glow-red transition-all duration-300 hover:scale-105"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}