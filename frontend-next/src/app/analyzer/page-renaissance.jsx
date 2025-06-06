'use client';

import React, { useState, useEffect } from 'react';
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
    <div className="bg-gradient-to-r from-coral-50 to-orange-50 p-4 rounded-lg mb-6 border border-coral-100">
      <h3 className="text-lg font-medium text-coral-700 mb-2">Tips for better analysis</h3>
      <div className="text-sm text-coral-600">
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--renaissance-cream)' }}>
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Initial Analysis Form */}
        {stage === 'input' && (
          <div className="space-y-10">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-block">
                <h1 className="text-6xl font-cinzel font-medium tracking-wide" style={{ color: 'var(--renaissance-charcoal)' }}>
                  COMPANY ANALYZER
                </h1>
                <div className="mt-2 flex items-center justify-center space-x-4">
                  <span style={{ width: '60px', height: '1px', backgroundColor: 'var(--renaissance-gold)', opacity: 0.6 }}></span>
                  <span style={{ color: 'var(--renaissance-gold)', fontSize: '20px' }}>❦</span>
                  <span style={{ width: '60px', height: '1px', backgroundColor: 'var(--renaissance-gold)', opacity: 0.6 }}></span>
                </div>
              </div>
              <p className="text-lg italic" style={{ color: 'var(--renaissance-ink)', opacity: 0.8 }}>
                Unveil the potential of artificial intelligence for your enterprise
              </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
              {/* Tab Navigation */}
              <div className="flex">
                <button
                  type="button"
                  className={`flex-1 px-8 py-5 text-sm font-medium transition-all duration-300 border-b-2 ${
                    analysisType === 'website' 
                      ? '' 
                      : 'opacity-50'
                  }`}
                  style={{
                    backgroundColor: analysisType === 'website' ? 'var(--renaissance-sky)' : 'transparent',
                    borderBottomColor: analysisType === 'website' ? 'var(--renaissance-charcoal)' : 'transparent',
                    color: 'var(--renaissance-ink)'
                  }}
                  onClick={() => setAnalysisType('website')}
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="font-cinzel text-sm tracking-wider">Website Analysis</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex-1 px-8 py-5 text-sm font-medium transition-all duration-300 border-b-2 ${
                    analysisType === 'description' 
                      ? '' 
                      : 'opacity-50'
                  }`}
                  style={{
                    backgroundColor: analysisType === 'description' ? 'var(--renaissance-sage)' : 'transparent',
                    borderBottomColor: analysisType === 'description' ? 'var(--renaissance-charcoal)' : 'transparent',
                    color: 'var(--renaissance-ink)'
                  }}
                  onClick={() => {
                    setAnalysisType('description');
                    if (!companyDescription) {
                      setCompanyDescription(defaultTemplate);
                    }
                  }}
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-cinzel text-sm tracking-wider">Written Description</span>
                  </div>
                </button>
              </div>

              {/* Form Content */}
              <div className="px-10 py-10">
                {/* Analysis Guidance - Minimal */}
                <div className="mb-8 text-center">
                  <p className="text-sm italic" style={{ color: 'var(--renaissance-ink)', opacity: 0.7 }}>
                    For best results, include your industry, employee count by department, and current challenges.
                  </p>
                </div>
                
                {/* Input Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {analysisType === 'website' ? (
                    <div className="space-y-3">
                      <label className="block text-sm font-cinzel tracking-wide" style={{ color: 'var(--renaissance-charcoal)' }} htmlFor="websiteUrl">
                        Enter your company website
                      </label>
                      <div className="relative">
                        <input
                          id="websiteUrl"
                          type="text"
                          className="w-full px-5 py-4 text-base bg-white/70 backdrop-blur-sm border-2 rounded-2xl focus:outline-none transition-all duration-300 placeholder:italic"
                          style={{
                            borderColor: 'var(--renaissance-sky)',
                            color: 'var(--renaissance-ink)'
                          }}
                          placeholder="e.g., company.com"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          disabled={isLoading}
                          onFocus={(e) => e.target.style.borderColor = 'var(--renaissance-charcoal)'}
                          onBlur={(e) => e.target.style.borderColor = 'var(--renaissance-sky)'}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm font-cinzel tracking-wide" style={{ color: 'var(--renaissance-charcoal)' }} htmlFor="companyDescription">
                        Describe your enterprise
                      </label>
                      <textarea
                        id="companyDescription"
                        className="w-full px-5 py-4 text-base bg-white/70 backdrop-blur-sm border-2 rounded-2xl focus:outline-none transition-all duration-300 placeholder:italic leading-relaxed resize-none"
                        style={{
                          borderColor: 'var(--renaissance-sage)',
                          color: 'var(--renaissance-ink)',
                          lineHeight: '1.8'
                        }}
                        placeholder="Paint a picture of your company's essence..."
                        rows={14}
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        disabled={isLoading}
                        onFocus={(e) => e.target.style.borderColor = 'var(--renaissance-charcoal)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--renaissance-sage)'}
                      />
                    </div>
                  )}
                  
                  {/* Error message */}
                  {error && (
                    <div className="px-5 py-4 rounded-2xl" style={{ backgroundColor: 'var(--renaissance-blush)' }}>
                      <p className="text-sm italic" style={{ color: 'var(--renaissance-charcoal)' }}>{error}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-center pt-6">
                    <button
                      type="submit"
                      className={`inline-flex items-center px-10 py-4 text-base font-cinzel tracking-wider rounded-full transition-all duration-300 transform hover:scale-105 ${
                        isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-2xl'
                      }`}
                      style={{
                        backgroundColor: 'var(--renaissance-charcoal)',
                        color: 'var(--renaissance-cream)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Begin Analysis
                          <svg className="ml-3 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-coral-200 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-coral-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {stage === 'salary-adjust' 
                    ? 'Analyzing company with Claude Sonnet 4' 
                    : 'Calculating ROI based on your specifications'}
                </p>
                <p className="text-sm text-gray-500">
                  This may take 30-60 seconds
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Salary Adjustment Form */}
        {stage === 'salary-adjust' && !isLoading && analysisResults && (
          <div className="space-y-8">
            {/* Back button */}
            <button
              onClick={handleSalaryAdjustmentCancel}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to company description
            </button>
            
            <SalaryAdjustmentForm 
              analysisData={analysisResults} 
              onProceed={handleSalaryAdjustmentSubmit} 
              onCancel={handleSalaryAdjustmentCancel}
            />
          </div>
        )}

        {/* Results Section */}
        {stage === 'results' && combinedResults && (
          <div className="space-y-8">
            {/* Back button */}
            <button
              onClick={() => {
                setStage('input');
                setCombinedResults(null);
                setAnalysisResults(null);
              }}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Analyze another company
            </button>

            {/* Company Summary - Redesigned */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company</p>
                  <p className="text-base font-medium text-gray-900">{combinedResults.companyInfo?.name || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</p>
                  <p className="text-base font-medium text-gray-900">{combinedResults.companyInfo?.industry}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</p>
                  <p className="text-base font-medium text-gray-900">{combinedResults.companyInfo?.totalEmployees?.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</p>
                  <p className="text-base font-medium text-gray-900">{combinedResults.companyInfo?.headquarters}</p>
                </div>
              </div>
            </div>

            {/* ROI Analysis - Redesigned */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">AI Implementation ROI Analysis</h2>
                <p className="text-sm text-gray-600 mt-1">Projected savings and efficiency gains from Claude implementation</p>
              </div>
              <div className="p-6">
                <UseCaseMatchesV2 matches={combinedResults} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyAnalyzer;
