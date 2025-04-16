'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Default hourly rates by role (can be customized)
const DEFAULT_HOURLY_RATES = {
  "Engineering/Development": 75,
  "Customer Service/Support": 30,
  "Marketing/Content": 45,
  "Sales": 60,
  "Legal/Compliance": 90,
  "Research/Data Analysis": 65,
  "Operations/Administration": 35,
  "Executive/Management": 100,
  "Other": 50
};

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

// Helper function to calculate ROI
const calculateRoi = (useCase, hourlyRates = DEFAULT_HOURLY_RATES) => {
  if (!useCase.targetRoles || useCase.targetRoles.length === 0) {
    return { 
      annual: 0, 
      threeYear: 0, 
      implementation: useCase.estimatedImplementationCost?.range || "$0",
      employees: 0,
      savingsDetails: []
    };
  }
  
  // Calculate annual savings based on role hourly rates and time savings
  let totalAnnualSavings = 0;
  let totalEmployees = 0;
  const savingsDetails = [];
  
  useCase.targetRoles.forEach(role => {
    const employeeCount = parseInt(role.employeeCount) || 0;
    totalEmployees += employeeCount;
    
    // Extract time savings percentage (convert "20-30%" to average of 25%)
    const timeSavingsText = role.timeSavings || "0%";
    const timeSavingsMatch = timeSavingsText.match(/(\d+)(?:-(\d+))?%/);
    let timeSavingsPercent = 0;
    
    if (timeSavingsMatch) {
      if (timeSavingsMatch[2]) {
        // Range like "20-30%"
        const min = parseInt(timeSavingsMatch[1]);
        const max = parseInt(timeSavingsMatch[2]);
        timeSavingsPercent = (min + max) / 2;
      } else {
        // Single value like "25%"
        timeSavingsPercent = parseInt(timeSavingsMatch[1]);
      }
    }
    
    // Get hourly rate for this role
    const roleName = role.role || "Other";
    const hourlyRate = hourlyRates[roleName] || DEFAULT_HOURLY_RATES["Other"];
    
    // Calculate annual savings (assuming 2080 working hours per year)
    const annualHours = 2080;
    const savedHoursPerEmployee = annualHours * (timeSavingsPercent / 100);
    const savingsPerEmployee = savedHoursPerEmployee * hourlyRate;
    const totalRoleSavings = savingsPerEmployee * employeeCount;
    
    totalAnnualSavings += totalRoleSavings;
    
    savingsDetails.push({
      role: roleName,
      employees: employeeCount,
      timeSavings: `${timeSavingsPercent}%`,
      hourlyRate: `$${hourlyRate}`,
      annualSavings: formatCurrency(totalRoleSavings)
    });
  });
  
  // Extract implementation cost range
  const costRangeText = useCase.estimatedImplementationCost?.range || "$0";
  const costMatch = costRangeText.match(/\$(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:-\s*\$(\d+(?:,\d+)?(?:\.\d+)?))?/);
  
  let implementationCost = 0;
  if (costMatch) {
    if (costMatch[2]) {
      // Range like "$10,000 - $20,000"
      const min = parseFloat(costMatch[1].replace(/,/g, ''));
      const max = parseFloat(costMatch[2].replace(/,/g, ''));
      implementationCost = (min + max) / 2;
    } else {
      // Single value like "$15,000"
      implementationCost = parseFloat(costMatch[1].replace(/,/g, ''));
    }
  }
  
  // Calculate 3-year ROI, accounting for implementation costs
  const threeYearSavings = totalAnnualSavings * 3;
  const threeYearROI = threeYearSavings - implementationCost;
  
  return {
    annual: totalAnnualSavings,
    threeYear: threeYearROI,
    implementation: costRangeText,
    implementationCost: implementationCost,
    employees: totalEmployees,
    savingsDetails: savingsDetails
  };
};

// Helper function to format currency 
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

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

