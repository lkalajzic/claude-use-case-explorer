'use client';

import React, { useState } from 'react';
import { companyAnalysisApi } from '../../services/api';
import AnalysisResults from '../../components/analysis/AnalysisResults';
import UseCaseMatches from '../../components/analysis/UseCaseMatches';
import { FormReview } from '../../components/analysis/FormReview';

const CompanyAnalyzer = () => {
  // State for form inputs and workflow
  const [analysisType, setAnalysisType] = useState('website');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [useCaseMatches, setUseCaseMatches] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  
  // Function to match use cases after analysis
  const matchUseCases = async (analysis) => {
    try {
      const matches = await companyAnalysisApi.matchUseCases(analysis);
      setUseCaseMatches(matches);
      return matches;
    } catch (err) {
      console.error('Use case matching error:', err);
      setError('Error matching use cases. Please try again.');
      return null;
    }
  };

  // Handle initial form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous results and errors
    setAnalysisResults(null);
    setUseCaseMatches(null);
    setError(null);
    setShowReviewForm(false);
    setReviewCompleted(false);
    setIsLoading(true);
    
    try {
      // Based on analysis type, call appropriate API
      if (analysisType === 'website' && websiteUrl) {
        const results = await companyAnalysisApi.analyzeWebsite(websiteUrl);
        setAnalysisResults(results);
        // Show review form
        setShowReviewForm(true);
      } else if (analysisType === 'description' && companyDescription) {
        const results = await companyAnalysisApi.analyzeDescription(companyDescription);
        setAnalysisResults(results);
        // Show review form
        setShowReviewForm(true);
      } else {
        setError('Please enter ' + (analysisType === 'website' ? 'a valid URL' : 'a company description'));
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        analysisType === 'website' 
          ? 'Error analyzing website. Please check the URL and try again.' 
          : 'Error analyzing description. Please try again with a more detailed description.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form review submission
  const handleReviewSubmit = async (reviewedData) => {
    setIsLoading(true);
    try {
      // Update analysis results with reviewed data
      setAnalysisResults(reviewedData);
      
      // Match use cases with the reviewed data
      await matchUseCases(reviewedData);
      
      // Mark review as completed
      setShowReviewForm(false);
      setReviewCompleted(true);
    } catch (err) {
      console.error('Error after review:', err);
      setError('Failed to process reviewed data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle review cancellation
  const handleReviewCancel = () => {
    setShowReviewForm(false);
    // Keep the original analysis results
  };
  
  // Show analysis info guidance
  const AnalysisGuidance = () => (
    <div className="bg-blue-50 p-4 rounded-md mb-6">
      <h3 className="text-lg font-medium text-blue-800 mb-2">Tips for better analysis</h3>
      <div className="text-sm text-blue-700">
        <p className="mb-2">For the most accurate results, include information about:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Company industry and size</li>
          <li>Number of employees (total and by department)</li>
          <li>Key business challenges and goals</li>
          <li>Current processes that could be improved</li>
          <li>Technologies and tools currently in use</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Initial Analysis Form */}
      {!showReviewForm && !reviewCompleted && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Company Analyzer</h1>
          
          {/* Analysis Guidance */}
          <AnalysisGuidance />
          
          {/* Analysis Type Selection */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${
                  analysisType === 'website' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setAnalysisType('website')}
                disabled={isLoading}
              >
                Analyze Website
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${
                  analysisType === 'description' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setAnalysisType('description')}
                disabled={isLoading}
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
                  Enter the company&apos;s main website URL without http:// or https://
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
                  placeholder="Enter a detailed description of the company, including industry, size, products/services, employee roles, and challenges..."
                  rows={6}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  The more detailed your description, the better the analysis will be.
                </p>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
                {error}
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
      )}

      {/* Loading indicator with case study explanation */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <p className="mt-2 text-gray-600">
            {showReviewForm ? 'Processing your review...' : 'Analyzing company data with Claude...'}
            <br />
            <span className="text-sm text-gray-500">
              {!showReviewForm && 'Analyzing against 74 real-world Claude implementation case studies. '}
              This may take 1-2 minutes.
            </span>
          </p>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && !isLoading && analysisResults && (
        <div className="mb-8">
          <FormReview 
            analysisData={analysisResults} 
            onConfirm={handleReviewSubmit} 
            onCancel={handleReviewCancel}
          />
        </div>
      )}

      {/* Results Section - more compact */}
      {reviewCompleted && analysisResults && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Analysis Results</h2>
          <AnalysisResults analysis={analysisResults} />
        </div>
      )}

      {/* Use Case Matches Section */}
      {reviewCompleted && useCaseMatches && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended Claude Use Cases</h2>
          <UseCaseMatches matches={useCaseMatches} />
        </div>
      )}
    </div>
  );
};

export default CompanyAnalyzer;
