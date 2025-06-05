'use client';

import React, { useState } from 'react';
import { companyAnalysisApi } from '../../services/api';
import AnalysisResults from '../../components/analysis/AnalysisResults';
import UseCaseMatches from '../../components/analysis/UseCaseMatches';
import UseCaseMatchesV2 from '../../components/analysis/UseCaseMatchesV2';
import { FormReview } from '../../components/analysis/FormReview';
import SalaryAdjustmentForm from '../../components/analysis/SalaryAdjustmentForm';

const CompanyAnalyzer = () => {
  // Default template for company description
  const defaultTemplate = `We are a [Industry] company with approximately [Total] employees:

• Engineering/Development: [X] engineers
• Customer Support: [X] support representatives  
• Sales & Marketing: [X] sales and marketing professionals
• Operations: [X] operations staff
• Human Resources: [X] HR professionals
• Finance & Accounting: [X] finance team members
• Legal & Compliance: [X] legal/compliance staff
• Executive/Leadership: [X] executives
• IT/Technology: [X] IT professionals
• Other roles: [Describe any other significant roles]

Our main products/services include:
[Describe what your company does]

Key challenges we face:
[List main operational challenges or pain points]`;

  // State for form inputs and workflow
  const [analysisType, setAnalysisType] = useState('website');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [combinedResults, setCombinedResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('input'); // 'input' | 'salary-adjust' | 'results'
  
  // Handle the complete analysis with corrected data
  const handleCompleteAnalysis = async (correctedData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the combined endpoint with original description and corrected data
      const result = await companyAnalysisApi.analyzeAndMatch(companyDescription, correctedData);
      setCombinedResults(result);
      setStage('results');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to complete analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initial form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous results and errors
    setAnalysisResults(null);
    setCombinedResults(null);
    setError(null);
    setIsLoading(true);
    
    try {
      // For the new flow, we'll use the combined endpoint directly
      if (analysisType === 'description' && companyDescription) {
        // First call to get initial analysis with salary adjustments
        const results = await companyAnalysisApi.analyzeAndMatch(companyDescription);
        setAnalysisResults(results);
        setStage('salary-adjust');
      } else if (analysisType === 'website' && websiteUrl) {
        // For website, we need to first get the description, then analyze
        setError('Website analysis coming soon! Please use company description for now.');
      } else {
        setError('Please enter ' + (analysisType === 'website' ? 'a valid URL' : 'a company description'));
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Error analyzing company. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle salary adjustment form submission
  const handleSalaryAdjustmentSubmit = (adjustedData) => {
    // Now make the final call with corrected data
    handleCompleteAnalysis(adjustedData);
  };
  
  // Handle salary adjustment cancellation
  const handleSalaryAdjustmentCancel = () => {
    setStage('input');
    setAnalysisResults(null);
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
      {stage === 'input' && (
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
                onClick={() => {
                  setAnalysisType('description');
                  // Populate template if description is empty
                  if (!companyDescription) {
                    setCompanyDescription(defaultTemplate);
                  }
                }}
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

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-2 text-gray-600">
            {stage === 'salary-adjust' 
              ? 'Analyzing company with Claude Sonnet 4...' 
              : 'Calculating ROI based on your specifications...'}
            <br />
            <span className="text-sm text-gray-500">
              This may take 30-60 seconds.
            </span>
          </p>
        </div>
      )}

      {/* Salary Adjustment Form */}
      {stage === 'salary-adjust' && !isLoading && analysisResults && (
        <div className="mb-8">
          <SalaryAdjustmentForm 
            analysisData={analysisResults} 
            onProceed={handleSalaryAdjustmentSubmit} 
            onCancel={handleSalaryAdjustmentCancel}
          />
        </div>
      )}

      {/* Results Section */}
      {stage === 'results' && combinedResults && (
        <>
          {/* Company Summary */}
          <div className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Company Summary</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-gray-500">Company</span>
                <p className="font-medium">{combinedResults.companyInfo?.name || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Industry</span>
                <p className="font-medium">{combinedResults.companyInfo?.industry}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Employees</span>
                <p className="font-medium">{combinedResults.companyInfo?.totalEmployees}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Location</span>
                <p className="font-medium">{combinedResults.companyInfo?.headquarters}</p>
              </div>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Implementation ROI Analysis</h2>
            <UseCaseMatchesV2 matches={combinedResults} />
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyAnalyzer;
