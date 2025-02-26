import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  // Function to check if the link is active
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  className="h-8 w-auto mr-2"
                  src="/claude-logo.svg"
                  alt="Claude Logo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/32?text=C';
                  }}
                />
                <span className="font-bold text-xl text-gray-900">Claude Use Case Explorer</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                to="/analyzer"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/analyzer') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Company Analyzer
              </Link>
              <Link
                to="/use-cases"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/use-cases') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Use Cases
              </Link>
              <Link
                to="/roi-calculator"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/roi-calculator') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                ROI Calculator
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <a
              href="https://github.com/yourusername/claude-use-case-explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Home
          </Link>
          <Link
            to="/analyzer"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/analyzer') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Company Analyzer
          </Link>
          <Link
            to="/use-cases"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/use-cases') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Use Cases
          </Link>
          <Link
            to="/roi-calculator"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/roi-calculator') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            ROI Calculator
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
