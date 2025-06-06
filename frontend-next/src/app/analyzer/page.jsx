"use client";

import React, { useState, useEffect } from "react";
import { companyAnalysisApi } from "../../services/api";
import AnalysisResults from "../../components/analysis/AnalysisResults";
import UseCaseMatches from "../../components/analysis/UseCaseMatches";
import UseCaseMatchesV2 from "../../components/analysis/UseCaseMatchesV2";
import { FormReview } from "../../components/analysis/FormReview";
import SalaryAdjustmentForm from "../../components/analysis/SalaryAdjustmentForm";

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
  const [analysisType, setAnalysisType] = useState("website");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [combinedResults, setCombinedResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState("input"); // 'input' | 'salary-adjust' | 'results'

  // Handle the complete analysis with corrected data
  const handleCompleteAnalysis = async (correctedData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the combined endpoint with original description and corrected data
      const result = await companyAnalysisApi.analyzeAndMatch(
        companyDescription,
        correctedData
      );
      setCombinedResults(result);
      setStage("results");
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to complete analysis. Please try again.");
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
      if (analysisType === "description" && companyDescription) {
        // First call to get initial analysis with salary adjustments
        const results = await companyAnalysisApi.analyzeAndMatch(
          companyDescription
        );
        setAnalysisResults(results);
        setStage("salary-adjust");
      } else if (analysisType === "website" && websiteUrl) {
        // For website, we need to first get the description, then analyze
        setError(
          "Website analysis coming soon! Please use company description for now."
        );
      } else {
        setError(
          "Please enter " +
            (analysisType === "website"
              ? "a valid URL"
              : "a company description")
        );
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Error analyzing company. Please try again.");
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
    setStage("input");
    setAnalysisResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-coral-50/20 via-white to-orange-50/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {/* Renaissance-style geometric pattern */}
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <pattern
            id="grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="5" cy="5" r="0.5" fill="#dc7454" />
            <path
              d="M 0 5 L 5 0 M 5 10 L 10 5"
              stroke="#dc7454"
              strokeWidth="0.1"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Modern neural network overlay - expanded */}
        <svg
          className="absolute bottom-0 right-0 w-2/3 h-2/3"
          viewBox="0 0 400 400"
        >
          <g opacity="0.5">
            {/* Input layer */}
            <circle cx="50" cy="100" r="3" fill="#dc7454" opacity="0.3" />
            <circle cx="50" cy="150" r="3" fill="#dc7454" opacity="0.3" />
            <circle cx="50" cy="200" r="3" fill="#dc7454" opacity="0.3" />
            <circle cx="50" cy="250" r="3" fill="#dc7454" opacity="0.3" />

            {/* Hidden layer 1 */}
            <circle cx="150" cy="80" r="4" fill="#1a1a1a" />
            <circle cx="150" cy="130" r="4" fill="#1a1a1a" />
            <circle cx="150" cy="180" r="4" fill="#1a1a1a" />
            <circle cx="150" cy="230" r="4" fill="#1a1a1a" />
            <circle cx="150" cy="280" r="4" fill="#1a1a1a" />

            {/* Hidden layer 2 */}
            <circle cx="250" cy="100" r="4" fill="#1a1a1a" />
            <circle cx="250" cy="175" r="4" fill="#1a1a1a" />
            <circle cx="250" cy="250" r="4" fill="#1a1a1a" />

            {/* Output layer */}
            <circle cx="350" cy="150" r="3" fill="#dc7454" opacity="0.3" />
            <circle cx="350" cy="200" r="3" fill="#dc7454" opacity="0.3" />

            {/* Connections - only showing some for visual clarity */}
            <line
              x1="50"
              y1="100"
              x2="150"
              y2="80"
              stroke="#1a1a1a"
              strokeWidth="0.2"
            />
            <line
              x1="50"
              y1="150"
              x2="150"
              y2="130"
              stroke="#1a1a1a"
              strokeWidth="0.2"
            />
            <line
              x1="150"
              y1="130"
              x2="250"
              y2="100"
              stroke="#1a1a1a"
              strokeWidth="0.2"
            />
            <line
              x1="150"
              y1="180"
              x2="250"
              y2="175"
              stroke="#1a1a1a"
              strokeWidth="0.2"
            />
            <line
              x1="250"
              y1="175"
              x2="350"
              y2="150"
              stroke="#1a1a1a"
              strokeWidth="0.2"
            />
            <line
              x1="250"
              y1="250"
              x2="350"
              y2="200"
              stroke="#1a1a1a"
              strokeWidth="0.2"
            />
          </g>
        </svg>

        {/* Da Vinci style technical drawing elements */}
        <svg
          className="absolute top-10 right-10 w-32 h-32 opacity-20"
          viewBox="0 0 100 100"
        >
          {/* Vitruvian circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="0.3"
          />
          {/* Square inscribed */}
          <rect
            x="20"
            y="20"
            width="60"
            height="60"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="0.3"
            transform="rotate(45 50 50)"
          />
          {/* Golden ratio spiral hint */}
          <path
            d="M 50 50 Q 80 50 80 80 T 50 110"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="0.2"
          />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-20 relative z-10">
        {/* Initial Analysis Form */}
        {stage === "input" && (
          <div className="space-y-12">
            {/* Header with decorative elements */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                {/* Decorative frame inspired by renaissance borders */}
                <div className="absolute -top-6 -left-8 w-6 h-6 border-t-2 border-l-2 border-coral-400/30"></div>
                <div className="absolute -top-6 -right-8 w-6 h-6 border-t-2 border-r-2 border-coral-400/30"></div>
                <div className="absolute -bottom-6 -left-8 w-6 h-6 border-b-2 border-l-2 border-coral-400/30"></div>
                <div className="absolute -bottom-6 -right-8 w-6 h-6 border-b-2 border-r-2 border-coral-400/30"></div>

                <h1 className="text-7xl font-light tracking-tight text-gray-900 font-serif">
                  Company Analyzer
                </h1>
              </div>

              {/* Decorative divider */}
              <div className="flex items-center justify-center space-x-4 my-6">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-coral-500/40"></div>
                <div className="relative">
                  <div className="w-8 h-8 border border-coral-500/40 rotate-45"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-coral-400 to-coral-600 rounded-full"></div>
                  </div>
                </div>
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-coral-500/40"></div>
              </div>

              <p className="text-lg text-gray-600 font-light italic">
                Describe your company and get an ROI estimate of implementing AI
                based on 120 real-world case studies of Fortune 100s and
                startups.
              </p>

              {/* Additional decorative elements */}
              <div className="absolute -left-40 top-1/2 transform -translate-y-1/2 opacity-30">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {/* Da Vinci style compass */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#dc7454"
                    strokeWidth="1"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="none"
                    stroke="#dc7454"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M 60 10 L 65 30 L 60 60 L 55 30 Z"
                    fill="#dc7454"
                    opacity="0.5"
                  />
                  <path
                    d="M 110 60 L 90 65 L 60 60 L 90 55 Z"
                    fill="#dc7454"
                    opacity="0.5"
                  />
                </svg>
              </div>
              <div className="absolute -right-40 top-1/2 transform -translate-y-1/2 opacity-30">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {/* Renaissance astrolabe inspired */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#dc7454"
                    strokeWidth="1"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="35"
                    fill="none"
                    stroke="#dc7454"
                    strokeWidth="0.5"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="20"
                    fill="none"
                    stroke="#dc7454"
                    strokeWidth="0.5"
                  />
                  {/* Radial lines */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
                    (angle) => (
                      <line
                        key={angle}
                        x1="60"
                        y1="60"
                        x2={60 + 45 * Math.cos((angle * Math.PI) / 180)}
                        y2={60 + 45 * Math.sin((angle * Math.PI) / 180)}
                        stroke="#dc7454"
                        strokeWidth="0.3"
                        opacity="0.5"
                      />
                    )
                  )}
                </svg>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm border border-coral-100 shadow-xl relative">
                {/* Corner decorations */}
                <div className="absolute -top-px -left-px w-16 h-16 border-t-2 border-l-2 border-coral-400/40"></div>
                <div className="absolute -top-px -right-px w-16 h-16 border-t-2 border-r-2 border-coral-400/40"></div>
                <div className="absolute -bottom-px -left-px w-16 h-16 border-b-2 border-l-2 border-coral-400/40"></div>
                <div className="absolute -bottom-px -right-px w-16 h-16 border-b-2 border-r-2 border-coral-400/40"></div>

                {/* Tab Selection */}
                <div className="flex border-b border-coral-100">
                  <button
                    type="button"
                    className={`flex-1 px-8 py-5 text-sm tracking-wide transition-all duration-300 relative ${
                      analysisType === "website"
                        ? "text-coral-800 bg-gradient-to-r from-coral-50 to-orange-50"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setAnalysisType("website")}
                    disabled={isLoading}
                  >
                    {analysisType === "website" && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-coral-500"></div>
                    )}
                    <span className="font-medium">Website Analysis</span>
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-8 py-5 text-sm tracking-wide transition-all duration-300 relative ${
                      analysisType === "description"
                        ? "text-coral-800 bg-gradient-to-r from-coral-50 to-orange-50"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => {
                      setAnalysisType("description");
                      if (!companyDescription) {
                        setCompanyDescription(defaultTemplate);
                      }
                    }}
                    disabled={isLoading}
                  >
                    {analysisType === "description" && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-coral-500"></div>
                    )}
                    <span className="font-medium">Written Description</span>
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-10 relative">
                  {/* Subtle background pattern - da Vinci notebook style */}
                  <div className="absolute inset-0 opacity-10">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 200 200"
                      preserveAspectRatio="xMidYMid slice"
                    >
                      <pattern
                        id="davinci-grid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 20 0 L 0 0 0 20"
                          fill="none"
                          stroke="#dc7454"
                          strokeWidth="0.5"
                        />
                        <circle
                          cx="10"
                          cy="10"
                          r="1"
                          fill="#dc7454"
                          opacity="0.3"
                        />
                      </pattern>
                      <rect
                        width="200"
                        height="200"
                        fill="url(#davinci-grid)"
                      />
                      {/* Mathematical annotations */}
                      <text
                        x="30"
                        y="40"
                        fontSize="8"
                        fill="#dc7454"
                        opacity="0.2"
                        fontStyle="italic"
                      >
                        φ = 1.618...
                      </text>
                      <text
                        x="120"
                        y="80"
                        fontSize="8"
                        fill="#dc7454"
                        opacity="0.2"
                        fontStyle="italic"
                      >
                        ∑(n)
                      </text>
                      <text
                        x="60"
                        y="140"
                        fontSize="8"
                        fill="#dc7454"
                        opacity="0.2"
                        fontStyle="italic"
                      >
                        ∂f/∂x
                      </text>
                    </svg>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-8 relative z-10"
                  >
                    {analysisType === "website" ? (
                      <div className="space-y-3">
                        <label
                          className="block text-xs uppercase tracking-[0.2em] text-coral-700"
                          htmlFor="websiteUrl"
                        >
                          Website URL
                        </label>
                        <input
                          id="websiteUrl"
                          type="text"
                          className="w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:border-gray-600 transition-colors placeholder:text-gray-400"
                          placeholder="company.com"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label
                          className="block text-xs uppercase tracking-[0.2em] text-coral-700"
                          htmlFor="companyDescription"
                        >
                          Company Description
                        </label>
                        {/* Helper text moved above */}
                        <div className="flex items-start space-x-2 text-sm text-gray-600 mb-4">
                          <span className="text-coral-500 mt-1">❦</span>
                          <p className="font-light">
                            Include industry classification, departmental
                            headcount, and operational challenges for optimal
                            analysis.
                          </p>
                        </div>
                        <textarea
                          id="companyDescription"
                          className="w-full px-0 py-3 text-base bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:border-gray-600 transition-colors placeholder:text-gray-400 leading-relaxed resize-none font-mono"
                          placeholder="Describe your company..."
                          rows={20}
                          value={companyDescription}
                          onChange={(e) =>
                            setCompanyDescription(e.target.value)
                          }
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    {/* Error message */}
                    {error && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-center pt-6 relative">
                      {/* Decorative elements around button */}
                      <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 opacity-40">
                        <svg width="40" height="40" viewBox="0 0 40 40">
                          <circle
                            cx="20"
                            cy="20"
                            r="15"
                            fill="none"
                            stroke="#dc7454"
                            strokeWidth="0.5"
                          />
                          <path
                            d="M 20 5 L 35 20 L 20 35 L 5 20 Z"
                            fill="none"
                            stroke="#dc7454"
                            strokeWidth="0.5"
                          />
                        </svg>
                      </div>
                      <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2 opacity-40">
                        <svg width="40" height="40" viewBox="0 0 40 40">
                          <circle
                            cx="20"
                            cy="20"
                            r="15"
                            fill="none"
                            stroke="#dc7454"
                            strokeWidth="0.5"
                          />
                          <path
                            d="M 20 5 L 35 20 L 20 35 L 5 20 Z"
                            fill="none"
                            stroke="#dc7454"
                            strokeWidth="0.5"
                            transform="rotate(45 20 20)"
                          />
                        </svg>
                      </div>

                      <button
                        type="submit"
                        className={`group relative px-12 py-4 text-sm font-medium tracking-wider text-white bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 transition-all duration-300 shadow-lg hover:shadow-xl ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading}
                      >
                        {/* Button corner decorations */}
                        <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute -top-px -right-px w-3 h-3 border-t border-r border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {isLoading ? "ANALYZING..." : "COMMENCE ANALYSIS"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="relative">
                {/* Renaissance-inspired loading animation */}
                <div className="w-24 h-24 border-2 border-coral-200 rounded-full animate-pulse"></div>
                <div
                  className="absolute inset-0 w-24 h-24 border-2 border-coral-500 rounded-full animate-spin"
                  style={{
                    borderTopColor: "transparent",
                    borderRightColor: "transparent",
                  }}
                ></div>
                <div className="absolute inset-4 w-16 h-16 border-2 border-coral-400 rotate-45 animate-pulse"></div>
              </div>
              <p className="text-sm font-light text-gray-600 italic">
                {stage === "salary-adjust"
                  ? "Analyzing your enterprise with artificial intelligence..."
                  : "Calculating return on investment..."}
              </p>
            </div>
          </div>
        )}

        {/* Salary Adjustment Form */}
        {stage === "salary-adjust" && !isLoading && analysisResults && (
          <div className="space-y-8">
            <button
              onClick={handleSalaryAdjustmentCancel}
              className="text-sm text-coral-600 hover:text-coral-700 transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span>Return to description</span>
            </button>

            <SalaryAdjustmentForm
              analysisData={analysisResults}
              onProceed={handleSalaryAdjustmentSubmit}
              onCancel={handleSalaryAdjustmentCancel}
            />
          </div>
        )}

        {/* Results Section */}
        {stage === "results" && combinedResults && (
          <div className="space-y-8">
            <button
              onClick={() => {
                setStage("input");
                setCombinedResults(null);
                setAnalysisResults(null);
              }}
              className="text-sm text-coral-600 hover:text-coral-700 transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span>New Analysis</span>
            </button>

            {/* Company Summary with decorative frame */}
            <div className="bg-white/80 backdrop-blur-sm border border-coral-100 shadow-lg p-8 relative">
              <div className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-coral-400/40"></div>
              <div className="absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-coral-400/40"></div>
              <div className="absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-coral-400/40"></div>
              <div className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2 border-coral-400/40"></div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-coral-700">
                    Company
                  </p>
                  <p className="mt-2 text-lg font-light">
                    {combinedResults.companyInfo?.name || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-coral-700">
                    Industry
                  </p>
                  <p className="mt-2 text-lg font-light">
                    {combinedResults.companyInfo?.industry}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-coral-700">
                    Employees
                  </p>
                  <p className="mt-2 text-lg font-light">
                    {combinedResults.companyInfo?.totalEmployees?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-coral-700">
                    Location
                  </p>
                  <p className="mt-2 text-lg font-light">
                    {combinedResults.companyInfo?.headquarters}
                  </p>
                </div>
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="pt-6">
              <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
                Artificial Intelligence Implementation Analysis
              </h2>
              <UseCaseMatchesV2 matches={combinedResults} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyAnalyzer;
