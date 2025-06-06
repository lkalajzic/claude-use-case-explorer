'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-sm flex items-center justify-center">
                <span className="text-white font-medium text-lg">C</span>
              </div>
              <span className="text-gray-900 font-light text-lg tracking-tight">
                Claude Use Case Explorer
              </span>
            </Link>
          </div>
          
          <div className="hidden sm:flex items-center space-x-8">
            <Link 
              href="/analyzer"
              className="text-gray-600 hover:text-gray-900 text-sm font-light tracking-wide transition-colors"
            >
              Company Analyzer
            </Link>
            <Link 
              href="/use-cases"
              className="text-gray-600 hover:text-gray-900 text-sm font-light tracking-wide transition-colors"
            >
              Use Cases
            </Link>
            <Link 
              href="/roi-calculator"
              className="text-gray-600 hover:text-gray-900 text-sm font-light tracking-wide transition-colors"
            >
              ROI Calculator
            </Link>
            <a
              href="https://github.com/yourusername/claude-use-case-explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden border-t border-gray-200`}>
        <div className="px-4 py-4 space-y-3">
          <Link 
            href="/analyzer"
            className="block text-gray-600 hover:text-gray-900 text-sm font-light"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Company Analyzer
          </Link>
          <Link 
            href="/use-cases"
            className="block text-gray-600 hover:text-gray-900 text-sm font-light"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Use Cases
          </Link>
          <Link 
            href="/roi-calculator"
            className="block text-gray-600 hover:text-gray-900 text-sm font-light"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ROI Calculator
          </Link>
        </div>
      </div>
    </nav>
  );
}