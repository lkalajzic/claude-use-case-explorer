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
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-md">
        <p className="text-gray-500">No suitable use cases found. Try providing more company information.</p>
      </div>
    );
  }
  
  // Sort matches by relevance score if they aren't already sorted
  const sortedMatches = [...matches].sort((a, b) => {
    const scoreA = typeof a.relevanceScore === 'number' ? a.relevanceScore : parseInt(a.relevanceScore.toString(), 10);
    const scoreB = typeof b.relevanceScore === 'number' ? b.relevanceScore : parseInt(b.relevanceScore.toString(), 10);
    return scoreB - scoreA;
  });
  
  return (
    <div className="space-y-6">
      {sortedMatches.map((match, index) => (
        <div key={index} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="border-b bg-gray-50 px-4 py-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">{match.useCase}</h3>
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
            
            <div className="flex justify-end mt-4">
              <Link 
                href={`/roi-calculator?useCase=${encodeURIComponent(match.useCase)}&relevanceScore=${match.relevanceScore}`}
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
