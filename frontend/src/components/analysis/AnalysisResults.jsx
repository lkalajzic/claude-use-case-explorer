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

// Helper function to render a section with confidence
const AnalysisSection = ({ title, children, confidence }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {confidence && <ConfidenceIndicator score={confidence} />}
    </div>
    <div className="bg-gray-50 p-4 rounded-md">
      {children}
    </div>
  </div>
);

// Main component
const AnalysisResults = ({ analysis }) => {
  // Handle case where analysis is not yet available
  if (!analysis) return null;
  
  return (
    <div>
      {/* Company Information */}
      <AnalysisSection 
        title="Company Information" 
        confidence={analysis.companyInfo?.industry?.confidence || analysis.confidenceScore?.companyInfo}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{analysis.companyInfo?.name || "Not identified"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Industry</p>
            <p className="font-medium">{analysis.companyInfo?.industry?.primary || analysis.companyInfo?.industry || "Not identified"}</p>
            
            {analysis.companyInfo?.industry?.secondary && (
              <div className="mt-1">
                <p className="text-xs text-gray-500">Secondary Industries</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysis.companyInfo.industry.secondary.map((industry, idx) => (
                    <span key={idx} className="text-xs bg-gray-200 rounded px-2 py-1">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="font-medium">
              {analysis.companyInfo?.size?.category || analysis.companyInfo?.size || "Not identified"}
              {analysis.companyInfo?.size?.employeeEstimate && ` (Est. ${analysis.companyInfo.size.employeeEstimate} employees)`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Geography</p>
            <p className="font-medium">
              {analysis.companyInfo?.geography?.headquarters || 
               analysis.companyInfo?.region || 
               analysis.companyInfo?.geography || 
               "Not identified"}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm text-gray-500">Description</p>
          <p className="text-sm">{analysis.companyInfo?.companyDescription || analysis.companyDesc || "No description available"}</p>
        </div>
      </AnalysisSection>
      
      {/* Business Focus */}
      {(analysis.businessFocus || analysis.implementation) && (
        <AnalysisSection 
          title="Business Focus" 
          confidence={analysis.businessFocus?.confidence || analysis.confidenceScore?.implementation}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Products and Services */}
            <div>
              <p className="text-sm text-gray-500">Products & Services</p>
              {analysis.businessFocus?.products && (
                <div>
                  <p className="text-xs text-gray-500 mt-2">Products</p>
                  <ul className="list-disc pl-5 text-sm">
                    {analysis.businessFocus.products.map((product, idx) => (
                      <li key={idx}>{product}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.businessFocus?.services && (
                <div>
                  <p className="text-xs text-gray-500 mt-2">Services</p>
                  <ul className="list-disc pl-5 text-sm">
                    {analysis.businessFocus.services.map((service, idx) => (
                      <li key={idx}>{service}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.implementation?.useCase && (
                <p className="mt-2">{analysis.implementation.useCase}</p>
              )}
            </div>
            
            {/* Target Customers and Value Proposition */}
            <div>
              <p className="text-sm text-gray-500">Target Customers</p>
              {analysis.businessFocus?.targetCustomers ? (
                <ul className="list-disc pl-5 text-sm">
                  {analysis.businessFocus.targetCustomers.map((customer, idx) => (
                    <li key={idx}>{customer}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">Not identified</p>
              )}
              
              {analysis.businessFocus?.valueProposition && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Value Proposition</p>
                  <p className="text-sm">{analysis.businessFocus.valueProposition}</p>
                </div>
              )}
            </div>
          </div>
        </AnalysisSection>
      )}
      
      {/* Technical Profile */}
      {analysis.technicalProfile && (
        <AnalysisSection 
          title="Technical Profile" 
          confidence={analysis.technicalProfile.confidence}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Digital Maturity</p>
              <div className="flex items-center mt-1">
                <div className={`h-2 rounded-full ${
                  analysis.technicalProfile.digitalMaturity === 'High' ? 'bg-green-500 w-3/3' :
                  analysis.technicalProfile.digitalMaturity === 'Medium' ? 'bg-yellow-500 w-2/3' :
                  'bg-red-500 w-1/3'
                }`}></div>
                <span className="ml-2 text-sm">{analysis.technicalProfile.digitalMaturity}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Automation Level</p>
              <div className="flex items-center mt-1">
                <div className={`h-2 rounded-full ${
                  analysis.technicalProfile.automationLevel === 'High' ? 'bg-green-500 w-3/3' :
                  analysis.technicalProfile.automationLevel === 'Medium' ? 'bg-yellow-500 w-2/3' :
                  'bg-red-500 w-1/3'
                }`}></div>
                <span className="ml-2 text-sm">{analysis.technicalProfile.automationLevel}</span>
              </div>
            </div>
          </div>
          
          {analysis.technicalProfile.technologies && analysis.technicalProfile.technologies.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-500">Technologies</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.technicalProfile.technologies.map((tech, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {analysis.technicalProfile.integrations && analysis.technicalProfile.integrations.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-500">Integrations</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.technicalProfile.integrations.map((integration, idx) => (
                  <span key={idx} className="text-xs bg-purple-100 text-purple-800 rounded px-2 py-1">
                    {integration}
                  </span>
                ))}
              </div>
            </div>
          )}
        </AnalysisSection>
      )}
      
      {/* Business Challenges */}
      {analysis.businessChallenges && (
        <AnalysisSection 
          title="Business Challenges" 
          confidence={analysis.businessChallenges.confidence}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Explicit Challenges */}
            {analysis.businessChallenges.explicitChallenges && analysis.businessChallenges.explicitChallenges.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Explicit Challenges</p>
                <ul className="list-disc pl-5 text-sm">
                  {analysis.businessChallenges.explicitChallenges.map((challenge, idx) => (
                    <li key={idx}>{challenge}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Implied Challenges */}
            {analysis.businessChallenges.impliedChallenges && analysis.businessChallenges.impliedChallenges.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Implied Challenges</p>
                <ul className="list-disc pl-5 text-sm">
                  {analysis.businessChallenges.impliedChallenges.map((challenge, idx) => (
                    <li key={idx}>{challenge}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Problem from case study format */}
          {analysis.implementation?.problem && (
            <div className="mt-3">
              <p className="text-sm text-gray-500">Identified Problem</p>
              <p className="text-sm mt-1">{analysis.implementation.problem}</p>
            </div>
          )}
        </AnalysisSection>
      )}
      
      {/* AI Opportunities (First Look) */}
      {analysis.aiOpportunities && (
        <AnalysisSection title="AI Opportunity Assessment">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Content Generation */}
            <div className="bg-white p-3 rounded-md border">
              <div className="flex justify-between">
                <h4 className="font-medium">Content Generation</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  analysis.aiOpportunities.contentGeneration.potential === 'High' ? 'bg-green-100 text-green-800' :
                  analysis.aiOpportunities.contentGeneration.potential === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {analysis.aiOpportunities.contentGeneration.potential}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Potential Uses</p>
                <ul className="list-disc pl-4 text-xs">
                  {analysis.aiOpportunities.contentGeneration.specificUses.map((use, idx) => (
                    <li key={idx}>{use}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end mt-2">
                <ConfidenceIndicator score={analysis.aiOpportunities.contentGeneration.confidence} />
              </div>
            </div>
            
            {/* Customer Service */}
            <div className="bg-white p-3 rounded-md border">
              <div className="flex justify-between">
                <h4 className="font-medium">Customer Service</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  analysis.aiOpportunities.customerService.potential === 'High' ? 'bg-green-100 text-green-800' :
                  analysis.aiOpportunities.customerService.potential === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {analysis.aiOpportunities.customerService.potential}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Potential Uses</p>
                <ul className="list-disc pl-4 text-xs">
                  {analysis.aiOpportunities.customerService.specificUses.map((use, idx) => (
                    <li key={idx}>{use}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end mt-2">
                <ConfidenceIndicator score={analysis.aiOpportunities.customerService.confidence} />
              </div>
            </div>
            
            {/* Research Needs */}
            <div className="bg-white p-3 rounded-md border">
              <div className="flex justify-between">
                <h4 className="font-medium">Research & Analysis</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  analysis.aiOpportunities.researchNeeds.potential === 'High' ? 'bg-green-100 text-green-800' :
                  analysis.aiOpportunities.researchNeeds.potential === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {analysis.aiOpportunities.researchNeeds.potential}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Potential Uses</p>
                <ul className="list-disc pl-4 text-xs">
                  {analysis.aiOpportunities.researchNeeds.specificUses.map((use, idx) => (
                    <li key={idx}>{use}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end mt-2">
                <ConfidenceIndicator score={analysis.aiOpportunities.researchNeeds.confidence} />
              </div>
            </div>
          </div>
        </AnalysisSection>
      )}
      
      {/* Analysis Metadata */}
      {analysis.analysisMetadata && (
        <div className="text-xs text-gray-500 mt-6 flex justify-between">
          <span>Source: {analysis.analysisMetadata.source}</span>
          <span>Analysis Date: {analysis.analysisMetadata.analysisDate}</span>
          <span>Overall Confidence: {analysis.analysisMetadata.overallConfidence}/5</span>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
