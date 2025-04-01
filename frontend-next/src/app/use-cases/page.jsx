'use client';

import React, { useState, useEffect } from 'react';
import { useCaseApi } from '../../services/api';
import Link from 'next/link';

const UseCaseExplorer = () => {
  const [useCases, setUseCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch use cases from API
    const fetchUseCases = async () => {
      try {
        setLoading(true);
        const useCaseData = await useCaseApi.getUseCases();
        
        // Convert object of use cases to array
        const useCasesArray = Object.values(useCaseData);
        
        // Make sure every use case has the required properties
        const safeUseCases = useCasesArray.map(useCase => ({
          ...useCase,
          id: useCase.id || '',
          company: useCase.company || useCase.name || '',
          industry: useCase.industry || '',
          description: useCase.description || '',
          url: useCase.url || '',
          categoryId: useCase.categoryId || 'productivity',
          companyInfo: useCase.companyInfo || {
            industry: useCase.industry || '',
            size: 'Not specified',
            region: 'Not specified'
          },
          metrics: Array.isArray(useCase.metrics) ? useCase.metrics : 
                  (Array.isArray(useCase.highlights) ? useCase.highlights : [])
        }));
        
        setUseCases(safeUseCases);
        setError(null);
      } catch (err) {
        console.error('Error fetching use cases:', err);
        setError('Failed to load use case database. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUseCases();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Claude Use Case Explorer</h1>
        <p className="text-gray-600 mb-6">
          Browse common implementation scenarios for Claude AI across different industries and business functions.
        </p>
        
        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
            <p className="mt-2 text-gray-600">Loading use cases...</p>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Use cases grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <Link 
                href={`/use-cases/${useCase.id}`} 
                key={useCase.id}
                className="block"
              >
                <div 
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 h-full bg-white"
                >
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">{useCase.company}</h2>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-gray-600 mb-4 line-clamp-3">{useCase.description}</p>
                    
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Company Information</h3>
                      <div className="mb-1">
                        <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 mr-1">
                          Industry: {useCase.companyInfo.industry}
                        </span>
                      </div>
                      <div className="mb-1">
                        <span className="text-xs bg-purple-100 text-purple-800 rounded px-2 py-1 mr-1">
                          Size: {useCase.companyInfo.size}
                        </span>
                      </div>
                      <div className="mb-1">
                        <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-1">
                          Region: {useCase.companyInfo.region}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Key Metrics</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {useCase.metrics.map((metric, idx) => (
                          <li key={idx}>{metric}</li>
                        ))}
                      </ul>
                      
                      <div className="mt-4 text-center">
                        <button className="inline-block bg-coral-500 hover:bg-coral-600 text-white font-medium text-sm py-2 px-4 rounded transition-colors">
                          View Full Case Study
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UseCaseExplorer;
