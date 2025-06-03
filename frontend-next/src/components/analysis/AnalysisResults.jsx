'use client';

import React from 'react';

// Helper function to render confidence indicator
const ConfidenceIndicator = ({ score }) => {
  const filledCircles = Math.round(score);
  const emptyCircles = 5 - filledCircles;
  
  return (
    <div className="flex items-center">
      {[...Array(filledCircles)].map((_, i) => (
        <div key={`filled-${i}`} className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
      ))}
      {[...Array(emptyCircles)].map((_, i) => (
        <div key={`empty-${i}`} className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
      ))}
      <span className="text-xs text-gray-500 ml-1">{score}/5</span>
    </div>
  );
};

// Helper function to render a section with confidence - now more compact
const AnalysisSection = ({ title, children, confidence }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <h3 className="text-md font-semibold text-gray-700">{title}</h3>
      {confidence && <ConfidenceIndicator score={confidence} />}
    </div>
    <div className="bg-gray-50 p-2 rounded-md">
      {children}
    </div>
  </div>
);

// Main component
const AnalysisResults = ({ analysis }) => {
  // Handle case where analysis is not yet available
  if (!analysis) return null;
  
  return (
    <div className="pb-2 border-b border-gray-200">
      {/* Company Information - more compact */}
      <AnalysisSection 
        title="Company Information" 
        confidence={
          typeof analysis.companyInfo?.industry === 'object' 
            ? analysis.companyInfo.industry.confidence 
            : analysis.confidenceScore?.companyInfo
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-1">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium">{analysis.companyInfo?.name || "Not identified"}</p>
          </div>
          <div>
            <p className="text-gray-500">Industry</p>
            <p className="font-medium">
              {typeof analysis.companyInfo?.industry === 'object' 
                ? analysis.companyInfo.industry.primary 
                : analysis.companyInfo?.industry || "Not identified"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Size</p>
            <p className="font-medium">
              {typeof analysis.companyInfo?.size === 'object' 
                ? analysis.companyInfo.size.category 
                : analysis.companyInfo?.size || "Not identified"}
              {typeof analysis.companyInfo?.size === 'object' && 
               analysis.companyInfo.size.employeeEstimate && 
               ` (${analysis.companyInfo.size.employeeEstimate})`}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Geography</p>
            <p className="font-medium">
              {analysis.companyInfo?.geography?.headquarters || 
               analysis.companyInfo?.region || 
               (typeof analysis.companyInfo?.geography === 'string' ? analysis.companyInfo.geography : null) || 
               "Not identified"}
            </p>
          </div>
        </div>
      </AnalysisSection>
      
      {/* Business Focus - simplified */}
      {(analysis.businessFocus || analysis.implementation) && (
        <AnalysisSection 
          title="Business Focus" 
          confidence={analysis.businessFocus?.confidence || analysis.confidenceScore?.implementation}
        >
          <div className="flex flex-wrap gap-1 text-xs">
            {/* Products */}
            {analysis.businessFocus?.products && analysis.businessFocus.products.length > 0 && (
              <div className="w-full">
                <span className="text-gray-500 mr-1">Products:</span>
                <span className="font-medium">{analysis.businessFocus.products.join(', ')}</span>
              </div>
            )}
            
            {/* Services */}
            {analysis.businessFocus?.services && analysis.businessFocus.services.length > 0 && (
              <div className="w-full">
                <span className="text-gray-500 mr-1">Services:</span>
                <span className="font-medium">{analysis.businessFocus.services.join(', ')}</span>
              </div>
            )}
            
            {/* Value Proposition */}
            {analysis.businessFocus?.valueProposition && (
              <div className="w-full">
                <span className="text-gray-500 mr-1">Value Proposition:</span>
                <span className="font-medium">{analysis.businessFocus.valueProposition.length > 100 ? analysis.businessFocus.valueProposition.substring(0, 100) + '...' : analysis.businessFocus.valueProposition}</span>
              </div>
            )}
          </div>
        </AnalysisSection>
      )}
      
      {/* Technical Profile - simplified */}
      {analysis.technicalProfile && (
        <AnalysisSection 
          title="Technical Profile" 
          confidence={analysis.technicalProfile.confidence}
        >
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Digital Maturity & Automation Level */}
            <div className="flex items-center gap-4">
              <div>
                <span className="text-gray-500 mr-1">Digital Maturity:</span>
                <span className={`font-medium px-2 py-0.5 rounded ${
                  analysis.technicalProfile.digitalMaturity === 'High' ? 'bg-green-100 text-green-800' :
                  analysis.technicalProfile.digitalMaturity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>{analysis.technicalProfile.digitalMaturity}</span>
              </div>
              
              <div>
                <span className="text-gray-500 mr-1">Automation:</span>
                <span className={`font-medium px-2 py-0.5 rounded ${
                  analysis.technicalProfile.automationLevel === 'High' ? 'bg-green-100 text-green-800' :
                  analysis.technicalProfile.automationLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>{analysis.technicalProfile.automationLevel}</span>
              </div>
            </div>
            
            {/* Technologies */}
            {analysis.technicalProfile.technologies && analysis.technicalProfile.technologies.length > 0 && (
              <div className="flex items-center flex-wrap">
                <span className="text-gray-500 mr-1">Tech:</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.technicalProfile.technologies.map((tech, idx) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AnalysisSection>
      )}
      
      {/* Business Challenges - simplified */}
      {analysis.businessChallenges && (
        <AnalysisSection 
          title="Business Challenges" 
          confidence={analysis.businessChallenges.confidence}
        >
          <div className="text-xs">
            {/* Key Challenges (combined explicit and implied) */}
            <div className="flex flex-wrap">
              {[...(analysis.businessChallenges.explicitChallenges || []), ...(analysis.businessChallenges.impliedChallenges || [])].map((challenge, idx) => (
                <span 
                  key={idx} 
                  className="mr-2 mb-1 px-2 py-0.5 bg-red-50 text-red-800 rounded"
                >
                  {challenge}
                </span>
              ))}
            </div>
          </div>
        </AnalysisSection>
      )}
      
      {/* AI Opportunities - simplified */}
      {analysis.aiOpportunities && (
        <AnalysisSection title="AI Opportunity Assessment">
          <div className="flex flex-wrap gap-2">
            {/* Content Generation */}
            {analysis.aiOpportunities.contentGeneration && (
              <div className="flex items-center">
                <span className="font-medium text-xs mr-1">Content:</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  analysis.aiOpportunities.contentGeneration.potential === 'High' ? 'bg-green-100 text-green-800' :
                  analysis.aiOpportunities.contentGeneration.potential === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {analysis.aiOpportunities.contentGeneration.potential}
                </span>
              </div>
            )}
            
            {/* Customer Service */}
            {analysis.aiOpportunities.customerService && (
              <div className="flex items-center">
                <span className="font-medium text-xs mr-1">Customer Svc:</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  analysis.aiOpportunities.customerService.potential === 'High' ? 'bg-green-100 text-green-800' :
                  analysis.aiOpportunities.customerService.potential === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {analysis.aiOpportunities.customerService.potential}
                </span>
              </div>
            )}
            
            {/* Research Needs */}
            {analysis.aiOpportunities.researchNeeds && (
              <div className="flex items-center">
                <span className="font-medium text-xs mr-1">Research:</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  analysis.aiOpportunities.researchNeeds.potential === 'High' ? 'bg-green-100 text-green-800' :
                  analysis.aiOpportunities.researchNeeds.potential === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {analysis.aiOpportunities.researchNeeds.potential}
                </span>
              </div>
            )}
            
            {/* Document Processing */}
            {analysis.aiOpportunities.documentProcessing && (
              <div className="flex items-center">
                <span className="font-medium text-xs mr-1">Documents:</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  analysis.aiOpportunities.documentProcessing.potential === 'High' ? 'bg-green-100 text-green-800' :
                  analysis.aiOpportunities.documentProcessing.potential === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {analysis.aiOpportunities.documentProcessing.potential}
                </span>
              </div>
            )}
            
            {/* Data Analysis */}
            {analysis.aiOpportunities.dataAnalysis && (
              <div className="flex items-center">
                <span className="font-medium text-xs mr-1">Data Analysis:</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  analysis.aiOpportunities.dataAnalysis.potential === 'High' ? 'bg-green-100 text-green-800' :
                  analysis.aiOpportunities.dataAnalysis.potential === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {analysis.aiOpportunities.dataAnalysis.potential}
                </span>
              </div>
            )}
          </div>
        </AnalysisSection>
      )}
    </div>
  );
};

export default AnalysisResults;
