import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white mt-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link to="/" className="text-gray-500 hover:text-gray-900">
              Home
            </Link>
            <Link to="/analyzer" className="text-gray-500 hover:text-gray-900">
              Company Analyzer
            </Link>
            <Link to="/use-cases" className="text-gray-500 hover:text-gray-900">
              Use Cases
            </Link>
            <Link to="/roi-calculator" className="text-gray-500 hover:text-gray-900">
              ROI Calculator
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Claude Use Case Explorer. All rights reserved.
              <span className="mx-2">|</span>
              <a
                href="https://github.com/yourusername/claude-use-case-explorer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                GitHub Repository
              </a>
            </p>
            <div className="mt-2 text-center text-xs text-gray-400">
              <p>Made with Claude 3.7 Sonnet · Powered by Anthropic's Claude API</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
