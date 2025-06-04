"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

// Default hourly rates by role (US baseline)
const DEFAULT_HOURLY_RATES = {
  "Executive/Leadership": 100,
  "Sales": 50,
  "Marketing": 40,
  "Product & Engineering": 60,
  "Operations": 30,
  "Finance & Accounting": 55,
  "Human Resources": 35,
  "Legal & Compliance": 75,
  "Customer Support": 20,
};

// Claude API subscription pricing
const CLAUDE_PRICING = {
  monthlySeatCost: 100, // ~$100 per user per month (estimated)
};

// Helper function to format currency
const formatCurrency = (amount) => {
  const absAmount = Math.abs(amount);
  const negative = amount < 0 ? "-" : "";
  
  if (absAmount >= 1000000) {
    return `${negative}$${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    return `${negative}$${(absAmount / 1000).toFixed(0)}K`;
  }
  return `${negative}$${absAmount.toFixed(0)}`;
};

// Helper function to format percentages with commas
const formatPercent = (percent) => {
  return percent.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

// Helper function to get complexity color
const getComplexityColor = (complexity) => {
  switch (complexity?.toLowerCase()) {
    case "low": return "text-green-600 bg-green-50";
    case "medium": return "text-yellow-600 bg-yellow-50";
    case "high": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

// Helper function to get readiness status icon
const getReadinessIcon = (status) => {
  switch (status) {
    case "ready":
      return <span className="text-green-500">✅</span>;
    case "requires_setup":
      return <span className="text-yellow-500">⚠️</span>;
    case "depends_on_other":
      return <span className="text-orange-500">🔒</span>;
    default:
      return <span className="text-gray-400">❓</span>;
  }
};

// Component for individual use case
const UseCaseCard = ({ useCase, functionData, onHoursChange, onEmployeeCountChange, enabled }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Auto-expand examples
  const [hours, setHours] = useState(useCase.hoursPerWeek || 10);
  const [employeeCount, setEmployeeCount] = useState(functionData.totalEmployees || 0);
  
  // Calculate ROI for this specific use case
  const roi = useMemo(() => {
    if (!enabled) return { annual: 0, perEmployee: 0 };
    
    const timeSavings = (useCase.timeSavingsPercent || 30) / 100;
    const hourlyRate = useCase.adjustedHourlyRate || DEFAULT_HOURLY_RATES[functionData.name] || 40;
    
    // Annual savings = employees × hours/week × 52 weeks × time savings × hourly rate
    const annualSavings = employeeCount * hours * 52 * timeSavings * hourlyRate;
    const perEmployee = employeeCount > 0 ? annualSavings / employeeCount : 0;
    
    return {
      annual: annualSavings,
      perEmployee: perEmployee
    };
  }, [hours, employeeCount, useCase, functionData, enabled]);
  
  const quickWinBadge = useCase.quickWinScore > 500 && (
    <span className="ml-2 px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
      Quick Win
    </span>
  );

  return (
    <div className={`border rounded-lg p-4 ${enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 flex items-center">
            {getReadinessIcon(useCase.readinessStatus)}
            <span className="ml-2">{useCase.name}</span>
            {quickWinBadge}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{useCase.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-lg font-semibold text-green-600">
            {formatCurrency(roi.annual)}/yr
          </div>
          <div className="text-xs text-gray-500">
            {formatCurrency(roi.perEmployee)}/employee
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm">
          <span className={`px-2 py-1 rounded-full ${getComplexityColor(useCase.complexity)}`}>
            {useCase.complexity || "Medium"} complexity
          </span>
          <span className="text-gray-500">
            ~{useCase.complexityWeeks || 4} weeks
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Employees:</label>
            <input
              type="number"
              min="0"
              max={functionData.totalEmployees}
              value={employeeCount}
              onChange={(e) => {
                const newCount = parseInt(e.target.value) || 0;
                setEmployeeCount(newCount);
                onEmployeeCountChange(useCase.id, newCount);
              }}
              className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!enabled}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Hours/week:</label>
            <input
              type="number"
              min="0"
              max="40"
              value={hours}
              onChange={(e) => {
                const newHours = parseInt(e.target.value) || 0;
                setHours(newHours);
                onHoursChange(useCase.id, newHours);
              }}
              className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!enabled}
            />
          </div>
        </div>
      </div>
      
      {useCase.examples && useCase.examples.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {isExpanded ? "Hide" : "Show"} examples ({useCase.examples.length})
            <svg className={`w-4 h-4 ml-1 transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="mt-2 space-y-2">
              {useCase.examples.map((example, idx) => (
                <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                  <Link href={`/use-cases/${example.caseStudyId}`} className="font-medium text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {example.company}
                  </Link>
                  <span className="text-gray-600">: {example.metric}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {useCase.prerequisites && useCase.prerequisites.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Prerequisites: {useCase.prerequisites.join(", ")}
        </div>
      )}
    </div>
  );
};

// Main component
const UseCaseMatchesV2 = ({ matches }) => {
  const hasBusinessFunctions = matches?.businessFunctions?.length > 0;
  
  if (!hasBusinessFunctions) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-md">
        <p className="text-gray-500">
          No suitable use cases found. Try providing more company information.
        </p>
      </div>
    );
  }

  // Sort business functions by relevance score
  const sortedFunctions = [...matches.businessFunctions].sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // State for enabled functions and use cases
  const [enabledFunctions, setEnabledFunctions] = useState(
    sortedFunctions.reduce((acc, func) => {
      acc[func.id] = true;
      return acc;
    }, {})
  );
  
  const [enabledUseCases, setEnabledUseCases] = useState(
    sortedFunctions.reduce((acc, func) => {
      if (func.useCases) {
        func.useCases.forEach(uc => {
          acc[uc.id] = true;
        });
      }
      return acc;
    }, {})
  );
  
  const [useCaseHours, setUseCaseHours] = useState(
    sortedFunctions.reduce((acc, func) => {
      if (func.useCases) {
        func.useCases.forEach(uc => {
          acc[uc.id] = uc.hoursPerWeek || 10;
        });
      }
      return acc;
    }, {})
  );
  
  const [useCaseEmployees, setUseCaseEmployees] = useState(
    sortedFunctions.reduce((acc, func) => {
      if (func.useCases) {
        func.useCases.forEach(uc => {
          acc[uc.id] = func.totalEmployees || 0;
        });
      }
      return acc;
    }, {})
  );
  
  const [expandedFunctions, setExpandedFunctions] = useState({});

  // Calculate total ROI
  const totalMetrics = useMemo(() => {
    let totalAnnualSavings = 0;
    let totalEmployees = 0;
    let totalImplementationWeeks = 0;
    let implementationCosts = 0;
    
    sortedFunctions.forEach(func => {
      if (!enabledFunctions[func.id] || !func.useCases) return;
      
      totalEmployees += func.totalEmployees || 0;
      
      func.useCases.forEach(uc => {
        if (!enabledUseCases[uc.id]) return;
        
        const hours = useCaseHours[uc.id] || uc.hoursPerWeek || 10;
        const timeSavings = (uc.timeSavingsPercent || 30) / 100;
        const hourlyRate = uc.adjustedHourlyRate || DEFAULT_HOURLY_RATES[func.name] || 40;
        const employees = useCaseEmployees[uc.id] || 0;
        
        totalAnnualSavings += employees * hours * 52 * timeSavings * hourlyRate;
        totalImplementationWeeks = Math.max(totalImplementationWeeks, uc.complexityWeeks || 4);
      });
    });
    
    // Claude subscription cost
    const annualClaudeCost = totalEmployees * CLAUDE_PRICING.monthlySeatCost * 12;
    
    // Estimate implementation cost (simplified)
    implementationCosts = totalImplementationWeeks * 2000; // ~$2k per week
    
    const netFirstYear = totalAnnualSavings - annualClaudeCost - implementationCosts;
    const netAnnual = totalAnnualSavings - annualClaudeCost;
    const roiPercent = implementationCosts > 0 ? (netFirstYear / implementationCosts) * 100 : 0;
    
    return {
      totalAnnualSavings,
      annualClaudeCost,
      implementationCosts,
      netFirstYear,
      netAnnual,
      roiPercent,
      totalEmployees,
      totalImplementationWeeks
    };
  }, [sortedFunctions, enabledFunctions, enabledUseCases, useCaseHours]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm text-gray-600">Annual Savings</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalMetrics.totalAnnualSavings)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm text-gray-600">Claude Cost (Annual)</h3>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalMetrics.annualClaudeCost)}</p>
          <p className="text-xs text-gray-500 mt-1">~$100/user/mo estimate</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm text-gray-600">Net Annual Savings</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalMetrics.netAnnual)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm text-gray-600">ROI (Year 1)</h3>
          <p className="text-2xl font-bold text-purple-600">{formatPercent(totalMetrics.roiPercent)}%</p>
          <p className="text-xs text-gray-500 mt-1">{totalMetrics.totalImplementationWeeks} week impl.</p>
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
        💡 Pricing shown is an estimate (~$100/seat/month). 
        <Link href="https://anthropic.com/enterprise" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
          Contact Anthropic for accurate pricing
        </Link>
      </div>

      {/* Business Functions */}
      {sortedFunctions.map((func) => {
        const isExpanded = expandedFunctions[func.id] !== false;
        const functionEnabled = enabledFunctions[func.id];
        const hasUseCases = func.useCases && func.useCases.length > 0;
        
        // Calculate function-specific ROI
        const functionRoi = useMemo(() => {
          if (!functionEnabled || !hasUseCases) return 0;
          
          let total = 0;
          func.useCases.forEach(uc => {
            if (!enabledUseCases[uc.id]) return;
            
            const hours = useCaseHours[uc.id] || uc.hoursPerWeek || 10;
            const timeSavings = (uc.timeSavingsPercent || 30) / 100;
            const hourlyRate = uc.adjustedHourlyRate || DEFAULT_HOURLY_RATES[func.name] || 40;
            const employees = useCaseEmployees[uc.id] || 0;
            
            total += employees * hours * 52 * timeSavings * hourlyRate;
          });
          
          return total;
        }, [func, functionEnabled, enabledUseCases, useCaseHours, useCaseEmployees]);
        
        return (
          <div key={func.id} className={`border rounded-lg ${functionEnabled ? 'border-blue-200 shadow-sm' : 'border-gray-200'}`}>
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={functionEnabled}
                    onChange={(e) => {
                      setEnabledFunctions(prev => ({ ...prev, [func.id]: e.target.checked }));
                      // Also toggle all use cases in this function
                      if (func.useCases) {
                        const newUseCases = { ...enabledUseCases };
                        func.useCases.forEach(uc => {
                          newUseCases[uc.id] = e.target.checked;
                        });
                        setEnabledUseCases(newUseCases);
                      }
                    }}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      {func.name}
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({func.relevanceScore}% relevance)
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      {func.totalEmployees} employees
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {functionEnabled && (
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(functionRoi)}/yr
                      </div>
                      <div className="text-xs text-gray-500">Total ROI</div>
                    </div>
                  )}
                  
                  {hasUseCases && (
                    <button
                      onClick={() => setExpandedFunctions(prev => ({ ...prev, [func.id]: !isExpanded }))}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className={`w-5 h-5 transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {func.whyRelevant && (
                <p className="mt-2 text-sm text-gray-700 italic">
                  "{func.whyRelevant}"
                </p>
              )}
            </div>
            
            {isExpanded && hasUseCases && (
              <div className="p-4 space-y-3">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Use Cases (showing top {Math.min(3, func.useCases.length)} of {func.useCases.length}):
                </div>
                
                {func.useCases.slice(0, 3).map(useCase => (
                  <div key={useCase.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={enabledUseCases[useCase.id]}
                      onChange={(e) => {
                        setEnabledUseCases(prev => ({ ...prev, [useCase.id]: e.target.checked }));
                      }}
                      disabled={!functionEnabled}
                      className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <UseCaseCard
                        useCase={useCase}
                        functionData={func}
                        enabled={functionEnabled && enabledUseCases[useCase.id]}
                        onHoursChange={(id, hours) => {
                          setUseCaseHours(prev => ({ ...prev, [id]: hours }));
                        }}
                        onEmployeeCountChange={(id, count) => {
                          setUseCaseEmployees(prev => ({ ...prev, [id]: count }));
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                {func.useCases.length > 3 && (
                  <button className="text-sm text-blue-600 hover:text-blue-800 mt-2">
                    Show {func.useCases.length - 3} more use cases
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UseCaseMatchesV2;