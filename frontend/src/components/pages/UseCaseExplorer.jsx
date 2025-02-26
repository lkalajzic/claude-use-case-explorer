import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UseCaseExplorer = () => {
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterCompanySize, setFilterCompanySize] = useState('');
  
  // Fetch use cases from the API
  const { data: useCases, isLoading, error } = useQuery('useCases', async () => {
    const response = await axios.get('/api/use-case-database');
    return response.data;
  });
  
  // Handle use case selection
  const handleUseCaseClick = (useCaseId) => {
    // If already selected, toggle off
    if (selectedUseCase === useCaseId) {
      setSelectedUseCase(null);
    } else {
      setSelectedUseCase(useCaseId);
    }
  };
  
  // Filter use cases based on selected filters
  const filteredUseCases = useCases && Object.values(useCases).filter(useCase => {
    // Apply industry filter if set
    if (filterIndustry && useCase.idealFit?.industries && 
        !useCase.idealFit.industries.some(industry => 
          industry.toLowerCase().includes(filterIndustry.toLowerCase()))) {
      return false;
    }
    
    // Apply company size filter if set
    if (filterCompanySize && useCase.idealFit?.companySize && 
        !useCase.idealFit.companySize.some(size => 
          size.toLowerCase().includes(filterCompanySize.toLowerCase()))) {
      return false;
    }
    
    return true;
  });
  
  // Get selected use case details
  const selectedUseCaseDetails = selectedUseCase && useCases ? 
    Object.values(useCases).find(useCase => useCase.id === selectedUseCase) : null;
  
  // Extract unique industries and company sizes for filters
  const uniqueIndustries = useCases ? 
    [...new Set(Object.values(useCases).flatMap(useCase => 
      useCase.idealFit?.industries || []))] : [];
      
  const uniqueCompanySizes = useCases ? 
    [...new Set(Object.values(useCases).flatMap(useCase => 
      useCase.idealFit?.companySize || []))] : [];
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Claude Use Case Explorer</h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="industryFilter">
              Filter by Industry
            </label>
            <select
              id="industryFilter"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
            >
              <option value="">All Industries</option>
              {uniqueIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companySizeFilter">
              Filter by Company Size
            </label>
            <select
              id="companySizeFilter"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filterCompanySize}
              onChange={(e) => setFilterCompanySize(e.target.value)}
            >
              <option value="">All Company Sizes</option>
              {uniqueCompanySizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Loading and Error States */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="spinner-border text-blue-500" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600">Loading use cases...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error loading use cases. Please try again later.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Use Case Grid */}
        {filteredUseCases && filteredUseCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUseCases.map((useCase) => (
              <div 
                key={useCase.id} 
                className={`border rounded-lg overflow-hidden cursor-pointer transition-shadow hover:shadow-md ${
                  selectedUseCase === useCase.id ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200'
                }`}
                onClick={() => handleUseCaseClick(useCase.id)}
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{useCase.name}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{useCase.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-1">
                    {useCase.idealFit?.industries && useCase.idealFit.industries.slice(0, 3).map((industry, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {industry}
                      </span>
                    ))}
                    
                    {useCase.idealFit?.industries && useCase.idealFit.industries.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        +{useCase.idealFit.industries.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Ideal for: {useCase.idealFit?.companySize ? useCase.idealFit.companySize.join(', ') : 'All company sizes'}
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Technical Requirements: {useCase.idealFit?.technicalRequirements || 'Not specified'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No use cases found matching your filters.</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  setFilterIndustry('');
                  setFilterCompanySize('');
                }}
              >
                Clear Filters
              </button>
            </div>
          )
        )}
      </div>
      
      {/* Selected Use Case Details */}
      {selectedUseCaseDetails && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-800">{selectedUseCaseDetails.name}</h2>
            <Link
              to={`/roi-calculator?useCase=${selectedUseCaseDetails.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
            >
              Calculate ROI
            </Link>
          </div>
          
          <p className="text-gray-600 mb-6">{selectedUseCaseDetails.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Left Column */}
            <div>
              {/* Ideal Fit */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Ideal Company Fit</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {/* Industries */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Industries</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedUseCaseDetails.idealFit?.industries?.map((industry, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Company Size */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Company Size</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedUseCaseDetails.idealFit?.companySize?.map((size, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Technical Requirements */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Technical Requirements</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedUseCaseDetails.idealFit?.technicalRequirements === 'High' ? 'bg-red-100 text-red-800' :
                      selectedUseCaseDetails.idealFit?.technicalRequirements === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedUseCaseDetails.idealFit?.technicalRequirements || 'Low'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Examples */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Examples</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="list-disc pl-5">
                    {selectedUseCaseDetails.examples?.map((example, idx) => (
                      <li key={idx} className="text-gray-700 mb-1">{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div>
              {/* Implementation Steps */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Implementation Steps</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="space-y-4">
                    {/* Show implementation steps if available or default steps */}
                    {selectedUseCaseDetails.implementationSteps ? (
                      selectedUseCaseDetails.implementationSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start">
                          <div className="flex-shrink-0 bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{step.name}</h4>
                            <p className="text-sm text-gray-600">{step.description}</p>
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <span className="mr-2">Time: {step.timeframe}</span>
                              <span>Complexity: {step.complexity}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                            1
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Analysis & Planning</h4>
                            <p className="text-sm text-gray-600">Identify specific use case requirements and plan implementation approach</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                            2
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">API Integration</h4>
                            <p className="text-sm text-gray-600">Connect to Claude API and implement basic functionality</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                            3
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Testing & Refinement</h4>
                            <p className="text-sm text-gray-600">Test with real-world scenarios and refine implementation</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                            4
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Deployment & Monitoring</h4>
                            <p className="text-sm text-gray-600">Deploy to production and set up monitoring</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Case Studies */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Related Case Studies</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {selectedUseCaseDetails.examples ? (
                    <div className="space-y-4">
                      {/* Show placeholder case studies */}
                      <div className="border-l-4 border-blue-500 pl-3">
                        <h4 className="font-medium text-gray-900">Industry Leader</h4>
                        <p className="text-sm text-gray-600 mt-1">Implemented Claude for {selectedUseCaseDetails.name.toLowerCase()} and achieved significant improvements in efficiency and customer satisfaction.</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-3">
                        <h4 className="font-medium text-gray-900">Growth Company</h4>
                        <p className="text-sm text-gray-600 mt-1">Scaled their operations using Claude's {selectedUseCaseDetails.name.toLowerCase()} capabilities while maintaining quality and consistency.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No case studies available for this use case yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Ready to explore how this use case could benefit your company?</p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/analyzer"
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
              >
                Analyze Your Company
              </Link>
              <Link
                to={`/roi-calculator?useCase=${selectedUseCaseDetails.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Calculate ROI
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UseCaseExplorer;
