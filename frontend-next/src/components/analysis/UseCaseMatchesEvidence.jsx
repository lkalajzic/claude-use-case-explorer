"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Default hourly rates by role (can be customized)
const DEFAULT_HOURLY_RATES = {
  "Engineering/Development": 75,
  "Software Development": 75,
  "Customer Service/Support": 30,
  "Marketing/Content": 45,
  Sales: 60,
  Marketing: 45,
  "Legal/Compliance": 90,
  "Research/Data Analysis": 65,
  "Operations/Administration": 35,
  Operations: 35,
  "Executive/Management": 100,
  HR: 50,
  "Human Resources": 50,
  Finance: 65,
  Other: 50,
};

// Claude API subscription pricing (estimated based on community reports)
const CLAUDE_PRICING = {
  monthlySeatCost: 100, // ~$100 per user per month (estimated)
  minUsers: 1,          // No minimum users for simplified calculation
  minAnnualCost: 0,     // No minimum cost - pay per seat
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

// Helper function to render relevance score
const RelevanceScore = ({ score }) => {
  const percentage = typeof score === "number" ? score : parseInt(score.toString(), 10);
  const width = `${percentage}%`;

  let bgColor = "bg-gray-200";
  let fillColor = "bg-gray-400";

  if (percentage >= 80) {
    fillColor = "bg-green-500";
  } else if (percentage >= 60) {
    fillColor = "bg-blue-500";
  } else if (percentage >= 40) {
    fillColor = "bg-yellow-500";
  } else {
    fillColor = "bg-orange-500";
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

// Helper function to calculate ROI for a business function
const calculateRoi = (businessFunction, hourlyRates = DEFAULT_HOURLY_RATES) => {
  if (!businessFunction.targetRoles || businessFunction.targetRoles.length === 0) {
    return {
      annual: 0,
      implementation: businessFunction.estimatedImplementationCost?.range || "$0",
      claudeCost: formatCurrency(CLAUDE_PRICING.minAnnualCost),
      netAnnual: -CLAUDE_PRICING.minAnnualCost,
      employees: 0,
      affectedRoles: [],
      savingsDetails: [],
    };
  }

  let totalAnnualSavings = 0;
  let totalEmployees = 0;
  let affectedRoles = new Set();
  const savingsDetails = [];

  businessFunction.targetRoles.forEach((role) => {
    const employeeCount = parseInt(role.employeeCount) || 0;
    totalEmployees += employeeCount;
    affectedRoles.add(role.role);

    // Extract time savings percentage
    const timeSavingsText = role.timeSavings || "0%";
    const timeSavingsMatch = timeSavingsText.match(/(\d+)(?:-(\d+))?%/);
    let timeSavingsPercent = 0;

    if (timeSavingsMatch) {
      if (timeSavingsMatch[2]) {
        const min = parseInt(timeSavingsMatch[1]);
        const max = parseInt(timeSavingsMatch[2]);
        timeSavingsPercent = (min + max) / 2;
      } else {
        timeSavingsPercent = parseInt(timeSavingsMatch[1]);
      }
    }

    // Look up hourly rate
    const hourlyRate = hourlyRates[role.role] || hourlyRates["Other"];
    
    // Calculate annual savings (2000 working hours per year)
    const annualSavings = employeeCount * hourlyRate * 2000 * (timeSavingsPercent / 100);
    totalAnnualSavings += annualSavings;

    savingsDetails.push({
      role: role.role,
      employees: employeeCount,
      timeSavings: timeSavingsText,
      annualSavings: formatCurrency(annualSavings),
    });
  });

  // Extract implementation cost
  const implementationRange = businessFunction.estimatedImplementationCost?.range || "$0";
  const implementationMatch = implementationRange.match(/\$?([\d,]+)(?:\s*-\s*\$?([\d,]+))?/);
  let implementationCost = 0;
  
  if (implementationMatch) {
    const min = parseInt(implementationMatch[1].replace(/,/g, ""));
    const max = implementationMatch[2] ? parseInt(implementationMatch[2].replace(/,/g, "")) : min;
    implementationCost = (min + max) / 2;
  }

  // Calculate Claude cost based on affected employees
  const annualClaudeCost = totalEmployees * CLAUDE_PRICING.monthlySeatCost * 12;

  // Calculate net annual savings (Year 1 includes implementation cost)
  const netAnnualSavings = totalAnnualSavings - annualClaudeCost - implementationCost;

  return {
    annual: totalAnnualSavings,
    implementation: implementationRange,
    claudeCost: formatCurrency(annualClaudeCost),
    netAnnual: netAnnualSavings,
    employees: totalEmployees,
    affectedRoles: Array.from(affectedRoles),
    savingsDetails,
  };
};

// Helper function to format case study URL
const formatCaseStudyUrl = (caseStudyId) => {
  if (!caseStudyId) return "#";
  
  // Handle special cases
  const specialCases = {
    "copy-ai": "copy_ai",
    "brand-ai": "brand_ai",
    "law-and-company": "law_and_company",
    "you-dot-com": "you_dot_com",
  };
  
  const formattedId = specialCases[caseStudyId] || caseStudyId;
  return `/use-cases/${formattedId}`;
};

const UseCaseMatchesEvidence = ({ matches }) => {
  // Check if we have the new businessFunctions format
  const hasBusinessFunctions = matches && matches.businessFunctions && matches.businessFunctions.length > 0;
  const hasUseCases = matches && matches.useCases && matches.useCases.length > 0;
  
  // Handle both old and new formats
  if (!hasBusinessFunctions && !hasUseCases) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-md">
        <p className="text-gray-500">
          No suitable use cases found. Try providing more company information.
        </p>
      </div>
    );
  }

  // If old format, show a message
  if (!hasBusinessFunctions && hasUseCases) {
    return (
      <div className="text-center py-4 bg-yellow-50 rounded-md border border-yellow-200">
        <p className="text-yellow-800">
          Using legacy format. Please refresh to see evidence-based recommendations.
        </p>
      </div>
    );
  }

  // Sort business functions by relevance score
  const sortedFunctions = [...matches.businessFunctions].sort((a, b) => b.relevanceScore - a.relevanceScore);

  // State for enabled business functions
  const [enabledFunctions, setEnabledFunctions] = useState(
    sortedFunctions.map((func) => ({ id: func.id, enabled: true }))
  );

  // Calculate total ROI across all enabled business functions
  const totalRoi = React.useMemo(() => {
    const enabledIds = enabledFunctions
      .filter((item) => item.enabled)
      .map((item) => item.id);

    const enabledBusinessFunctions = sortedFunctions.filter((func) =>
      enabledIds.includes(func.id)
    );

    let totalAnnualSavings = 0;
    let totalImplementationCost = 0;
    let totalEmployeesAffected = 0;
    let allAffectedRoles = new Set();

    enabledBusinessFunctions.forEach((func) => {
      const roi = calculateRoi(func);
      totalAnnualSavings += roi.annual;
      
      // Extract implementation cost
      const costMatch = roi.implementation.match(/\$?([\d,]+)(?:\s*-\s*\$?([\d,]+))?/);
      if (costMatch) {
        const min = parseInt(costMatch[1].replace(/,/g, ""));
        const max = costMatch[2] ? parseInt(costMatch[2].replace(/,/g, "")) : min;
        totalImplementationCost += (min + max) / 2;
      }

      totalEmployeesAffected += roi.employees || 0;
      
      if (roi.affectedRoles && roi.affectedRoles.length > 0) {
        roi.affectedRoles.forEach(role => allAffectedRoles.add(role));
      }
    });

    // Calculate Claude subscription cost (simple per-seat pricing)
    const annualClaudeCost = totalEmployeesAffected * CLAUDE_PRICING.monthlySeatCost * 12;
    
    // Calculate net annual savings (Year 1 includes implementation cost)
    const netAnnualSavings = totalAnnualSavings - annualClaudeCost - totalImplementationCost;

    return {
      annual: totalAnnualSavings,
      claudeCost: formatCurrency(annualClaudeCost),
      netAnnual: netAnnualSavings,
      implementation: formatCurrency(totalImplementationCost),
      employees: totalEmployeesAffected,
      affectedRoles: Array.from(allAffectedRoles),
      functionCount: enabledBusinessFunctions.length,
    };
  }, [sortedFunctions, enabledFunctions]);

  // Toggle business function enabled/disabled
  const toggleFunction = (id) => {
    setEnabledFunctions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  // Collect all second-order benefits
  const allSecondOrderBenefits = React.useMemo(() => {
    const enabledIds = enabledFunctions
      .filter((item) => item.enabled)
      .map((item) => item.id);

    const benefits = [];
    sortedFunctions
      .filter((func) => enabledIds.includes(func.id))
      .forEach((func) => {
        if (func.secondOrderBenefits) {
          benefits.push(...func.secondOrderBenefits);
        }
      });

    // Remove duplicates based on benefit name
    const uniqueBenefits = benefits.filter(
      (benefit, index, self) =>
        index === self.findIndex((b) => b.benefit === benefit.benefit)
    );

    return uniqueBenefits;
  }, [sortedFunctions, enabledFunctions]);

  return (
    <div className="space-y-6">
      {/* ROI Summary Dashboard */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Annual ROI Summary
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Annual Time Savings</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(totalRoi.annual)}
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-800 mb-1">Implementation Cost</p>
            <p className="text-2xl font-bold text-orange-900">
              {totalRoi.implementation}
            </p>
            <p className="text-xs text-orange-700 mt-1">One-time investment</p>
          </div>

          <div className={`rounded-lg p-4 ${totalRoi.netAnnual >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm mb-1 ${totalRoi.netAnnual >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              Year 1 Net ROI
            </p>
            <p className={`text-2xl font-bold ${totalRoi.netAnnual >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(totalRoi.netAnnual)}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-800 mb-1">Claude Licenses</p>
            <p className="text-2xl font-bold text-purple-900">
              {totalRoi.employees}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              {totalRoi.claudeCost}/year
            </p>
          </div>
        </div>

        {/* Second-Order Benefits */}
        {allSecondOrderBenefits.length > 0 && (
          <div className="mt-6 p-4 bg-teal-50 border border-teal-100 rounded-lg">
            <h4 className="text-md font-semibold text-teal-800 mb-3">
              Beyond Direct Time Savings: Second-Order Benefits
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allSecondOrderBenefits.slice(0, 6).map((benefit, idx) => (
                <div key={idx} className="bg-white rounded-md p-3 border border-teal-100">
                  <span className="block text-sm font-medium text-teal-700 mb-1">
                    {benefit.benefit}
                  </span>
                  <p className="text-xs text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-4 text-sm text-gray-500">
          <p>Toggle business functions on/off to customize your ROI calculation</p>
        </div>

        {/* Pricing Disclaimer */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Claude Enterprise pricing is estimated at ~$100/user/month based on community reports. 
            For accurate pricing specific to your organization, please{' '}
            <a 
              href="https://www.anthropic.com/enterprise" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-900 underline font-medium hover:text-amber-700"
            >
              contact Anthropic directly
            </a>.
          </p>
        </div>
      </div>

      {/* Business Function Cards */}
      <div className="space-y-6">
        {sortedFunctions.map((func, index) => {
          const isEnabled =
            enabledFunctions.find((item) => item.id === func.id)?.enabled ?? true;
          const roi = calculateRoi(func);

          return (
            <div
              key={index}
              className={`bg-white border rounded-lg overflow-hidden shadow-sm transition-opacity ${
                !isEnabled && "opacity-60"
              }`}
            >
              {/* Header */}
              <div className="border-b bg-gray-50 px-4 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {/* Toggle checkbox */}
                    <label className="inline-flex items-center mr-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        checked={isEnabled}
                        onChange={() => toggleFunction(func.id)}
                      />
                    </label>

                    <h3 className="text-lg font-semibold text-gray-800">
                      {func.name}
                    </h3>
                    <span className="ml-3 text-sm text-gray-600">
                      ({func.totalEmployeesAffected} employees)
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      func.relevanceScore >= 80
                        ? "bg-green-100 text-green-800"
                        : func.relevanceScore >= 60
                        ? "bg-blue-100 text-blue-800"
                        : func.relevanceScore >= 40
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {func.relevanceScore}% Match
                  </span>
                </div>
                <div className="mt-2">
                  <RelevanceScore score={func.relevanceScore} />
                </div>
              </div>

              <div className="p-4">
                {/* ROI Details - Moved to top */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Annual Savings</p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(roi.annual)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Implementation</p>
                    <p className="text-lg font-bold text-purple-700">
                      {roi.implementation}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Estimated ROI</p>
                    <p className="text-lg font-bold text-green-700">
                      {func.estimatedROI || formatCurrency(roi.annual)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Confidence</p>
                    <p className="text-lg font-bold text-gray-700">
                      {func.relevanceScore}%
                    </p>
                  </div>
                </div>

                {/* Why Relevant */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    Why this matches your company:
                  </h4>
                  <p className="text-sm text-gray-600">{func.whyRelevant}</p>
                </div>

                {/* Real-world Examples */}
                {func.examples && func.examples.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      How similar companies succeeded:
                    </h4>
                    <div className="space-y-3">
                      {func.examples.map((example, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-800">
                                  🏢 {example.company}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({example.size} {example.industry})
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {example.implementation}
                              </p>
                              <p className="text-sm font-medium text-green-700">
                                → {example.metric}
                              </p>
                            </div>
                            <Link
                              href={formatCaseStudyUrl(example.caseStudyId)}
                              className="ml-3 text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                            >
                              View Case Study →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UseCaseMatchesEvidence;