const UseCaseMatches = ({ matches }) => {
  // If no matches are provided or array is empty
  if (!matches || !matches.useCases || matches.useCases.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-md">
        <p className="text-gray-500">No suitable use cases found. Try providing more company information.</p>
      </div>
    );
  }
  
  // Sort matches by relevance score
  const sortedMatches = [...matches.useCases].sort((a, b) => {
    const scoreA = typeof a.relevanceScore === 'number' ? a.relevanceScore : parseInt(a.relevanceScore.toString(), 10);
    const scoreB = typeof b.relevanceScore === 'number' ? b.relevanceScore : parseInt(b.relevanceScore.toString(), 10);
    return scoreB - scoreA;
  });
  
  // State for enabled use cases (all enabled by default)
  const [enabledUseCases, setEnabledUseCases] = useState(
    sortedMatches.map(match => ({ id: match.id, enabled: true }))
  );
  
  // Calculate total ROI across all enabled use cases
  const totalRoi = React.useMemo(() => {
    const enabledIds = enabledUseCases
      .filter(item => item.enabled)
      .map(item => item.id);
    
    const enabledMatches = sortedMatches.filter(match => 
      enabledIds.includes(match.id)
    );
    
    let totalAnnualSavings = 0;
    let totalThreeYearRoi = 0;
    let totalImplementationCost = 0;
    let totalEmployeesAffected = 0;
    
    enabledMatches.forEach(match => {
      const roi = calculateRoi(match);
      totalAnnualSavings += roi.annual;
      totalThreeYearRoi += roi.threeYear;
      totalImplementationCost += roi.implementationCost || 0;
      
      // Count unique employees (avoid double-counting if same employees appear in multiple use cases)
      const roleIds = new Set();
      if (match.targetRoles) {
        match.targetRoles.forEach(role => {
          roleIds.add(`${role.role}-${role.employeeCount}`);
        });
      }
      
      // For simplicity, we'll just use the totalEmployeesAffected value directly
      totalEmployeesAffected = Math.max(totalEmployeesAffected, match.totalEmployeesAffected || 0);
    });
    
    return {
      annual: totalAnnualSavings,
      threeYear: totalThreeYearRoi,
      implementation: formatCurrency(totalImplementationCost),
      employees: totalEmployeesAffected,
      useCaseCount: enabledMatches.length
    };
  }, [sortedMatches, enabledUseCases]);
  
  // Toggle use case enabled/disabled
  const toggleUseCase = (id) => {
    setEnabledUseCases(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };
  
  return (
    <div>
      {/* ROI Summary Card */}
      <div className="bg-white border rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Total ROI Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-1">Annual Savings</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRoi.annual)}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-800 mb-1">3-Year ROI</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(totalRoi.threeYear)}</p>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-800 mb-1">Implementation Cost</p>
            <p className="text-2xl font-bold text-amber-900">{totalRoi.implementation}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-800 mb-1">Employees Affected</p>
            <p className="text-2xl font-bold text-purple-900">{totalRoi.employees}</p>
            <p className="text-xs text-purple-700 mt-1">Across {totalRoi.useCaseCount} use cases</p>
          </div>
        </div>
        
        <div className="text-center mt-4 text-sm text-gray-500">
          <p>Toggle use cases below to customize your ROI calculation</p>
        </div>
      </div>
      
      {/* Use Case Cards */}
      <div className="space-y-6">
        {sortedMatches.map((match, index) => {
          const isEnabled = enabledUseCases.find(item => item.id === match.id)?.enabled ?? true;
          const roi = calculateRoi(match);
          
          return (
            <div key={index} className={`bg-white border rounded-lg overflow-hidden shadow-sm transition-opacity ${!isEnabled && 'opacity-60'}`}>
              <div className="border-b bg-gray-50 px-4 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {/* Toggle checkbox */}
                    <label className="inline-flex items-center mr-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        checked={isEnabled}
                        onChange={() => toggleUseCase(match.id)}
                      />
                    </label>
                    
                    <h3 className="text-lg font-semibold text-gray-800">{match.name}</h3>
                    {match.id && (
                      <Link href={formatCaseStudyUrl(match.id)} className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline" target="_blank">
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
                {/* ROI Quick View */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Annual Savings</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(roi.annual)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">3-Year ROI</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(roi.threeYear)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Implementation</p>
                    <p className="text-lg font-bold text-amber-700">{roi.implementation}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Why This Matches Your Company</h4>
                  <p className="text-sm text-gray-600">{match.relevanceExplanation}</p>
                </div>
                
                {/* Target Roles Section */}
                {match.targetRoles && match.targetRoles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Target Roles & Savings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {match.targetRoles.map((role, idx) => {
                        // Find savings details for this role
                        const savingsDetail = roi.savingsDetails.find(d => d.role === role.role);
                        
                        return (
                          <div key={idx} className="flex items-center border rounded-md p-2 bg-gray-50">
                            <div className="flex-grow">
                              <p className="font-medium text-sm">{role.role}</p>
                              <p className="text-xs text-gray-600">
                                {role.employeeCount} employees · {role.timeSavings} time savings
                              </p>
                              {savingsDetail && (
                                <p className="text-xs font-semibold text-blue-700 mt-1">
                                  {savingsDetail.annualSavings}/year
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
                    target="_blank"
                  >
                    Detailed ROI Analysis
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UseCaseMatches;
