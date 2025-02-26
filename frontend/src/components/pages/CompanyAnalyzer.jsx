import React, { useState } from 'react';
import { useMutation } from 'react-query';
import axios from 'axios';

// Import components
import AnalysisResults from '../analysis/AnalysisResults';
import UseCaseMatches from '../analysis/UseCaseMatches';

const CompanyAnalyzer = () => {
  // State for form inputs
  const [analysisType, setAnalysisType] = useState('website');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [useCaseMatches, setUseCaseMatches] = useState(null);

  // Website analysis mutation
  const websiteAnalysisMutation = useMutation(
    (url) => axios.post('/api/analyze-website', { url }),
    {
      onSuccess: (response) => {
        setAnalysisResults(response.data);
        // After getting analysis, match use cases
        matchUseCases(response.data);
      },
      onError: (error) => {
        console.error('Website analysis error:', error);
        alert('Error analyzing website. Please check the URL and try again.');
      }
    }
  );

  // Description analysis mutation
  const descriptionAnalysisMutation = useMutation(
    (description) => axios.post('/api/analyze-description', { description }),
    {
      onSuccess: (response) => {
        setAnalysisResults(response.data);
        // After getting analysis, match use cases
        matchUseCases(response.data);
      },
      onError: (error) => {
        console.error('Description analysis error:', error);
        alert('Error analyzing description. Please try again with a more detailed description.');
      }
    }
  );

  // Use case matching mutation
  const useCaseMatchingMutation = useMutation(
    (analysis) => axios.post('/api/match-use-cases', { analysis }),
    {
      onSuccess: (response) => {
        setUseCaseMatches(response.data);
      },
      onError: (error) => {
        console.error('Use case matching error:', error);
        alert('Error matching use cases. Please try again.');
      }
    }
  );

  // Function to match use cases after analysis
  const matchUseCases = (analysis) => {
    useCaseMatchingMutation.mutate(analysis);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset previous results
    setAnalysisResults(null);
    setUseCaseMatches(null);
    
    // Based on analysis type, call appropriate API
    if (analysisType === 'website' && websiteUrl) {
      websiteAnalysisMutation.mutate(websiteUrl);
    } else if (analysisType === 'description' && companyDescription) {
      descriptionAnalysisMutation.mutate(companyDescription);
    } else {
      alert('Please enter ' + (analysisType === 'website' ? 'a valid URL' : 'a company description'));
    }
  };

  // Loading state
  const isLoading = websiteAnalysisMutation.isLoading || 
                    descriptionAnalysisMutation.isLoading || 
                    useCaseMatchingMutation.isLoading;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Company Analyzer</h1>
        
        {/* Analysis Type Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-md ${
                analysisType === 'website' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setAnalysisType('website')}
            >
              Analyze Website
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                analysisType === 'description' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setAnalysisType('description')}
            >
              Analyze Description
            </button>
          </div>
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit}>
          {analysisType === 'website' ? (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="websiteUrl">
                Company Website URL
              </label>
              <input
                id="websiteUrl"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter company website URL (e.g., company.com)"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the company's main website URL without http:// or https://
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyDescription">
                Company Description
              </label>
              <textarea
                id="companyDescription"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter a detailed description of the company, including industry, size, products/services, and challenges..."
                rows="6"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">
                The more detailed your description, the better the analysis will be.
              </p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Company'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="spinner-border text-blue-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">
            Analyzing company data with Claude... This may take a minute.
          </p>
        </div>
      )}

      {analysisResults && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Analysis Results</h2>
          <AnalysisResults analysis={analysisResults} />
        </div>
      )}

      {useCaseMatches && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended Claude Use Cases</h2>
          <UseCaseMatches matches={useCaseMatches} />
        </div>
      )}
    </div>
  );
};

export default CompanyAnalyzer;
