'use client';

import React from 'react';

export const ConfidenceIndicator = ({ score }) => {
  const confidenceScore = Math.round(Math.max(1, Math.min(5, score)));
  const filledCircles = confidenceScore;
  const emptyCircles = 5 - filledCircles;
  
  // Get the confidence level description
  const confidenceLevels = [
    'Very Low', // 1
    'Low',      // 2
    'Moderate', // 3
    'High',     // 4
    'Very High' // 5
  ];
  
  const confidenceLabel = confidenceLevels[confidenceScore - 1];
  
  // Determine the color based on the confidence level
  const getConfidenceColor = (score) => {
    if (score <= 2) return 'text-amber-600';
    if (score <= 3) return 'text-blue-600';
    return 'text-green-600';
  };
  
  const textColor = getConfidenceColor(confidenceScore);
  
  return (
    <div className="flex items-center">
      <span className={`text-xs mr-2 ${textColor}`}>
        {confidenceLabel} Confidence
      </span>
      <div className="flex">
        {[...Array(filledCircles)].map((_, i) => (
          <div key={`filled-${i}`} className={`w-2 h-2 rounded-full bg-current ${textColor} mr-1`}></div>
        ))}
        {[...Array(emptyCircles)].map((_, i) => (
          <div key={`empty-${i}`} className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
        ))}
      </div>
    </div>
  );
};

export default ConfidenceIndicator;