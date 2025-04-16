'use client';

import React from 'react';
import Link from 'next/link';

// Helper function to render relevance score
const RelevanceScore = ({ score }) => {
  // Convert score to percentage for visual display
  const percentage = typeof score === 'number' ? score : parseInt(score.toString(), 10);
  const width = `${percentage}%`;
  
  // Determine color based on score
  let bgColor = 'bg-gray-200';
  let fillColor = 'bg-gray-400';
  
  if (percentage >= 80) {
    fillColor = 'bg-green-500';
  } else if (percentage >= 60) {
    fillColor = 'bg-blue-500';
  } else if (percentage >= 40) {
    fillColor = 'bg-yellow-500';
  } else {
    fillColor = 'bg-orange-500';
  }
  
  return (
    <div className="flex items-center">
      <div className={`w-full h-2 rounded-full ${bgColor} mr-2`}>
        <div className={`h-2 rounded-full ${fillColor}`} style={{ width }}></div>
      </div>
      <span className="text-sm font-medium">{percentage}%</span>
    </div>
  );
};

const UseCaseMatches = ({ matches }) => {
  // If no matches are provided or array is empty
  if (!matches || !matches.useCases || matches.useCases.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-md">
        <p className="text-gray-500">No suitable use cases found. Try providing more company information.</p>
      </div>
    );
  }
  
  // Sort matches by relevance score if they aren't already sorted
  const sortedMatches = [...matches.useCases].sort((a, b) => {
    const scoreA = typeof a.relevanceScore === 'number' ? a.relevanceScore : parseInt(a.relevanceScore.toString(), 10);
    const scoreB = typeof b.relevanceScore === 'number' ? b.relevanceScore : parseInt(b.relevanceScore.toString(), 10);
    return scoreB - scoreA;
  });
  
  // Function to format case study ID for URL
  const formatCaseStudyUrl = (id) => {
    if (!id) return '/use-cases';
    
    // Handle special cases based on the examples provided
    // 1. Convert dots to underscores (e.g., copy.ai -> copy_ai)
    // 2. Keep hyphens as is
    // 3. Take only the first part before parentheses or spaces
    // 4. Make everything lowercase
    
    let formattedId = id
      .toLowerCase()
      .replace(/\./g, '_')                // Replace dots with underscores
      .replace(/\s+\([^)]*\)/g, '')       // Remove anything in parentheses with preceding space
      .split(/\s+/)[0];                   // Take only the first part before any spaces
    
    return `/use-cases/${formattedId}`;
  };
  
  return (
    <div className="space-y-6">
      {sortedMatches.map((match, index) => (
        <div key={index} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="border-b bg-gray-50 px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-800">{match.name}</h3>
                {match.id && (
                  <Link href={formatCaseStudyUrl(match.id)} className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline">
                    View Case Study
                  </Link>
                )}
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                match.relevanceScore >= 80 ? 'bg-green-100 text-green-800' :
                match.relevanceScore >= 60 ? 'bg-blue-100 text-blue-800' :
                match.relevanceScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {match.relevanceScore >= 80 ? 'Excellent Match' :
                 match.relevanceScore >= 60 ? 'Good Match' :
                 match.relevanceScore >= 40 ? 'Potential Match' :
                 'Possible Match'}
              </span>
            </div>
            <div className="mt-2">
              <RelevanceScore score={match.relevanceScore} />
            </div>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Why This Matches Your Company</h4>
              <p className="text-sm text-gray-600">{match.relevanceExplanation}</p>
            </div>
            
            {/* Target Roles Section */}
            {match.targetRoles && match.targetRoles.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Target Roles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {match.targetRoles.map((role, idx) => (
                    <div key={idx} className="flex items-center border rounded-md p-2 bg-gray-50">
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{role.role}</p>
                        <p className="text-xs text-gray-600">
                          {role.employeeCount} employees · {role.timeSavings} time savings
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Implementation Ideas</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {match.implementationIdeas.map((idea, idx) => (
                    <li key={idx}>{idea}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Benefits</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {match.expectedBenefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Potential Challenges</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {match.expectedChallenges.map((challenge, idx) => (
                  <li key={idx}>{challenge}</li>
                ))}
              </ul>
            </div>
            
            {/* Implementation Cost Section */}
            {match.estimatedImplementationCost && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Implementation Cost</h4>
                <p className="text-sm">
                  <span className={`font-medium ${
                    match.estimatedImplementationCost.level.includes('Low') ? 'text-green-600' :
                    match.estimatedImplementationCost.level.includes('Medium') ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {match.estimatedImplementationCost.level}
                  </span>
                  {match.estimatedImplementationCost.range && ` - ${match.estimatedImplementationCost.range}`}
                </p>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4">
              <div>
                {match.totalEmployeesAffected && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    {match.totalEmployeesAffected} employees affected
                  </span>
                )}
              </div>
              <Link 
                href={`/roi-calculator?useCase=${encodeURIComponent(match.name)}&relevanceScore=${match.relevanceScore}`}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Calculate ROI for This Use Case
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UseCaseMatches;
